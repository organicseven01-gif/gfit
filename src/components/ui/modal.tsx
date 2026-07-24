"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal do painel. Fecha no Escape e no clique fora, trava a rolagem do
 * fundo e foca o primeiro CAMPO ao abrir.
 */
export function Modal({
  aberto,
  onFechar,
  titulo,
  descricao,
  children,
  className,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const caixaRef = useRef<HTMLDivElement>(null);

  // Guarda o `onFechar` mais recente sem que ele vire dependência do efeito
  // de abertura. O pai recria essa função a cada tecla; se ela fosse
  // dependência, o efeito rodaria a cada letra e roubaria o foco do campo.
  const onFecharRef = useRef(onFechar);
  useEffect(() => {
    onFecharRef.current = onFechar;
  }, [onFechar]);

  // Roda SÓ quando o modal abre/fecha.
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFecharRef.current();
    };
    document.addEventListener("keydown", aoTeclar);

    // trava a rolagem do fundo enquanto o modal está aberto
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // foca o primeiro CAMPO (nunca um botão — senão o X do cabeçalho, que
    // vem antes no DOM, ficaria com o foco e o usuário não conseguiria digitar)
    const campo = caixaRef.current?.querySelector<HTMLElement>(
      "input, select, textarea",
    );
    campo?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        ref={caixaRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        // impede que o clique dentro da caixa feche o modal
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md rounded-card border border-borda bg-superficie shadow-2xl",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-borda p-5">
          <div className="space-y-1">
            <h2 className="font-semibold text-texto">{titulo}</h2>
            {descricao && (
              <p className="text-sm text-texto-suave">{descricao}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-md p-1 text-texto-fraco transition-colors hover:bg-superficie-2 hover:text-texto"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
