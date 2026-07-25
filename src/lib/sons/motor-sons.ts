"use client";

import type { EventoSom } from "@/types";

/* ==========================================================================
   Motor de som — Web Audio API.

   Gera bipes curtos e agradáveis em tempo real (ondas senoidais com envelope
   suave). Não depende de nenhum arquivo de áudio.

   Autoplay: navegadores só deixam o áudio tocar após um gesto do usuário.
   A TV é uma tela passiva, então o contexto começa "suspenso" e é liberado
   por `desbloquearSom()` no primeiro toque/clique.
   ========================================================================== */

let ctx: AudioContext | null = null;

function contexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
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

/** Toca uma nota com ataque rápido e decaimento exponencial (som limpo). */
function nota(freq: number, atrasoS: number, durS: number, pico: number): void {
  const c = contexto();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  const t = c.currentTime + atrasoS;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, pico), t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durS);

  osc.connect(g);
  g.connect(c.destination);
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

  // pico máximo controlado para não estourar/distorcer
  const v = Math.max(0, Math.min(1, volume / 100)) * 0.32;
  if (v <= 0) return;

  switch (evento) {
    case "contagem": // 3...2...1 — tique curto e seco
      nota(880, 0, 0.11, v);
      break;
    case "troca": // começa exercício — duas notas subindo, animado
      nota(660, 0, 0.12, v);
      nota(990, 0.12, 0.16, v);
      break;
    case "descanso": // começa descanso — duas notas descendo, suave
      nota(523, 0, 0.14, v * 0.85);
      nota(392, 0.14, 0.2, v * 0.85);
      break;
    case "inicio": // início do treino — chamada clara
      nota(523, 0, 0.12, v);
      nota(784, 0.12, 0.18, v);
      break;
    case "preparacao": // preparação — tom neutro
      nota(494, 0, 0.18, v * 0.8);
      break;
    case "conclusao": // fim — pequeno arpejo
      nota(523, 0, 0.14, v);
      nota(659, 0.14, 0.14, v);
      nota(784, 0.28, 0.3, v);
      break;
  }
}
