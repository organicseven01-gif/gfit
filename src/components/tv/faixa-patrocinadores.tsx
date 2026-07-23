"use client";

import { useEffect, useState } from "react";
import type { MidiaPatrocinador } from "@/types";
import { usePlaylist } from "@/lib/patrocinadores/use-playlist";

/**
 * Faixa lateral da TV (~35% da largura).
 *
 * - Ordem: playlist justa (cada peça 1× por ciclo, ver `playlist.ts`).
 * - Transição: crossfade — a peça nova entra por cima em opacidade,
 *   a anterior sai; nunca há corte seco nem tela preta.
 * - Pré-carregamento: a próxima peça é baixada enquanto a atual toca.
 * - Vídeos rodam mudos (a TV da academia fica sem som).
 */
export function FaixaPatrocinadores({ itens }: { itens: MidiaPatrocinador[] }) {
  const { atual, proxima, avancar, marcarQuebrada, total, posicao } =
    usePlaylist(itens);

  // Camadas do crossfade: no máximo duas (a que sai e a que entra).
  const [camadas, setCamadas] = useState<MidiaPatrocinador[]>([]);
  const [idNoTopo, setIdNoTopo] = useState<string | null>(null);

  if (atual && atual.id !== idNoTopo) {
    setIdNoTopo(atual.id);
    setCamadas((anteriores) => [...anteriores.slice(-1), atual]);
  }

  // Imagens avançam por tempo. Vídeo avança sozinho no `onEnded`.
  useEffect(() => {
    if (!atual || atual.tipo === "video" || total <= 1) return;
    const id = setTimeout(avancar, (atual.duracaoSegundos ?? 8) * 1000);
    return () => clearTimeout(id);
  }, [atual, avancar, total]);

  // Espaço reservado mesmo sem nenhuma peça elegível.
  if (!atual) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[1.5vw] border border-borda bg-superficie">
        <p className="text-[1vw] tracking-[0.3em] text-texto-fraco uppercase">
          Espaço para patrocinadores
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.5vw] border border-borda bg-superficie">
      {camadas.map((peca) => {
        const noTopo = peca.id === atual.id;
        return (
          <div
            key={`${peca.id}-${noTopo ? "topo" : "saindo"}`}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: noTopo ? 1 : 0 }}
          >
            {peca.tipo === "video" ? (
              <video
                src={peca.src}
                autoPlay={noTopo}
                muted
                playsInline
                preload="auto"
                onEnded={noTopo ? avancar : undefined}
                onError={() => {
                  marcarQuebrada(peca.id);
                  if (noTopo) avancar();
                }}
                className="h-full w-full object-cover"
              />
            ) : (
              // <img> em vez de next/image: a peça troca dinamicamente e o
              // arquivo vem do Storage, fora do otimizador.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={peca.src}
                alt={peca.nome}
                onError={() => {
                  marcarQuebrada(peca.id);
                  if (noTopo) avancar();
                }}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        );
      })}

      {/* Pré-carrega a próxima peça: quando ela entrar, já está em cache. */}
      {proxima && (
        <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
          {proxima.tipo === "video" ? (
            <video src={proxima.src} preload="auto" muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={proxima.src} alt="" />
          )}
        </div>
      )}

      {/* Selo discreto no topo */}
      <span className="absolute top-[1.5vh] left-[1.5vh] rounded-full bg-black/60 px-[1vw] py-[0.5vh] text-[0.7vw] font-semibold tracking-[0.25em] text-texto-suave uppercase backdrop-blur">
        Patrocínio
      </span>

      {/* Indicadores de posição no ciclo */}
      {total > 1 && (
        <div className="absolute inset-x-0 bottom-[1.5vh] flex justify-center gap-[0.5vw]">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={
                "h-[0.4vh] rounded-full transition-all duration-500 " +
                (i === posicao ? "w-[2vw] bg-marca" : "w-[0.8vw] bg-white/25")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
