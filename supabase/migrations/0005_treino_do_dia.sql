-- ============================================================================
-- 0005_treino_do_dia.sql — Treino do dia
--
-- Qual treino roda em cada data. Todas as turmas do dia usam o mesmo treino.
-- Mapa JSONB na linha única de `configuracoes`:
--   { "2026-07-26": "id-do-treino", "2026-07-27": "outro-id", ... }
-- ============================================================================

alter table configuracoes
  add column if not exists treinos_do_dia jsonb not null default '{}'::jsonb;

-- Recarrega o cache de schema do PostgREST (senão a API pode não "ver" a coluna).
notify pgrst, 'reload schema';
