"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { Configuracoes, Treino } from "@/types";
import { obterTreino } from "@/lib/services/treinos-service";
import { obterConfiguracoes } from "@/lib/services/configuracoes-service";
import { expandirEtapas, type Fase } from "@/lib/timer/expandir";
import { useSessao } from "@/lib/sessao/hooks/use-sessao";
import { useVisaoSessao } from "@/lib/sessao/hooks/use-visao-sessao";
import { useSonsSessao } from "@/lib/sons/use-sons-sessao";
import { desbloquearSom } from "@/lib/sons/motor-sons";
import { formatarTempo } from "@/lib/utils";
import { BotaoControle } from "@/components/controle/botao-controle";

const AJUSTE_SEGUNDOS = 10;

/** Cor de fundo por tipo de fase, para leitura instantânea a distância. */
const COR_FASE = {
  exercicio: "var(--color-trabalho)",
  descanso: "var(--color-descanso)",
  preparacao: "var(--color-preparar)",
} as const;

/**
 * Controle remoto: NÃO conta tempo por conta própria. Ele apenas despacha
 * ações para a engine (via a sessão) e exibe a visão derivada. A TV reflete
 * a mesma sessão em tempo real.
 */
export function ControleRemoto({ treinoId }: { treinoId: string }) {
  const [treino, setTreino] = useState<Treino | null>(null);
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [carregando, setCarregando] = useState(true);

  const { estado, despachar } = useSessao();
  const visao = useVisaoSessao();

  // Toca os bipes também no celular — como o coach interage aqui (toques),
  // o áudio já está liberado, então dá pra ouvir na hora sem depender da TV.
  useSonsSessao(visao, config?.som ?? null);

  useEffect(() => {
    obterTreino(treinoId).then((t) => {
      setTreino(t);
      setCarregando(false);
    });
    obterConfiguracoes()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, [treinoId]);

  // Prévia local do treino carregado, para o visor mostrar a primeira etapa
  // antes de dar START (quando a sessão ainda está ociosa).
  const fasesLocais = useMemo(
    () => (treino ? expandirEtapas(treino.etapas) : []),
    [treino],
  );

  // Antes de iniciar, o visor usa a prévia local; em sessão, usa a visão viva.
  const emSessao = estado.status !== "ocioso";
  const faseAtual: Fase | null = emSessao ? visao.faseAtual : fasesLocais[0] ?? null;
  const proximaFase: Fase | null = emSessao ? visao.proximaFase : fasesLocais[1] ?? null;
  const restanteMs = emSessao
    ? visao.restanteMs
    : (fasesLocais[0]?.segundos ?? 0) * 1000;
  const indice = emSessao ? visao.indice : 0;
  const totalFases = emSessao ? visao.totalFases : fasesLocais.length;

  const rodando = estado.status === "rodando";
  const pausado = estado.status === "pausado";
  const concluido = visao.concluido;
  const semFases = fasesLocais.length === 0;

  // Mantém a tela do celular acesa durante a aula.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const pedir = async () => {
      try {
        if ("wakeLock" in navigator) {
          lock = await navigator.wakeLock.request("screen");
        }
      } catch {
        // negado (aba em segundo plano, bateria baixa): sem problema.
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

  const corFase =
    faseAtual && !concluido ? COR_FASE[faseAtual.tipo] : "var(--color-neutro)";

  // Ação do botão principal conforme a situação.
  const aoTocarPrincipal = () => {
    desbloquearSom(); // este toque libera o áudio do celular
    if (rodando) despachar({ tipo: "PAUSE" });
    else if (pausado) despachar({ tipo: "RESUME" });
    else if (treino) despachar({ tipo: "START", treino }); // ocioso ou encerrado
  };
  const rotuloPrincipal = rodando
    ? "Pausar"
    : concluido
      ? "Reiniciar"
      : pausado
        ? "Continuar"
        : "Iniciar";
  const iconePrincipal = rodando ? Pause : concluido ? RotateCcw : Play;

  if (carregando) {
    return (
      <div className="grid flex-1 place-items-center text-texto-fraco">
        <RotateCcw className="size-8 animate-spin" aria-hidden />
      </div>
    );
  }

  if (!treino) {
    return (
      <div className="grid flex-1 place-items-center p-6 text-center">
        <div className="space-y-3">
          <p className="text-texto-suave">Treino não encontrado.</p>
          <Link
            href="/painel/treinos"
            className="inline-flex items-center gap-1.5 text-sm text-marca"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar à biblioteca
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      // largura de celular, centralizada: numa TV/desktop o controle não
      // se esparrama, fica uma coluna intencional.
      className="mx-auto flex h-full w-full max-w-md flex-col"
      style={{ ["--c" as string]: corFase }}
    >
      {/* Cabeçalho compacto: sair + nome do treino */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link
          href={`/painel/treinos/${treino.id}`}
          aria-label="Sair do controle"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-borda text-texto-suave"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-semibold text-texto">{treino.nome}</p>
          <p className="text-xs text-texto-fraco">
            {concluido
              ? "Treino concluído"
              : emSessao
                ? `Etapa ${indice + 1} de ${totalFases}`
                : "Pronto para começar"}
          </p>
        </div>
      </header>

      {/* Visor: fase atual + cronômetro + próxima */}
      <section
        className="mx-4 flex flex-col items-center justify-center gap-1 rounded-3xl border py-6 transition-colors"
        style={{
          borderColor: `color-mix(in srgb, ${corFase} 40%, var(--color-borda))`,
          backgroundColor: `color-mix(in srgb, ${corFase} 10%, transparent)`,
        }}
      >
        {/* Espelha a TV: mesmo round, mesma fase, mesmo tempo. */}
        {faseAtual && !concluido && faseAtual.totalRounds > 1 && (
          <p className="text-xs font-bold tracking-[0.2em] text-texto-fraco uppercase">
            Round {faseAtual.round} de {faseAtual.totalRounds}
          </p>
        )}

        <p
          className="text-sm font-bold tracking-[0.2em] uppercase"
          style={{ color: corFase }}
        >
          {concluido
            ? "CONCLUÍDO"
            : faseAtual
              ? faseAtual.tipo === "descanso"
                ? "DESCANSO"
                : faseAtual.nome
              : "AGUARDANDO"}
        </p>

        <p className="numeros-timer text-7xl leading-none font-extrabold text-texto">
          {formatarTempo(restanteMs)}
        </p>

        <p className="mt-1 h-5 text-sm text-texto-fraco">
          {proximaFase
            ? `A seguir: ${proximaFase.tipo === "descanso" ? "Descanso" : proximaFase.nome}`
            : concluido
              ? ""
              : "Última etapa"}
        </p>
      </section>

      {/* Botões grandes */}
      <div className="grid flex-1 grid-cols-2 gap-3 p-4">
        {/* Iniciar / Pausar ocupa a largura toda e é o maior alvo */}
        <BotaoControle
          className="col-span-2 min-h-24"
          destaque
          rotulo={rotuloPrincipal}
          icone={iconePrincipal}
          onClick={aoTocarPrincipal}
          disabled={semFases}
        />

        <BotaoControle
          rotulo="Anterior"
          icone={SkipBack}
          onClick={() => despachar({ tipo: "PREVIOUS" })}
          disabled={!emSessao || indice === 0}
        />
        <BotaoControle
          rotulo="Próximo"
          icone={SkipForward}
          onClick={() => despachar({ tipo: "NEXT" })}
          disabled={!emSessao || indice >= totalFases - 1}
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
          onClick={() =>
            despachar({ tipo: "REMOVE_TIME", segundos: AJUSTE_SEGUNDOS })
          }
          disabled={!emSessao || concluido}
        />

        <BotaoControle
          className="col-span-2"
          tom="perigo"
          rotulo="Encerrar treino"
          icone={Square}
          onClick={() => despachar({ tipo: "FINISH" })}
          disabled={!emSessao || concluido}
        />
      </div>
    </div>
  );
}
