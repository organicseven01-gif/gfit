"use client";

import { useEffect } from "react";
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
import { useControladorAula } from "@/lib/aula/use-controlador-aula";
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

export function ControleAula() {
  const {
    partes,
    parteAtiva,
    visao,
    despachar,
    rodando,
    pausado,
    concluido,
    emSessao,
    selecionar,
    aoTocarPrincipal,
    encerrar,
  } = useControladorAula();
  const faseAtual = visao.faseAtual;

  const corFase =
    faseAtual && !concluido
      ? COR_FASE[faseAtual.tipo]
      : "var(--color-neutro)";

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

  if (partes.length === 0 && !emSessao) {
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

  // Sem aula cadastrada hoje, mas há uma sessão ativa (ex.: sobra de um
  // teste, ou um treino avulso iniciado pela biblioteca) — dá pra pará-la
  // por aqui em vez de ficar preso sem nenhum controle.
  if (partes.length === 0 && emSessao) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-4 p-4">
        <p className="text-center text-sm text-texto-fraco">
          Nenhuma aula cadastrada para hoje, mas há uma sessão ativa.
        </p>
        <PreviaTv estado={visaoParaEstadoTv(visao)} />
        <div className="grid grid-cols-2 gap-3">
          <BotaoControle
            rotulo={rodando ? "Pausar" : "Continuar"}
            icone={rodando ? Pause : Play}
            onClick={aoTocarPrincipal}
          />
          <BotaoControle
            tom="perigo"
            rotulo="Encerrar"
            icone={Square}
            onClick={encerrar}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex min-h-full w-full max-w-md flex-col"
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
            {parteAtiva
              ? `Parte ${partes.indexOf(parteAtiva) + 1} de ${partes.length}`
              : emSessao
                ? "Sessão em andamento"
                : "Escolha uma parte"}
          </p>
        </div>
      </header>

      {/* Seletor de partes */}
      <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2">
        {partes.map((p, i) => {
          const ativa = p.id === parteAtiva?.id;
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
      <div className="mt-auto grid grid-cols-2 gap-3 p-4">
        <BotaoControle
          className="col-span-2 min-h-24"
          destaque
          rotulo={rotuloPrincipal}
          icone={iconePrincipal}
          onClick={aoTocarPrincipal}
          disabled={!parteAtiva && !emSessao}
        />

        <BotaoControle
          rotulo="Anterior"
          icone={SkipBack}
          onClick={() => despachar({ tipo: "PREVIOUS" })}
          disabled={!emSessao || visao.indice === 0}
        />
        <BotaoControle
          rotulo="Próximo"
          icone={SkipForward}
          onClick={() => despachar({ tipo: "NEXT" })}
          disabled={!emSessao || visao.indice >= visao.totalFases - 1}
        />

        <BotaoControle
          rotulo={`+${AJUSTE_SEGUNDOS}s`}
          sublabel="Adicionar"
          icone={Plus}
          onClick={() => despachar({ tipo: "ADD_TIME", segundos: AJUSTE_SEGUNDOS })}
          disabled={!emSessao || concluido}
        />
        <BotaoControle
          rotulo={`−${AJUSTE_SEGUNDOS}s`}
          sublabel="Diminuir"
          icone={Minus}
          onClick={() => despachar({ tipo: "REMOVE_TIME", segundos: AJUSTE_SEGUNDOS })}
          disabled={!emSessao || concluido}
        />

        <BotaoControle
          className="col-span-2"
          tom="perigo"
          rotulo="Encerrar aula"
          icone={Square}
          onClick={encerrar}
          disabled={!emSessao}
        />
      </div>
    </div>
  );
}
