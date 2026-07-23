import { redirect } from "next/navigation";

/** A raiz não tem conteúdo próprio: o sistema vive em /painel e /tv. */
export default function Home() {
  redirect("/painel");
}
