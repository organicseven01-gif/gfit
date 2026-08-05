import { PageHeader } from "@/components/ui/page-header";
import { ResumoDoDia } from "@/components/painel/resumo-do-dia";

export const metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Home"
        descricao="O que está acontecendo na academia agora."
      />
      <ResumoDoDia />
    </div>
  );
}
