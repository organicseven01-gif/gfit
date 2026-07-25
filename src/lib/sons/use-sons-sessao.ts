"use client";

import { useEffect, useRef } from "react";
import type { ConfigSom } from "@/types";
import type { VisaoSessao } from "@/lib/sessao/tipos";
import { tocarSom } from "@/lib/sons/motor-sons";

/* ==========================================================================
   Dispara os sons do treino a partir das transições da sessão.

   Roda na TV (que tem as caixas de som da academia). Só reage a MUDANÇAS de
   estado — nunca por segundo. Respeita as preferências (ativo, volume, e cada
   evento individualmente).
   ========================================================================== */

export function useSonsSessao(visao: VisaoSessao, som: ConfigSom | null): void {
  const indiceAnterior = useRef<number | null>(null);
  const statusAnterior = useRef<string>("ocioso");
  const tipoAnterior = useRef<string | null>(null);
  const ultimoTique = useRef<number>(-1);

  // Preparação, início do treino, troca de fase e conclusão.
  useEffect(() => {
    if (!som || !som.ativo) {
      indiceAnterior.current = visao.indice;
      statusAnterior.current = visao.status;
      tipoAnterior.current = visao.faseAtual?.tipo ?? null;
      return;
    }
    const vol = som.volume;
    const prevStatus = statusAnterior.current;
    const prevIndice = indiceAnterior.current;
    const prevTipo = tipoAnterior.current;
    const fase = visao.faseAtual;

    if (visao.concluido && prevStatus !== "encerrado") {
      if (som.conclusao) tocarSom("conclusao", vol);
    } else if (visao.status === "rodando") {
      const comecou = prevStatus === "ocioso" || prevStatus === "encerrado";
      if (comecou) {
        // O treino abre com os 10s de "prepare-se".
        if (fase?.tipo === "preparacao") {
          if (som.preparacao) tocarSom("preparacao", vol);
        } else if (som.inicio) {
          tocarSom("inicio", vol);
        }
        ultimoTique.current = -1;
      } else if (visao.indice !== prevIndice) {
        // troca de fase (não dispara em RESUME, que mantém o índice)
        if (fase?.tipo === "descanso") {
          if (som.descanso) tocarSom("descanso", vol);
        } else if (prevTipo === "preparacao") {
          // saiu da preparação → agora o treino vale de fato
          if (som.inicio) tocarSom("inicio", vol);
        } else if (som.troca) {
          tocarSom("troca", vol);
        }
        ultimoTique.current = -1;
      }
    }

    indiceAnterior.current = visao.indice;
    statusAnterior.current = visao.status;
    tipoAnterior.current = fase?.tipo ?? null;
  }, [visao.status, visao.indice, visao.concluido, visao.faseAtual, som]);

  // Contagem regressiva 3-2-1 nos segundos finais da fase.
  useEffect(() => {
    if (!som || !som.ativo || !som.contagem) return;
    if (visao.status !== "rodando") return;
    const seg = Math.ceil(visao.restanteMs / 1000);
    if (seg >= 1 && seg <= 3 && seg !== ultimoTique.current) {
      ultimoTique.current = seg;
      tocarSom("contagem", som.volume);
    }
  }, [visao.restanteMs, visao.status, som]);
}
