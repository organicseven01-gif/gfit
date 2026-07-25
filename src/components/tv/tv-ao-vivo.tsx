"use client";

import { useEffect, useState } from "react";
import type { Configuracoes, MidiaPatrocinador } from "@/types";
import { useVisaoSessao } from "@/lib/sessao/hooks/use-visao-sessao";
import { visaoParaEstadoTv } from "@/lib/sessao/services/mapear-tv";
import { listarParaExibicao } from "@/lib/services/patrocinadores-service";
import { obterConfiguracoes } from "@/lib/services/configuracoes-service";
import { useSonsSessao } from "@/lib/sons/use-sons-sessao";
import { desbloquearSom } from "@/lib/sons/motor-sons";
import { DisplayTv } from "@/components/tv/display-tv";

/**
 * A TV ao vivo: observa a sessão e alimenta a `DisplayTv`. Não envia nada.
 * Toca os sons do treino (nas caixas da academia) conforme as transições.
 */
export function TvAoVivo() {
  const visao = useVisaoSessao();
  const [patrocinadores, setPatrocinadores] = useState<MidiaPatrocinador[]>([]);
  const [config, setConfig] = useState<Configuracoes | null>(null);
  const [somBloqueado, setSomBloqueado] = useState(true);

  useEffect(() => {
    listarParaExibicao()
      .then(setPatrocinadores)
      .catch(() => setPatrocinadores([]));
    obterConfiguracoes()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  // Dispara os bipes conforme a sessão muda de fase.
  useSonsSessao(visao, config?.som ?? null);

  // Navegadores só liberam áudio após um gesto. A TV é passiva, então
  // libera no primeiro toque/clique/tecla e some com a dica.
  useEffect(() => {
    if (!somBloqueado) return;
    const liberar = () => {
      desbloquearSom();
      setSomBloqueado(false);
    };
    window.addEventListener("pointerdown", liberar);
    window.addEventListener("keydown", liberar);
    return () => {
      window.removeEventListener("pointerdown", liberar);
      window.removeEventListener("keydown", liberar);
    };
  }, [somBloqueado]);

  const mostrarDica = !!config?.som.ativo && somBloqueado;

  return (
    <div className="relative h-full w-full">
      <DisplayTv
        estado={visaoParaEstadoTv(
          visao,
          config?.agenda ?? [],
          config?.nomeAcademia ?? "G FIT",
        )}
        patrocinadores={patrocinadores}
      />

      {mostrarDica && (
        <button
          type="button"
          onClick={() => {
            desbloquearSom();
            setSomBloqueado(false);
          }}
          className="absolute bottom-[2.5vh] left-1/2 -translate-x-1/2 rounded-full border border-marca/40 bg-black/70 px-[1.6vw] py-[1vh] text-[1vw] font-semibold tracking-wide text-marca backdrop-blur transition-opacity hover:bg-black/85"
        >
          🔊 Toque na tela para ativar o som
        </button>
      )}
    </div>
  );
}
