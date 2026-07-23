import { Dumbbell, Pause, Repeat, type LucideIcon } from "lucide-react";
import type { Etapa, TipoEtapa } from "@/types";

export interface DefinicaoTipo {
  id: TipoEtapa;
  rotulo: string;
  icone: LucideIcon;
  /** Token de cor usado no acento da linha. */
  cor: string;
  nomePadrao: string;
  segundosPadrao: number;
}

export const TIPOS_ETAPA: DefinicaoTipo[] = [
  {
    id: "exercicio",
    rotulo: "Exercício",
    icone: Dumbbell,
    cor: "var(--color-trabalho)",
    nomePadrao: "Novo exercício",
    segundosPadrao: 40,
  },
  {
    id: "descanso",
    rotulo: "Descanso",
    icone: Pause,
    cor: "var(--color-descanso)",
    nomePadrao: "Descanso",
    segundosPadrao: 20,
  },
  {
    id: "repetir",
    rotulo: "Repetir",
    icone: Repeat,
    cor: "var(--color-marca)",
    nomePadrao: "Repetir tudo",
    segundosPadrao: 0,
  },
];

const POR_ID = new Map(TIPOS_ETAPA.map((t) => [t.id, t]));

export function tipoEtapa(id: TipoEtapa): DefinicaoTipo {
  return POR_ID.get(id) ?? TIPOS_ETAPA[0];
}

function novoId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}

export function criarEtapa(tipo: TipoEtapa): Etapa {
  const def = tipoEtapa(tipo);
  return {
    id: novoId(),
    tipo,
    nome: def.nomePadrao,
    segundos: def.segundosPadrao,
    ...(tipo === "repetir" ? { vezes: 3 } : {}),
  };
}

/** Duplica preservando os dados, mas com identidade nova. */
export function clonarEtapa(etapa: Etapa): Etapa {
  return { ...etapa, id: novoId() };
}

/** Passo de ajuste do tempo: mais fino em durações curtas. */
export function passoSegundos(segundos: number): number {
  if (segundos < 60) return 5;
  if (segundos < 300) return 15;
  return 30;
}

/** "0:40", "3:00", "1:05:00" */
export function formatarRelogio(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(seg)}` : `${m}:${pad(seg)}`;
}
