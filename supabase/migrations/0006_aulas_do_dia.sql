-- ============================================================================
-- 0006_aulas_do_dia.sql — Aula do dia em partes
--
-- A aula de cada data vira uma lista de PARTES (aquecimento, AMRAP, WOD...).
-- Cada parte tem seu próprio cronômetro e lista de exercícios. O professor
-- escolhe no controle qual parte da aula está rodando.
--
-- Mapa JSONB na linha única de `configuracoes`:
--   { "2026-07-26": [ { id, nome, modo, etapas: [...], movimentos: [...] }, ... ] }
-- ============================================================================

alter table configuracoes
  add column if not exists aulas_do_dia jsonb not null default '{}'::jsonb;

-- Recarrega o cache de schema do PostgREST.
notify pgrst, 'reload schema';
