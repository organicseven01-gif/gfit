"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { DefinicaoModo } from "@/lib/timer/modos";
import type { Template } from "@/types";
import { listarTemplates, usarTemplate } from "@/lib/services/templates-service";
import { criarTreino, atualizarTreino } from "@/lib/services/treinos-service";
import { etapasDoModo, categoriaDoModo } from "@/lib/timer/modelos";
import { categoria } from "@/lib/treinos/categorias";
import { duracaoDasEtapas } from "@/lib/treinos/calculos";
import { formatarDuracao } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toolbar } from "@/components/ui/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { MODOS_TIMER } from "@/lib/timer/modos";

export function TemplatesView() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [usandoId, setUsandoId] = useState<string | null>(null);

  useEffect(() => {
    listarTemplates().then((lista) => {
      setTemplates(lista);
      setCarregando(false);
    });
  }, []);

  async function aoUsar(template: Template) {
    if (usandoId) return;
    setUsandoId(template.id);
    const treino = await usarTemplate(template.id);
    if (treino) router.push(`/painel/treinos/${treino.id}`);
    else setUsandoId(null);
  }

  // Cria um treino já montado no formato do modo e abre o editor.
  async function aoUsarModo(modo: DefinicaoModo) {
    if (usandoId) return;
    setUsandoId(modo.id);
    try {
      const treino = await criarTreino({
        nome: `Novo treino — ${modo.nome}`,
        categoria: categoriaDoModo(modo.id),
      });
      const etapas = etapasDoModo(modo.id);
      if (etapas.length > 0) {
        await atualizarTreino(treino.id, { etapas });
      }
      router.push(`/painel/treinos/${treino.id}`);
    } catch {
      setUsandoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Templates"
        descricao="Modelos prontos para criar um treino em poucos cliques."
      />

      <Toolbar placeholder="Buscar template..." />

      {/* Catálogo por modo de timer (leva a montar do zero) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-texto-suave uppercase">
          Por modo de timer
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODOS_TIMER.map((modo) => (
            <button
              key={modo.id}
              type="button"
              onClick={() => aoUsarModo(modo)}
              disabled={usandoId !== null}
              className="group block text-left disabled:opacity-60"
            >
              <Card className="h-full transition-colors group-hover:border-marca">
                <div className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-texto group-hover:text-marca">
                      {modo.nome}
                    </h3>
                    <Badge tom={modo.progressivo ? "neutro" : "marca"}>
                      {modo.progressivo ? "Progressivo" : "Regressivo"}
                    </Badge>
                  </div>
                  <p className="flex-1 text-sm text-texto-suave">
                    {modo.descricao}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-texto-fraco group-hover:text-marca">
                    {usandoId === modo.id ? "Criando treino..." : "Usar este modelo"}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </section>

      {/* Templates salvos no banco */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-texto-suave uppercase">
          Salvos pela academia
        </h2>

        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2].map((n) => (
              <Skeleton key={n} className="h-36 rounded-card" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <div className="py-12 text-center text-sm text-texto-fraco">
              Nenhum template próprio salvo ainda.
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => {
              const cat = categoria(template.categoria);
              const duracao = duracaoDasEtapas(
                // duracaoDasEtapas espera etapas; template.etapas serve
                template.etapas,
              );
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => aoUsar(template)}
                  disabled={usandoId !== null}
                  className="group block text-left disabled:opacity-60"
                >
                  <Card className="h-full transition-colors group-hover:border-marca">
                    <div className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-texto group-hover:text-marca">
                          {template.nome}
                        </h3>
                        <Badge tom={cat.tom}>{cat.nome}</Badge>
                      </div>
                      <p className="flex-1 text-sm text-texto-suave">
                        {template.descricao ?? "—"}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-texto-fraco group-hover:text-marca">
                        {usandoId === template.id
                          ? "Criando treino..."
                          : `Usar template · ${formatarDuracao(duracao)}`}
                        <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
