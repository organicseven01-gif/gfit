import type { AulaAgendada, EstadoTv } from "@/types";
import type { VisaoSessao } from "@/lib/sessao/tipos";

/* ==========================================================================
   Ponte entre a sessão e a tela da TV.

   Converte a `VisaoSessao` (novo modelo) no `EstadoTv` que a `DisplayTv` já
   consome. A TV e seus componentes visuais permanecem intactos — só passam
   a receber dados vivos em vez de fixos.
   ========================================================================== */

export function visaoParaEstadoTv(
  visao: VisaoSessao,
  agenda: AulaAgendada[] = [],
  nomeAcademia = "G FIT",
): EstadoTv {
  // ocioso, encerrado ou sem fase → tela de espera com a agenda da academia
  if (visao.status === "ocioso" || visao.concluido || !visao.faseAtual) {
    return { situacao: "aguardando", agenda, nomeAcademia };
  }

  const f = visao.faseAtual;
  const nomeDe = (fase: typeof f) =>
    fase.tipo === "descanso" ? "Descanso" : fase.nome;

  return {
    situacao: "treino",
    exercicio: nomeDe(f),
    proximoExercicio: visao.proximaFase ? nomeDe(visao.proximaFase) : null,
    fase:
      f.tipo === "descanso"
        ? "descanso"
        : f.tipo === "preparacao"
          ? "preparar"
          : "trabalho",
    round: f.round,
    totalRounds: f.totalRounds,
    restanteMs: visao.restanteMs,
    progressoFase: visao.progresso,
  };
}
