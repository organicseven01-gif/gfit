import Link from "next/link";
import { Building2, Palette, Volume2, MonitorPlay, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardCabecalho,
  CardTitulo,
  CardDescricao,
  CardConteudo,
} from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Configurações"
        descricao="Preferências da unidade, das telas e da equipe."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Unidade */}
        <Card>
          <CardCabecalho>
            <CardTitulo className="flex items-center gap-2">
              <Building2 className="size-4 text-texto-fraco" aria-hidden />
              Unidade
            </CardTitulo>
            <CardDescricao>Identificação da academia.</CardDescricao>
          </CardCabecalho>
          <CardConteudo className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="academia">Nome da academia</Label>
              <Input id="academia" placeholder="G FIT" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center gap-3">
                <div className="size-12 shrink-0 rounded-lg border border-borda bg-superficie-2" />
                <Button variante="secundaria" tamanho="sm" disabled>
                  Enviar imagem
                </Button>
              </div>
            </div>
          </CardConteudo>
        </Card>

        {/* Telas */}
        <Card>
          <CardCabecalho className="flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitulo className="flex items-center gap-2">
                <MonitorPlay className="size-4 text-texto-fraco" aria-hidden />
                Telas
              </CardTitulo>
              <CardDescricao>TVs pareadas nesta unidade.</CardDescricao>
            </div>
            <Button tamanho="sm" disabled>
              <Plus className="size-4" aria-hidden />
              Parear
            </Button>
          </CardCabecalho>
          <CardConteudo className="space-y-3">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="flex items-center justify-between gap-3 rounded-lg border border-borda bg-superficie-2 p-3"
              >
                <Skeleton className="h-3 w-28" />
                <Badge tom="neutro">Offline</Badge>
              </div>
            ))}
            <p className="text-xs text-texto-fraco">
              Abra{" "}
              <Link href="/tv" className="text-marca hover:underline">
                a tela da TV
              </Link>{" "}
              na televisão e informe aqui o código exibido.
            </p>
          </CardConteudo>
        </Card>

        {/* Aparência da TV */}
        <Card>
          <CardCabecalho>
            <CardTitulo className="flex items-center gap-2">
              <Palette className="size-4 text-texto-fraco" aria-hidden />
              Aparência da TV
            </CardTitulo>
            <CardDescricao>
              Cores das fases e informações exibidas na tela.
            </CardDescricao>
          </CardCabecalho>
          <CardConteudo className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tom="alerta">Preparar</Badge>
              <Badge tom="sucesso">Trabalho</Badge>
              <Badge tom="erro">Descanso</Badge>
            </div>
            <p className="text-xs text-texto-fraco">
              A personalização de cores entra junto com a engine de contagem.
            </p>
          </CardConteudo>
        </Card>

        {/* Som */}
        <Card>
          <CardCabecalho>
            <CardTitulo className="flex items-center gap-2">
              <Volume2 className="size-4 text-texto-fraco" aria-hidden />
              Som
            </CardTitulo>
            <CardDescricao>
              Avisos sonoros de virada de fase e contagem final.
            </CardDescricao>
          </CardCabecalho>
          <CardConteudo className="space-y-3">
            {["Bipe nos 3 segundos finais", "Sinal de virada de fase", "Sinal de conclusão"].map(
              (opcao) => (
                <div
                  key={opcao}
                  className="flex items-center justify-between gap-3 rounded-lg border border-borda bg-superficie-2 p-3"
                >
                  <span className="text-sm text-texto-suave">{opcao}</span>
                  <div className="h-5 w-9 rounded-full bg-borda" aria-hidden />
                </div>
              ),
            )}
          </CardConteudo>
        </Card>

      </div>
    </div>
  );
}
