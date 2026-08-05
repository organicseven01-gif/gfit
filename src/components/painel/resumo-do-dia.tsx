"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import type { Configuracoes, Treino } from "@/types";
import { listarTreinos } from "@/lib/services/treinos-service";
import { obterConfiguracoes } from "@/lib/services/configuracoes-service";
import { aulaAtual, proximaAula, dataLocalISO } from "@/lib/agenda/agenda";
import { visaoParaEstadoTv } from "@/lib/sessao/services/mapear-tv";
import { SessaoProvider } from "@/lib/sessao/providers/sessao-provider";
import { useSessao } from "@/lib/sessao/hooks/use-sessao";
import { useVisaoSessao } from "@/lib/sessao/hooks/use-visao-sessao";
import { PreviaTv } from "@/components/controle/previa-tv";
import { CardAgora, CardAgoraAula, horarioDe } from "@/components/painel/card-agora";
import { Card, CardConteudo } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Resumo do dia — o que a Home mostra em primeiro lugar.
 *
 * Observa a sessão ao vivo (se alguém já apertou play, mostra rolando) e,
 * quando não há nada no ar, mostra a aula/treino de hoje pronta pra iniciar
 * (ou o convite pra montar, se ainda não existe) + os horários das turmas.
 */
export function ResumoDoDia() {
  return (
    <SessaoProvider papel="observador">
      <ResumoDoDiaConteudo />
    </SessaoProvider>
  );
}

function ResumoDoDiaConteudo() {
  const { estado } = useSessao();
  const visao = useVisaoSessao();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [carregando, setCarregando] = useState(true);
  // recalculado periodicamente para "agora" acompanhar o horário das turmas
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    Promise.all([listarTreinos(), obterConfiguracoes()])
      .then(([lista, cfg]) => {
        setTreinos(lista);
        setConfig(cfg);
      })
      .finally(() => setCarregando(false));
    const id = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Alguém já apertou play — reflete ao vivo, com link pro controle certo.
  const emSessaoAoVivo = estado.status !== "ocioso" && !visao.concluido;

  if (emSessaoAoVivo) {
    // Aula em partes: controla direto na TV. Treino avulso: mantém o
    // controle pelo celular, já que não tem parte pra escolher.
    const href = estado.treino?.id.startsWith("parte-")
      ? "/tv"
      : estado.treino
        ? `/controle-remoto/${estado.treino.id}`
        : "/painel/controle";
    return (
      <Card className="overflow-hidden border-trabalho/50 bg-trabalho/5">
        <CardConteudo className="space-y-3">
          <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-trabalho uppercase">
            <span className="tv-pulso inline-block size-2 rounded-full bg-trabalho" />
            Aula em andamento
          </span>
          <PreviaTv estado={visaoParaEstadoTv(visao)} />
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-marca hover:underline"
          >
            Abrir o controle →
          </Link>
        </CardConteudo>
      </Card>
    );
  }

  if (carregando) {
    return <Skeleton className="h-32 rounded-card" />;
  }

  const dataHoje = dataLocalISO(agora);
  const aulaHoje = config?.aulasDoDia[dataHoje] ?? null;
  const treinoHojeId = config?.treinosDoDia[dataHoje];
  const treinoHoje = treinos.find((t) => t.id === treinoHojeId) ?? null;
  const turma = config
    ? (aulaAtual(config.agenda, agora) ?? proximaAula(config.agenda, agora))
    : null;
  const emAula = !!(config && aulaAtual(config.agenda, agora));

  // Turmas de hoje, em ordem, pra ver o dia inteiro numa olhada.
  const hojeSemana = agora.getDay();
  const turmasHoje = (config?.agenda ?? [])
    .filter((a) => a.dias.includes(hojeSemana))
    .map((a) => {
      const [h, m] = a.horario.split(":").map(Number);
      const inicio = new Date(agora);
      inicio.setHours(h, m, 0, 0);
      return { nome: a.nome, horario: a.horario, inicio };
    })
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

  return (
    <div className="space-y-4">
      {aulaHoje?.length ? (
        <CardAgoraAula partes={aulaHoje} turma={turma} emAula={emAula} />
      ) : (
        <CardAgora treino={treinoHoje} turma={turma} emAula={emAula} />
      )}

      {turmasHoje.length > 0 && (
        <Card>
          <CardConteudo className="space-y-2.5">
            <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-texto-suave uppercase">
              <CalendarClock className="size-3.5" aria-hidden />
              Turmas de hoje
            </span>
            <div className="flex flex-wrap gap-2">
              {turmasHoje.map((t, i) => {
                const passou =
                  agora.getTime() >= t.inicio.getTime() + 60 * 60_000;
                const acontecendo = turma?.nome === t.nome && emAula;
                return (
                  <span
                    key={`${t.nome}-${i}`}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                      acontecendo
                        ? "border-trabalho/50 bg-trabalho/10 text-trabalho"
                        : passou
                          ? "border-borda text-texto-fraco opacity-60"
                          : "border-borda text-texto-suave",
                    )}
                  >
                    {horarioDe(t.inicio)} · {t.nome}
                  </span>
                );
              })}
            </div>
          </CardConteudo>
        </Card>
      )}
    </div>
  );
}
