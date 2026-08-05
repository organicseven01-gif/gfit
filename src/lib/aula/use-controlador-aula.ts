"use client";

import { useEffect, useState } from "react";
import type { AulaParte, ConfigSom, Treino } from "@/types";
import { obterConfiguracoes } from "@/lib/services/configuracoes-service";
import { dataLocalISO } from "@/lib/agenda/agenda";
import { useSessao } from "@/lib/sessao/hooks/use-sessao";
import { useVisaoSessao } from "@/lib/sessao/hooks/use-visao-sessao";
import { useSonsSessao } from "@/lib/sons/use-sons-sessao";
import { desbloquearSom } from "@/lib/sons/motor-sons";

/* ==========================================================================
   Controle da aula do dia — lógica compartilhada entre o celular
   (`/controle-aula`) e o painel embutido na TV (`/tv`). Um só lugar para a
   regra de negócio; cada tela só cuida do próprio layout.
   ========================================================================== */

/** Uma parte da aula vira um "treino" sintético para o motor da sessão. */
export function treinoDaParte(p: AulaParte): Treino {
  return {
    id: `parte-${p.id}`,
    nome: p.nome,
    descricao: null,
    categoria: "funcional",
    etapas: p.etapas,
    criadoEm: "",
    atualizadoEm: "",
  };
}

export function useControladorAula() {
  const [partes, setPartes] = useState<AulaParte[] | null>(null);
  const [som, setSom] = useState<ConfigSom | null>(null);
  const [parteAtivaId, setParteAtivaId] = useState<string | null>(null);

  const { estado, despachar } = useSessao();
  const visao = useVisaoSessao();
  useSonsSessao(visao, som);

  useEffect(() => {
    obterConfiguracoes()
      .then((c) => {
        setPartes(c.aulasDoDia[dataLocalISO()] ?? []);
        setSom(c.som);
      })
      .catch(() => setPartes([]));
  }, []);

  const rodando = estado.status === "rodando";
  const pausado = estado.status === "pausado";
  const concluido = visao.concluido;
  // Há uma sessão de verdade rodando/pausada — pode não ter sido esta aba
  // que a iniciou (reload, ou outro dispositivo tocou).
  const emSessao = estado.status !== "ocioso";

  // Prioriza o que está REALMENTE rodando na sessão (reflete até depois de
  // recarregar, ou se outro dispositivo tocou); cai para a seleção local só
  // enquanto ninguém iniciou nada ainda.
  const parteAtiva =
    partes?.find((p) => estado.treino?.id === `parte-${p.id}`) ??
    partes?.find((p) => p.id === parteAtivaId) ??
    null;

  /**
   * Toca numa parte. Se ela JÁ é a sessão em andamento, alterna pausa/
   * continua em vez de reiniciar do zero — antes, tocar de novo na parte
   * ativa (ex.: depois de recarregar a página) disparava START e resetava
   * o cronômetro sem querer.
   */
  function selecionar(p: AulaParte) {
    desbloquearSom();
    const jaAtiva = estado.treino?.id === `parte-${p.id}`;
    if (jaAtiva && !concluido) {
      if (rodando) despachar({ tipo: "PAUSE" });
      else if (pausado) despachar({ tipo: "RESUME" });
      return;
    }
    setParteAtivaId(p.id);
    despachar({ tipo: "START", treino: treinoDaParte(p) });
  }

  function aoTocarPrincipal() {
    desbloquearSom();
    if (rodando) despachar({ tipo: "PAUSE" });
    else if (pausado) despachar({ tipo: "RESUME" });
    else if (parteAtiva) despachar({ tipo: "START", treino: treinoDaParte(parteAtiva) });
  }

  function encerrar() {
    despachar({ tipo: "FINISH" });
    setParteAtivaId(null);
  }

  return {
    partes,
    parteAtiva,
    estado,
    visao,
    despachar,
    rodando,
    pausado,
    concluido,
    emSessao,
    selecionar,
    aoTocarPrincipal,
    encerrar,
  };
}
