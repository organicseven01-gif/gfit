/**
 * Barra de tempo restante da fase.
 *
 * Esvazia da direita para a esquerda. A largura é recalculada a cada frame
 * (a tela já re-renderiza no ritmo do relógio), então o movimento é contínuo
 * — sem `transition`, que competiria com a atualização por frame e causaria
 * arrasto.
 *
 * Abaixo dela, marcadores discretos dos rounds dão a noção do todo sem
 * disputar atenção com o cronômetro.
 */
export function BarraProgresso({
  progressoFase,
  cor,
  round,
  totalRounds,
}: {
  /** 0 a 1 — quanto da fase já passou. */
  progressoFase: number;
  cor: string;
  round: number;
  totalRounds: number;
}) {
  const restantePct = Math.min(100, Math.max(0, (1 - progressoFase) * 100));

  return (
    <div className="flex flex-col gap-[1.2vh]">
      {/* Trilho + preenchimento restante */}
      <div className="relative h-[0.9vh] w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${restantePct}%`,
            backgroundColor: cor,
            boxShadow: `0 0 2vh ${cor}`,
          }}
        />
      </div>

      {/* Rounds: preenchidos = concluídos, o atual pulsa em cor */}
      {totalRounds > 1 && (
        <div className="flex items-center gap-[0.4vw]">
          {Array.from({ length: totalRounds }, (_, i) => {
            const numero = i + 1;
            const passou = numero < round;
            const atual = numero === round;
            return (
              <span
                key={numero}
                className="h-[0.35vh] flex-1 rounded-full transition-colors duration-500"
                style={{
                  backgroundColor: atual
                    ? cor
                    : passou
                      ? "color-mix(in srgb, var(--color-texto) 35%, transparent)"
                      : "color-mix(in srgb, var(--color-texto) 10%, transparent)",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
