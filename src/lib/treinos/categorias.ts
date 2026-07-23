import type { CategoriaTreino } from "@/types";

type Tom = "marca" | "neutro" | "sucesso" | "alerta" | "erro";

export interface DefinicaoCategoria {
  id: CategoriaTreino;
  nome: string;
  tom: Tom;
}

/** Catálogo de categorias. A UI lê daqui — nada de string solta. */
export const CATEGORIAS: DefinicaoCategoria[] = [
  { id: "crossfit", nome: "CrossFit", tom: "marca" },
  { id: "hyrox", nome: "Hyrox", tom: "sucesso" },
  { id: "funcional", nome: "Funcional", tom: "alerta" },
  { id: "condicionamento", nome: "Condicionamento", tom: "erro" },
  { id: "core", nome: "Core", tom: "neutro" },
];

const POR_ID = new Map(CATEGORIAS.map((c) => [c.id, c]));

export function categoria(id: CategoriaTreino): DefinicaoCategoria {
  return POR_ID.get(id) ?? CATEGORIAS[0];
}
