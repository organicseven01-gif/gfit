import { PageHeader } from "@/components/ui/page-header";
import { AgendaEditor } from "@/components/painel/agenda-editor";
import { TreinoDoDiaEditor } from "@/components/painel/treino-do-dia-editor";

export const metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Agenda"
        descricao="Treino do dia e horários das turmas. Aparecem no controle e na TV."
      />
      <TreinoDoDiaEditor />
      <AgendaEditor />
    </div>
  );
}
