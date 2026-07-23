import * as React from "react";
import { cn } from "@/lib/utils";

type Variante = "primaria" | "secundaria" | "fantasma" | "perigo";
type Tamanho = "sm" | "md" | "lg";

const variantes: Record<Variante, string> = {
  primaria:
    "bg-marca text-marca-contraste font-semibold hover:bg-marca-forte active:bg-marca-forte",
  secundaria:
    "bg-superficie-2 text-texto border border-borda hover:border-borda-forte hover:bg-borda/40",
  fantasma: "text-texto-suave hover:text-texto hover:bg-superficie-2",
  perigo: "bg-descanso text-white font-semibold hover:brightness-110",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanho?: Tamanho;
}

export function Button({
  className,
  variante = "primaria",
  tamanho = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg whitespace-nowrap transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        variantes[variante],
        tamanhos[tamanho],
        className,
      )}
      {...props}
    />
  );
}
