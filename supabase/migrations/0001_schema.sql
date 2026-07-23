-- ============================================================================
-- G FIT TIME — Schema definitivo
-- Sistema privado de UMA academia, sem login. O papel `anon` é o único cliente.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type categoria_treino as enum
  ('crossfit','hyrox','funcional','condicionamento','core');
create type tipo_etapa   as enum ('exercicio','descanso','repetir');
create type status_sessao as enum ('ocioso','rodando','pausado','encerrado');
create type tipo_midia    as enum ('imagem','video');

-- ----------------------------------------------------------------------------
-- Treinos + Etapas (normalizado: etapas pertencem a um treino, ordenadas)
-- ----------------------------------------------------------------------------
create table treinos (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  descricao    text,
  categoria    categoria_treino not null default 'crossfit',
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table etapas (
  id         uuid primary key default gen_random_uuid(),
  treino_id  uuid not null references treinos(id) on delete cascade,
  tipo       tipo_etapa not null,
  nome       text not null,
  segundos   integer not null default 0,
  vezes      integer,               -- apenas quando tipo = 'repetir'
  ordem      integer not null
);
create index idx_etapas_treino on etapas(treino_id, ordem);

-- ----------------------------------------------------------------------------
-- Templates (blueprints reutilizáveis; etapas em jsonb pois são inertes
-- até serem duplicadas para um treino, que aí sim normaliza)
-- ----------------------------------------------------------------------------
create table templates (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  descricao  text,
  categoria  categoria_treino not null default 'crossfit',
  etapas     jsonb not null default '[]'::jsonb,
  criado_em  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Sessões — o CORAÇÃO do realtime. Estado vivo do treino em execução.
-- Só eventos gravam aqui; o tempo restante é recalculado nos clientes.
-- ----------------------------------------------------------------------------
create table sessoes (
  id             uuid primary key default gen_random_uuid(),
  treino_id      uuid references treinos(id) on delete set null,
  status         status_sessao not null default 'ocioso',
  etapa_atual    integer not null default 0,   -- índice da fase expandida
  round_atual    integer not null default 1,
  tempo_restante integer not null default 0,   -- ms, congelado quando pausado
  started_at     timestamptz,                  -- início da fase atual (rodando)
  paused_at      timestamptz,                  -- instante da pausa (null se rodando)
  updated_at     timestamptz not null default now()
);
create index idx_sessoes_status on sessoes(status, updated_at desc);
-- payload completo da linha nos eventos de UPDATE do Realtime
alter table sessoes replica identity full;

-- ----------------------------------------------------------------------------
-- Histórico — log de execuções (snapshot do nome sobrevive à exclusão)
-- ----------------------------------------------------------------------------
create table historico (
  id               uuid primary key default gen_random_uuid(),
  sessao_id        uuid references sessoes(id) on delete set null,
  treino_id        uuid references treinos(id) on delete set null,
  treino_nome      text not null,
  categoria        categoria_treino,
  iniciado_em      timestamptz not null,
  encerrado_em     timestamptz,
  concluido        boolean not null default false,
  duracao_segundos integer
);
create index idx_historico_data on historico(iniciado_em desc);

-- ----------------------------------------------------------------------------
-- Configurações — linha única (id sempre = 1)
-- ----------------------------------------------------------------------------
create table configuracoes (
  id               integer primary key default 1,
  nome_academia    text not null default 'G FIT',
  logo_url         text,
  som_bipe_final   boolean not null default true,
  som_virada_fase  boolean not null default true,
  som_conclusao    boolean not null default true,
  atualizado_em    timestamptz not null default now(),
  constraint configuracoes_linha_unica check (id = 1)
);

-- ----------------------------------------------------------------------------
-- Patrocinadores — faixa lateral da TV
-- ----------------------------------------------------------------------------
create table patrocinadores (
  id               uuid primary key default gen_random_uuid(),
  nome             text not null,
  tipo             tipo_midia not null default 'imagem',
  src              text not null,
  duracao_segundos integer,
  ordem            integer not null default 0,
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now()
);
create index idx_patrocinadores_ordem on patrocinadores(ativo, ordem);

-- ----------------------------------------------------------------------------
-- Triggers de timestamp
-- ----------------------------------------------------------------------------
create or replace function toca_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create or replace function toca_atualizado_em() returns trigger as $$
begin new.atualizado_em = now(); return new; end;
$$ language plpgsql;

create trigger trg_sessoes_updated
  before update on sessoes for each row execute function toca_updated_at();
create trigger trg_treinos_atualizado
  before update on treinos for each row execute function toca_atualizado_em();

-- ----------------------------------------------------------------------------
-- Realtime: publicar mudanças da tabela de sessões
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table sessoes;

-- ----------------------------------------------------------------------------
-- RLS — sem login, o papel `anon` é o único cliente da academia.
-- Habilitado com política total para anon/authenticated.
-- NOTA DE SEGURANÇA: a anon key fica embutida no cliente; qualquer pessoa com
-- a URL do app pode ler/gravar. Aceitável para uso interno numa rede privada.
-- Se um dia for exposto na internet, adicionar um gate (senha única/VPN).
-- ----------------------------------------------------------------------------
alter table treinos        enable row level security;
alter table etapas         enable row level security;
alter table templates      enable row level security;
alter table sessoes        enable row level security;
alter table historico      enable row level security;
alter table configuracoes  enable row level security;
alter table patrocinadores enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'treinos','etapas','templates','sessoes','historico',
    'configuracoes','patrocinadores'
  ] loop
    execute format(
      'create policy "acesso_total_%1$s" on %1$s
         for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- linha única de configurações
insert into configuracoes (id) values (1) on conflict (id) do nothing;
