import type { EstadoTvTreino } from "@/types";
import { formatarTempo } from "@/lib/utils";
import { BarraProgresso } from "@/components/tv/barra-progresso";
import {
  APARENCIA,
  ALERTA_MS,
  estadoVisualDe,
} from "@/lib/tv/estado-visual";

/**
 * Coluna principal durante o treino (~70% da tela).
 *
 * Hierarquia deliberada, no espírito de painel de competição: o cronômetro
 * domina tudo, o exercício vem logo abaixo em segundo peso, e o "a seguir"
 * fica contido até a troca ficar iminente — aí ele acende.
 *
 * Toda a escala é em `vw`/`vh`, sem breakpoints: as proporções se mantêm
 * idênticas de um Full HD a um 4K.
 */
export function PainelTreino({ estado }: { estado: EstadoTvTreino }) {
  const visual = estadoVisualDe(estado);
  const { rotulo, cor } = APARENCIA[visual];

  const trocaIminente = estado.restanteMs <= ALERTA_MS;
  const segundosFinais = Math.ceil(estado.restanteMs / 1000);

  return (
    <div
      className="relative flex h-full flex-col justify-between"
      style={{ "--c": cor } as React.CSSProperties}
    >
      {/* Brilho ambiente na cor do estado — muda junto, nunca de repente */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[9vw] transition-colors duration-700"
        style={{ backgroundColor: cor, opacity: 0.16 }}
      />

      {/* ---------------------------------------------------- Topo: round + estado */}
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-[0.7vw]">
          <span className="text-[1vw] font-bold tracking-[0.4em] text-texto-fraco">
            ROUND
          </span>
          <span className="numeros-timer text-[3.2vw] leading-none font-extrabold text-texto">
            {estado.round}
          </span>
          <span className="text-[1.1vw] font-bold tracking-[0.2em] text-texto-fraco">
            DE
          </span>
          <span className="numeros-timer text-[2vw] leading-none font-bold text-texto-suave">
            {estado.totalRounds}
          </span>
        </div>

        <span
          key={rotulo}
          className="tv-sobe rounded-full px-[1.6vw] py-[0.9vh] text-[1.05vw] font-extrabold tracking-[0.3em] transition-colors duration-700"
          style={{
            backgroundColor: `color-mix(in srgb, ${cor} 16%, transparent)`,
            color: cor,
            boxShadow: `inset 0 0 0 0.1vh color-mix(in srgb, ${cor} 35%, transparent)`,
          }}
        >
          {rotulo}
        </span>
      </header>

      {/* ------------------------------------------- Centro: cronômetro + exercício */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <p
          className={`numeros-timer text-[19vw] leading-[0.82] font-extrabold tracking-[-0.02em] transition-colors duration-700 ${
            trocaIminente ? "tv-batida" : ""
          }`}
          style={{
            color: cor,
            textShadow: `0 0 6vh color-mix(in srgb, ${cor} 45%, transparent)`,
          }}
        >
          {/* Os dois-pontos ocupam uma célula inteira na fonte monoespaçada;
              puxamos as laterais para o número respirar como em painel de TV. */}
          {formatarTempo(estado.restanteMs)
            .split(":")
            .flatMap((parte, i) =>
              i === 0
                ? [<span key={`n${i}`}>{parte}</span>]
                : [
                    <span
                      key={`s${i}`}
                      className="mx-[-1.1vw] inline-block opacity-55"
                    >
                      :
                    </span>,
                    <span key={`n${i}`}>{parte}</span>,
                  ],
            )}
        </p>

        {/* Troca de exercício entra com fade + leve subida */}
        <p
          key={estado.exercicio}
          className="tv-entrada mt-[1.5vh] max-w-full truncate text-center text-[4vw] leading-none font-extrabold tracking-[0.02em] text-texto uppercase"
        >
          {estado.exercicio}
        </p>
      </div>

      {/* --------------------------------------- Base: a seguir + barra de progresso */}
      <footer className="flex flex-col gap-[2.2vh]">
        <div
          className="flex items-center gap-[1.4vw] rounded-[1vw] px-[1.4vw] py-[1.4vh] transition-all duration-500"
          style={{
            backgroundColor: trocaIminente
              ? `color-mix(in srgb, ${cor} 14%, transparent)`
              : "color-mix(in srgb, var(--color-texto) 4%, transparent)",
            boxShadow: trocaIminente
              ? `inset 0 0 0 0.12vh color-mix(in srgb, ${cor} 45%, transparent)`
              : "none",
          }}
        >
          <span
            className={`shrink-0 text-[0.95vw] font-bold tracking-[0.4em] transition-colors duration-500 ${
              trocaIminente ? "tv-pulso" : ""
            }`}
            style={{ color: trocaIminente ? cor : "var(--color-texto-fraco)" }}
          >
            A SEGUIR
          </span>

          <span
            key={estado.proximoExercicio ?? "fim"}
            className="tv-sobe min-w-0 flex-1 truncate text-[2.1vw] font-bold text-texto-suave uppercase"
          >
            {estado.proximoExercicio ?? "Último bloco"}
          </span>

          {/* Contagem dos segundos finais, só quando a troca está perto */}
          {trocaIminente && segundosFinais > 0 && (
            <span
              className="numeros-timer shrink-0 text-[2.4vw] leading-none font-extrabold tabular-nums"
              style={{ color: cor }}
            >
              {segundosFinais}
            </span>
          )}
        </div>

        <BarraProgresso
          progressoFase={estado.progressoFase}
          cor={cor}
          round={estado.round}
          totalRounds={estado.totalRounds}
        />
      </footer>
    </div>
  );
}
