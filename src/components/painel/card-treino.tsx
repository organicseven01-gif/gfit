"use client";

import Link from "next/link";
import { Clock, Dumbbell, History, Copy, Pencil, Trash2 } from "lucide-react";
import type { Treino } from "@/types";
import { Badge } from "@/components/ui/badge";
import { categoria } from "@/lib/treinos/categorias";
import { duracaoTotalSegundos, quantidadeExercicios } from "@/lib/treinos/calculos";
import { formatarDuracao, formatarDesde } from "@/lib/utils";

/**
 * Card de treino da biblioteca.
 *
 * As ações ficam sempre visíveis em vez de aparecerem no hover: o painel
 * é usado em tablet no balcão da academia, onde hover não existe.
 */
export function CardTreino({
  treino,
  onDuplicar,
  onExcluir,
}: {
  treino: Treino;
  onDuplicar: (treino: Treino) => void;
  onExcluir: (treino: Treino) => void;
}) {
  const cat = categoria(treino.categoria);
  const duracao = duracaoTotalSegundos(treino);
  const exercicios = quantidadeExercicios(treino);

  return (
    <article className="group flex flex-col rounded-card border border-borda bg-superficie transition-colors hover:border-borda-forte">
      {/* Corpo clicável leva à edição */}
      <Link
        href={`/painel/treinos/${treino.id}`}
        className="flex flex-1 flex-col gap-4 p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-semibold text-texto group-hover:text-marca">
            {treino.nome}
          </h3>
          <Badge tom={cat.tom} className="shrink-0">
            {cat.nome}
          </Badge>
        </div>

        <dl className="mt-auto grid grid-cols-2 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-texto-suave">
            <Clock className="size-3.5 shrink-0 text-texto-fraco" aria-hidden />
            <dt className="sr-only">Tempo total</dt>
            <dd className="numeros-timer">{formatarDuracao(duracao)}</dd>
          </div>

          <div className="flex items-center gap-1.5 text-texto-suave">
            <Dumbbell className="size-3.5 shrink-0 text-texto-fraco" aria-hidden />
            <dt className="sr-only">Exercícios</dt>
            <dd>
              {exercicios} {exercicios === 1 ? "exercício" : "exercícios"}
            </dd>
          </div>

          <div className="col-span-2 flex items-center gap-1.5 text-texto-fraco">
            <History className="size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Última atualização</dt>
            <dd>Atualizado {formatarDesde(treino.atualizadoEm)}</dd>
          </div>
        </dl>
      </Link>

      {/* Ações */}
      <div className="flex items-center gap-1 border-t border-borda px-3 py-2">
        <Link
          href={`/painel/treinos/${treino.id}`}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-texto-suave transition-colors hover:bg-superficie-2 hover:text-texto"
        >
          <Pencil className="size-3.5" aria-hidden />
          Editar
        </Link>

        <button
          type="button"
          onClick={() => onDuplicar(treino)}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-texto-suave transition-colors hover:bg-superficie-2 hover:text-texto"
        >
          <Copy className="size-3.5" aria-hidden />
          Duplicar
        </button>

        <button
          type="button"
          onClick={() => onExcluir(treino)}
          aria-label={`Excluir ${treino.nome}`}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-texto-fraco transition-colors hover:bg-descanso/10 hover:text-descanso"
        >
          <Trash2 className="size-3.5" aria-hidden />
          Excluir
        </button>
      </div>
    </article>
  );
}
