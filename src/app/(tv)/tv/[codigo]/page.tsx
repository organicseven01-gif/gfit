import type { EstadoTv } from "@/types";
import { patrocinadores } from "@/config/patrocinadores";
import { DisplayTv } from "@/components/tv/display-tv";

export const metadata = { title: "Tela da TV" };

/**
 * Enquanto o pareamento e a engine de contagem não existem, o estado vem
 * daqui. `?demo=treino` na URL mostra a tela em execução — útil para
 * conferir o layout na televisão antes de ligar os dados reais.
 */
const AGUARDANDO: EstadoTv = {
  situacao: "aguardando",
  nomeAcademia: "G FIT",
  agenda: [
    { id: "demo-1", nome: "CrossFit — WOD", horario: "06:00", dias: [1, 2, 3, 4, 5], duracaoMin: 60 },
    { id: "demo-2", nome: "Funcional", horario: "19:00", dias: [1, 2, 3, 4, 5], duracaoMin: 60 },
  ],
};

const EM_TREINO: EstadoTv = {
  situacao: "treino",
  exercicio: "Burpee Box Jump",
  proximoExercicio: "Wall Ball",
  fase: "trabalho",
  round: 3,
  totalRounds: 8,
  restanteMs: 83_000,
  decorridoMs: 37_000,
  progressivo: false,
  progressoFase: 0.62,
};

export default async function TvPage({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { codigo } = await params;
  const { demo } = await searchParams;

  return (
    <DisplayTv
      estado={demo === "treino" ? EM_TREINO : AGUARDANDO}
      patrocinadores={patrocinadores}
      codigo={codigo}
    />
  );
}
