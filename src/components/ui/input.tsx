import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-borda bg-superficie-2 px-3.5 text-sm text-texto",
        "placeholder:text-texto-fraco",
        "focus:border-marca focus:outline-none",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-semibold tracking-wide text-texto-suave uppercase",
        className,
      )}
      {...props}
    />
  );
}
