"use client";

import type { EstadoTv } from "@/types";
import { formatarTempo } from "@/lib/utils";
import { APARENCIA, estadoVisualDe } from "@/lib/tv/estado-visual";

/**
 * Prévia do que está na TV, dentro do controle do celular.
 *
 * Recebe o MESMO `EstadoTv` que a TV consome, então mostra exatamente o que
 * o aluno vê na tela grande — round, fase (com cor), cronômetro e o próximo.
 */
export function PreviaTv({ estado }: { estado: EstadoTv }) {
  if (estado.situacao !== "treino") {
    return (
      <div className="mx-4 rounded-2xl border border-borda bg-black/40 p-4 text-center">
        <p className="text-[0.65rem] font-bold tracking-[0.3em] text-marca">
          📺 NA TV
        </p>
        <p className="mt-1 text-lg font-bold text-texto-suave">
          Aguardando treino
        </p>
      </div>
    );
  }

  const { rotulo, cor } = APARENCIA[estadoVisualDe(estado)];
  const ms = estado.progressivo ? estado.decorridoMs : estado.restanteMs;

  return (
    <div
      className="mx-4 rounded-2xl border p-4"
      style={{
        borderColor: `color-mix(in srgb, ${cor} 45%, var(--color-borda))`,
        backgroundColor: "color-mix(in srgb, black 55%, transparent)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[0.65rem] font-bold tracking-[0.3em] text-marca">
          📺 NA TV
        </span>
        <span className="text-[0.7rem] font-bold tracking-widest text-texto-fraco">
          ROUND {estado.round}/{estado.totalRounds}
        </span>
      </div>

      <p
        className="numeros-timer mt-1 text-center text-5xl leading-none font-extrabold"
        style={{ color: cor }}
      >
        {formatarTempo(ms)}
      </p>

      <p
        className="mt-1 text-center text-xs font-bold tracking-[0.2em] uppercase"
        style={{ color: cor }}
      >
        {rotulo}
      </p>

      <p className="mt-1 truncate text-center text-base font-bold text-texto uppercase">
        {estado.exercicio}
      </p>

      <p className="mt-0.5 truncate text-center text-xs text-texto-fraco">
        A seguir: {estado.proximoExercicio ?? "Último bloco"}
      </p>
    </div>
  );
}
