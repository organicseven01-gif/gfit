/**
 * Ambiente do controle remoto: tela cheia, sem sidebar, sem topbar, sem
 * barra de navegação inferior.
 *
 * Durante a aula o professor segura o celular numa mão, muitas vezes sem
 * olhar direito. Qualquer cromo de navegação vira alvo de toque errado —
 * por isso este ambiente não herda o shell do painel.
 */
export default function ControleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-dvw flex-col overflow-hidden bg-fundo select-none">
      {children}
    </div>
  );
}
