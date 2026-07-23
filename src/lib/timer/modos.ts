import type { ModoTimer } from "@/types";

export interface DefinicaoModo {
  id: ModoTimer;
  nome: string;
  descricao: string;
  /** Conta para cima (cronômetro) em vez de regressivo. */
  progressivo: boolean;
  /** Campos que o formulário deve exibir para este modo. */
  campos: Array<"rounds" | "trabalho" | "descanso" | "duracao">;
}

/**
 * Catálogo dos modos suportados.
 * A engine de contagem consome esta lista — nada de `switch` espalhado.
 */
export const MODOS_TIMER: DefinicaoModo[] = [
  {
    id: "relogio",
    nome: "Relógio",
    descricao: "Cronômetro livre, sem limite de tempo.",
    progressivo: true,
    campos: [],
  },
  {
    id: "tabata",
    nome: "Tabata",
    descricao: "Trabalho e descanso alternados por rounds.",
    progressivo: false,
    campos: ["rounds", "trabalho", "descanso"],
  },
  {
    id: "for_time",
    nome: "For Time",
    descricao: "Conta para cima até concluir, com time cap opcional.",
    progressivo: true,
    campos: ["duracao"],
  },
  {
    id: "emom",
    nome: "EMOM",
    descricao: "Um round novo a cada intervalo.",
    progressivo: false,
    campos: ["rounds", "trabalho"],
  },
  {
    id: "amrap",
    nome: "AMRAP",
    descricao: "Contagem regressiva até o fim do tempo.",
    progressivo: false,
    campos: ["duracao"],
  },
];

/** Segundos de contagem antes de o treino começar. */
export const SEGUNDOS_PREPARACAO = 10;

/** Cor de cada fase — precisa casar com os tokens de globals.css. */
export const COR_DA_FASE = {
  preparar: "var(--color-preparar)",
  trabalho: "var(--color-trabalho)",
  descanso: "var(--color-descanso)",
} as const;
