"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Plus,
  Minus,
  Square,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useControladorAula } from "@/lib/aula/use-controlador-aula";
import { cn } from "@/lib/utils";

const AJUSTE_SEGUNDOS = 10;

/**
 * Painel de controle embutido na própria tela da TV — pensado para o
 * professor que roda a aula do computador (não só do celular).
 *
 * Fica um botão discreto e SEMPRE visível (não depende de passar o mouse
 * por cima) num canto da tela; clicar abre a gaveta com as partes da aula
 * e os controles de play/pausa/avançar.
 */
export function PainelControleTv() {
  const [aberto, setAberto] = useState(false);
  const {
    partes,
    parteAtiva,
    visao,
    despachar,
    rodando,
    pausado,
    concluido,
    emSessao,
    selecionar,
    aoTocarPrincipal,
    encerrar,
  } = useControladorAula();

  const rotuloPrincipal = rodando
    ? "Pausar"
    : concluido
      ? "Reiniciar"
      : pausado
        ? "Continuar"
        : "Iniciar";
  const IconePrincipal = rodando ? Pause : Play;

  return (
    <>
      {/* Botão de abrir — discreto, mas sempre visível (sem depender de hover). */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-label={aberto ? "Fechar controle" : "Abrir controle"}
        className={cn(
          "absolute bottom-[1.4vh] left-[1.4vw] z-20 flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold backdrop-blur transition-colors",
          aberto
            ? "border-marca bg-marca text-marca-contraste"
            : "border-white/15 bg-black/50 text-texto-suave hover:border-marca/50 hover:text-marca",
        )}
      >
        {aberto ? <X className="size-4" aria-hidden /> : <SlidersHorizontal className="size-4" aria-hidden />}
        Controle
      </button>

      {aberto && (
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/85 p-5 backdrop-blur-md">
          {partes === null ? (
            <p className="text-center text-sm text-texto-fraco">Carregando…</p>
          ) : partes.length === 0 && !emSessao ? (
            <p className="text-center text-sm text-texto-fraco">
              Nenhuma aula cadastrada para hoje.{" "}
              <Link href="/painel/agenda" className="text-marca hover:underline">
                Montar na Agenda
              </Link>
            </p>
          ) : (
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {/* Partes da aula */}
              {partes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {partes.map((p, i) => {
                    const ativa = p.id === parteAtiva?.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selecionar(p)}
                        className={cn(
                          "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
                          ativa
                            ? "border-marca bg-marca text-marca-contraste"
                            : "border-white/15 text-texto-suave hover:border-white/30",
                        )}
                      >
                        <span className="mr-1.5 opacity-60">{i + 1}</span>
                        {p.nome}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Controles */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={aoTocarPrincipal}
                  disabled={!parteAtiva && !emSessao}
                  className="flex items-center gap-2 rounded-xl bg-marca px-5 py-3 text-sm font-bold text-marca-contraste transition-colors hover:bg-marca-forte disabled:opacity-35"
                >
                  <IconePrincipal className="size-4" aria-hidden fill="currentColor" />
                  {rotuloPrincipal}
                </button>

                <BotaoIcone
                  icone={SkipBack}
                  aria="Etapa anterior"
                  onClick={() => despachar({ tipo: "PREVIOUS" })}
                  disabled={!emSessao || visao.indice === 0}
                />
                <BotaoIcone
                  icone={SkipForward}
                  aria="Próxima etapa"
                  onClick={() => despachar({ tipo: "NEXT" })}
                  disabled={!emSessao || visao.indice >= visao.totalFases - 1}
                />
                <BotaoIcone
                  icone={Plus}
                  aria={`Adicionar ${AJUSTE_SEGUNDOS}s`}
                  onClick={() => despachar({ tipo: "ADD_TIME", segundos: AJUSTE_SEGUNDOS })}
                  disabled={!emSessao || concluido}
                />
                <BotaoIcone
                  icone={Minus}
                  aria={`Remover ${AJUSTE_SEGUNDOS}s`}
                  onClick={() => despachar({ tipo: "REMOVE_TIME", segundos: AJUSTE_SEGUNDOS })}
                  disabled={!emSessao || concluido}
                />

                <button
                  type="button"
                  onClick={encerrar}
                  disabled={!emSessao}
                  className="ml-auto flex items-center gap-2 rounded-xl border border-descanso/40 bg-descanso/10 px-5 py-3 text-sm font-bold text-descanso transition-colors hover:bg-descanso/20 disabled:opacity-35"
                >
                  <Square className="size-4" aria-hidden />
                  Encerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function BotaoIcone({
  icone: Icone,
  aria,
  onClick,
  disabled,
}: {
  icone: typeof Play;
  aria: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className="grid size-11 place-items-center rounded-xl border border-white/15 text-texto-suave transition-colors hover:border-white/30 hover:text-texto disabled:opacity-35"
    >
      <Icone className="size-4" aria-hidden />
    </button>
  );
}
