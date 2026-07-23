import type { MidiaPatrocinador } from "@/types";

/**
 * Peças exibidas na faixa lateral da TV.
 *
 * Placeholders até a academia subir o material real. Para trocar, basta
 * apontar `src` para arquivos em `public/patrocinadores/`.
 *
 * - Imagens: use `duracaoSegundos` para controlar o tempo em tela.
 * - Vídeos: avançam sozinhos quando terminam; devem ser MUDOS
 *   (a TV da academia normalmente fica sem som ou com música própria).
 *
 * Formato ideal: vertical 9:16 (ex.: 1080×1920).
 */
export const patrocinadores: MidiaPatrocinador[] = [
  {
    id: "placeholder-1",
    nome: "Espaço disponível",
    tipo: "imagem",
    src: "/patrocinadores/placeholder-1.svg",
    duracaoSegundos: 8,
  },
  {
    id: "placeholder-2",
    nome: "Espaço disponível",
    tipo: "imagem",
    src: "/patrocinadores/placeholder-2.svg",
    duracaoSegundos: 8,
  },
  {
    id: "placeholder-3",
    nome: "Espaço disponível",
    tipo: "imagem",
    src: "/patrocinadores/placeholder-3.svg",
    duracaoSegundos: 8,
  },
];
