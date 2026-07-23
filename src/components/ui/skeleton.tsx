import { cn } from "@/lib/utils";

/** Bloco cinza que ocupa o lugar de um dado ainda não implementado. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-superficie-2", className)}
      aria-hidden
      {...props}
    />
  );
}
