import type { Treino } from "@/types";
import type { Fase } from "@/lib/timer/expandir";

/* ==========================================================================
   Contratos da sessão sincronizada.

   Uma ÚNICA fonte de verdade: `EstadoSessao`. Ninguém conta tempo por conta
   própria — todos derivam a exibição desse estado + `Date.now()`.
   ========================================================================== */

export type StatusSessao = "ocioso" | "rodando" | "pausado" | "encerrado";

/**
 * Estado da sessão. É isto que trafega no canal, e só em EVENTOS — nunca o
 * tempo restante a cada segundo.
 *
 * - `rodando`: o tempo vem de `fimPrevistoEpoch − Date.now()`.
 * - `pausado`/`ocioso`: o tempo é o `restanteMs` congelado.
 *
 * As âncoras são epoch de relógio (`Date.now()`), não `performance.now()`,
 * porque precisam valer entre dispositivos diferentes.
 */
export interface EstadoSessao {
  /** Monotônica: mensagens com versão menor são descartadas (last-writer-wins). */
  versao: number;
  /** `Date.now()` de quem publicou. */
  atualizadoEm: number;
  /** Viaja junto para telas que não têm o treino localmente (TV cross-device). */
  treino: Treino | null;
  status: StatusSessao;
  /** Índice da fase atual dentro das fases expandidas. */
  indice: number;
  /** Epoch (ms) em que a fase atual termina. Válido quando `rodando`. */
  fimPrevistoEpoch: number;
  /** Restante congelado (ms). Válido quando `pausado`/`ocioso`/`encerrado`. */
  restanteMs: number;
}

/** As únicas transições possíveis. Toda alteração passa por uma destas. */
export type AcaoSessao =
  | { tipo: "START"; treino: Treino }
  | { tipo: "PAUSE" }
  | { tipo: "RESUME" }
  | { tipo: "NEXT" }
  | { tipo: "PREVIOUS" }
  | { tipo: "FINISH" }
  | { tipo: "ADD_TIME"; segundos: number }
  | { tipo: "REMOVE_TIME"; segundos: number };

/** Visão pronta para renderizar, derivada do estado + agora. */
export interface VisaoSessao {
  status: StatusSessao;
  treino: Treino | null;
  indice: number;
  totalFases: number;
  faseAtual: Fase | null;
  proximaFase: Fase | null;
  restanteMs: number;
  /** 0 a 1. */
  progresso: number;
  concluido: boolean;
}
