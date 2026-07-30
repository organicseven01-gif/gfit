-- ============================================================================
-- 0007_sessao_snapshot.sql — Retrato do treino na sessão
--
-- A aula do dia roda como um treino "sintético" (montado das partes), que não
-- existe na tabela `treinos`. Sem isto, uma TV aberta DEPOIS do início não
-- consegue recuperar a aula (só a hidratação por id funcionava).
--
-- Guardando o treino inteiro (jsonb) na sessão, qualquer TV que abrir no meio
-- recupera exatamente o que está rodando.
-- ============================================================================

alter table sessoes
  add column if not exists treino_snapshot jsonb;

-- Recarrega o cache de schema do PostgREST.
notify pgrst, 'reload schema';
