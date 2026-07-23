-- ============================================================================
-- G FIT TIME — Módulo Patrocinadores
-- Migra a tabela existente para o schema do módulo + cria o bucket de mídia.
-- Idempotente: pode rodar novamente sem quebrar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabela: renomeia colunas e adiciona os campos do módulo
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_name='patrocinadores' and column_name='src') then
    alter table patrocinadores rename column src to arquivo_url;
  end if;

  if exists (select 1 from information_schema.columns
             where table_name='patrocinadores' and column_name='duracao_segundos') then
    alter table patrocinadores rename column duracao_segundos to tempo_exibicao;
  end if;

  if exists (select 1 from information_schema.columns
             where table_name='patrocinadores' and column_name='criado_em') then
    alter table patrocinadores rename column criado_em to created_at;
  end if;

  if exists (select 1 from information_schema.columns
             where table_name='patrocinadores' and column_name='ordem') then
    alter table patrocinadores drop column ordem;
  end if;
end $$;

alter table patrocinadores
  add column if not exists descricao   text,
  add column if not exists data_inicio date,
  add column if not exists data_fim    date,
  add column if not exists updated_at  timestamptz not null default now();

-- tempo de exibição sempre preenchido (imagens dependem dele)
alter table patrocinadores
  alter column tempo_exibicao set default 8;
update patrocinadores set tempo_exibicao = 8 where tempo_exibicao is null;

-- updated_at automático
create trigger trg_patrocinadores_updated
  before update on patrocinadores
  for each row execute function toca_updated_at();

-- Consulta da TV: ativos dentro da janela de datas
create index if not exists idx_patrocinadores_exibicao
  on patrocinadores (ativo, data_inicio, data_fim);

-- ----------------------------------------------------------------------------
-- 2. Storage: bucket exclusivo da mídia dos patrocinadores
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patrocinadores', 'patrocinadores', true,
  52428800, -- 50 MB
  array['image/png','image/jpeg','image/webp','video/mp4']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Políticas do bucket (sem login: o papel anon é o cliente da academia)
drop policy if exists "patrocinadores_ler"     on storage.objects;
drop policy if exists "patrocinadores_enviar"  on storage.objects;
drop policy if exists "patrocinadores_alterar" on storage.objects;
drop policy if exists "patrocinadores_apagar"  on storage.objects;

create policy "patrocinadores_ler" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'patrocinadores');

create policy "patrocinadores_enviar" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'patrocinadores');

create policy "patrocinadores_alterar" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'patrocinadores');

create policy "patrocinadores_apagar" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'patrocinadores');
