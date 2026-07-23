import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta classes do Tailwind resolvendo conflitos (ex.: "p-2" + "p-4" => "p-4"). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Duração legível a partir de segundos: "45s", "12 min", "1h 05min". */
export function formatarDuracao(segundos: number): string {
  if (segundos <= 0) return "—";
  if (segundos < 60) return `${segundos}s`;

  const h = Math.floor(segundos / 3600);
  const m = Math.round((segundos % 3600) / 60);

  if (h === 0) return `${m} min`;
  return `${h}h ${String(m).padStart(2, "0")}min`;
}

/** Tempo decorrido em linguagem natural: "agora", "há 3 h", "há 2 dias". */
export function formatarDesde(iso: string, agora: Date = new Date()): string {
  const diffMs = agora.getTime() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);

  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;

  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;

  const meses = Math.floor(dias / 30);
  return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
}

/** Formata milissegundos como MM:SS ou H:MM:SS. */
export function formatarTempo(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
