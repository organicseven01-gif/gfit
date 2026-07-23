import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tom = "neutro" | "perigo";

/**
 * Botão grande do controle remoto.
 *
 * Otimizado para uso durante a aula:
 * - alvo mínimo alto (mão suada, sem olhar direito);
 * - `touch-manipulation` remove o atraso de 300ms e bloqueia o zoom por
 *   duplo toque, que dispararia acidentalmente ao tocar rápido;
 * - feedback imediato no `active` em vez de depender de hover (não existe
 *   em toque).
 */
export function BotaoControle({
  rotulo,
  sublabel,
  icone: Icone,
  onClick,
  disabled = false,
  destaque = false,
  tom = "neutro",
  className,
}: {
  rotulo: string;
  sublabel?: string;
  icone: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  /** Botão primário (Iniciar/Pausar): cor de marca. */
  destaque?: boolean;
  tom?: Tom;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-20 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-2xl border text-center transition-transform",
        "active:scale-[0.97] disabled:opacity-35",
        destaque
          ? "border-transparent bg-marca text-marca-contraste"
          : tom === "perigo"
            ? "border-descanso/40 bg-descanso/10 text-descanso"
            : "border-borda bg-superficie text-texto",
        className,
      )}
    >
      <Icone
        className={cn(destaque ? "size-8" : "size-7")}
        aria-hidden
        {...(destaque && rotulo === "Iniciar" ? { fill: "currentColor" } : {})}
      />
      <span className="flex flex-col leading-tight">
        <span className={cn("font-bold", destaque ? "text-lg" : "text-base")}>
          {rotulo}
        </span>
        {sublabel && (
          <span className="text-xs font-medium opacity-70">{sublabel}</span>
        )}
      </span>
    </button>
  );
}
