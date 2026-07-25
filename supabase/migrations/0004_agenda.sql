-- ============================================================================
-- 0004_agenda.sql — Agenda semanal de turmas
--
-- A grade de aulas é pequena e única por academia, então mora como JSONB na
-- linha única de `configuracoes` (sem tabela nova, sem RLS extra).
--
-- Formato de cada item do array:
--   { "id": "uuid", "nome": "Turma das 6h", "horario": "06:00",
--     "dias": [1,2,3,4,5], "duracaoMin": 60 }
--   dias: 0=Dom, 1=Seg … 6=Sáb.
-- ============================================================================

alter table configuracoes
  add column if not exists agenda jsonb not null default '[]'::jsonb;

-- Recarrega o cache de schema do PostgREST: sem isso, a API pode continuar
-- respondendo "column agenda não encontrada" logo após criar a coluna.
notify pgrst, 'reload schema';
