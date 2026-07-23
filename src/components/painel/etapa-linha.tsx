"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Minus, Plus, Copy, Trash2, ArrowDown } from "lucide-react";
import type { Etapa } from "@/types";
import { tipoEtapa, passoSegundos, formatarRelogio } from "@/lib/treinos/etapas";
import { cn } from "@/lib/utils";

const MIN_SEGUNDOS = 5;
const MAX_SEGUNDOS = 3600;

export function EtapaLinha({
  etapa,
  indice,
  onAlterar,
  onDuplicar,
  onRemover,
  arrastando = false,
  mostrarSeta = false,
}: {
  etapa: Etapa;
  indice: number;
  onAlterar: (id: string, campos: Partial<Etapa>) => void;
  onDuplicar: (id: string) => void;
  onRemover: (id: string) => void;
  /** true na prévia que segue o cursor durante o arraste */
  arrastando?: boolean;
  /** desenha a seta de ligação para a etapa seguinte */
  mostrarSeta?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: etapa.id });

  const def = tipoEtapa(etapa.tipo);
  const Icone = def.icone;
  const ehRepetir = etapa.tipo === "repetir";

  const ajustarTempo = (delta: number) => {
    const passo = passoSegundos(etapa.segundos);
    const novo = Math.min(
      MAX_SEGUNDOS,
      Math.max(MIN_SEGUNDOS, etapa.segundos + delta * passo),
    );
    onAlterar(etapa.id, { segundos: novo });
  };

  const ajustarVezes = (delta: number) => {
    const novo = Math.min(50, Math.max(2, (etapa.vezes ?? 2) + delta));
    onAlterar(etapa.id, { vezes: novo });
  };

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        // cor de acento do tipo, consumida pelas classes abaixo
        ["--acento" as string]: def.cor,
      }}
      className={cn(
        // flex-wrap: no celular os controles descem para a segunda linha,
        // senão o campo de nome fica espremido em poucos pixels.
        "group relative flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-superficie px-3 py-3 sm:flex-nowrap sm:gap-x-4 sm:px-4",
        "border-borda",
        // espaço para a seta, que é desenhada dentro da própria <li>
        mostrarSeta && "mb-6",
        isDragging && "opacity-40",
        arrastando && "border-[var(--acento)] shadow-2xl",
      )}
    >
      {mostrarSeta && (
        <ArrowDown
          aria-hidden
          className="absolute -bottom-5 left-1/2 size-4 -translate-x-1/2 text-texto-fraco/50"
        />
      )}
      {/* Faixa de acento */}
      <span
        aria-hidden
        className="absolute inset-y-2 left-0 w-1 rounded-full bg-[var(--acento)]"
      />

      {/* Alça de arraste */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Mover ${etapa.nome}`}
        className="shrink-0 cursor-grab touch-none rounded-md p-1 text-texto-fraco transition-colors hover:bg-superficie-2 hover:text-texto active:cursor-grabbing"
      >
        <GripVertical className="size-5" aria-hidden />
      </button>

      {/* Posição */}
      <span className="numeros-timer w-5 shrink-0 text-center text-xs font-bold text-texto-fraco">
        {indice + 1}
      </span>

      {/* Ícone do tipo */}
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg"
        style={{
          backgroundColor: `color-mix(in srgb, ${def.cor} 15%, transparent)`,
          color: def.cor,
        }}
      >
        <Icone className="size-4.5" aria-hidden />
      </span>

      {/* Nome — editável no lugar, sem abrir formulário */}
      <input
        value={etapa.nome}
        onChange={(e) => onAlterar(etapa.id, { nome: e.target.value })}
        aria-label={`Nome da etapa ${indice + 1}`}
        list={etapa.tipo === "exercicio" ? "sugestoes-exercicios" : undefined}
        readOnly={ehRepetir}
        className={cn(
          "min-w-24 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-texto",
          "hover:border-borda focus:border-marca focus:bg-superficie-2 focus:outline-none",
          ehRepetir && "cursor-default text-marca hover:border-transparent",
        )}
      />

      {/* Controles: linha própria no celular, inline a partir do sm */}
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
      {/* Tempo, ou vezes no caso do repetir */}
      <div className="flex shrink-0 items-center gap-1 rounded-lg border border-borda bg-superficie-2 p-1">
        <button
          type="button"
          onClick={() => (ehRepetir ? ajustarVezes(-1) : ajustarTempo(-1))}
          aria-label={ehRepetir ? "Menos repetições" : "Diminuir tempo"}
          className="grid size-7 place-items-center rounded-md text-texto-fraco transition-colors hover:bg-borda hover:text-texto"
        >
          <Minus className="size-3.5" aria-hidden />
        </button>

        <span className="numeros-timer w-12 text-center text-sm font-bold text-texto tabular-nums">
          {ehRepetir ? `${etapa.vezes ?? 2}x` : formatarRelogio(etapa.segundos)}
        </span>

        <button
          type="button"
          onClick={() => (ehRepetir ? ajustarVezes(1) : ajustarTempo(1))}
          aria-label={ehRepetir ? "Mais repetições" : "Aumentar tempo"}
          className="grid size-7 place-items-center rounded-md text-texto-fraco transition-colors hover:bg-borda hover:text-texto"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>

      {/* Ações da linha */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => onDuplicar(etapa.id)}
          aria-label={`Duplicar ${etapa.nome}`}
          className="grid size-8 place-items-center rounded-md text-texto-fraco transition-colors hover:bg-superficie-2 hover:text-texto"
        >
          <Copy className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onRemover(etapa.id)}
          aria-label={`Remover ${etapa.nome}`}
          className="grid size-8 place-items-center rounded-md text-texto-fraco transition-colors hover:bg-descanso/10 hover:text-descanso"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
      </div>
    </li>
  );
}
