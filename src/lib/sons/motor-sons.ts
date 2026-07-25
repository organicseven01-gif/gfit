"use client";

import type { EventoSom } from "@/types";

/* ==========================================================================
   Motor de som — Web Audio API.

   Gera bipes CURTOS, ALTOS e CORTANTES em tempo real — pensados para serem
   ouvidos por cima da música e do barulho de uma academia. Não depende de
   nenhum arquivo de áudio.

   Toda nota passa por uma cadeia master (ganho + limitador), que deixa o som
   bem alto sem estourar/distorcer quando duas notas tocam juntas.

   Autoplay: navegadores só deixam o áudio tocar após um gesto do usuário.
   A TV é uma tela passiva, então o contexto começa "suspenso" e é liberado
   por `desbloquearSom()` no primeiro toque/clique.
   ========================================================================== */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function contexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    // Cadeia master: ganho + limitador. O limitador segura os picos para
    // podermos empurrar o volume bem alto sem distorcer.
    master = ctx.createGain();
    master.gain.value = 1;
    const limitador = ctx.createDynamicsCompressor();
    limitador.threshold.value = -2;
    limitador.knee.value = 0;
    limitador.ratio.value = 20;
    limitador.attack.value = 0.002;
    limitador.release.value = 0.12;
    master.connect(limitador);
    limitador.connect(ctx.destination);
  }
  return ctx;
}

/** Libera o áudio após um gesto do usuário. Idempotente. */
export function desbloquearSom(): void {
  const c = contexto();
  if (c && c.state === "suspended") void c.resume();
}

/** true quando o áudio já pode tocar (contexto ativo). */
export function somLiberado(): boolean {
  return !!ctx && ctx.state === "running";
}

/**
 * Toca uma nota com ataque rápido e sustain — som presente e "cortante".
 * `tipo` define o timbre: "square"/"sawtooth" cortam mais (bipe de timer),
 * "triangle" é mais cheio e musical.
 */
function nota(
  freq: number,
  atrasoS: number,
  durS: number,
  pico: number,
  tipo: OscillatorType = "square",
): void {
  const c = contexto();
  if (!c || !master) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.value = freq;

  const alvo = Math.max(0.0002, pico);
  const t = c.currentTime + atrasoS;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(alvo, t + 0.008);
  g.gain.setValueAtTime(alvo, t + durS * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durS);

  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + durS + 0.03);
}

/**
 * Toca o som de um evento do treino, no volume dado (0–100).
 * Se o contexto ainda estiver suspenso, tenta liberar (caso já haja gesto).
 */
export function tocarSom(evento: EventoSom, volume: number): void {
  const c = contexto();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  // Nível alto — o limitador master segura os picos para não distorcer.
  const v = Math.max(0, Math.min(1, volume / 100)) * 0.9;
  if (v <= 0) return;

  switch (evento) {
    case "contagem": // 3...2...1 — bipe seco e agudo de timer
      nota(1000, 0, 0.14, v, "square");
      break;
    case "troca": // começa exercício — "GO!" em duas notas subindo, forte
      nota(700, 0, 0.12, v, "square");
      nota(1050, 0.1, 0.22, v, "square");
      break;
    case "descanso": // começa descanso — duas notas descendo, mais macias
      nota(600, 0, 0.16, v * 0.9, "triangle");
      nota(420, 0.15, 0.26, v * 0.9, "triangle");
      break;
    case "inicio": // início do treino — chamada de 3 notas subindo
      nota(523, 0, 0.14, v, "triangle");
      nota(659, 0.13, 0.14, v, "triangle");
      nota(880, 0.26, 0.3, v, "triangle");
      break;
    case "preparacao": // prepare-se — dois toques de aviso
      nota(660, 0, 0.16, v * 0.85, "triangle");
      nota(660, 0.22, 0.2, v * 0.85, "triangle");
      break;
    case "conclusao": // fim — arpejo de vitória, forte e longo
      nota(523, 0, 0.16, v, "triangle");
      nota(659, 0.16, 0.16, v, "triangle");
      nota(784, 0.32, 0.16, v, "triangle");
      nota(1047, 0.48, 0.45, v, "triangle");
      break;
  }
}
