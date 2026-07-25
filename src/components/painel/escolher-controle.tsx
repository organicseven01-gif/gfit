"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, ArrowRight, Dumbbell, Play, CalendarClock } from "lucide-react";
import type { Configuracoes, Treino } from "@/types";
import { listarTreinos } from "@/lib/services/treinos-service";
import { obterConfiguracoes } from "@/lib/services/configuracoes-service";
import {
  aulaAtual,
  proximaAula,
  dataLocalISO,
  type OcorrenciaAula,
} from "@/lib/agenda/agenda";
import { categoria } from "@/lib/treinos/categorias";
import { duracaoTotalSegundos } from "@/lib/treinos/calculos";
import { formatarDuracao } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const pad = (n: number) => String(n).padStart(2, "0");
const horarioDe = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function EscolherControle() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [carregando, setCarregando] = useState(true);
  // recalculado a cada minuto para "agora" acompanhar o horário das turmas
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    Promise.all([listarTreinos(), obterConfiguracoes()])
      .then(([lista, cfg]) => {
        setTreinos(lista);
        setConfig(cfg);
      })
      .finally(() => setCarregando(false));
    const id = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const treinoHojeId = config?.treinosDoDia[dataLocalISO(agora)];
  const treinoHoje = treinos.find((t) => t.id === treinoHojeId) ?? null;
  const turma: OcorrenciaAula | null = config
    ? (aulaAtual(config.agenda, agora) ?? proximaAula(config.agenda, agora))
    : null;
  const emAula = !!(config && aulaAtual(config.agenda, agora));

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Controle pelo Celular"
        descricao="Comande a contagem pelo celular, de perto dos alunos."
      />

      {/* AGORA: treino do dia + turma do horário, pronto pra iniciar */}
      {!carregando && (
        <CardAgora treino={treinoHoje} turma={turma} emAula={emAula} />
      )}

      <h2 className="text-sm font-semibold tracking-wide text-texto-suave uppercase">
        {treinoHoje ? "Ou escolha outro treino" : "Escolha um treino"}
      </h2>

      {carregando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-24 rounded-card" />
          ))}
        </div>
      ) : treinos.length === 0 ? (
        <EmptyState
          icone={Dumbbell}
          titulo="Nenhum treino para controlar"
          descricao="Crie um treino na biblioteca para poder comandá-lo pelo celular."
          acao={
            <Link
              href="/painel/treinos"
              className="text-sm font-medium text-marca hover:underline"
            >
              Ir para a biblioteca
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {treinos.map((treino) => {
            const cat = categoria(treino.categoria);
            return (
              <Link
                key={treino.id}
                href={`/controle-remoto/${treino.id}`}
                className="group"
              >
                <Card className="flex h-full items-center gap-4 p-4 transition-colors group-hover:border-marca">
                  <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-marca/10 text-marca">
                    <Smartphone className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-texto group-hover:text-marca">
                      {treino.nome}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-texto-fraco">
                      <Badge tom={cat.tom}>{cat.nome}</Badge>
                      <span className="numeros-timer">
                        {formatarDuracao(duracaoTotalSegundos(treino))}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    className="size-5 shrink-0 text-texto-fraco group-hover:text-marca"
                    aria-hidden
                  />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Card de destaque: o treino do dia pronto pra iniciar, com contexto da turma. */
function CardAgora({
  treino,
  turma,
  emAula,
}: {
  treino: Treino | null;
  turma: OcorrenciaAula | null;
  emAula: boolean;
}) {
  // Sem treino definido para hoje → orienta cadastrar
  if (!treino) {
    return (
      <Card className="border-borda-forte p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-superficie-2 text-texto-fraco">
            <CalendarClock className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-texto">
              Nenhum treino definido para hoje
            </p>
            <p className="text-sm text-texto-fraco">
              Defina o treino do dia na{" "}
              <Link href="/painel/agenda" className="text-marca hover:underline">
                Agenda
              </Link>{" "}
              — ele aparece aqui pronto pra iniciar.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const cat = categoria(treino.categoria);

  return (
    <Card className="overflow-hidden border-marca/50 bg-marca/5">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-1">
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-marca uppercase">
            <span className="tv-pulso inline-block size-2 rounded-full bg-marca" />
            {turma
              ? emAula
                ? `Agora · ${turma.nome} · ${horarioDe(turma.inicio)}`
                : `Próxima turma · ${turma.nome} · ${horarioDe(turma.inicio)}`
              : "Treino de hoje"}
          </span>
          <p className="truncate text-2xl font-extrabold text-texto">
            {treino.nome}
          </p>
          <div className="flex items-center gap-2 text-xs text-texto-fraco">
            <Badge tom={cat.tom}>{cat.nome}</Badge>
            <span className="numeros-timer">
              {formatarDuracao(duracaoTotalSegundos(treino))}
            </span>
          </div>
        </div>

        <Link
          href={`/controle-remoto/${treino.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-marca px-6 py-4 text-base font-bold text-marca-contraste transition-colors hover:bg-marca-forte"
        >
          <Play className="size-5" aria-hidden />
          Iniciar na TV
        </Link>
      </div>
    </Card>
  );
}
