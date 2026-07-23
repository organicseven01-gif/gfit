import Image from "next/image";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Marca em texto — usada onde o espaço é horizontal e apertado
 * (sidebar, topbar). Reproduz a hierarquia de cor da logo:
 * "G" amarelo, "FIT" branco, "TIME" amarelo menor e espaçado.
 */
export function Logo({
  className,
  tamanho = "md",
}: {
  className?: string;
  tamanho?: "sm" | "md" | "lg";
}) {
  const escalas = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  } as const;

  return (
    <span
      className={cn(
        "font-extrabold tracking-tight text-texto italic select-none",
        escalas[tamanho],
        className,
      )}
    >
      <span className="text-marca">G</span>
      <span className="ml-1 text-white">FIT</span>
      <span className="ml-1.5 text-[0.6em] font-bold tracking-[0.25em] text-marca not-italic">
        TIME
      </span>
    </span>
  );
}

/**
 * Selo completo da marca (cronômetro). Usado onde há espaço vertical:
 * tela da TV e modo espera.
 */
export function LogoSelo({
  className,
  tamanho = 160,
}: {
  className?: string;
  tamanho?: number;
}) {
  return (
    <Image
      src={site.logo}
      alt={site.nome}
      width={tamanho}
      height={tamanho}
      priority
      // sem `w-auto`: ele anularia as dimensões e a imagem tomaria a tela toda
      className={cn("max-w-full select-none", className)}
    />
  );
}
