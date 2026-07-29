"use client";

import type {
  AulaAgendada,
  AulaParte,
  Configuracoes,
  ConfigSom,
  Etapa,
  ModoTimer,
} from "@/types";
import type { ConfiguracoesRow } from "@/lib/supabase/tipos-db";
import { criarClienteNavegador } from "@/lib/supabase/client";

/* ==========================================================================
   Configurações da unidade (Supabase, tabela `configuracoes`, linha única).
   ========================================================================== */

const SOM_PADRAO: ConfigSom = {
  ativo: true,
  volume: 70,
  inicio: true,
  preparacao: true,
  troca: true,
  descanso: true,
  contagem: true,
  conclusao: true,
};

const PADRAO: Configuracoes = {
  nomeAcademia: "G FIT",
  logoUrl: null,
  som: SOM_PADRAO,
  agenda: [],
  treinosDoDia: {},
  aulasDoDia: {},
};

const MODOS_VALIDOS: ModoTimer[] = [
  "relogio",
  "tabata",
  "for_time",
  "emom",
  "amrap",
];

/** Normaliza uma etapa vinda do JSONB. */
function paraEtapa(bruto: unknown): Etapa | null {
  if (!bruto || typeof bruto !== "object") return null;
  const e = bruto as Record<string, unknown>;
  const tipo = e.tipo;
  if (tipo !== "exercicio" && tipo !== "descanso" && tipo !== "repetir") return null;
  return {
    id: String(e.id ?? crypto.randomUUID()),
    tipo,
    nome: String(e.nome ?? ""),
    segundos: Number(e.segundos) || 0,
    ...(e.vezes != null ? { vezes: Number(e.vezes) || 1 } : {}),
  };
}

/** Normaliza o mapa "YYYY-MM-DD" -> partes da aula. */
function paraAulasDoDia(bruto: unknown): Record<string, AulaParte[]> {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};
  const saida: Record<string, AulaParte[]> = {};
  for (const [data, partesBrutas] of Object.entries(bruto as Record<string, unknown>)) {
    if (!Array.isArray(partesBrutas)) continue;
    const partes: AulaParte[] = partesBrutas
      .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
      .map((p) => ({
        id: String(p.id ?? crypto.randomUUID()),
        nome: String(p.nome ?? ""),
        modo: MODOS_VALIDOS.includes(p.modo as ModoTimer)
          ? (p.modo as ModoTimer)
          : "amrap",
        etapas: Array.isArray(p.etapas)
          ? p.etapas.map(paraEtapa).filter((e): e is Etapa => e !== null)
          : [],
        movimentos: Array.isArray(p.movimentos)
          ? p.movimentos.map(String).filter(Boolean)
          : [],
      }));
    if (partes.length > 0) saida[data] = partes;
  }
  return saida;
}

/** Normaliza o mapa "YYYY-MM-DD" -> treinoId (tolerante a lixo). */
function paraTreinosDoDia(bruto: unknown): Record<string, string> {
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return {};
  const saida: Record<string, string> = {};
  for (const [data, id] of Object.entries(bruto as Record<string, unknown>)) {
    if (typeof id === "string" && id) saida[data] = id;
  }
  return saida;
}

/** Normaliza o JSONB da agenda para o tipo do domínio (tolerante a lixo). */
function paraAgenda(bruto: unknown): AulaAgendada[] {
  if (!Array.isArray(bruto)) return [];
  return bruto
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => ({
      id: String(a.id ?? crypto.randomUUID()),
      nome: String(a.nome ?? ""),
      horario: String(a.horario ?? "00:00"),
      dias: Array.isArray(a.dias) ? a.dias.map(Number).filter((d) => d >= 0 && d <= 6) : [],
      duracaoMin: Number(a.duracaoMin) > 0 ? Number(a.duracaoMin) : 60,
    }));
}

function paraConfig(row: ConfiguracoesRow): Configuracoes {
  return {
    nomeAcademia: row.nome_academia,
    logoUrl: row.logo_url,
    som: {
      ativo: row.som_ativo,
      volume: row.som_volume,
      inicio: row.som_inicio,
      preparacao: row.som_preparacao,
      troca: row.som_troca,
      descanso: row.som_descanso,
      contagem: row.som_contagem,
      conclusao: row.som_conclusao,
    },
    agenda: paraAgenda(row.agenda),
    treinosDoDia: paraTreinosDoDia(row.treinos_do_dia),
    aulasDoDia: paraAulasDoDia(row.aulas_do_dia),
  };
}

export async function obterConfiguracoes(): Promise<Configuracoes> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("configuracoes")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  return data ? paraConfig(data as unknown as ConfiguracoesRow) : PADRAO;
}

export async function atualizarConfiguracoes(
  patch: Partial<Pick<Configuracoes, "nomeAcademia" | "logoUrl">> & {
    som?: Partial<ConfigSom>;
    agenda?: AulaAgendada[];
    treinosDoDia?: Record<string, string>;
    aulasDoDia?: Record<string, AulaParte[]>;
  },
): Promise<void> {
  const sb = criarClienteNavegador();
  const linha: Record<string, unknown> = {};

  if (patch.nomeAcademia !== undefined) linha.nome_academia = patch.nomeAcademia;
  if (patch.logoUrl !== undefined) linha.logo_url = patch.logoUrl;
  if (patch.agenda !== undefined) linha.agenda = patch.agenda;
  if (patch.treinosDoDia !== undefined) linha.treinos_do_dia = patch.treinosDoDia;
  if (patch.aulasDoDia !== undefined) linha.aulas_do_dia = patch.aulasDoDia;

  const s = patch.som;
  if (s) {
    if (s.ativo !== undefined) linha.som_ativo = s.ativo;
    if (s.volume !== undefined) linha.som_volume = s.volume;
    if (s.inicio !== undefined) linha.som_inicio = s.inicio;
    if (s.preparacao !== undefined) linha.som_preparacao = s.preparacao;
    if (s.troca !== undefined) linha.som_troca = s.troca;
    if (s.descanso !== undefined) linha.som_descanso = s.descanso;
    if (s.contagem !== undefined) linha.som_contagem = s.contagem;
    if (s.conclusao !== undefined) linha.som_conclusao = s.conclusao;
  }

  if (Object.keys(linha).length === 0) return;

  const { error } = await sb.from("configuracoes").update(linha).eq("id", 1);
  if (error) throw error;
}
