import type { EstadoTv } from "@/types";
import type { VisaoSessao } from "@/lib/sessao/tipos";

/* ==========================================================================
   Ponte entre a sessão e a tela da TV.

   Converte a `VisaoSessao` (novo modelo) no `EstadoTv` que a `DisplayTv` já
   consome. A TV e seus componentes visuais permanecem intactos — só passam
   a receber dados vivos em vez de fixos.
   ========================================================================== */

/**
 * Exibido quando não há treino no ar.
 *
 * Ainda não existe módulo de agenda; estes valores são o padrão da tela.
 * O nome não pode repetir o rótulo "PRÓXIMA AULA" que aparece acima dele.
 */
const AGUARDANDO: EstadoTv = {
  situacao: "aguardando",
  proximaAula: "Treino livre",
  horario: "19:00",
};

export function visaoParaEstadoTv(visao: VisaoSessao): EstadoTv {
  // ocioso, encerrado ou sem fase → tela de espera
  if (visao.status === "ocioso" || visao.concluido || !visao.faseAtual) {
    return AGUARDANDO;
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
