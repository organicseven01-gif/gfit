import type { MidiaPatrocinador } from "@/types";

/* ==========================================================================
   Playlist justa (round-robin embaralhado).

   Regra: dentro de um ciclo, cada patrocinador aparece EXATAMENTE UMA VEZ.
   Só quando o ciclo termina é que uma nova ordem aleatória é sorteada.

   Isso garante que, ao fim de N ciclos, todos tenham exatamente N exibições —
   diferente de sorteio simples, onde um pode repetir antes de outro aparecer.
   ========================================================================== */

/** Fisher-Yates: embaralhamento uniforme, sem viés. */
export function embaralhar<T>(itens: readonly T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Monta um ciclo novo.
 *
 * `evitarPrimeiro` é o id da última peça exibida: se o sorteio a colocar no
 * começo do ciclo seguinte, ela apareceria duas vezes seguidas (fim de um
 * ciclo + início do outro). Trocamos com a posição seguinte para evitar isso —
 * sem quebrar a regra de "uma vez por ciclo".
 */
export function criarCiclo(
  itens: readonly MidiaPatrocinador[],
  evitarPrimeiro?: string,
): MidiaPatrocinador[] {
  const ciclo = embaralhar(itens);
  if (
    ciclo.length > 1 &&
    evitarPrimeiro &&
    ciclo[0].id === evitarPrimeiro
  ) {
    [ciclo[0], ciclo[1]] = [ciclo[1], ciclo[0]];
  }
  return ciclo;
}
