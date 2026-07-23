"use client";

import { useContextoSessao } from "@/lib/sessao/providers/sessao-provider";

/** Acesso à sessão: estado atual, papel e o despachar (só controladores). */
export function useSessao() {
  return useContextoSessao();
}
