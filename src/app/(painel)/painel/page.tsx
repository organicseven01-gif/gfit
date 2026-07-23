import Link from "next/link";
import {
  Plus,
  MonitorPlay,
  Library,
  LayoutTemplate,
  Smartphone,
  Dumbbell,
  Timer,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardCabecalho, CardTitulo, CardConteudo } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Home" };

const indicadores = [
  { rotulo: "Treinos na biblioteca", icone: Dumbbell },
  { rotulo: "Templates", icone: Timer },
  { rotulo: "TVs conectadas", icone: MonitorPlay },
  { rotulo: "Sessões hoje", icone: Activity },
];

const atalhos = [
  {
    titulo: "Novo treino",
    descricao: "Montar do zero",
    href: "/painel/treinos",
    icone: Plus,
  },
  {
    titulo: "Biblioteca",
    descricao: "Ver treinos salvos",
    href: "/painel/treinos",
    icone: Library,
  },
  {
    titulo: "Templates",
    descricao: "Começar de um modelo",
    href: "/painel/templates",
    icone: LayoutTemplate,
  },
  {
    titulo: "Controle",
    descricao: "Comandar pelo celular",
    href: "/painel/controle",
    icone: Smartphone,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Home"
        descricao="O que está acontecendo na academia agora."
        acoes={
          <Link href="/painel/treinos">
            <Button tamanho="sm">
              <Plus className="size-4" aria-hidden />
              Novo treino
            </Button>
          </Link>
        }
      />

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicadores.map(({ rotulo, icone: Icone }) => (
          <Card key={rotulo}>
            <CardConteudo className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-texto-suave">{rotulo}</span>
                <Icone className="size-4 text-texto-fraco" aria-hidden />
              </div>
              <p className="numeros-timer text-3xl font-bold text-texto-fraco">—</p>
            </CardConteudo>
          </Card>
        ))}
      </div>

      {/* Atalhos */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {atalhos.map(({ titulo, descricao, href, icone: Icone }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-marca">
              <CardConteudo className="flex items-center gap-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-marca/10 text-marca">
                  <Icone className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-texto">{titulo}</p>
                  <p className="truncate text-xs text-texto-suave">{descricao}</p>
                </div>
              </CardConteudo>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* TVs no ar */}
        <Card>
          <CardCabecalho className="flex-row items-center justify-between">
            <CardTitulo>TVs no ar</CardTitulo>
            <Link
              href="/painel/configuracoes"
              className="text-xs font-medium text-marca hover:underline"
            >
              Gerenciar
            </Link>
          </CardCabecalho>
          <CardConteudo className="space-y-3">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="flex items-center justify-between gap-3 rounded-lg border border-borda bg-superficie-2 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MonitorPlay className="size-4 shrink-0 text-texto-fraco" aria-hidden />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Badge tom="neutro">Offline</Badge>
              </div>
            ))}
          </CardConteudo>
        </Card>

        {/* Últimas sessões */}
        <Card>
          <CardCabecalho className="flex-row items-center justify-between">
            <CardTitulo>Últimas sessões</CardTitulo>
            <Link
              href="/painel/historico"
              className="text-xs font-medium text-marca hover:underline"
            >
              Ver histórico
            </Link>
          </CardCabecalho>
          <CardConteudo className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </CardConteudo>
        </Card>
      </div>
    </div>
  );
}
