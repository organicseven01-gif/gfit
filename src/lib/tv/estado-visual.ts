import type { EstadoTvTreino } from "@/types";

/* ==========================================================================
   Estado VISUAL da tela da TV.

   Camada puramente de apresentação: não altera a engine nem o modelo de
   dados. A engine só distingue `trabalho` e `descanso`; "Aquecimento" é o
   nome de um exercício, então é reconhecido aqui pelo nome para ganhar
   cor própria na tela.
   ========================================================================== */

export type EstadoVisual =
  | "aquecimento"
  | "exercicio"
  | "descanso"
  | "preparacao";

const PARECE_AQUECIMENTO = /aquec|warm|mobilidade|alongamento/i;

export function estadoVisualDe(estado: EstadoTvTreino): EstadoVisual {
  if (estado.fase === "descanso") return "descanso";
  if (estado.fase === "preparar") return "preparacao";
  return PARECE_AQUECIMENTO.test(estado.exercicio)
    ? "aquecimento"
    : "exercicio";
}

export interface Aparencia {
  rotulo: string;
  cor: string;
}

export const APARENCIA: Record<EstadoVisual, Aparencia> = {
  aquecimento: { rotulo: "AQUECIMENTO", cor: "var(--color-neutro)" },
  exercicio: { rotulo: "EXERCÍCIO", cor: "var(--color-trabalho)" },
  descanso: { rotulo: "DESCANSO", cor: "var(--color-descanso)" },
  preparacao: { rotulo: "PREPARAÇÃO", cor: "var(--color-preparar)" },
};

/** Segundos finais em que a troca é sinalizada na tela. */
export const ALERTA_MS = 5000;
