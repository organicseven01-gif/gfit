"use client";

import type { CategoriaTreino, Etapa, Treino } from "@/types";
import type { EtapaRow, TreinoRow } from "@/lib/supabase/tipos-db";
import { criarClienteNavegador } from "@/lib/supabase/client";

/* ==========================================================================
   Fonte OFICIAL de treinos: Supabase (tabelas `treinos` + `etapas`).

   Mesmas assinaturas do antigo repositório localStorage, então os
   componentes que consomem não mudam. Toda leitura/gravação vai ao banco.
   ========================================================================== */

type TreinoComEtapas = TreinoRow & { etapas: EtapaRow[] };

/** Linha do banco → modelo de domínio. */
function paraTreino(row: TreinoComEtapas): Treino {
  const etapas: Etapa[] = [...(row.etapas ?? [])]
    .sort((a, b) => a.ordem - b.ordem)
    .map((e) => ({
      id: e.id,
      tipo: e.tipo,
      nome: e.nome,
      segundos: e.segundos,
      ...(e.vezes != null ? { vezes: e.vezes } : {}),
    }));

  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    categoria: row.categoria,
    etapas,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

/** Etapas do domínio → linhas para inserir (ordem = posição no array). */
function paraLinhasEtapa(treinoId: string, etapas: Etapa[]) {
  return etapas.map((e, i) => ({
    treino_id: treinoId,
    tipo: e.tipo,
    nome: e.nome,
    segundos: e.segundos,
    vezes: e.vezes ?? null,
    ordem: i,
  }));
}

export async function listarTreinos(): Promise<Treino[]> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("treinos")
    .select("*, etapas(*)")
    .order("atualizado_em", { ascending: false });

  if (error) throw error;
  return (data as unknown as TreinoComEtapas[]).map(paraTreino);
}

export async function obterTreino(id: string): Promise<Treino | null> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("treinos")
    .select("*, etapas(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? paraTreino(data as unknown as TreinoComEtapas) : null;
}

export async function criarTreino(dados: {
  nome: string;
  categoria: CategoriaTreino;
  descricao?: string | null;
}): Promise<Treino> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("treinos")
    .insert({
      nome: dados.nome.trim(),
      categoria: dados.categoria,
      descricao: dados.descricao?.trim() || null,
    })
    .select("*, etapas(*)")
    .single();

  if (error) throw error;
  return paraTreino(data as unknown as TreinoComEtapas);
}

export async function atualizarTreino(
  id: string,
  campos: Partial<Pick<Treino, "nome" | "descricao" | "categoria" | "etapas">>,
): Promise<Treino | null> {
  const sb = criarClienteNavegador();

  // Campos simples do treino
  const patch: Record<string, unknown> = {};
  if (campos.nome !== undefined) patch.nome = campos.nome;
  if (campos.descricao !== undefined) patch.descricao = campos.descricao;
  if (campos.categoria !== undefined) patch.categoria = campos.categoria;

  if (Object.keys(patch).length > 0) {
    const { error } = await sb.from("treinos").update(patch).eq("id", id);
    if (error) throw error;
  }

  // Etapas: substitui o conjunto inteiro (o editor salva a lista completa)
  if (campos.etapas !== undefined) {
    const { error: erroDel } = await sb
      .from("etapas")
      .delete()
      .eq("treino_id", id);
    if (erroDel) throw erroDel;

    if (campos.etapas.length > 0) {
      const { error: erroIns } = await sb
        .from("etapas")
        .insert(paraLinhasEtapa(id, campos.etapas));
      if (erroIns) throw erroIns;
    }
    // toca atualizado_em mesmo sem mudança em coluna do treino
    await sb.from("treinos").update({ atualizado_em: new Date().toISOString() }).eq("id", id);
  }

  return obterTreino(id);
}

export async function duplicarTreino(id: string): Promise<Treino | null> {
  const original = await obterTreino(id);
  if (!original) return null;

  const copia = await criarTreino({
    nome: `${original.nome} (cópia)`,
    categoria: original.categoria,
    descricao: original.descricao,
  });

  if (original.etapas.length > 0) {
    await atualizarTreino(copia.id, { etapas: original.etapas });
  }
  return obterTreino(copia.id);
}

export async function excluirTreino(id: string): Promise<void> {
  const sb = criarClienteNavegador();
  // etapas somem por ON DELETE CASCADE
  const { error } = await sb.from("treinos").delete().eq("id", id);
  if (error) throw error;
}
