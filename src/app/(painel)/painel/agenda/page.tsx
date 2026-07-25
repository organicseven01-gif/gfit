import { PageHeader } from "@/components/ui/page-header";
import { AgendaEditor } from "@/components/painel/agenda-editor";

export const metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Agenda"
        descricao="Horários das turmas. Aparecem na tela da TV quando não há treino no ar."
      />
      <AgendaEditor />
    </div>
  );
}
