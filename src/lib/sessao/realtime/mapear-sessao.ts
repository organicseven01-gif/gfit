"use client";

import type { Treino } from "@/types";
import type { EstadoSessao } from "@/lib/sessao/tipos";
import type { SessaoRow } from "@/lib/supabase/tipos-db";
import { expandirEtapas } from "@/lib/timer/expandir";
import { obterTreino } from "@/lib/services/treinos-service";

/* ==========================================================================
   Ponte entre o EstadoSessao (cliente) e a linha `sessoes` (banco).

   Existe UMA sessão ativa: uma linha de id fixo, sempre sobrescrita.
   ========================================================================== */

export const ID_SESSAO_ATIVA = "11111111-1111-1111-1111-111111111111";

/** EstadoSessao → colunas da linha `sessoes` (para gravar). */
export function estadoParaLinha(estado: EstadoSessao) {
  const fases = estado.treino ? expandirEtapas(estado.treino.etapas) : [];
  const fase = fases[estado.indice];
  const duracaoMs = (fase?.segundos ?? 0) * 1000;
  const rodando = estado.status === "rodando";

  // Partes da aula têm id sintético ("parte-…"), que NÃO é UUID válido para a
  // coluna treino_id. Nesses casos gravamos null e confiamos no snapshot.
  const treinoIdReal =
    estado.treino && !estado.treino.id.startsWith("parte-")
      ? estado.treino.id
      : null;

  return {
    id: ID_SESSAO_ATIVA,
    treino_id: treinoIdReal,
    treino_snapshot: estado.treino ?? null,
    status: estado.status,
    etapa_atual: estado.indice,
    round_atual: fase?.round ?? 1,
    tempo_restante: Math.round(estado.restanteMs),
    // início oficial da fase = fim previsto − duração (quando rodando)
    started_at: rodando
      ? new Date(estado.fimPrevistoEpoch - duracaoMs).toISOString()
      : null,
    paused_at:
      estado.status === "pausado"
        ? new Date(estado.atualizadoEm).toISOString()
        : null,
  };
}

/**
 * Linha `sessoes` → EstadoSessao (para hidratar quem entra no meio).
 * Carrega o treino por id; o cliente reconstrói o tempo a partir do
 * horário oficial `started_at` + a duração da fase.
 */
export async function linhaParaEstado(
  row: SessaoRow,
): Promise<EstadoSessao> {
  // Prefere o retrato salvo (recupera aulas sintéticas); senão busca por id.
  const snap = (row.treino_snapshot as Treino | null) ?? null;
  const treino = snap ?? (row.treino_id ? await obterTreino(row.treino_id) : null);
  const fases = treino ? expandirEtapas(treino.etapas) : [];
  const duracaoMs = (fases[row.etapa_atual]?.segundos ?? 0) * 1000;
  const rodando = row.status === "rodando";

  return {
    // updated_at do banco serve de relógio monotônico para o last-writer-wins
    versao: new Date(row.updated_at).getTime(),
    atualizadoEm: new Date(row.updated_at).getTime(),
    treino,
    status: row.status,
    indice: row.etapa_atual,
    fimPrevistoEpoch:
      rodando && row.started_at
        ? new Date(row.started_at).getTime() + duracaoMs
        : 0,
    restanteMs: row.tempo_restante,
  };
}
