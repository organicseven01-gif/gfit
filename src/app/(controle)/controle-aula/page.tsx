import { SessaoProvider } from "@/lib/sessao/providers/sessao-provider";
import { ControleAula } from "@/components/controle/controle-aula";

export const metadata = { title: "Controle da Aula" };

/** Controle da aula do dia (em partes). É controlador da sessão. */
export default function ControleAulaPage() {
  return (
    <SessaoProvider papel="controlador">
      <ControleAula />
    </SessaoProvider>
  );
}
