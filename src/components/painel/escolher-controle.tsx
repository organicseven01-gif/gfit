"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, ArrowRight, Dumbbell } from "lucide-react";
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
import { CardAgora, CardAgoraAula } from "@/components/painel/card-agora";

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

  const dataHoje = dataLocalISO(agora);
  const aulaHoje = config?.aulasDoDia[dataHoje] ?? null;
  const treinoHojeId = config?.treinosDoDia[dataHoje];
  const treinoHoje = treinos.find((t) => t.id === treinoHojeId) ?? null;
  const turma: OcorrenciaAula | null = config
    ? (aulaAtual(config.agenda, agora) ?? proximaAula(config.agenda, agora))
    : null;
  const emAula = !!(config && aulaAtual(config.agenda, agora));
  const temAgora = !!(aulaHoje?.length || treinoHoje);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Controle pelo Celular"
        descricao="Comande a contagem pelo celular, de perto dos alunos."
      />

      {/* AGORA: aula (em partes) ou treino do dia + turma, pronto pra iniciar */}
      {!carregando &&
        (aulaHoje?.length ? (
          <CardAgoraAula partes={aulaHoje} turma={turma} emAula={emAula} />
        ) : (
          <CardAgora treino={treinoHoje} turma={turma} emAula={emAula} />
        ))}

      <h2 className="text-sm font-semibold tracking-wide text-texto-suave uppercase">
        {temAgora ? "Ou escolha outro treino" : "Escolha um treino"}
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
