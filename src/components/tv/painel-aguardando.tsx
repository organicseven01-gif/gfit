"use client";

import { useEffect, useState } from "react";
import type { EstadoTvAguardando } from "@/types";
import { LogoSelo } from "@/components/layout/logo";

/** Próxima ocorrência de "HH:MM" — hoje se ainda não passou, senão amanhã. */
function proximaOcorrencia(horario: string, agora: Date): Date {
  const [h, m] = horario.split(":").map(Number);
  const alvo = new Date(agora);
  alvo.setHours(h, m, 0, 0);
  if (alvo.getTime() <= agora.getTime()) {
    alvo.setDate(alvo.getDate() + 1);
  }
  return alvo;
}

function partes(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Coluna principal quando não há treino no ar.
 *
 * Mostra a próxima aula, o horário e a contagem regressiva até ela.
 * A contagem recalcula a partir de `Date.now()` a cada tique, então não
 * acumula desvio mesmo com a TV ligada o dia inteiro.
 */
export function PainelAguardando({ estado }: { estado: EstadoTvAguardando }) {
  // `null` até montar no cliente: horário calculado no servidor divergiria
  // do navegador e quebraria a hidratação.
  const [restanteMs, setRestanteMs] = useState<number | null>(null);
  const [relogio, setRelogio] = useState<string | null>(null);

  useEffect(() => {
    const tique = () => {
      const agora = new Date();
      setRestanteMs(proximaOcorrencia(estado.horario, agora).getTime() - agora.getTime());
      setRelogio(`${pad(agora.getHours())}:${pad(agora.getMinutes())}`);
    };
    tique();
    const id = setInterval(tique, 1000);
    return () => clearInterval(id);
  }, [estado.horario]);

  const { h, m, s } = partes(restanteMs ?? 0);
  const carregando = restanteMs === null;

  return (
    <div className="relative flex h-full flex-col justify-between">
      {/* Brilho ambiente na cor da marca */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marca opacity-[0.10] blur-[9vw]"
      />

      {/* Topo: estado + relógio de parede */}
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-[0.8vw] text-[1vw] font-bold tracking-[0.4em] text-texto-fraco">
          <span className="tv-pulso inline-block size-[0.7vw] rounded-full bg-marca" />
          AGUARDANDO TREINO
        </span>
        <span className="numeros-timer text-[2vw] leading-none font-bold text-texto-suave tabular-nums">
          {relogio ?? "--:--"}
        </span>
      </header>

      {/* Centro: marca + próxima aula + contagem */}
      <div className="flex flex-col items-center justify-center gap-[1.6vh]">
        <LogoSelo tamanho={140} className="mb-[1vh] opacity-95" />

        <span className="text-[1vw] font-bold tracking-[0.4em] text-marca">
          PRÓXIMA AULA
        </span>

        <p
          key={estado.proximaAula}
          className="tv-entrada max-w-full truncate text-center text-[4.6vw] leading-none font-extrabold tracking-[0.02em] text-texto uppercase"
        >
          {estado.proximaAula}
        </p>

        <p className="numeros-timer text-[2.8vw] leading-none font-bold text-texto-suave tabular-nums">
          {estado.horario}
        </p>

        {/* Contagem regressiva */}
        <div className="mt-[1.5vh] flex items-start gap-[1vw]">
          {[
            { valor: h, rotulo: "HORAS" },
            { valor: m, rotulo: "MIN" },
            { valor: s, rotulo: "SEG" },
          ].map(({ valor, rotulo }, i) => (
            <div key={rotulo} className="flex items-start gap-[1vw]">
              {i > 0 && (
                <span
                  aria-hidden
                  className="numeros-timer text-[6vw] leading-[0.85] font-extrabold text-texto-fraco/30"
                >
                  :
                </span>
              )}
              <div className="flex flex-col items-center gap-[0.8vh]">
                <span
                  className="numeros-timer text-[8vw] leading-[0.85] font-extrabold text-marca tabular-nums transition-opacity duration-500"
                  style={{ opacity: carregando ? 0.25 : 1 }}
                >
                  {carregando ? "--" : pad(valor)}
                </span>
                <span className="text-[0.85vw] font-bold tracking-[0.35em] text-texto-fraco">
                  {rotulo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-white/8 pt-[2vh] text-center text-[0.95vw] tracking-[0.4em] text-texto-fraco uppercase">
        Nenhum treino no ar
      </footer>
    </div>
  );
}
