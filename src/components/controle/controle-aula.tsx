"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  Minus,
  Square,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import type { AulaParte, ConfigSom, Treino } from "@/types";
import { obterConfiguracoes } from "@/lib/services/configuracoes-service";
import { dataLocalISO } from "@/lib/agenda/agenda";
import { useSessao } from "@/lib/sessao/hooks/use-sessao";
import { useVisaoSessao } from "@/lib/sessao/hooks/use-visao-sessao";
import { useSonsSessao } from "@/lib/sons/use-sons-sessao";
import { desbloquearSom } from "@/lib/sons/motor-sons";
import { visaoParaEstadoTv } from "@/lib/sessao/services/mapear-tv";
import { cn } from "@/lib/utils";
import { BotaoControle } from "@/components/controle/botao-controle";
import { PreviaTv } from "@/components/controle/previa-tv";

const AJUSTE_SEGUNDOS = 10;

const COR_FASE = {
  exercicio: "var(--color-trabalho)",
  descanso: "var(--color-descanso)",
  preparacao: "var(--color-preparar)",
} as const;

/** Uma parte da aula vira um "treino" sintético para o motor da sessão. */
function treinoDaParte(p: AulaParte): Treino {
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

export function ControleAula() {
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

  // Mantém a tela do celular acesa durante a aula.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const pedir = async () => {
      try {
        if ("wakeLock" in navigator)
          lock = await navigator.wakeLock.request("screen");
      } catch {
        /* negado: sem problema */
      }
    };
    pedir();
    const aoVoltar = () => {
      if (document.visibilityState === "visible") pedir();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      document.removeEventListener("visibilitychange", aoVoltar);
      lock?.release().catch(() => {});
    };
  }, []);

  const parteAtiva = partes?.find((p) => p.id === parteAtivaId) ?? null;
  const rodando = estado.status === "rodando";
  const pausado = estado.status === "pausado";
  const concluido = visao.concluido;
  const faseAtual = visao.faseAtual;

  const corFase =
    faseAtual && !concluido
      ? COR_FASE[faseAtual.tipo]
      : "var(--color-neutro)";

  function selecionar(p: AulaParte) {
    desbloquearSom(); // libera o áudio do celular
    setParteAtivaId(p.id);
    despachar({ tipo: "START", treino: treinoDaParte(p) });
  }

  function aoTocarPrincipal() {
    desbloquearSom();
    if (rodando) despachar({ tipo: "PAUSE" });
    else if (pausado) despachar({ tipo: "RESUME" });
    else if (parteAtiva) despachar({ tipo: "START", treino: treinoDaParte(parteAtiva) });
  }

  const rotuloPrincipal = rodando
    ? "Pausar"
    : concluido
      ? "Reiniciar"
      : pausado
        ? "Continuar"
        : "Iniciar";
  const iconePrincipal = rodando ? Pause : concluido ? RotateCcw : Play;

  if (partes === null) {
    return (
      <div className="grid flex-1 place-items-center text-texto-fraco">
        <RotateCcw className="size-8 animate-spin" aria-hidden />
      </div>
    );
  }

  if (partes.length === 0) {
    return (
      <div className="grid flex-1 place-items-center p-6 text-center">
        <div className="space-y-3">
          <p className="text-texto-suave">Nenhuma aula definida para hoje.</p>
          <Link
            href="/painel/agenda"
            className="inline-flex items-center gap-1.5 text-sm text-marca"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Montar a aula na Agenda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex h-full w-full max-w-md flex-col"
      style={{ ["--c" as string]: corFase }}
    >
      {/* Cabeçalho */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link
          href="/painel/controle"
          aria-label="Sair"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-borda text-texto-suave"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-semibold text-texto">Aula de hoje</p>
          <p className="text-xs text-texto-fraco">
            {parteAtiva ? `Parte ${partes.indexOf(parteAtiva) + 1} de ${partes.length}` : "Escolha uma parte"}
          </p>
        </div>
      </header>

      {/* Seletor de partes */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2">
        {partes.map((p, i) => {
          const ativa = p.id === parteAtivaId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selecionar(p)}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                ativa
                  ? "border-marca bg-marca text-marca-contraste"
                  : "border-borda text-texto-suave hover:border-borda-forte",
              )}
            >
              <span className="mr-1.5 opacity-60">{i + 1}</span>
              {p.nome}
            </button>
          );
        })}
      </div>

      {/* Prévia do que está na TV */}
      <div className="pb-3">
        <PreviaTv estado={visaoParaEstadoTv(visao)} />
      </div>

      {/* Exercícios da parte */}
      {parteAtiva && parteAtiva.movimentos.length > 0 && (
        <ul className="mx-4 mt-3 space-y-1 rounded-2xl border border-borda bg-superficie-2 p-4 text-sm text-texto-suave">
          {parteAtiva.movimentos.map((m, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-texto-fraco">•</span>
              {m}
            </li>
          ))}
        </ul>
      )}

      {/* Botões */}
      <div className="grid flex-1 grid-cols-2 gap-3 p-4">
        <BotaoControle
          className="col-span-2 min-h-24"
          destaque
          rotulo={rotuloPrincipal}
          icone={iconePrincipal}
          onClick={aoTocarPrincipal}
          disabled={!parteAtiva}
        />

        <BotaoControle
          rotulo="Anterior"
          icone={SkipBack}
          onClick={() => despachar({ tipo: "PREVIOUS" })}
          disabled={!parteAtiva || visao.indice === 0}
        />
        <BotaoControle
          rotulo="Próximo"
          icone={SkipForward}
          onClick={() => despachar({ tipo: "NEXT" })}
          disabled={!parteAtiva || visao.indice >= visao.totalFases - 1}
        />

        <BotaoControle
          rotulo={`+${AJUSTE_SEGUNDOS}s`}
          sublabel="Adicionar"
          icone={Plus}
          onClick={() => despachar({ tipo: "ADD_TIME", segundos: AJUSTE_SEGUNDOS })}
          disabled={!parteAtiva || concluido}
        />
        <BotaoControle
          rotulo={`−${AJUSTE_SEGUNDOS}s`}
          sublabel="Diminuir"
          icone={Minus}
          onClick={() => despachar({ tipo: "REMOVE_TIME", segundos: AJUSTE_SEGUNDOS })}
          disabled={!parteAtiva || concluido}
        />

        <BotaoControle
          className="col-span-2"
          tom="perigo"
          rotulo="Encerrar aula"
          icone={Square}
          onClick={() => {
            despachar({ tipo: "FINISH" });
            setParteAtivaId(null);
          }}
          disabled={!parteAtiva}
        />
      </div>
    </div>
  );
}
