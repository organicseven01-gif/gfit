"use client";

import type { RegistroHistorico } from "@/types";
import type { HistoricoRow } from "@/lib/supabase/tipos-db";
import { criarClienteNavegador } from "@/lib/supabase/client";

/* ==========================================================================
   Histórico de execuções (Supabase, tabela `historico`).
   O registro de novas execuções entra junto com a Sessão/Realtime.
   ========================================================================== */

function paraRegistro(row: HistoricoRow): RegistroHistorico {
  return {
    id: row.id,
    treinoNome: row.treino_nome,
    categoria: row.categoria,
    iniciadoEm: row.iniciado_em,
    encerradoEm: row.encerrado_em,
    concluido: row.concluido,
    duracaoSegundos: row.duracao_segundos,
  };
}

export async function listarHistorico(): Promise<RegistroHistorico[]> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("historico")
    .select("*")
    .order("iniciado_em", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data as unknown as HistoricoRow[]).map(paraRegistro);
}
