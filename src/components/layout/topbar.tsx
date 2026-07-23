import Link from "next/link";
import { MonitorPlay } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-borda bg-fundo/90 px-4 backdrop-blur lg:px-8">
      <Link href="/painel" className="lg:hidden">
        <Logo tamanho="sm" />
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <Link href="/tv">
          <Button variante="secundaria" tamanho="sm">
            <MonitorPlay className="size-4" aria-hidden />
            Abrir TV
          </Button>
        </Link>
      </div>
    </header>
  );
}
