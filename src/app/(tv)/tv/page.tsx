import { SessaoProvider } from "@/lib/sessao/providers/sessao-provider";
import { TvAoVivo } from "@/components/tv/tv-ao-vivo";

export const metadata = { title: "Tela da TV" };

/**
 * A TV é sempre OBSERVADORA: nunca envia comandos, só reflete a sessão.
 * Antes do treino no ar, a própria `DisplayTv` mostra a tela de espera.
 */
export default function TvPage() {
  return (
    <SessaoProvider papel="observador">
      <TvAoVivo />
    </SessaoProvider>
  );
}
