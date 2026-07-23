"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Library } from "lucide-react";
import type { CategoriaTreino, Treino } from "@/types";
import {
  listarTreinos,
  criarTreino,
  duplicarTreino,
  excluirTreino,
} from "@/lib/services/treinos-service";
import { CATEGORIAS } from "@/lib/treinos/categorias";
import { duracaoTotalSegundos } from "@/lib/treinos/calculos";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CardTreino } from "@/components/painel/card-treino";

type Ordenacao = "recentes" | "nome" | "duracao";

export function BibliotecaTreinos() {
  const router = useRouter();

  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaTreino | "">("");
  const [ordem, setOrdem] = useState<Ordenacao>("recentes");

  const [modalNovo, setModalNovo] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [categoriaNova, setCategoriaNova] = useState<CategoriaTreino>("crossfit");
  const [salvando, setSalvando] = useState(false);

  const [paraExcluir, setParaExcluir] = useState<Treino | null>(null);

  // Os treinos vêm do Supabase; carregados ao montar.
  useEffect(() => {
    listarTreinos().then((lista) => {
      setTreinos(lista);
      setCarregando(false);
    });
  }, []);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const filtrados = treinos.filter((t) => {
      const casaCategoria = !filtroCategoria || t.categoria === filtroCategoria;
      if (!casaCategoria) return false;
      if (!termo) return true;
      // busca no nome e na descrição
      return (
        t.nome.toLowerCase().includes(termo) ||
        (t.descricao?.toLowerCase().includes(termo) ?? false)
      );
    });

    const ordenado = [...filtrados];
    if (ordem === "nome") {
      ordenado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    } else if (ordem === "duracao") {
      ordenado.sort((a, b) => duracaoTotalSegundos(b) - duracaoTotalSegundos(a));
    } else {
      ordenado.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
    }
    return ordenado;
  }, [treinos, busca, filtroCategoria, ordem]);

  async function aoCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeNovo.trim() || salvando) return;

    setSalvando(true);
    const novo = await criarTreino({ nome: nomeNovo, categoria: categoriaNova });
    setSalvando(false);
    setModalNovo(false);
    setNomeNovo("");
    // leva direto para a montagem dos blocos
    router.push(`/painel/treinos/${novo.id}`);
  }

  async function aoDuplicar(treino: Treino) {
    const copia = await duplicarTreino(treino.id);
    if (copia) setTreinos(await listarTreinos());
  }

  async function aoConfirmarExclusao() {
    if (!paraExcluir) return;
    await excluirTreino(paraExcluir.id);
    setParaExcluir(null);
    setTreinos(await listarTreinos());
  }

  const temFiltro = busca.trim() !== "" || filtroCategoria !== "";

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Biblioteca de Treinos"
        descricao="Todos os treinos da academia, prontos para enviar às telas."
        acoes={
          <Button tamanho="sm" onClick={() => setModalNovo(true)}>
            <Plus className="size-4" aria-hidden />
            Novo treino
          </Button>
        }
      />

      {/* Busca e filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-fraco"
            aria-hidden
          />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar treino pelo nome..."
            aria-label="Buscar treino"
            className="pl-10"
          />
        </div>

        <Select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as CategoriaTreino | "")}
          aria-label="Filtrar por categoria"
          className="sm:w-48"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>

        <Select
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as Ordenacao)}
          aria-label="Ordenar"
          className="sm:w-44"
        >
          <option value="recentes">Mais recentes</option>
          <option value="nome">Nome (A–Z)</option>
          <option value="duracao">Maior duração</option>
        </Select>
      </div>

      {/* Contagem */}
      {!carregando && (
        <p className="text-xs text-texto-fraco">
          {visiveis.length}{" "}
          {visiveis.length === 1 ? "treino encontrado" : "treinos encontrados"}
        </p>
      )}

      {/* Grid */}
      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-48 rounded-card" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <EmptyState
          icone={Library}
          titulo={temFiltro ? "Nenhum treino encontrado" : "Biblioteca vazia"}
          descricao={
            temFiltro
              ? "Tente outro termo de busca ou limpe os filtros."
              : "Crie o primeiro treino para começar a enviar às telas da academia."
          }
          acao={
            temFiltro ? (
              <Button
                tamanho="sm"
                variante="secundaria"
                onClick={() => {
                  setBusca("");
                  setFiltroCategoria("");
                }}
              >
                Limpar filtros
              </Button>
            ) : (
              <Button tamanho="sm" onClick={() => setModalNovo(true)}>
                Criar o primeiro treino
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visiveis.map((treino) => (
            <CardTreino
              key={treino.id}
              treino={treino}
              onDuplicar={aoDuplicar}
              onExcluir={setParaExcluir}
            />
          ))}
        </div>
      )}

      {/* Criar */}
      <Modal
        aberto={modalNovo}
        onFechar={() => setModalNovo(false)}
        titulo="Novo treino"
        descricao="Dê um nome e escolha a categoria. Os blocos você monta em seguida."
      >
        <form onSubmit={aoCriar} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome-novo">Nome do treino</Label>
            <Input
              id="nome-novo"
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              placeholder="Ex.: WOD Segunda"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria-nova">Categoria</Label>
            <Select
              id="categoria-nova"
              value={categoriaNova}
              onChange={(e) => setCategoriaNova(e.target.value as CategoriaTreino)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variante="secundaria"
              tamanho="sm"
              onClick={() => setModalNovo(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" tamanho="sm" disabled={!nomeNovo.trim() || salvando}>
              {salvando ? "Criando..." : "Criar treino"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Excluir */}
      <Modal
        aberto={paraExcluir !== null}
        onFechar={() => setParaExcluir(null)}
        titulo="Excluir treino"
        descricao={
          paraExcluir
            ? `"${paraExcluir.nome}" será removido da biblioteca. Esta ação não pode ser desfeita.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button
            variante="secundaria"
            tamanho="sm"
            onClick={() => setParaExcluir(null)}
          >
            Cancelar
          </Button>
          <Button variante="perigo" tamanho="sm" onClick={aoConfirmarExclusao}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
