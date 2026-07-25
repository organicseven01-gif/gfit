"use client";

import { useEffect, useState } from "react";
import type { EstadoTvAguardando } from "@/types";
import { aulaAtual, proximaAula, type OcorrenciaAula } from "@/lib/agenda/agenda";
import { LogoSelo } from "@/components/layout/logo";

/** Minutos que antecedem a aula em que o aviso destacado aparece. */
const ALERTA_MIN = 10;

function partes(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

interface Instante {
  relogio: string;
  atual: OcorrenciaAula | null;
  proxima: OcorrenciaAula | null;
  faltaMs: number;
}

/**
 * Coluna principal quando não há treino no ar.
 *
 * Lê a agenda da academia e, a cada segundo, decide o que mostrar:
 *  1. AULA EM ANDAMENTO — o horário chegou mas o professor não iniciou o
 *     cronômetro: exibe o nome da turma.
 *  2. AVISO (faltando ≤ 10 min) — destaca a próxima turma com contagem.
 *  3. PRÓXIMA AULA — nome, horário e contagem regressiva completa.
 * Tudo recalculado de `Date.now()`, então não acumula desvio.
 */
export function PainelAguardando({ estado }: { estado: EstadoTvAguardando }) {
  // `null` até montar no cliente (evita divergência de hidratação).
  const [agora, setAgora] = useState<Instante | null>(null);

  useEffect(() => {
    const tique = () => {
      const d = new Date();
      const proxima = proximaAula(estado.agenda, d);
      setAgora({
        relogio: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        atual: aulaAtual(estado.agenda, d),
        proxima,
        faltaMs: proxima ? proxima.inicio.getTime() - d.getTime() : Infinity,
      });
    };
    tique();
    const id = setInterval(tique, 1000);
    return () => clearInterval(id);
  }, [estado.agenda]);

  const emAula = !!agora?.atual;
  const alerta = !emAula && agora !== null && agora.faltaMs <= ALERTA_MIN * 60_000;

  return (
    <div className="relative flex h-full flex-col justify-between">
      {/* Brilho ambiente — vira âmbar quando a aula está prestes a começar */}
      <div
        aria-hidden
        className={`pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[9vw] transition-colors duration-1000 ${
          alerta ? "bg-preparar opacity-[0.16]" : "bg-marca opacity-[0.10]"
        }`}
      />

      {/* Topo: estado + relógio de parede */}
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-[0.8vw] text-[1vw] font-bold tracking-[0.4em] text-texto-fraco">
          <span
            className={`tv-pulso inline-block size-[0.7vw] rounded-full ${
              emAula ? "bg-trabalho" : alerta ? "bg-preparar" : "bg-marca"
            }`}
          />
          {emAula ? "AULA EM ANDAMENTO" : "AGUARDANDO TREINO"}
        </span>
        <span className="numeros-timer text-[2vw] leading-none font-bold text-texto-suave tabular-nums">
          {agora?.relogio ?? "--:--"}
        </span>
      </header>

      {/* Centro: muda conforme o modo */}
      <div className="flex flex-col items-center justify-center gap-[1.6vh]">
        <LogoSelo tamanho={120} className="mb-[0.5vh] opacity-95" />

        {emAula ? (
          <ModoEmAula atual={agora!.atual!} proxima={agora!.proxima} />
        ) : agora?.proxima ? (
          <ModoProxima
            proxima={agora.proxima}
            faltaMs={agora.faltaMs}
            alerta={alerta}
          />
        ) : (
          <ModoSemAulas nome={estado.nomeAcademia} />
        )}
      </div>

      <footer className="border-t border-white/8 pt-[2vh] text-center text-[0.95vw] tracking-[0.4em] text-texto-fraco uppercase">
        {emAula
          ? "Aguardando o professor iniciar o treino"
          : estado.nomeAcademia}
      </footer>
    </div>
  );
}

/** Uma turma está acontecendo agora — o nome ocupa a tela. */
function ModoEmAula({
  atual,
  proxima,
}: {
  atual: OcorrenciaAula;
  proxima: OcorrenciaAula | null;
}) {
  return (
    <>
      <span className="text-[1vw] font-bold tracking-[0.4em] text-trabalho">
        AGORA
      </span>
      <p
        key={atual.nome}
        className="tv-entrada max-w-full text-center text-[5.5vw] leading-none font-extrabold tracking-[0.02em] text-texto uppercase"
      >
        {atual.nome}
      </p>
      <p className="numeros-timer text-[2vw] leading-none font-bold text-texto-suave tabular-nums">
        {horarioDe(atual.inicio)}
      </p>
      {proxima && (
        <p className="mt-[1.5vh] text-[1.1vw] tracking-[0.2em] text-texto-fraco uppercase">
          A seguir: {proxima.nome} · {horarioDe(proxima.inicio)}
        </p>
      )}
    </>
  );
}

/** Próxima turma — normal, ou em destaque quando faltam ≤ 10 min. */
function ModoProxima({
  proxima,
  faltaMs,
  alerta,
}: {
  proxima: OcorrenciaAula;
  faltaMs: number;
  alerta: boolean;
}) {
  const { h, m, s } = partes(faltaMs);
  const cor = alerta ? "text-preparar" : "text-marca";

  return (
    <>
      <span
        className={`text-[1vw] font-bold tracking-[0.4em] ${cor} ${
          alerta ? "tv-pulso" : ""
        }`}
      >
        {alerta ? "PRÓXIMA TURMA COMEÇANDO" : "PRÓXIMA AULA"}
      </span>

      <p
        key={proxima.nome}
        className="tv-entrada max-w-full truncate text-center text-[4.6vw] leading-none font-extrabold tracking-[0.02em] text-texto uppercase"
      >
        {proxima.nome}
      </p>

      <p className="numeros-timer text-[2.8vw] leading-none font-bold text-texto-suave tabular-nums">
        {horarioDe(proxima.inicio)}
      </p>

      {/* Aviso de ≤ 10 min: só minutos e segundos, bem grande */}
      {alerta ? (
        <div className="mt-[1vh] flex flex-col items-center gap-[0.6vh]">
          <span className="text-[0.9vw] font-bold tracking-[0.35em] text-texto-fraco">
            COMEÇA EM
          </span>
          <span className="numeros-timer text-[9vw] leading-[0.85] font-extrabold text-preparar tabular-nums">
            {pad(m)}:{pad(s)}
          </span>
        </div>
      ) : (
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
                <span className="numeros-timer text-[8vw] leading-[0.85] font-extrabold text-marca tabular-nums">
                  {pad(valor)}
                </span>
                <span className="text-[0.85vw] font-bold tracking-[0.35em] text-texto-fraco">
                  {rotulo}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** Grade vazia — só a marca. */
function ModoSemAulas({ nome }: { nome: string }) {
  return (
    <>
      <span className="text-[1vw] font-bold tracking-[0.4em] text-marca">
        {nome.toUpperCase()}
      </span>
      <p className="text-center text-[3vw] leading-none font-extrabold text-texto-suave uppercase">
        Nenhuma aula programada
      </p>
      <p className="text-[1vw] tracking-[0.2em] text-texto-fraco uppercase">
        Cadastre a agenda no painel
      </p>
    </>
  );
}

function horarioDe(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
