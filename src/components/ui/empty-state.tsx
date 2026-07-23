import * as React from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-borda px-6 py-16 text-center">
      <div className="rounded-full bg-superficie-2 p-3 text-texto-fraco">
        <Icone className="size-6" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-texto">{titulo}</h2>
      <p className="max-w-sm text-sm text-texto-suave">{descricao}</p>
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  );
}
