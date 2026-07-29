import type { CategoriaTreino, Etapa, ModoTimer } from "@/types";

/* ==========================================================================
   Modelos de treino por modo de timer.

   Cada modo vira um treino inicial já montado (rounds/tempos típicos), que o
   professor abre no editor e ajusta. É só um ponto de partida.
   ========================================================================== */

function etapa(
  tipo: Etapa["tipo"],
  nome: string,
  segundos: number,
  opcoes: { vezes?: number; progressivo?: boolean } = {},
): Etapa {
  return {
    id: crypto.randomUUID(),
    tipo,
    nome,
    segundos,
    ...(opcoes.vezes != null ? { vezes: opcoes.vezes } : {}),
    ...(opcoes.progressivo ? { progressivo: true } : {}),
  };
}

/** Etapas padrão para começar um treino em cada modo. */
export function etapasDoModo(modo: ModoTimer): Etapa[] {
  switch (modo) {
    case "tabata": // clássico: 8 rounds de 20s de trabalho / 10s de descanso
      return [
        etapa("exercicio", "Exercício", 20),
        etapa("descanso", "Descanso", 10),
        etapa("repetir", "Repetir", 0, { vezes: 8 }),
      ];
    case "emom": // um round por minuto, 10 minutos
      return [
        etapa("exercicio", "Exercício", 60),
        etapa("repetir", "Repetir", 0, { vezes: 10 }),
      ];
    case "amrap": // bloco único de 20 minutos (regressivo)
      return [etapa("exercicio", "AMRAP", 20 * 60)];
    case "for_time": // conta PRA CIMA até o time cap de 20 min
      return [etapa("exercicio", "For Time", 20 * 60, { progressivo: true })];
    case "relogio": // cronômetro contando pra cima (cap de 20 min)
      return [etapa("exercicio", "Cronômetro", 20 * 60, { progressivo: true })];
  }
}

/** Categoria inicial sugerida para cada modo. */
export function categoriaDoModo(modo: ModoTimer): CategoriaTreino {
  switch (modo) {
    case "tabata":
      return "condicionamento";
    case "emom":
    case "amrap":
    case "for_time":
      return "crossfit";
    case "relogio":
      return "funcional";
  }
}
