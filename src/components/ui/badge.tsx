import * as React from "react";
import { cn } from "@/lib/utils";

type Tom = "marca" | "neutro" | "sucesso" | "alerta" | "erro";

const tons: Record<Tom, string> = {
  marca: "bg-marca/15 text-marca border-marca/30",
  neutro: "bg-superficie-2 text-texto-suave border-borda",
  sucesso: "bg-trabalho/15 text-trabalho border-trabalho/30",
  alerta: "bg-preparar/15 text-preparar border-preparar/30",
  erro: "bg-descanso/15 text-descanso border-descanso/30",
};

export function Badge({
  className,
  tom = "neutro",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tom?: Tom }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tons[tom],
        className,
      )}
      {...props}
    />
  );
}
