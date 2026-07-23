import { SessaoProvider } from "@/lib/sessao/providers/sessao-provider";
import { ControleRemoto } from "@/components/controle/controle-remoto";

export const metadata = { title: "Controle" };

export default async function ControleRemotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <SessaoProvider papel="controlador">
      <ControleRemoto treinoId={id} />
    </SessaoProvider>
  );
}
