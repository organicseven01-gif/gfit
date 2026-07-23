"use client";

import type { MidiaPatrocinador, Patrocinador, TipoMidia } from "@/types";
import type { PatrocinadorRow } from "@/lib/supabase/tipos-db";
import { criarClienteNavegador } from "@/lib/supabase/client";

/* ==========================================================================
   Patrocinadores (Supabase: tabela `patrocinadores` + bucket `patrocinadores`).
   Fonte da mídia exibida na TV.
   ========================================================================== */

export const BUCKET = "patrocinadores";

/** Tipos aceitos no upload. */
export const MIME_ACEITOS = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
] as const;

export const TAMANHO_MAXIMO_MB = 50;

function paraPatrocinador(row: PatrocinadorRow): Patrocinador {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    tipo: row.tipo,
    arquivoUrl: row.arquivo_url,
    tempoExibicao: row.tempo_exibicao,
    ativo: row.ativo,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

/* ---------------------------------------------------------------- Leitura */

/** Todos, para o painel administrativo. */
export async function listarPatrocinadores(): Promise<Patrocinador[]> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("patrocinadores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as PatrocinadorRow[]).map(paraPatrocinador);
}

/**
 * Peças elegíveis para a TV: ativas E dentro da janela de datas.
 * O filtro roda no banco — a TV não recebe o que não pode exibir.
 * Datas nulas significam "sem limite".
 */
export async function listarParaExibicao(): Promise<MidiaPatrocinador[]> {
  const sb = criarClienteNavegador();
  const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await sb
    .from("patrocinadores")
    .select("*")
    .eq("ativo", true)
    .or(`data_inicio.is.null,data_inicio.lte.${hoje}`)
    .or(`data_fim.is.null,data_fim.gte.${hoje}`);

  if (error) throw error;

  return (data as unknown as PatrocinadorRow[])
    .filter((r) => r.arquivo_url) // sem arquivo não entra na playlist
    .map((r) => ({
      id: r.id,
      nome: r.nome,
      tipo: r.tipo,
      src: r.arquivo_url,
      duracaoSegundos: r.tempo_exibicao,
    }));
}

/* ---------------------------------------------------------------- Escrita */

export interface DadosPatrocinador {
  nome: string;
  descricao?: string | null;
  tipo: TipoMidia;
  arquivoUrl: string;
  tempoExibicao: number;
  ativo: boolean;
  dataInicio?: string | null;
  dataFim?: string | null;
}

function paraLinha(dados: Partial<DadosPatrocinador>) {
  const linha: Record<string, unknown> = {};
  if (dados.nome !== undefined) linha.nome = dados.nome.trim();
  if (dados.descricao !== undefined)
    linha.descricao = dados.descricao?.trim() || null;
  if (dados.tipo !== undefined) linha.tipo = dados.tipo;
  if (dados.arquivoUrl !== undefined) linha.arquivo_url = dados.arquivoUrl;
  if (dados.tempoExibicao !== undefined)
    linha.tempo_exibicao = dados.tempoExibicao;
  if (dados.ativo !== undefined) linha.ativo = dados.ativo;
  if (dados.dataInicio !== undefined) linha.data_inicio = dados.dataInicio || null;
  if (dados.dataFim !== undefined) linha.data_fim = dados.dataFim || null;
  return linha;
}

export async function criarPatrocinador(
  dados: DadosPatrocinador,
): Promise<Patrocinador> {
  const sb = criarClienteNavegador();
  const { data, error } = await sb
    .from("patrocinadores")
    .insert(paraLinha(dados))
    .select("*")
    .single();

  if (error) throw error;
  return paraPatrocinador(data as unknown as PatrocinadorRow);
}

export async function atualizarPatrocinador(
  id: string,
  dados: Partial<DadosPatrocinador>,
): Promise<void> {
  const sb = criarClienteNavegador();
  const { error } = await sb
    .from("patrocinadores")
    .update(paraLinha(dados))
    .eq("id", id);
  if (error) throw error;
}

/** Liga/desliga a campanha sem abrir o formulário. */
export async function alternarAtivo(id: string, ativo: boolean): Promise<void> {
  return atualizarPatrocinador(id, { ativo });
}

/** Remove o registro e o arquivo correspondente no Storage. */
export async function excluirPatrocinador(
  id: string,
  arquivoUrl?: string,
): Promise<void> {
  const sb = criarClienteNavegador();

  const { error } = await sb.from("patrocinadores").delete().eq("id", id);
  if (error) throw error;

  const caminho = arquivoUrl ? caminhoDoArquivo(arquivoUrl) : null;
  if (caminho) {
    // best-effort: falha aqui não deve impedir a exclusão do registro
    await sb.storage.from(BUCKET).remove([caminho]);
  }
}

/* ---------------------------------------------------------------- Storage */

/** Extrai o caminho dentro do bucket a partir da URL pública. */
function caminhoDoArquivo(url: string): string | null {
  const marcador = `/${BUCKET}/`;
  const i = url.indexOf(marcador);
  return i === -1 ? null : url.slice(i + marcador.length);
}

/** Deriva o tipo da peça pelo MIME do arquivo. */
export function tipoDoArquivo(file: File): TipoMidia {
  return file.type.startsWith("video/") ? "video" : "imagem";
}

/**
 * Envia o arquivo para o bucket e devolve a URL pública.
 * O banco guarda apenas essa URL.
 */
export async function enviarArquivo(file: File): Promise<string> {
  if (!MIME_ACEITOS.includes(file.type as (typeof MIME_ACEITOS)[number])) {
    throw new Error("Formato não aceito. Use PNG, JPG, WEBP ou MP4.");
  }
  if (file.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    throw new Error(`Arquivo maior que ${TAMANHO_MAXIMO_MB} MB.`);
  }

  const sb = criarClienteNavegador();
  const extensao = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const nome = `${crypto.randomUUID()}.${extensao}`;

  const { error } = await sb.storage.from(BUCKET).upload(nome, file, {
    cacheControl: "31536000", // 1 ano: a mídia é imutável (nome único)
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = sb.storage.from(BUCKET).getPublicUrl(nome);
  return data.publicUrl;
}
