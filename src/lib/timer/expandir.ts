import type { Etapa, TipoEtapa } from "@/types";

/** Contagem regressiva de "prepare-se" no começo de todo treino (segundos). */
export const PREPARACAO_SEGUNDOS = 10;

/** Uma ocorrência concreta de etapa na linha do tempo do treino. */
export interface Fase {
  /** Único por ocorrência — a mesma etapa repetida gera ids diferentes. */
  id: string;
  etapaId: string;
  nome: string;
  tipo: "exercicio" | "descanso" | "preparacao";
  segundos: number;
  /** Round em que esta ocorrência acontece (1-based). */
  round: number;
  totalRounds: number;
  /** Conta pra cima (tempo decorrido) em vez de regressivo. */
  progressivo: boolean;
}

/**
 * Expande a lista de etapas na sequência real de fases.
 *
 * Uma etapa "repetir" multiplica tudo que veio antes dela (desde o começo
 * ou desde o "repetir" anterior). O que vier depois do último "repetir"
 * acontece uma vez só — mesma regra de `duracaoDasEtapas`.
 */
export function expandirEtapas(
  etapas: Etapa[],
  opcoes: { preparacaoSegundos?: number } = {},
): Fase[] {
  const preparacaoSegundos = opcoes.preparacaoSegundos ?? PREPARACAO_SEGUNDOS;
  const fases: Fase[] = [];
  let segmento: Etapa[] = [];

  const despejar = (vezes: number) => {
    for (let round = 1; round <= vezes; round++) {
      for (const etapa of segmento) {
        fases.push({
          id: `${etapa.id}#${round}#${fases.length}`,
          etapaId: etapa.id,
          nome: etapa.nome,
          tipo: etapa.tipo as Exclude<TipoEtapa, "repetir">,
          segundos: etapa.segundos,
          round,
          totalRounds: vezes,
          progressivo: etapa.progressivo ?? false,
        });
      }
    }
    segmento = [];
  };

  for (const etapa of etapas) {
    if (etapa.tipo === "repetir") {
      despejar(Math.max(1, etapa.vezes ?? 1));
    } else {
      segmento.push(etapa);
    }
  }
  despejar(1);

  // "Prepare-se": 10s de contagem regressiva antes do treino valer, uma vez.
  if (preparacaoSegundos > 0 && fases.length > 0) {
    fases.unshift({
      id: "preparacao#0",
      etapaId: "preparacao",
      nome: "Prepare-se",
      tipo: "preparacao",
      segundos: preparacaoSegundos,
      round: 1,
      totalRounds: fases[0].totalRounds,
      progressivo: false,
    });
  }

  return fases;
}
