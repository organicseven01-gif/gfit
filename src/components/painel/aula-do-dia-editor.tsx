"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Loader2,
  TriangleAlert,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { AulaParte, Etapa, ModoTimer } from "@/types";
import {
  obterConfiguracoes,
  atualizarConfiguracoes,
} from "@/lib/services/configuracoes-service";
import { etapasDoModo } from "@/lib/timer/modelos";
import { MODOS_TIMER } from "@/lib/timer/modos";
import { DIAS_SEMANA, dataLocalISO, proximosDias } from "@/lib/agenda/agenda";
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

const DIAS_A_PLANEJAR = 7;

/** Modos de bloco único (têm "duração"); os demais têm rounds fixos. */
const ehBloco = (m: ModoTimer) =>
  m === "amrap" || m === "for_time" || m === "relogio";

function rotuloDia(d: Date, i: number): string {
  if (i === 0) return "Hoje";
  if (i === 1) return "Amanhã";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${DIAS_SEMANA[d.getDay()]} ${p(d.getDate())}`;
}

function novaParte(): AulaParte {
  return {
    id: crypto.randomUUID(),
    nome: "AMRAP",
    modo: "amrap",
    etapas: etapasDoModo("amrap"),
    movimentos: [],
  };
}

export function AulaDoDiaEditor() {
  const [mapa, setMapa] = useState<Record<string, AulaParte[]> | null>(null);
  const [dataSel, setDataSel] = useState(() => dataLocalISO());
  const [salvo, setSalvo] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    obterConfiguracoes()
      .then((c) => setMapa(c.aulasDoDia))
      .catch(() => setMapa({}));
  }, []);

  function persistir(novo: Record<string, AulaParte[]>) {
    setSalvo(false);
    setErro(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await atualizarConfiguracoes({ aulasDoDia: novo });
        setSalvo(true);
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : e && typeof e === "object" && "message" in e
              ? String((e as { message: unknown }).message)
              : String(e);
        setErro(msg);
        setSalvo(false);
      }
    }, 600);
  }

  const partes = mapa?.[dataSel] ?? [];

  function aplicarPartes(novasPartes: AulaParte[]) {
    if (!mapa) return;
    const novo = { ...mapa };
    if (novasPartes.length > 0) novo[dataSel] = novasPartes;
    else delete novo[dataSel];
    setMapa(novo);
    persistir(novo);
  }

  const adicionar = () => aplicarPartes([...partes, novaParte()]);
  const remover = (id: string) =>
    aplicarPartes(partes.filter((p) => p.id !== id));
  const editar = (id: string, patch: Partial<AulaParte>) =>
    aplicarPartes(partes.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  function mover(id: string, dir: -1 | 1) {
    const i = partes.indexOf(partes.find((p) => p.id === id)!);
    const j = i + dir;
    if (j < 0 || j >= partes.length) return;
    const copia = [...partes];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    aplicarPartes(copia);
  }

  function trocarModo(p: AulaParte, modo: ModoTimer) {
    const etapas = etapasDoModo(modo);
    if (ehBloco(modo) && etapas[0]) etapas[0].nome = p.nome || etapas[0].nome;
    editar(p.id, { modo, etapas });
  }

  function trocarNome(p: AulaParte, nome: string) {
    const patch: Partial<AulaParte> = { nome };
    if (ehBloco(p.modo) && p.etapas[0]) {
      patch.etapas = [{ ...p.etapas[0], nome: nome || p.etapas[0].nome }];
    }
    editar(p.id, patch);
  }

  function trocarDuracao(p: AulaParte, min: number) {
    if (!p.etapas[0]) return;
    const etapas: Etapa[] = [
      { ...p.etapas[0], segundos: Math.max(1, min) * 60 },
    ];
    editar(p.id, { etapas });
  }

  const dias = proximosDias(DIAS_A_PLANEJAR);

  return (
    <Card>
      <CardCabecalho className="flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitulo className="flex items-center gap-2">
            <CalendarDays className="size-4 text-texto-fraco" aria-hidden />
            Aula do dia
          </CardTitulo>
          <CardDescricao>
            Monte a aula em partes (aquecimento, AMRAP, WOD…). O professor toca
            cada parte no controle do celular.
          </CardDescricao>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-texto-fraco">
          {erro ? (
            <>
              <TriangleAlert className="size-3.5 text-descanso" aria-hidden />
              Não salvou
            </>
          ) : salvo ? (
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
        {erro && (
          <div className="flex items-start gap-2.5 rounded-lg border border-descanso/40 bg-descanso/10 p-3 text-sm text-texto">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-descanso" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">Não foi possível salvar.</p>
              {/aulas_do_dia|column|schema cache|PGRST/i.test(erro) ? (
                <p className="text-texto-suave">
                  A coluna <code className="text-marca">aulas_do_dia</code> ainda
                  não existe no banco. Rode o SQL no Supabase e tente de novo.
                </p>
              ) : (
                <p className="text-texto-suave">{erro}</p>
              )}
            </div>
          </div>
        )}

        {/* Seletor de dia */}
        <div className="flex flex-wrap gap-1.5">
          {dias.map((d, i) => {
            const data = dataLocalISO(d);
            const ativo = data === dataSel;
            const temAula = (mapa?.[data]?.length ?? 0) > 0;
            return (
              <button
                key={data}
                type="button"
                onClick={() => setDataSel(data)}
                className={cn(
                  "relative rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                  ativo
                    ? "border-marca bg-marca text-marca-contraste"
                    : "border-borda text-texto-suave hover:border-borda-forte",
                )}
              >
                {rotuloDia(d, i)}
                {temAula && !ativo && (
                  <span className="absolute top-1 right-1 size-1.5 rounded-full bg-marca" />
                )}
              </button>
            );
          })}
        </div>

        {mapa === null ? (
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <Skeleton key={n} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : partes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-borda p-8 text-center text-sm text-texto-fraco">
            Nenhuma parte nesta aula. Adicione a primeira (ex.: Aquecimento).
          </p>
        ) : (
          <div className="space-y-3">
            {partes.map((p, i) => {
              const duracaoMin = ehBloco(p.modo)
                ? Math.round((p.etapas[0]?.segundos ?? 0) / 60)
                : null;
              return (
                <div
                  key={p.id}
                  className="space-y-3 rounded-xl border border-borda bg-superficie-2 p-4"
                >
                  {/* Cabeçalho da parte: número + nome + mover/remover */}
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-marca/15 text-xs font-bold text-marca">
                      {i + 1}
                    </span>
                    <Input
                      value={p.nome}
                      onChange={(e) => trocarNome(p, e.target.value)}
                      placeholder="Nome da parte (ex.: Aquecimento)"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => mover(p.id, -1)}
                      disabled={i === 0}
                      aria-label="Mover para cima"
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-borda text-texto-fraco transition-colors hover:text-texto disabled:opacity-30"
                    >
                      <ChevronUp className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(p.id, 1)}
                      disabled={i === partes.length - 1}
                      aria-label="Mover para baixo"
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-borda text-texto-fraco transition-colors hover:text-texto disabled:opacity-30"
                    >
                      <ChevronDown className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(p.id)}
                      aria-label={`Remover ${p.nome}`}
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-borda text-texto-fraco transition-colors hover:border-descanso hover:text-descanso"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>

                  {/* Modo + duração */}
                  <div className="flex flex-wrap items-end gap-4">
                    <label className="space-y-1.5">
                      <span className="block text-xs font-semibold tracking-wide text-texto-suave uppercase">
                        Tipo
                      </span>
                      <select
                        value={p.modo}
                        onChange={(e) =>
                          trocarModo(p, e.target.value as ModoTimer)
                        }
                        className="h-11 rounded-lg border border-borda bg-superficie px-3 text-sm text-texto focus:border-marca focus:outline-none"
                      >
                        {MODOS_TIMER.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    {duracaoMin !== null ? (
                      <label className="space-y-1.5">
                        <span className="block text-xs font-semibold tracking-wide text-texto-suave uppercase">
                          Duração (min)
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={duracaoMin}
                          onChange={(e) =>
                            trocarDuracao(p, Number(e.target.value) || 1)
                          }
                          className="h-11 w-28 rounded-lg border border-borda bg-superficie px-3 text-sm text-texto focus:border-marca focus:outline-none"
                        />
                      </label>
                    ) : (
                      <p className="pb-3 text-xs text-texto-fraco">
                        {p.modo === "tabata"
                          ? "8 rounds · 20s / 10s (ajuste fino em breve)"
                          : "10 rounds · 1 min cada (ajuste fino em breve)"}
                      </p>
                    )}
                  </div>

                  {/* Movimentos */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold tracking-wide text-texto-suave uppercase">
                      Exercícios (um por linha)
                    </span>
                    <textarea
                      value={p.movimentos.join("\n")}
                      onChange={(e) =>
                        editar(p.id, { movimentos: e.target.value.split("\n") })
                      }
                      rows={3}
                      placeholder={"8-12 KB Bent Over Row\nDB Biceps Curl\n10-15 DB Lat Raises"}
                      className="w-full rounded-lg border border-borda bg-superficie px-3 py-2 text-sm text-texto focus:border-marca focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Button
          variante="secundaria"
          onClick={adicionar}
          disabled={mapa === null}
          className="w-full"
        >
          <Plus className="size-4" aria-hidden />
          Adicionar parte
        </Button>
      </CardConteudo>
    </Card>
  );
}
