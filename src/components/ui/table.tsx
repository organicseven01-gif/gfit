import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tabela do painel. O wrapper rola horizontalmente sozinho para que a
 * página nunca role no eixo X no mobile.
 */
export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-card border border-borda">
      <table
        className={cn("w-full min-w-[40rem] border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHead({ ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-superficie" {...props} />;
}

export function TableBody({ ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b border-borda last:border-0", className)}
      {...props}
    />
  );
}

export function TableTh({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold tracking-wide text-texto-suave uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function TableTd({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-texto", className)} {...props} />;
}
