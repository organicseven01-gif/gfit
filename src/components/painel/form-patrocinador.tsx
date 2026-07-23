"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, FileVideo, FileImage } from "lucide-react";
import type { Patrocinador } from "@/types";
import {
  criarPatrocinador,
  atualizarPatrocinador,
  enviarArquivo,
  tipoDoArquivo,
  MIME_ACEITOS,
  TAMANHO_MAXIMO_MB,
} from "@/lib/services/patrocinadores-service";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

/**
 * Cadastro/edição de patrocinador. O arquivo vai para o Supabase Storage e
 * o banco guarda só a URL. Ao editar, o arquivo é opcional (mantém o atual).
 */
export function FormPatrocinador({
  patrocinador,
  onPronto,
  onCancelar,
}: {
  patrocinador?: Patrocinador;
  onPronto: () => void;
  onCancelar: () => void;
}) {
  const editando = !!patrocinador;

  const [nome, setNome] = useState(patrocinador?.nome ?? "");
  const [descricao, setDescricao] = useState(patrocinador?.descricao ?? "");
  const [tempo, setTempo] = useState(patrocinador?.tempoExibicao ?? 8);
  const [ativo, setAtivo] = useState(patrocinador?.ativo ?? true);
  const [dataInicio, setDataInicio] = useState(patrocinador?.dataInicio ?? "");
  const [dataFim, setDataFim] = useState(patrocinador?.dataFim ?? "");

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const tipo = arquivo ? tipoDoArquivo(arquivo) : (patrocinador?.tipo ?? "imagem");

  async function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (salvando) return;
    setErro(null);

    if (!nome.trim()) return setErro("Informe o nome.");
    if (!editando && !arquivo) return setErro("Escolha uma imagem ou vídeo.");
    if (dataInicio && dataFim && dataFim < dataInicio) {
      return setErro("A data final não pode ser anterior à inicial.");
    }

    setSalvando(true);
    try {
      let url = patrocinador?.arquivoUrl ?? "";
      if (arquivo) url = await enviarArquivo(arquivo);

      const dados = {
        nome,
        descricao,
        tipo,
        arquivoUrl: url,
        tempoExibicao: Math.max(1, tempo),
        ativo,
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
      };

      if (editando) await atualizarPatrocinador(patrocinador.id, dados);
      else await criarPatrocinador(dados);

      onPronto();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao salvar.");
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={aoSalvar} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="p-nome">Nome</Label>
        <Input
          id="p-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Suplementos XY"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="p-desc">Descrição (opcional)</Label>
        <Input
          id="p-desc"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Campanha de verão"
        />
      </div>

      {/* Arquivo */}
      <div className="space-y-1.5">
        <Label htmlFor="p-arquivo">
          {editando ? "Substituir arquivo (opcional)" : "Imagem ou vídeo"}
        </Label>
        <input
          ref={inputArquivo}
          id="p-arquivo"
          type="file"
          accept={MIME_ACEITOS.join(",")}
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputArquivo.current?.click()}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed border-borda bg-superficie-2 px-3.5 py-3 text-left text-sm text-texto-suave transition-colors hover:border-marca hover:text-texto"
        >
          {tipo === "video" ? (
            <FileVideo className="size-5 shrink-0 text-texto-fraco" aria-hidden />
          ) : (
            <FileImage className="size-5 shrink-0 text-texto-fraco" aria-hidden />
          )}
          <span className="min-w-0 flex-1 truncate">
            {arquivo
              ? arquivo.name
              : editando
                ? "Manter arquivo atual"
                : "Escolher arquivo..."}
          </span>
          <Upload className="size-4 shrink-0 text-texto-fraco" aria-hidden />
        </button>
        <p className="text-xs text-texto-fraco">
          PNG, JPG, WEBP ou MP4 · até {TAMANHO_MAXIMO_MB} MB · vertical (9:16) fica melhor
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="p-tempo">Tempo de exibição (seg)</Label>
          <Input
            id="p-tempo"
            type="number"
            min={1}
            max={300}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
          />
          {tipo === "video" && (
            <p className="text-xs text-texto-fraco">
              Vídeo avança ao terminar; este valor é ignorado.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-status">Status</Label>
          <Select
            id="p-status"
            value={ativo ? "ativo" : "inativo"}
            onChange={(e) => setAtivo(e.target.value === "ativo")}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="p-ini">Data inicial (opcional)</Label>
          <Input
            id="p-ini"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-fim">Data final (opcional)</Label>
          <Input
            id="p-fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      {erro && (
        <p className="rounded-lg border border-descanso/40 bg-descanso/10 px-3 py-2 text-sm text-descanso">
          {erro}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variante="secundaria" tamanho="sm" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" tamanho="sm" disabled={salvando}>
          {salvando && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {salvando ? "Enviando..." : editando ? "Salvar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
