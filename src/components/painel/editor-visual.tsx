"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Check, Loader2, ListPlus } from "lucide-react";
import type { Etapa, TipoEtapa, Treino } from "@/types";
import { TIPOS_ETAPA, criarEtapa, clonarEtapa } from "@/lib/treinos/etapas";
import { duracaoDasEtapas } from "@/lib/treinos/calculos";
import { atualizarTreino } from "@/lib/services/treinos-service";
import { formatarDuracao } from "@/lib/utils";
import { EtapaLinha } from "@/components/painel/etapa-linha";

/** Sugestões que aparecem ao digitar o nome de um exercício. */
const SUGESTOES = [
  "Aquecimento", "Burpee", "Wall Ball", "Air Squat", "Push-up", "Pull-up",
  "Kettlebell Swing", "Double Under", "Box Jump", "Deadlift", "Thruster",
  "Remo", "Corrida", "Ski Erg", "Sled Push", "Farmers Carry", "Prancha",
  "Abdominal", "Afundo", "Polichinelo",
];

type Estado = "salvo" | "salvando";

export function EditorVisual({ treino }: { treino: Treino }) {
  const [etapas, setEtapas] = useState<Etapa[]>(treino.etapas);
  const [estado, setEstado] = useState<Estado>("salvo");
  const [idArrastando, setIdArrastando] = useState<string | null>(null);

  // Evita gravar na montagem — só quando algo muda de verdade.
  const primeiraRenderizacao = useRef(true);

  const sensors = useSensors(
    // 6px de tolerância: sem isso, um clique no botão vira arraste
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // no tablet, segurar 200ms distingue arraste de rolagem
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Salvamento automático — nada de botão "Salvar" para o professor lembrar.
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    setEstado("salvando");
    const id = setTimeout(async () => {
      await atualizarTreino(treino.id, { etapas });
      setEstado("salvo");
    }, 500);
    return () => clearTimeout(id);
  }, [etapas, treino.id]);

  const alterar = useCallback((id: string, campos: Partial<Etapa>) => {
    setEtapas((atual) =>
      atual.map((e) => (e.id === id ? { ...e, ...campos } : e)),
    );
  }, []);

  const duplicar = useCallback((id: string) => {
    setEtapas((atual) => {
      const i = atual.findIndex((e) => e.id === id);
      if (i === -1) return atual;
      const copia = clonarEtapa(atual[i]);
      // entra logo abaixo do original, que é onde se espera
      return [...atual.slice(0, i + 1), copia, ...atual.slice(i + 1)];
    });
  }, []);

  const remover = useCallback((id: string) => {
    setEtapas((atual) => atual.filter((e) => e.id !== id));
  }, []);

  const adicionar = useCallback((tipo: TipoEtapa) => {
    setEtapas((atual) => [...atual, criarEtapa(tipo)]);
  }, []);

  function aoIniciarArraste(evento: DragStartEvent) {
    setIdArrastando(String(evento.active.id));
  }

  function aoTerminarArraste(evento: DragEndEvent) {
    setIdArrastando(null);
    const { active, over } = evento;
    if (!over || active.id === over.id) return;

    setEtapas((atual) => {
      const de = atual.findIndex((e) => e.id === active.id);
      const para = atual.findIndex((e) => e.id === over.id);
      return de === -1 || para === -1 ? atual : arrayMove(atual, de, para);
    });
  }

  const etapaArrastada = etapas.find((e) => e.id === idArrastando) ?? null;
  const total = duracaoDasEtapas(etapas);
  const qtdExercicios = etapas.filter((e) => e.tipo === "exercicio").length;

  return (
    <div className="space-y-5">
      {/* Resumo + estado do salvamento */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-borda bg-superficie px-4 py-3">
        <div className="flex items-center gap-5 text-sm">
          <span className="text-texto-suave">
            <span className="numeros-timer font-bold text-texto">
              {formatarDuracao(total)}
            </span>{" "}
            no total
          </span>
          <span className="text-texto-suave">
            <span className="font-bold text-texto">{qtdExercicios}</span>{" "}
            {qtdExercicios === 1 ? "exercício" : "exercícios"}
          </span>
        </div>

        <span
          className="flex items-center gap-1.5 text-xs font-medium text-texto-fraco"
          aria-live="polite"
        >
          {estado === "salvando" ? (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Salvando
            </>
          ) : (
            <>
              <Check className="size-3.5 text-trabalho" aria-hidden />
              Salvo
            </>
          )}
        </span>
      </div>

      {/* Lista */}
      {etapas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-borda px-6 py-14 text-center">
          <div className="rounded-full bg-superficie-2 p-3 text-texto-fraco">
            <ListPlus className="size-6" aria-hidden />
          </div>
          <h3 className="font-semibold text-texto">Comece pela primeira etapa</h3>
          <p className="max-w-sm text-sm text-texto-suave">
            Monte o treino na ordem em que ele acontece. Depois é só arrastar
            para reorganizar.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={aoIniciarArraste}
          onDragEnd={aoTerminarArraste}
          onDragCancel={() => setIdArrastando(null)}
        >
          <SortableContext items={etapas} strategy={verticalListSortingStrategy}>
            {/* As <li> precisam ser filhas diretas da <ol>: qualquer wrapper
                aqui vira o "elemento pai" do arraste e prende a linha nele. */}
            <ol>
              {etapas.map((etapa, i) => (
                <EtapaLinha
                  key={etapa.id}
                  etapa={etapa}
                  indice={i}
                  onAlterar={alterar}
                  onDuplicar={duplicar}
                  onRemover={remover}
                  mostrarSeta={i < etapas.length - 1}
                />
              ))}
            </ol>
          </SortableContext>

          {/* Prévia que acompanha o cursor */}
          <DragOverlay>
            {etapaArrastada && (
              <ol>
                <EtapaLinha
                  etapa={etapaArrastada}
                  indice={etapas.findIndex((e) => e.id === etapaArrastada.id)}
                  onAlterar={() => {}}
                  onDuplicar={() => {}}
                  onRemover={() => {}}
                  arrastando
                />
              </ol>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Adicionar etapa */}
      <div className="flex flex-wrap gap-2">
        {TIPOS_ETAPA.map((tipo) => (
          <button
            key={tipo.id}
            type="button"
            onClick={() => adicionar(tipo.id)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-borda px-4 py-3.5 text-sm font-semibold text-texto-suave transition-colors hover:border-[var(--acento)] hover:text-[var(--acento)]"
            style={{ ["--acento" as string]: tipo.cor }}
          >
            <tipo.icone className="size-4" aria-hidden />
            {tipo.rotulo}
          </button>
        ))}
      </div>

      {/* Sugestões do campo de nome */}
      <datalist id="sugestoes-exercicios">
        {SUGESTOES.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
