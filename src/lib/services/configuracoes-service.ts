"use client";

import type { Configuracoes } from "@/types";
import type { ConfiguracoesRow } from "@/lib/supabase/tipos-db";
import { criarClienteNavegador } from "@/lib/supabase/client";

/* ==========================================================================
   Configurações da unidade (Supabase, tabela `configuracoes`, linha única).
   ========================================================================== */

const PADRAO: Configuracoes = {
  nomeAcademia: "G FIT",
  logoUrl: null,
  somBipeFinal: true,
  somViradaFase: true,
  somConclusao: true,
};

function paraConfig(row: ConfiguracoesRow): Configuracoes {
  return {
    nomeAcademia: row.nome_academia,
    logoUrl: row.logo_url,
    somBipeFinal: row.som_bipe_final,
    somViradaFase: row.som_virada_fase,
    somConclusao: row.som_conclusao,
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
  patch: Partial<Configuracoes>,
): Promise<void> {
  const sb = criarClienteNavegador();
  const linha: Record<string, unknown> = {};
  if (patch.nomeAcademia !== undefined) linha.nome_academia = patch.nomeAcademia;
  if (patch.logoUrl !== undefined) linha.logo_url = patch.logoUrl;
  if (patch.somBipeFinal !== undefined) linha.som_bipe_final = patch.somBipeFinal;
  if (patch.somViradaFase !== undefined) linha.som_virada_fase = patch.somViradaFase;
  if (patch.somConclusao !== undefined) linha.som_conclusao = patch.somConclusao;

  const { error } = await sb.from("configuracoes").update(linha).eq("id", 1);
  if (error) throw error;
}
