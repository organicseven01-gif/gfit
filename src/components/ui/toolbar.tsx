import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Barra de busca + filtros que aparece no topo das listagens. */
export function Toolbar({
  placeholder = "Buscar...",
  children,
  className,
}: {
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-fraco"
          aria-hidden
        />
        <Input placeholder={placeholder} className="pl-10" disabled />
      </div>
      {children}
    </div>
  );
}
