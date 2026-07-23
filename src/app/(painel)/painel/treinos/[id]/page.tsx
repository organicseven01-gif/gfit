import { EditarTreino } from "@/components/painel/editar-treino";

export const metadata = { title: "Editar Treino" };

export default async function EditarTreinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditarTreino id={id} />;
}
