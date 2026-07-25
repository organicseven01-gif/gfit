"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Check, Loader2 } from "lucide-react";
import type { ConfigSom, EventoSom } from "@/types";
import {
  obterConfiguracoes,
  atualizarConfiguracoes,
} from "@/lib/services/configuracoes-service";
import { tocarSom, desbloquearSom } from "@/lib/sons/motor-sons";
import {
  Card,
  CardCabecalho,
  CardTitulo,
  CardDescricao,
  CardConteudo,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EVENTOS: { chave: EventoSom; rotulo: string; desc: string }[] = [
  { chave: "inicio", rotulo: "Início do treino", desc: "Ao apertar play" },
  { chave: "contagem", rotulo: "Contagem 3-2-1", desc: "Segundos finais de cada fase" },
  { chave: "troca", rotulo: "Troca de exercício", desc: "Ao começar um exercício" },
  { chave: "descanso", rotulo: "Descanso", desc: "Ao começar o descanso" },
  { chave: "preparacao", rotulo: "Preparação", desc: "Aquecimento / preparação" },
  { chave: "conclusao", rotulo: "Término", desc: "Ao encerrar o treino" },
];

function Chave({
  ligado,
  onMudar,
  desabilitado,
  rotulo,
}: {
  ligado: boolean;
  onMudar: () => void;
  desabilitado?: boolean;
  rotulo: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={onMudar}
      disabled={desabilitado}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40",
        ligado ? "bg-marca" : "bg-borda",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
          ligado ? "translate-x-[1.35rem]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function SecaoSom() {
  const [som, setSom] = useState<ConfigSom | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvo, setSalvo] = useState(true);
  const timerVolume = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    obterConfiguracoes()
      .then((c) => setSom(c.som))
      .catch(() => setSom(null))
      .finally(() => setCarregando(false));
  }, []);

  async function salvar(patch: Partial<ConfigSom>) {
    setSalvo(false);
    try {
      await atualizarConfiguracoes({ som: patch });
      setSalvo(true);
    } catch {
      setSalvo(true);
    }
  }

  function alternar(campo: keyof ConfigSom) {
    if (!som) return;
    const novo = { ...som, [campo]: !som[campo] };
    setSom(novo);
    void salvar({ [campo]: novo[campo] } as Partial<ConfigSom>);
  }

  function mudarVolume(v: number) {
    if (!som) return;
    setSom({ ...som, volume: v });
    // salva ao parar de arrastar (debounce)
    if (timerVolume.current) clearTimeout(timerVolume.current);
    timerVolume.current = setTimeout(() => void salvar({ volume: v }), 400);
  }

  function testar(ev: EventoSom) {
    desbloquearSom();
    tocarSom(ev, som?.volume ?? 70);
  }

  return (
    <Card>
      <CardCabecalho className="flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitulo className="flex items-center gap-2">
            <Volume2 className="size-4 text-texto-fraco" aria-hidden />
            Sons
          </CardTitulo>
          <CardDescricao>
            Avisos sonoros do treino. Tocam na tela da TV.
          </CardDescricao>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-texto-fraco">
          {salvo ? (
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

      <CardConteudo className="space-y-5">
        {carregando || !som ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {/* Mestre: liga/desliga tudo */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-borda bg-superficie-2 p-3">
              <div className="flex items-center gap-2">
                {som.ativo ? (
                  <Volume2 className="size-4 text-marca" aria-hidden />
                ) : (
                  <VolumeX className="size-4 text-texto-fraco" aria-hidden />
                )}
                <span className="text-sm font-semibold text-texto">
                  Sons {som.ativo ? "ativados" : "desativados"}
                </span>
              </div>
              <Chave
                ligado={som.ativo}
                onMudar={() => alternar("ativo")}
                rotulo="Ativar sons"
              />
            </div>

            {/* Volume */}
            <div className={cn("space-y-2", !som.ativo && "opacity-40")}>
              <div className="flex items-center justify-between">
                <label htmlFor="volume" className="text-sm text-texto-suave">
                  Volume geral
                </label>
                <span className="numeros-timer text-sm font-bold text-texto">
                  {som.volume}%
                </span>
              </div>
              <input
                id="volume"
                type="range"
                min={0}
                max={100}
                step={5}
                value={som.volume}
                disabled={!som.ativo}
                onChange={(e) => mudarVolume(Number(e.target.value))}
                className="w-full accent-[var(--color-marca)]"
              />
            </div>

            {/* Eventos individuais */}
            <div className="space-y-2">
              {EVENTOS.map((ev) => (
                <div
                  key={ev.chave}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border border-borda bg-superficie-2 p-3",
                    !som.ativo && "opacity-40",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-texto">{ev.rotulo}</p>
                    <p className="truncate text-xs text-texto-fraco">{ev.desc}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => testar(ev.chave)}
                      disabled={!som.ativo}
                      aria-label={`Testar ${ev.rotulo}`}
                      className="grid size-8 place-items-center rounded-md border border-borda text-texto-suave transition-colors hover:border-marca hover:text-marca disabled:opacity-40"
                    >
                      <Play className="size-3.5" aria-hidden />
                    </button>
                    <Chave
                      ligado={som[ev.chave]}
                      onMudar={() => alternar(ev.chave)}
                      desabilitado={!som.ativo}
                      rotulo={ev.rotulo}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-texto-fraco">
              Na TV, o som começa após o primeiro toque na tela (regra do
              navegador). Aqui no painel você pode testar à vontade.
            </p>
          </>
        )}
      </CardConteudo>
    </Card>
  );
}
