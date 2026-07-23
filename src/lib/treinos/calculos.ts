import type { Etapa, Treino } from "@/types";

/**
 * Duração total em segundos.
 *
 * Uma etapa "repetir" multiplica tudo que veio antes dela (desde o começo
 * ou desde o "repetir" anterior). O que vier depois do último "repetir"
 * acontece uma vez só.
 *
 * Derivada das etapas, nunca guardada: um campo no banco ficaria
 * desatualizado assim que alguém editasse uma etapa.
 */
export function duracaoTotalSegundos(treino: Treino): number {
  return duracaoDasEtapas(treino.etapas);
}

export function duracaoDasEtapas(etapas: Etapa[]): number {
  let total = 0;
  let segmento = 0;

  for (const etapa of etapas) {
    if (etapa.tipo === "repetir") {
      total += segmento * Math.max(1, etapa.vezes ?? 1);
      segmento = 0;
    } else {
      segmento += etapa.segundos;
    }
  }

  return total + segmento;
}

/** Quantos exercícios distintos o treino tem (descanso e repetir não contam). */
export function quantidadeExercicios(treino: Treino): number {
  return treino.etapas.filter((e) => e.tipo === "exercicio").length;
}
