"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navegacaoPainel } from "@/config/navegacao";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

/** Marca o item ativo sem que "/painel" acenda em todas as subrotas. */
export function ehRotaAtiva(pathname: string, href: string) {
  return href === "/painel"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-borda bg-superficie lg:flex">
      <div className="flex h-16 items-center border-b border-borda px-6">
        <Link href="/painel">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navegacaoPainel.map((item) => {
          const ativo = ehRotaAtiva(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                ativo
                  ? "bg-marca/10 font-semibold text-marca"
                  : "text-texto-suave hover:bg-superficie-2 hover:text-texto",
              )}
            >
              <item.icone className="size-4.5 shrink-0" aria-hidden />
              {item.titulo}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
