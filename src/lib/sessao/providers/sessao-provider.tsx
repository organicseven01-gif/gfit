"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AcaoSessao, EstadoSessao } from "@/lib/sessao/tipos";
import { estadoInicial, reduzir } from "@/lib/sessao/engine/engine";
import { criarTransporte, type Transporte } from "@/lib/sessao/realtime/transporte";

export type PapelSessao = "controlador" | "observador";

interface ContextoSessao {
  estado: EstadoSessao;
  papel: PapelSessao;
  despachar: (acao: AcaoSessao) => void;
}

const Contexto = createContext<ContextoSessao | null>(null);

/**
 * Rebaseia o cronômetro no relógio LOCAL de quem recebe.
 *
 * O estado viaja com `restanteMs` (quanto falta, um DELTA) — não confiamos no
 * `fimPrevistoEpoch` do remetente, que é um horário absoluto do relógio DELE.
 * Se o celular e a TV/notebook têm relógios levemente diferentes (comum), usar
 * o horário absoluto do outro faz os cronômetros divergirem. Recalculando o
 * fim a partir do relógio local, toda tela mostra o MESMO tempo.
 */
function rebasearRelogio(e: EstadoSessao, agora: number): EstadoSessao {
  if (e.status !== "rodando") return e;
  return { ...e, fimPrevistoEpoch: agora + Math.max(0, e.restanteMs) };
}

/**
 * Provider da sessão sincronizada.
 *
 * - `controlador` (painel, controle): pode despachar ações; hospeda o laço de
 *   auto-avanço que dispara `NEXT` quando a fase acaba.
 * - `observador` (TV): só escuta; nunca altera o estado, nunca avança sozinho.
 *
 * Assume UM controlador ativo por vez (o professor usa um dispositivo). Se
 * dois controladores coexistirem, o último a publicar vence (versão maior).
 */
export function SessaoProvider({
  papel,
  children,
}: {
  papel: PapelSessao;
  children: React.ReactNode;
}) {
  const [estado, setEstado] = useState<EstadoSessao>(estadoInicial);

  const transporteRef = useRef<Transporte | null>(null);
  const estadoRef = useRef(estado);
  const despacharRef = useRef<(acao: AcaoSessao) => void>(() => {});

  // Aplica um estado atualizando ref + state JUNTOS (síncrono). Crucial: o
  // laço de auto-avanço lê `estadoRef`; se o ref ficar atrás do state (só
  // sincronizado por effect), o laço dispara NEXT sobre estado velho e
  // cascateia. Vale para comandos locais E para estados vindos do broadcast.
  const aplicar = (novo: EstadoSessao) => {
    estadoRef.current = novo;
    setEstado(novo);
  };

  // Liga o transporte uma vez.
  useEffect(() => {
    const t = criarTransporte();
    transporteRef.current = t;
    const cancelar = t.assinar((recebido) => {
      // last-writer-wins por horário (epoch): unifica broadcast ao vivo e
      // hidratação do banco, que usam relógios/contadores diferentes.
      if (recebido.atualizadoEm >= estadoRef.current.atualizadoEm) {
        // rebaseia no relógio local para o tempo bater em todas as telas
        aplicar(rebasearRelogio(recebido, Date.now()));
      }
    });
    return () => {
      cancelar();
      t.encerrar();
      transporteRef.current = null;
    };
  }, []);

  const despachar = (acao: AcaoSessao) => {
    if (papel !== "controlador") return; // observador nunca altera
    const novo = reduzir(estadoRef.current, acao, Date.now());
    aplicar(novo);
    transporteRef.current?.publicar(novo);
  };

  // Só o `despachar` precisa do valor corrente no laço; o estado já é
  // mantido por `aplicar`.
  useEffect(() => {
    despacharRef.current = despachar;
  });

  // Auto-avanço: só o controlador VISÍVEL. Quando a fase acaba, dispara NEXT.
  // A TV nunca entra aqui. O gate de visibilidade evita que uma aba de
  // controle em segundo plano, ao voltar ao foco, tente "recuperar" o tempo.
  useEffect(() => {
    if (papel !== "controlador") return;
    let id = 0;
    const loop = () => {
      const e = estadoRef.current;
      if (
        document.visibilityState === "visible" &&
        e.status === "rodando" &&
        Date.now() >= e.fimPrevistoEpoch
      ) {
        despacharRef.current({ tipo: "NEXT" });
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [papel]);

  return (
    <Contexto.Provider value={{ estado, papel, despachar }}>
      {children}
    </Contexto.Provider>
  );
}

export function useContextoSessao(): ContextoSessao {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error("useContextoSessao precisa estar dentro de <SessaoProvider>");
  }
  return ctx;
}
