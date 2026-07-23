-- ============================================================================
-- G FIT TIME — Seed inicial
-- Roda depois de 0001_schema.sql. Idempotente o suficiente para uso único.
-- ============================================================================

-- Configuração da unidade (linha única já existe; só ajusta o nome)
update configuracoes set nome_academia = 'G FIT' where id = 1;

-- ----------------------------------------------------------------------------
-- Patrocinadores (placeholders — trocar pelas peças reais da academia)
-- ----------------------------------------------------------------------------
insert into patrocinadores (nome, tipo, src, duracao_segundos, ordem, ativo) values
  ('Espaço disponível 1', 'imagem', '/patrocinadores/placeholder-1.svg', 8, 1, true),
  ('Espaço disponível 2', 'imagem', '/patrocinadores/placeholder-2.svg', 8, 2, true),
  ('Espaço disponível 3', 'imagem', '/patrocinadores/placeholder-3.svg', 8, 3, true);

-- ----------------------------------------------------------------------------
-- Treinos de exemplo (com etapas normalizadas)
-- ----------------------------------------------------------------------------
do $$
declare
  wod   uuid;
  hyrox uuid;
  core  uuid;
begin
  -- WOD Segunda
  insert into treinos (nome, descricao, categoria)
    values ('WOD Segunda', 'Abertura de semana, intensidade média.', 'crossfit')
    returning id into wod;
  insert into etapas (treino_id, tipo, nome, segundos, vezes, ordem) values
    (wod, 'exercicio', 'Aquecimento', 180, null, 0),
    (wod, 'exercicio', 'Burpee',       40, null, 1),
    (wod, 'descanso',  'Descanso',     20, null, 2),
    (wod, 'exercicio', 'Wall Ball',    40, null, 3),
    (wod, 'descanso',  'Descanso',     20, null, 4),
    (wod, 'repetir',   'Repetir tudo',  0,   4,  5);

  -- Hyrox Simulado
  insert into treinos (nome, descricao, categoria)
    values ('Hyrox Simulado', 'Simulação de prova completa.', 'hyrox')
    returning id into hyrox;
  insert into etapas (treino_id, tipo, nome, segundos, vezes, ordem) values
    (hyrox, 'exercicio', 'Corrida 1 km',       300, null, 0),
    (hyrox, 'descanso',  'Descanso',            60, null, 1),
    (hyrox, 'exercicio', 'Ski Erg',            240, null, 2),
    (hyrox, 'descanso',  'Descanso',            60, null, 3),
    (hyrox, 'exercicio', 'Sled Push',          180, null, 4),
    (hyrox, 'descanso',  'Descanso',            60, null, 5),
    (hyrox, 'exercicio', 'Burpee Broad Jump',  240, null, 6);

  -- Core Rápido
  insert into treinos (nome, descricao, categoria)
    values ('Core Rápido', 'Finalizador de 8 minutos.', 'core')
    returning id into core;
  insert into etapas (treino_id, tipo, nome, segundos, vezes, ordem) values
    (core, 'exercicio', 'Prancha',      30, null, 0),
    (core, 'descanso',  'Descanso',     15, null, 1),
    (core, 'exercicio', 'Hollow Hold',  30, null, 2),
    (core, 'descanso',  'Descanso',     15, null, 3),
    (core, 'exercicio', 'Sit-up',       30, null, 4),
    (core, 'descanso',  'Descanso',     15, null, 5),
    (core, 'repetir',   'Repetir tudo',  0,   4,  6);
end $$;

-- ----------------------------------------------------------------------------
-- Templates (blueprints com etapas em jsonb)
-- ----------------------------------------------------------------------------
insert into templates (nome, descricao, categoria, etapas) values
  ('Tabata Clássico', '8 rounds de 20s/10s.', 'crossfit',
   '[{"tipo":"exercicio","nome":"Exercício","segundos":20},
     {"tipo":"descanso","nome":"Descanso","segundos":10},
     {"tipo":"repetir","nome":"Repetir tudo","segundos":0,"vezes":8}]'::jsonb),
  ('EMOM 10 min', 'Um round por minuto.', 'condicionamento',
   '[{"tipo":"exercicio","nome":"Exercício","segundos":60},
     {"tipo":"repetir","nome":"Repetir tudo","segundos":0,"vezes":10}]'::jsonb);
