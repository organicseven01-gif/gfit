"use client";

import { useEffect, useState } from "react";
import { Plus, Tv, Pencil, Trash2, Clock, Calendar, Video, Image as Img } from "lucide-react";
import type { Patrocinador } from "@/types";
import {
  listarPatrocinadores,
  excluirPatrocinador,
  alternarAtivo,
} from "@/lib/services/patrocinadores-service";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FormPatrocinador } from "@/components/painel/form-patrocinador";

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/** Fora da janela de datas? (só para sinalizar no card) */
function foraDaJanela(p: Patrocinador): boolean {
  const hoje = new Date().toISOString().slice(0, 10);
  if (p.dataInicio && hoje < p.dataInicio) return true;
  if (p.dataFim && hoje > p.dataFim) return true;
  return false;
}

export function PatrocinadoresView() {
  const [lista, setLista] = useState<Patrocinador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Patrocinador | undefined>();
  const [paraExcluir, setParaExcluir] = useState<Patrocinador | null>(null);

  async function recarregar() {
    try {
      setLista(await listarPatrocinadores());
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  // Carga inicial: setState só dentro do callback assíncrono.
  useEffect(() => {
    listarPatrocinadores()
      .then((l) => {
        setLista(l);
        setErro(null);
      })
      .catch((e: unknown) =>
        setErro(e instanceof Error ? e.message : "Falha ao carregar."),
      )
      .finally(() => setCarregando(false));
  }, []);

  async function aoExcluir() {
    if (!paraExcluir) return;
    await excluirPatrocinador(paraExcluir.id, paraExcluir.arquivoUrl);
    setParaExcluir(null);
    recarregar();
  }

  async function aoAlternar(p: Patrocinador) {
    await alternarAtivo(p.id, !p.ativo);
    recarregar();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Patrocinadores"
        descricao="Mídia exibida na faixa lateral da tela da TV."
        acoes={
          <Button
            tamanho="sm"
            onClick={() => {
              setEditando(undefined);
              setFormAberto(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Novo Patrocinador
          </Button>
        }
      />

      {erro && (
        <p className="rounded-lg border border-descanso/40 bg-descanso/10 px-3 py-2 text-sm text-descanso">
          {erro}
        </p>
      )}

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-64 rounded-card" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <EmptyState
          icone={Tv}
          titulo="Nenhum patrocinador cadastrado"
          descricao="Cadastre imagens ou vídeos para exibir na faixa lateral da TV."
          acao={
            <Button
              tamanho="sm"
              onClick={() => {
                setEditando(undefined);
                setFormAberto(true);
              }}
            >
              Cadastrar o primeiro
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((p) => {
            const inativoPorData = p.ativo && foraDaJanela(p);
            return (
              <Card key={p.id} className="flex flex-col overflow-hidden">
                {/* Prévia da mídia */}
                <div className="relative aspect-video w-full overflow-hidden bg-superficie-2">
                  {p.tipo === "video" ? (
                    <video
                      src={p.arquivoUrl}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.arquivoUrl}
                      alt={p.nome}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[0.65rem] font-semibold text-texto-suave uppercase backdrop-blur">
                    {p.tipo === "video" ? (
                      <Video className="size-3" aria-hidden />
                    ) : (
                      <Img className="size-3" aria-hidden />
                    )}
                    {p.tipo}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-texto">{p.nome}</h3>
                      {p.descricao && (
                        <p className="truncate text-xs text-texto-suave">
                          {p.descricao}
                        </p>
                      )}
                    </div>
                    <Badge tom={p.ativo ? "sucesso" : "neutro"}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {inativoPorData && (
                    <p className="rounded-md bg-preparar/10 px-2 py-1 text-xs text-preparar">
                      Fora da janela de datas — não está sendo exibido.
                    </p>
                  )}

                  <dl className="mt-auto space-y-1.5 text-xs text-texto-suave">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 shrink-0 text-texto-fraco" aria-hidden />
                      <dt className="sr-only">Tempo de exibição</dt>
                      <dd>
                        {p.tipo === "video"
                          ? "Duração do vídeo"
                          : `${p.tempoExibicao}s em tela`}
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0 text-texto-fraco" aria-hidden />
                      <dt className="sr-only">Período</dt>
                      <dd>
                        {formatarData(p.dataInicio)} até {formatarData(p.dataFim)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex items-center gap-1 border-t border-borda pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(p);
                        setFormAberto(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-texto-suave transition-colors hover:bg-superficie-2 hover:text-texto"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => aoAlternar(p)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-texto-suave transition-colors hover:bg-superficie-2 hover:text-texto"
                    >
                      {p.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setParaExcluir(p)}
                      aria-label={`Excluir ${p.nome}`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-texto-fraco transition-colors hover:bg-descanso/10 hover:text-descanso"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Excluir
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cadastro / edição */}
      <Modal
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        titulo={editando ? "Editar patrocinador" : "Novo patrocinador"}
        descricao="A mídia vai para o Storage; a TV exibe apenas peças ativas e dentro do período."
        className="max-w-lg"
      >
        {formAberto && (
          <FormPatrocinador
            patrocinador={editando}
            onPronto={() => {
              setFormAberto(false);
              recarregar();
            }}
            onCancelar={() => setFormAberto(false)}
          />
        )}
      </Modal>

      {/* Exclusão */}
      <Modal
        aberto={paraExcluir !== null}
        onFechar={() => setParaExcluir(null)}
        titulo="Excluir patrocinador"
        descricao={
          paraExcluir
            ? `"${paraExcluir.nome}" e seu arquivo serão removidos. Não pode ser desfeito.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button variante="secundaria" tamanho="sm" onClick={() => setParaExcluir(null)}>
            Cancelar
          </Button>
          <Button variante="perigo" tamanho="sm" onClick={aoExcluir}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
