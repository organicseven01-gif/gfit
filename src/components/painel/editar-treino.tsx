"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MonitorPlay } from "lucide-react";
import type { Treino } from "@/types";
import { obterTreino, atualizarTreino } from "@/lib/services/treinos-service";
import { CATEGORIAS } from "@/lib/treinos/categorias";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { EditorVisual } from "@/components/painel/editor-visual";
import type { CategoriaTreino } from "@/types";

export function EditarTreino({ id }: { id: string }) {
  const [treino, setTreino] = useState<Treino | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    obterTreino(id).then((t) => {
      setTreino(t);
      setCarregando(false);
    });
  }, [id]);

  if (carregando) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 rounded-card" />
      </div>
    );
  }

  if (!treino) {
    return (
      <EmptyState
        icone={ArrowLeft}
        titulo="Treino não encontrado"
        descricao="Ele pode ter sido excluído. Volte à biblioteca para ver os treinos disponíveis."
        acao={
          <Link href="/painel/treinos">
            <Button tamanho="sm">Ir para a biblioteca</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/painel/treinos"
        className="inline-flex items-center gap-1.5 text-sm text-texto-suave transition-colors hover:text-texto"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Biblioteca de Treinos
      </Link>

      {/* Identificação: dois campos soltos, sem cara de formulário */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={treino.nome}
            onChange={(e) => {
              const nome = e.target.value;
              setTreino({ ...treino, nome });
              atualizarTreino(treino.id, { nome });
            }}
            aria-label="Nome do treino"
            className="h-12 min-w-0 flex-1 border-transparent bg-transparent px-2 text-2xl font-bold hover:border-borda focus:bg-superficie-2"
          />

          <Select
            value={treino.categoria}
            onChange={(e) => {
              const categoria = e.target.value as CategoriaTreino;
              setTreino({ ...treino, categoria });
              atualizarTreino(treino.id, { categoria });
            }}
            aria-label="Categoria"
            className="sm:w-48"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>

        <Link href={`/tv?treino=${treino.id}`}>
          <Button variante="secundaria" tamanho="sm">
            <MonitorPlay className="size-4" aria-hidden />
            Controlar na TV
          </Button>
        </Link>
      </header>

      <EditorVisual treino={treino} />
    </div>
  );
}
