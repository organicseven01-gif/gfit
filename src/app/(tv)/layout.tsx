/**
 * Ambiente da TV: tela cheia, sem sidebar, sem topbar, sem rolagem.
 * Tudo aqui é pensado para leitura a vários metros de distância.
 */
export default function TvLayout({ children }: { children: React.ReactNode }) {
  return <div className="tela-tv h-dvh w-dvw bg-fundo">{children}</div>;
}
