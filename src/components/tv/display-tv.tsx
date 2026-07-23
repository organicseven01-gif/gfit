import type { EstadoTv, MidiaPatrocinador } from "@/types";
import { Logo } from "@/components/layout/logo";
import { PainelTreino } from "@/components/tv/painel-treino";
import { PainelAguardando } from "@/components/tv/painel-aguardando";
import { FaixaPatrocinadores } from "@/components/tv/faixa-patrocinadores";

/**
 * Tela da TV.
 *
 * Divisão fixa: 70% para o treino, 30% para patrocinadores. A faixa roda nos
 * dois estados — é receita da academia e não pode depender de ter treino no ar.
 *
 * Todas as medidas são relativas (`vw`/`vh`), então as proporções se mantêm
 * idênticas de um Full HD a um 4K.
 */
export function DisplayTv({
  estado,
  patrocinadores,
  codigo,
}: {
  estado: EstadoTv;
  patrocinadores: MidiaPatrocinador[];
  codigo?: string;
}) {
  return (
    // grid-rows-[minmax(0,1fr)] + min-h-0 nos filhos: sem isso a altura
    // intrínseca da peça do patrocinador (9:16) estica a linha e empurra
    // o cronômetro para fora da tela.
    <div className="grid h-full w-full grid-cols-[70fr_30fr] grid-rows-[minmax(0,1fr)] gap-[1.2vw] p-[1.2vw]">
      {/* Coluna principal */}
      <section className="relative flex min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-[1.4vw] border border-white/8 bg-superficie/30 p-[2.6vw]">
        {estado.situacao === "treino" ? (
          <PainelTreino estado={estado} />
        ) : (
          <PainelAguardando estado={estado} />
        )}

        {/* Marca discreta no rodapé, sem competir com o cronômetro */}
        <div className="pointer-events-none absolute right-[1.8vw] bottom-[1.4vh] flex items-center gap-[0.8vw] opacity-25">
          <Logo tamanho="sm" />
          {codigo && (
            <span className="text-[0.65vw] tracking-[0.3em] text-texto-fraco uppercase">
              {codigo}
            </span>
          )}
        </div>
      </section>

      {/* Faixa de patrocinadores */}
      <aside className="min-h-0 min-w-0">
        <FaixaPatrocinadores itens={patrocinadores} />
      </aside>
    </div>
  );
}
