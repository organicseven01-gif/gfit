/* ==========================================================================
   Modelo de domínio do G FIT TIME.
   Contratos apenas — nenhuma lógica implementada nesta fase.

   O sistema roda sem login: é uma instalação única por academia, então não
   existem usuários, papéis nem separação por tenant.
   ========================================================================== */

export type ModoTimer = "relogio" | "tabata" | "for_time" | "emom" | "amrap";

export type TipoFase = "preparar" | "trabalho" | "descanso";

export type CategoriaTreino =
  | "crossfit"
  | "hyrox"
  | "funcional"
  | "condicionamento"
  | "core";

export type TipoEtapa = "exercicio" | "descanso" | "repetir";

/**
 * Uma etapa da sequência do treino.
 *
 * O treino é uma lista plana, na ordem em que acontece:
 *   Aquecimento → Burpee → Descanso → Wall Ball → Descanso → Repetir
 *
 * `repetir` não tem duração própria: ele faz tudo que vem antes
 * acontecer `vezes` vezes no total.
 */
export interface Etapa {
  id: string;
  tipo: TipoEtapa;
  /** "Burpee", "Descanso", "Repetir tudo". */
  nome: string;
  /** Duração em segundos. Sempre 0 quando `tipo` é "repetir". */
  segundos: number;
  /** Só em "repetir": quantas vezes a sequência acontece no total. */
  vezes?: number;
}

/** Um treino é uma sequência ordenada de etapas. */
export interface Treino {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: CategoriaTreino;
  etapas: Etapa[];
  criadoEm: string;
  atualizadoEm: string;
}

/** Uma TV pareada, identificada por um código curto exibido na tela. */
export interface Tela {
  id: string;
  nome: string;
  codigoPareamento: string;
  treinoAtivoId: string | null;
  ultimoPingEm: string | null;
}

/** Registro de uma execução de treino numa tela. */
export interface Sessao {
  id: string;
  treinoId: string;
  telaId: string;
  iniciadaEm: string;
  encerradaEm: string | null;
  concluida: boolean;
}

/** Um template: blueprint reutilizável que vira treino ao ser usado. */
export interface Template {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: CategoriaTreino;
  etapas: Etapa[];
  criadoEm: string;
}

/** Uma execução registrada no histórico. */
export interface RegistroHistorico {
  id: string;
  treinoNome: string;
  categoria: CategoriaTreino | null;
  iniciadoEm: string;
  encerradoEm: string | null;
  concluido: boolean;
  duracaoSegundos: number | null;
}

export type TipoMidia = "imagem" | "video";

/**
 * Peça exibida na faixa da TV — contrato mínimo de exibição.
 * O painel usa `Patrocinador` (completo); a TV só precisa disto.
 */
export interface MidiaPatrocinador {
  id: string;
  nome: string;
  tipo: TipoMidia;
  src: string;
  /** Segundos em tela. Ignorado em vídeo — ele avança ao terminar. */
  duracaoSegundos?: number;
}

/** Patrocinador completo, como gerenciado no painel. */
export interface Patrocinador {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TipoMidia;
  /** URL pública do arquivo no Supabase Storage. */
  arquivoUrl: string;
  /** Segundos em tela (imagens). Vídeo avança ao terminar. */
  tempoExibicao: number;
  ativo: boolean;
  /** "YYYY-MM-DD" ou null (sem limite). */
  dataInicio: string | null;
  dataFim: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

/** Estado exibido na TV em um dado momento. */
export interface EstadoTvTreino {
  situacao: "treino";
  exercicio: string;
  proximoExercicio: string | null;
  fase: TipoFase;
  round: number;
  totalRounds: number;
  /** Milissegundos restantes na fase atual. */
  restanteMs: number;
  /** Progresso da fase atual, de 0 a 1. */
  progressoFase: number;
}

export interface EstadoTvAguardando {
  situacao: "aguardando";
  proximaAula: string;
  /** Horário da próxima aula no formato "HH:MM". */
  horario: string;
}

export type EstadoTv = EstadoTvTreino | EstadoTvAguardando;

/** Eventos sonoros do treino. */
export type EventoSom =
  | "inicio"
  | "preparacao"
  | "troca"
  | "descanso"
  | "contagem"
  | "conclusao";

/** Preferências de som. */
export interface ConfigSom {
  /** Liga/desliga todos os sons de uma vez. */
  ativo: boolean;
  /** 0 a 100. */
  volume: number;
  inicio: boolean;
  preparacao: boolean;
  troca: boolean;
  descanso: boolean;
  contagem: boolean;
  conclusao: boolean;
}

/** Configurações da unidade, únicas por instalação. */
export interface Configuracoes {
  nomeAcademia: string;
  logoUrl: string | null;
  som: ConfigSom;
}
