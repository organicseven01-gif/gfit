import Link from "next/link";
import { Plus, Library, LayoutTemplate, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardConteudo } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Home" };

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
    </div>
  );
}
