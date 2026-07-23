"use client";

import type { EstadoSessao } from "@/lib/sessao/tipos";
import { criarTransporteSupabase } from "@/lib/sessao/realtime/transporte-supabase";

/* ==========================================================================
   Transporte da sessão.

   Abstrai COMO o estado viaja entre as telas. A engine e o provider não
   sabem que por baixo é o Supabase Realtime — só chamam esta interface.
   ========================================================================== */

export interface Transporte {
  /** Publica o estado atual para as outras telas. */
  publicar(estado: EstadoSessao): void;
  /** Recebe estados publicados por outras telas. Devolve o cancelador. */
  assinar(aoReceber: (estado: EstadoSessao) => void): () => void;
  /** Fecha o canal. */
  encerrar(): void;
}

/** Transporte oficial: Supabase Realtime, canal "gfit-session". */
export function criarTransporte(): Transporte {
  return criarTransporteSupabase();
}
