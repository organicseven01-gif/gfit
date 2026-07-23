"use client";

import { useEffect, useState } from "react";
import type { MidiaPatrocinador } from "@/types";
import { useVisaoSessao } from "@/lib/sessao/hooks/use-visao-sessao";
import { visaoParaEstadoTv } from "@/lib/sessao/services/mapear-tv";
import { listarParaExibicao } from "@/lib/services/patrocinadores-service";
import { DisplayTv } from "@/components/tv/display-tv";

/**
 * A TV ao vivo: observa a sessão e alimenta a `DisplayTv` já existente.
 * Não envia nada — só reflete o estado que o controlador publica.
 * Os patrocinadores vêm do Supabase.
 */
export function TvAoVivo() {
  const visao = useVisaoSessao();
  const [patrocinadores, setPatrocinadores] = useState<MidiaPatrocinador[]>([]);

  useEffect(() => {
    listarParaExibicao()
      .then(setPatrocinadores)
      .catch(() => setPatrocinadores([]));
  }, []);

  return (
    <DisplayTv estado={visaoParaEstadoTv(visao)} patrocinadores={patrocinadores} />
  );
}
