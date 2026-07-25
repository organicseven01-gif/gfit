"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, Loader2, TriangleAlert } from "lucide-react";
import type { Treino } from "@/types";
import {
  obterConfiguracoes,
  atualizarConfiguracoes,
} from "@/lib/services/configuracoes-service";
import { listarTreinos } from "@/lib/services/treinos-service";
import { DIAS_SEMANA, dataLocalISO, proximosDias } from "@/lib/agenda/agenda";
import {
  Card,
  CardCabecalho,
  CardTitulo,
  CardDescricao,
  CardConteudo,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DIAS_A_PLANEJAR = 7;

function rotuloDia(d: Date, i: number): string {
  if (i === 0) return "Hoje";
  if (i === 1) return "Amanhã";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${DIAS_SEMANA[d.getDay()]} ${p(d.getDate())}/${p(d.getMonth() + 1)}`;
}

export function TreinoDoDiaEditor() {
  const [treinos, setTreinos] = useState<Treino[] | null>(null);
  const [mapa, setMapa] = useState<Record<string, string>>({});
  const [salvo, setSalvo] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([listarTreinos(), obterConfiguracoes()])
      .then(([lista, cfg]) => {
        setTreinos(lista);
        setMapa(cfg.treinosDoDia);
      })
      .catch(() => setTreinos([]));
  }, []);

  function persistir(novo: Record<string, string>) {
    setSalvo(false);
    setErro(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await atualizarConfiguracoes({ treinosDoDia: novo });
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

  function definir(data: string, treinoId: string) {
    const novo = { ...mapa };
    if (treinoId) novo[data] = treinoId;
    else delete novo[data];
    setMapa(novo);
    persistir(novo);
  }

  const dias = proximosDias(DIAS_A_PLANEJAR);

  return (
    <Card>
      <CardCabecalho className="flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitulo className="flex items-center gap-2">
            <CalendarDays className="size-4 text-texto-fraco" aria-hidden />
            Treino do dia
          </CardTitulo>
          <CardDescricao>
            O treino de cada dia. Aparece pronto no controle do celular no
            horário das turmas.
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

      <CardConteudo className="space-y-3">
        {erro && (
          <div className="flex items-start gap-2.5 rounded-lg border border-descanso/40 bg-descanso/10 p-3 text-sm text-texto">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-descanso" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold">Não foi possível salvar.</p>
              {/treinos_do_dia|column|schema cache|PGRST/i.test(erro) ? (
                <p className="text-texto-suave">
                  A coluna <code className="text-marca">treinos_do_dia</code>{" "}
                  ainda não existe no banco. Rode o SQL no Supabase e tente de
                  novo.
                </p>
              ) : (
                <p className="text-texto-suave">{erro}</p>
              )}
            </div>
          </div>
        )}

        {treinos === null ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : treinos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-borda p-6 text-center text-sm text-texto-fraco">
            Crie treinos na biblioteca para poder definir o treino do dia.
          </p>
        ) : (
          dias.map((d, i) => {
            const data = dataLocalISO(d);
            return (
              <div
                key={data}
                className="flex items-center gap-3 rounded-lg border border-borda bg-superficie-2 p-3"
              >
                <span className="w-24 shrink-0 text-sm font-semibold text-texto">
                  {rotuloDia(d, i)}
                </span>
                <select
                  value={mapa[data] ?? ""}
                  onChange={(e) => definir(data, e.target.value)}
                  className="h-10 flex-1 rounded-lg border border-borda bg-superficie px-3 text-sm text-texto focus:border-marca focus:outline-none"
                >
                  <option value="">— sem treino —</option>
                  {treinos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
                </select>
              </div>
            );
          })
        )}
      </CardConteudo>
    </Card>
  );
}
