"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Check, Loader2, CalendarClock } from "lucide-react";
import type { AulaAgendada } from "@/types";
import {
  obterConfiguracoes,
  atualizarConfiguracoes,
} from "@/lib/services/configuracoes-service";
import { DIAS_SEMANA } from "@/lib/agenda/agenda";
import {
  Card,
  CardCabecalho,
  CardTitulo,
  CardDescricao,
  CardConteudo,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function novaAula(): AulaAgendada {
  return {
    id: crypto.randomUUID(),
    nome: "Nova turma",
    horario: "06:00",
    dias: [1, 2, 3, 4, 5],
    duracaoMin: 60,
  };
}

export function AgendaEditor() {
  const [aulas, setAulas] = useState<AulaAgendada[] | null>(null);
  const [salvo, setSalvo] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    obterConfiguracoes()
      .then((c) => setAulas(c.agenda))
      .catch(() => setAulas([]));
  }, []);

  // salva a grade inteira, com debounce (o usuário edita vários campos seguidos)
  function persistir(lista: AulaAgendada[]) {
    setSalvo(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await atualizarConfiguracoes({ agenda: lista });
      } finally {
        setSalvo(true);
      }
    }, 600);
  }

  function aplicar(lista: AulaAgendada[]) {
    setAulas(lista);
    persistir(lista);
  }

  const adicionar = () => aulas && aplicar([...aulas, novaAula()]);
  const remover = (id: string) =>
    aulas && aplicar(aulas.filter((a) => a.id !== id));
  const editar = (id: string, patch: Partial<AulaAgendada>) =>
    aulas && aplicar(aulas.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const alternarDia = (a: AulaAgendada, dia: number) =>
    editar(a.id, {
      dias: a.dias.includes(dia)
        ? a.dias.filter((d) => d !== dia)
        : [...a.dias, dia].sort((x, y) => x - y),
    });

  return (
    <Card>
      <CardCabecalho className="flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitulo className="flex items-center gap-2">
            <CalendarClock className="size-4 text-texto-fraco" aria-hidden />
            Agenda das turmas
          </CardTitulo>
          <CardDescricao>
            A TV mostra a próxima turma, um aviso 10 min antes e o nome durante a
            aula (quando não há treino no ar).
          </CardDescricao>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-texto-fraco">
          {salvo ? (
            <>
              <Check className="size-3.5 text-trabalho" aria-hidden />
              Salvo
            </>
          ) : (
            <>
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Salvando
            </>
          )}
        </span>
      </CardCabecalho>

      <CardConteudo className="space-y-4">
        {aulas === null ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : aulas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-borda p-8 text-center">
            <p className="text-sm text-texto-suave">
              Nenhuma turma cadastrada.
            </p>
            <p className="mt-1 text-xs text-texto-fraco">
              Adicione as turmas da academia para aparecerem na TV.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {aulas.map((a) => (
              <div
                key={a.id}
                className="space-y-3 rounded-xl border border-borda bg-superficie-2 p-4"
              >
                {/* Nome + remover */}
                <div className="flex items-center gap-2">
                  <Input
                    value={a.nome}
                    onChange={(e) => editar(a.id, { nome: e.target.value })}
                    placeholder="Nome da turma (ex.: Turma das 6h)"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => remover(a.id)}
                    aria-label={`Remover ${a.nome}`}
                    className="grid size-11 shrink-0 place-items-center rounded-lg border border-borda text-texto-fraco transition-colors hover:border-descanso hover:text-descanso"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>

                {/* Horário + duração */}
                <div className="flex flex-wrap items-end gap-4">
                  <label className="space-y-1.5">
                    <span className="block text-xs font-semibold tracking-wide text-texto-suave uppercase">
                      Horário
                    </span>
                    <input
                      type="time"
                      value={a.horario}
                      onChange={(e) => editar(a.id, { horario: e.target.value })}
                      className="h-11 rounded-lg border border-borda bg-superficie px-3 text-sm text-texto focus:border-marca focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="block text-xs font-semibold tracking-wide text-texto-suave uppercase">
                      Duração (min)
                    </span>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      step={5}
                      value={a.duracaoMin}
                      onChange={(e) =>
                        editar(a.id, {
                          duracaoMin: Math.max(5, Number(e.target.value) || 60),
                        })
                      }
                      className="h-11 w-28 rounded-lg border border-borda bg-superficie px-3 text-sm text-texto focus:border-marca focus:outline-none"
                    />
                  </label>
                </div>

                {/* Dias da semana */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold tracking-wide text-texto-suave uppercase">
                    Dias
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DIAS_SEMANA.map((rotulo, dia) => {
                      const ativo = a.dias.includes(dia);
                      return (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => alternarDia(a, dia)}
                          aria-pressed={ativo}
                          className={cn(
                            "h-9 w-11 rounded-lg border text-xs font-bold transition-colors",
                            ativo
                              ? "border-marca bg-marca text-marca-contraste"
                              : "border-borda text-texto-fraco hover:border-borda-forte hover:text-texto-suave",
                          )}
                        >
                          {rotulo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variante="secundaria"
          onClick={adicionar}
          disabled={aulas === null}
          className="w-full"
        >
          <Plus className="size-4" aria-hidden />
          Adicionar turma
        </Button>
      </CardConteudo>
    </Card>
  );
}
