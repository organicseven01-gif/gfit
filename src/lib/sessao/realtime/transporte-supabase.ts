"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { EstadoSessao } from "@/lib/sessao/tipos";
import type { SessaoRow } from "@/lib/supabase/tipos-db";
import type { Transporte } from "@/lib/sessao/realtime/transporte";
import { criarClienteNavegador } from "@/lib/supabase/client";
import {
  ID_SESSAO_ATIVA,
  estadoParaLinha,
  linhaParaEstado,
} from "@/lib/sessao/realtime/mapear-sessao";

/* ==========================================================================
   Transporte Supabase Realtime.

   - Canal "gfit-session" via Broadcast: entrega instantânea do EstadoSessao
     entre dispositivos. Só EVENTOS (nunca o cronômetro por segundo); cada
     cliente calcula o tempo restante localmente a partir do horário oficial.
   - `self: false`: quem publica não recebe o próprio evento de volta.
   - Persistência: cada publicação grava a linha única `sessoes` (UMA sessão
     ativa), o que permite hidratar quem abrir no meio da aula.
   ========================================================================== */

const NOME_CANAL = "gfit-session";
const EVENTO = "estado";

export function criarTransporteSupabase(): Transporte {
  const sb = criarClienteNavegador();
  const canal: RealtimeChannel = sb.channel(NOME_CANAL, {
    config: { broadcast: { self: false } },
  });

  let inscrito = false;

  const publicar = (estado: EstadoSessao) => {
    // 1) evento instantâneo para as telas
    canal.send({ type: "broadcast", event: EVENTO, payload: estado });
    // 2) persiste a sessão única (durabilidade / hidratação). Não bloqueia.
    void sb
      .from("sessoes")
      .upsert(estadoParaLinha(estado))
      .then((res: { error: { message: string } | null }) => {
        if (res.error)
          console.warn("[sessao] falha ao persistir:", res.error.message);
      });
  };

  const assinar = (aoReceber: (estado: EstadoSessao) => void) => {
    canal.on("broadcast", { event: EVENTO }, ({ payload }) => {
      aoReceber(payload as EstadoSessao);
    });

    if (!inscrito) {
      inscrito = true;
      canal.subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        // hidrata com a sessão atual do banco (quem entrou no meio)
        const { data } = await sb
          .from("sessoes")
          .select("*")
          .eq("id", ID_SESSAO_ATIVA)
          .maybeSingle();
        if (data) {
          aoReceber(await linhaParaEstado(data as unknown as SessaoRow));
        }
      });
    }

    return () => {
      // handlers do canal são limpos no encerrar()
    };
  };

  const encerrar = () => {
    sb.removeChannel(canal);
  };

  return { publicar, assinar, encerrar };
}
