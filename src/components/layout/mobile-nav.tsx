"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navegacaoPainel } from "@/config/navegacao";
import { ehRotaAtiva } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

/** Barra inferior no mobile — espelha a navegação da sidebar. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-borda bg-superficie/95 backdrop-blur lg:hidden">
      <ul className="flex">
        {navegacaoPainel.map((item) => {
          const ativo = ehRotaAtiva(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  ativo ? "text-marca" : "text-texto-fraco",
                )}
              >
                <item.icone className="size-5" aria-hidden />
                {item.tituloCurto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
