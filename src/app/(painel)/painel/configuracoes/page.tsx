import { Building2, Palette } from "lucide-react";
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
import { SecaoSom } from "@/components/painel/secao-som";

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

        {/* Som — funcional */}
        <SecaoSom />
      </div>
    </div>
  );
}
