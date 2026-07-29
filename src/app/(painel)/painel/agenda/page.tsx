import { PageHeader } from "@/components/ui/page-header";
import { AgendaEditor } from "@/components/painel/agenda-editor";
import { AulaDoDiaEditor } from "@/components/painel/aula-do-dia-editor";

export const metadata = { title: "Agenda" };

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Agenda"
        descricao="Aula do dia (em partes) e horários das turmas. Aparecem no controle e na TV."
      />
      <AulaDoDiaEditor />
      <AgendaEditor />
    </div>
  );
}
