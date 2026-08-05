import Link from "next/link";
import { Play, CalendarClock } from "lucide-react";
import type { AulaParte, Treino } from "@/types";
import type { OcorrenciaAula } from "@/lib/agenda/agenda";
import { categoria } from "@/lib/treinos/categorias";
import { duracaoTotalSegundos } from "@/lib/treinos/calculos";
import { formatarDuracao } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ==========================================================================
   Cards "o que fazer agora": mostram a aula/treino do dia pronto pra iniciar,
   com o contexto da turma (horário, se está rolando ou é a próxima).

   Compartilhados entre a Home e a aba Controle — mesma fonte de verdade,
   sem duplicar a lógica em dois lugares.
   ========================================================================== */

const pad = (n: number) => String(n).padStart(2, "0");
export const horarioDe = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Card de destaque para a aula em partes: leva ao controle da aula. */
export function CardAgoraAula({
  partes,
  turma,
  emAula,
}: {
  partes: AulaParte[];
  turma: OcorrenciaAula | null;
  emAula: boolean;
}) {
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
              : "Aula de hoje"}
          </span>
          <p className="text-2xl font-extrabold text-texto">Aula de hoje</p>
          <p className="truncate text-sm text-texto-suave">
            {partes.length} {partes.length === 1 ? "parte" : "partes"}:{" "}
            {partes.map((p) => p.nome).join(" · ")}
          </p>
        </div>

        <Link
          href="/tv"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-marca px-6 py-4 text-base font-bold text-marca-contraste transition-colors hover:bg-marca-forte"
        >
          <Play className="size-5" aria-hidden />
          Iniciar aula
        </Link>
      </div>
    </Card>
  );
}

/** Card de destaque: o treino do dia pronto pra iniciar, com contexto da turma. */
export function CardAgora({
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
              Nenhuma aula definida para hoje
            </p>
            <p className="text-sm text-texto-fraco">
              Monte a aula do dia na{" "}
              <Link href="/painel/agenda" className="text-marca hover:underline">
                Agenda
              </Link>{" "}
              — ela aparece aqui pronta pra iniciar.
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
