import type { AulaAgendada } from "@/types";

/* ==========================================================================
   Lógica da agenda semanal.

   Pura e determinística: recebe a grade + o instante e devolve qual turma
   está acontecendo agora e qual é a próxima. A TV recalcula a cada segundo,
   então nada acumula desvio.
   ========================================================================== */

export interface OcorrenciaAula {
  nome: string;
  /** Início daquela ocorrência concreta. */
  inicio: Date;
  /** Fim = início + duração. */
  fim: Date;
}

const MS_MIN = 60_000;

/** Rótulos dos dias (0=Dom … 6=Sáb). */
export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/** Data local no formato "YYYY-MM-DD" (chave do treino do dia). */
export function dataLocalISO(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Os próximos `n` dias a partir de hoje (para o planejador). */
export function proximosDias(n: number, base: Date = new Date()): Date[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

/**
 * Todas as ocorrências concretas da grade numa janela de -1 a +7 dias,
 * ordenadas por horário de início. Cobre a virada da semana com folga.
 */
function ocorrencias(agenda: AulaAgendada[], agora: Date): OcorrenciaAula[] {
  const lista: OcorrenciaAula[] = [];
  for (let off = -1; off <= 7; off++) {
    const dia = new Date(agora);
    dia.setDate(dia.getDate() + off);
    const dow = dia.getDay();
    for (const aula of agenda) {
      if (!aula.dias.includes(dow)) continue;
      const [h, m] = aula.horario.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) continue;
      const inicio = new Date(dia);
      inicio.setHours(h, m, 0, 0);
      const dur = aula.duracaoMin > 0 ? aula.duracaoMin : 60;
      lista.push({ nome: aula.nome, inicio, fim: new Date(inicio.getTime() + dur * MS_MIN) });
    }
  }
  return lista.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}

/** A turma acontecendo AGORA (início ≤ agora < fim), a mais recente. Ou null. */
export function aulaAtual(agenda: AulaAgendada[], agora: Date): OcorrenciaAula | null {
  const t = agora.getTime();
  const candidatas = ocorrencias(agenda, agora).filter(
    (o) => o.inicio.getTime() <= t && t < o.fim.getTime(),
  );
  return candidatas.length ? candidatas[candidatas.length - 1] : null;
}

/** A próxima turma a começar (início > agora). Ou null se a grade é vazia. */
export function proximaAula(agenda: AulaAgendada[], agora: Date): OcorrenciaAula | null {
  const t = agora.getTime();
  return ocorrencias(agenda, agora).find((o) => o.inicio.getTime() > t) ?? null;
}
