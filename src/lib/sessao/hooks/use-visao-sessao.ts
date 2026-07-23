"use client";

import { useEffect, useState } from "react";
import { derivarVisao } from "@/lib/sessao/engine/engine";
import { useSessao } from "@/lib/sessao/hooks/use-sessao";
import type { VisaoSessao } from "@/lib/sessao/tipos";

/**
 * Visão de exibição da sessão, atualizada a cada frame.
 *
 * Este é o ÚNICO tique local de cada tela — e ele só deriva do estado
 * compartilhado, nunca o altera. Só roda `rAF` enquanto `rodando`; pausado
 * ou ocioso, o valor é congelado e não há trabalho por frame.
 */
export function useVisaoSessao(): VisaoSessao {
  const { estado } = useSessao();
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (estado.status !== "rodando") return;
    let id = 0;
    const loop = () => {
      setAgora(Date.now());
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [estado.status]);

  return derivarVisao(estado, agora);
}
