/**
 * Miniatura da tela da TV, usada no editor de treinos.
 * Reproduz a hierarquia visual real (round, fase, cronômetro) em escala
 * reduzida, para o coach conferir o resultado sem abrir a televisão.
 */
export function PreviewTv() {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-card border border-borda bg-fundo">
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-[0.6rem] font-bold tracking-[0.3em] text-texto-suave">
          ROUND — / —
        </p>
        <p className="text-lg leading-none font-extrabold tracking-[0.15em] text-marca">
          TRABALHO
        </p>
        <p className="numeros-timer text-5xl leading-none font-extrabold text-texto">
          00:00
        </p>
      </div>
    </div>
  );
}
