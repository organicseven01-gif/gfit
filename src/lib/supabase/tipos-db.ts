/* ==========================================================================
   Tipos do schema do Supabase (espelham supabase/migrations/0001_schema.sql).
   Mantidos à mão — se o schema mudar, atualizar aqui.
   ========================================================================== */

export type CategoriaTreinoDB =
  | "crossfit"
  | "hyrox"
  | "funcional"
  | "condicionamento"
  | "core";
export type TipoEtapaDB = "exercicio" | "descanso" | "repetir";
export type StatusSessaoDB = "ocioso" | "rodando" | "pausado" | "encerrado";
export type TipoMidiaDB = "imagem" | "video";

export interface TreinoRow {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: CategoriaTreinoDB;
  criado_em: string;
  atualizado_em: string;
}

export interface EtapaRow {
  id: string;
  treino_id: string;
  tipo: TipoEtapaDB;
  nome: string;
  segundos: number;
  vezes: number | null;
  ordem: number;
}

export interface TemplateRow {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: CategoriaTreinoDB;
  etapas: unknown; // jsonb
  criado_em: string;
}

export interface SessaoRow {
  id: string;
  treino_id: string | null;
  status: StatusSessaoDB;
  etapa_atual: number;
  round_atual: number;
  tempo_restante: number;
  started_at: string | null;
  paused_at: string | null;
  updated_at: string;
}

export interface HistoricoRow {
  id: string;
  sessao_id: string | null;
  treino_id: string | null;
  treino_nome: string;
  categoria: CategoriaTreinoDB | null;
  iniciado_em: string;
  encerrado_em: string | null;
  concluido: boolean;
  duracao_segundos: number | null;
}

export interface ConfiguracoesRow {
  id: number;
  nome_academia: string;
  logo_url: string | null;
  som_ativo: boolean;
  som_volume: number;
  som_inicio: boolean;
  som_preparacao: boolean;
  som_troca: boolean;
  som_descanso: boolean;
  som_contagem: boolean;
  som_conclusao: boolean;
  /** Grade semanal de turmas (array de AulaAgendada). */
  agenda: unknown;
  atualizado_em: string;
}

export interface PatrocinadorRow {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: TipoMidiaDB;
  arquivo_url: string;
  tempo_exibicao: number;
  ativo: boolean;
  /** "YYYY-MM-DD" ou null (sem limite de janela). */
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string;
  updated_at: string;
}

/** Contrato do banco para tipar o cliente Supabase. */
export interface Database {
  public: {
    Tables: {
      treinos: {
        Row: TreinoRow;
        Insert: Partial<TreinoRow> & { nome: string };
        Update: Partial<TreinoRow>;
      };
      etapas: {
        Row: EtapaRow;
        Insert: Omit<EtapaRow, "id"> & { id?: string };
        Update: Partial<EtapaRow>;
      };
      templates: {
        Row: TemplateRow;
        Insert: Partial<TemplateRow> & { nome: string };
        Update: Partial<TemplateRow>;
      };
      sessoes: {
        Row: SessaoRow;
        Insert: Partial<SessaoRow>;
        Update: Partial<SessaoRow>;
      };
      historico: {
        Row: HistoricoRow;
        Insert: Omit<HistoricoRow, "id"> & { id?: string };
        Update: Partial<HistoricoRow>;
      };
      configuracoes: {
        Row: ConfiguracoesRow;
        Insert: Partial<ConfiguracoesRow>;
        Update: Partial<ConfiguracoesRow>;
      };
      patrocinadores: {
        Row: PatrocinadorRow;
        Insert: Omit<PatrocinadorRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<PatrocinadorRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      categoria_treino: CategoriaTreinoDB;
      tipo_etapa: TipoEtapaDB;
      status_sessao: StatusSessaoDB;
      tipo_midia: TipoMidiaDB;
    };
  };
}
