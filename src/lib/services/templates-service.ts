"use client";

import type { Etapa, Template, Treino } from "@/types";
import type { TemplateRow } from "@/lib/supabase/tipos-db";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { criarTreino, atualizarTreino } from "@/lib/services/treinos-service";

/* ==========================================================================
   Templates (Supabase, tabela `templates`). Etapas ficam em jsonb.
   ========================================================================== */

function paraTemplate(row: TemplateRow): Template {
  const etapas = Array.isArray(row.etapas) ? (row.etapas as Etapa[]) : [];
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    categoria: row.categoria,
    etapas,
    criadoEm: row.criado_em,
  };
}

export async function listarTemplates(): Promise<Template[]> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("templates")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return (data as unknown as TemplateRow[]).map(paraTemplate);
}

/** Cria um treino novo a partir de um template. */
export async function usarTemplate(templateId: string): Promise<Treino | null> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const template = paraTemplate(data as unknown as TemplateRow);
  const treino = await criarTreino({
    nome: template.nome,
    categoria: template.categoria,
    descricao: template.descricao,
  });

  if (template.etapas.length > 0) {
    await atualizarTreino(treino.id, { etapas: template.etapas });
  }
  return treino;
}
