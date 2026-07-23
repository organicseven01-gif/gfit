import type { Treino } from "@/types";
import { expandirEtapas, type Fase } from "@/lib/timer/expandir";
import type {
  AcaoSessao,
  EstadoSessao,
  VisaoSessao,
} from "@/lib/sessao/tipos";

/* ==========================================================================
   A ÚNICA engine do treino.

   Puro: sem React, sem I/O, sem `Date.now()` interno. Recebe o instante de
   fora (`agora`) para ser determinística e testável. Toda tela consome o
   resultado desta engine — nenhuma tem lógica de contagem própria.
   ========================================================================== */

export function estadoInicial(): EstadoSessao {
  return {
    versao: 0,
    atualizadoEm: 0,
    treino: null,
    status: "ocioso",
    indice: 0,
    fimPrevistoEpoch: 0,
    restanteMs: 0,
  };
}

function fasesDe(treino: Treino | null): Fase[] {
  return treino ? expandirEtapas(treino.etapas) : [];
}

function duracaoMs(fases: Fase[], indice: number): number {
  return (fases[indice]?.segundos ?? 0) * 1000;
}

/** Aplica uma ação e devolve o novo estado (nova versão). */
export function reduzir(
  estado: EstadoSessao,
  acao: AcaoSessao,
  agora: number,
): EstadoSessao {
  const proximo = (patch: Partial<EstadoSessao>): EstadoSessao => ({
    ...estado,
    ...patch,
    versao: estado.versao + 1,
    atualizadoEm: agora,
  });

  switch (acao.tipo) {
    case "START": {
      const fases = fasesDe(acao.treino);
      if (fases.length === 0) {
        return proximo({
          treino: acao.treino,
          status: "encerrado",
          indice: 0,
          fimPrevistoEpoch: 0,
          restanteMs: 0,
        });
      }
      const dur = duracaoMs(fases, 0);
      return proximo({
        treino: acao.treino,
        status: "rodando",
        indice: 0,
        fimPrevistoEpoch: agora + dur,
        restanteMs: dur,
      });
    }

    case "PAUSE": {
      if (estado.status !== "rodando") return estado;
      return proximo({
        status: "pausado",
        restanteMs: Math.max(0, estado.fimPrevistoEpoch - agora),
      });
    }

    case "RESUME": {
      if (estado.status !== "pausado") return estado;
      return proximo({
        status: "rodando",
        fimPrevistoEpoch: agora + estado.restanteMs,
      });
    }

    case "NEXT": {
      if (estado.treino === null) return estado;
      const fases = fasesDe(estado.treino);
      const alvo = estado.indice + 1;
      if (alvo >= fases.length) {
        return proximo({
          status: "encerrado",
          fimPrevistoEpoch: 0,
          restanteMs: 0,
        });
      }
      return moverPara(estado, fases, alvo, agora, proximo);
    }

    case "PREVIOUS": {
      if (estado.treino === null) return estado;
      const fases = fasesDe(estado.treino);
      const alvo = Math.max(0, estado.indice - 1);
      return moverPara(estado, fases, alvo, agora, proximo);
    }

    case "FINISH": {
      return proximo({ status: "encerrado", fimPrevistoEpoch: 0, restanteMs: 0 });
    }

    case "ADD_TIME":
    case "REMOVE_TIME": {
      if (estado.status === "encerrado" || estado.treino === null) return estado;
      const delta = (acao.tipo === "ADD_TIME" ? 1 : -1) * acao.segundos * 1000;
      if (estado.status === "rodando") {
        const fim = Math.max(agora, estado.fimPrevistoEpoch + delta);
        return proximo({ fimPrevistoEpoch: fim, restanteMs: Math.max(0, fim - agora) });
      }
      return proximo({ restanteMs: Math.max(0, estado.restanteMs + delta) });
    }
  }
}

function moverPara(
  estado: EstadoSessao,
  fases: Fase[],
  alvo: number,
  agora: number,
  proximo: (patch: Partial<EstadoSessao>) => EstadoSessao,
): EstadoSessao {
  const dur = duracaoMs(fases, alvo);
  if (estado.status === "rodando") {
    return proximo({ indice: alvo, fimPrevistoEpoch: agora + dur, restanteMs: dur });
  }
  // navegar a partir de "encerrado" volta para "pausado"
  return proximo({
    status: estado.status === "encerrado" ? "pausado" : estado.status,
    indice: alvo,
    fimPrevistoEpoch: 0,
    restanteMs: dur,
  });
}

/** Deriva a visão de exibição do estado + instante atual. Puro. */
export function derivarVisao(
  estado: EstadoSessao,
  agora: number,
): VisaoSessao {
  const fases = fasesDe(estado.treino);
  const concluido = estado.status === "encerrado";
  const faseAtual = concluido ? null : (fases[estado.indice] ?? null);
  const proximaFase = concluido ? null : (fases[estado.indice + 1] ?? null);
  const dur = duracaoMs(fases, estado.indice);

  let restanteMs = estado.restanteMs;
  if (estado.status === "rodando") {
    restanteMs = Math.max(0, estado.fimPrevistoEpoch - agora);
  }

  const progresso = dur > 0 ? Math.min(1, Math.max(0, 1 - restanteMs / dur)) : 0;

  return {
    status: estado.status,
    treino: estado.treino,
    indice: estado.indice,
    totalFases: fases.length,
    faseAtual,
    proximaFase,
    restanteMs: concluido ? 0 : restanteMs,
    progresso: concluido ? 1 : progresso,
    concluido,
  };
}
