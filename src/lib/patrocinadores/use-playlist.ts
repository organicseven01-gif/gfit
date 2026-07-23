"use client";

import { useCallback, useMemo, useState } from "react";
import type { MidiaPatrocinador } from "@/types";
import { criarCiclo } from "@/lib/patrocinadores/playlist";

/**
 * Playlist de exibição da TV.
 *
 * Mantém um ciclo embaralhado onde cada peça aparece uma única vez; ao
 * terminar, sorteia um ciclo novo. Peças cujo arquivo falha ao carregar são
 * marcadas e saem da rotação automaticamente (sem travar o ciclo).
 */
export function usePlaylist(itens: MidiaPatrocinador[]) {
  const [quebrados, setQuebrados] = useState<string[]>([]);

  const disponiveis = useMemo(
    () => itens.filter((i) => !quebrados.includes(i.id)),
    [itens, quebrados],
  );

  const [ciclo, setCiclo] = useState<MidiaPatrocinador[]>([]);
  const [indice, setIndice] = useState(0);

  // Recria o ciclo quando a lista disponível muda (carregou, ativou/desativou
  // alguém, ou uma peça quebrou). Ajuste de estado em render — padrão do React.
  const [fonteAnterior, setFonteAnterior] = useState<MidiaPatrocinador[] | null>(
    null,
  );
  if (disponiveis !== fonteAnterior) {
    setFonteAnterior(disponiveis);
    setCiclo(criarCiclo(disponiveis));
    setIndice(0);
  }

  const atual = ciclo[indice] ?? null;
  /** Próxima peça do ciclo — usada para pré-carregar e evitar tela preta. */
  const proxima = ciclo[indice + 1] ?? null;

  const avancar = useCallback(() => {
    const proximo = indice + 1;
    if (proximo < ciclo.length) {
      setIndice(proximo);
      return;
    }
    // ciclo completo: todos exibiram exatamente uma vez → sorteia novo
    setCiclo(criarCiclo(disponiveis, ciclo[indice]?.id));
    setIndice(0);
  }, [ciclo, indice, disponiveis]);

  /** Tira da rotação uma peça cujo arquivo não carregou. */
  const marcarQuebrada = useCallback((id: string) => {
    setQuebrados((atuais) =>
      atuais.includes(id) ? atuais : [...atuais, id],
    );
  }, []);

  return {
    atual,
    proxima,
    avancar,
    marcarQuebrada,
    /** Quantas peças estão realmente na rotação. */
    total: disponiveis.length,
    posicao: indice,
  };
}
