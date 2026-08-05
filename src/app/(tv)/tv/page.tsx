import { SessaoProvider } from "@/lib/sessao/providers/sessao-provider";
import { TvAoVivo } from "@/components/tv/tv-ao-vivo";

export const metadata = { title: "Tela da TV" };

/**
 * A TV também é CONTROLADORA: além de exibir, tem um painel embutido
 * (`PainelControleTv`) para o professor comandar a aula direto do
 * computador que alimenta a tela — não só pelo celular.
 *
 * Continua igual se ninguém tocar em nada: a `DisplayTv` mostra a tela de
 * espera / o cronômetro normalmente.
 */
export default function TvPage() {
  return (
    <SessaoProvider papel="controlador">
      <TvAoVivo />
    </SessaoProvider>
  );
}
