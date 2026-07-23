"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import type { RegistroHistorico } from "@/types";
import { listarHistorico } from "@/lib/services/historico-service";
import { categoria } from "@/lib/treinos/categorias";
import { formatarDuracao } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Toolbar } from "@/components/ui/toolbar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableTh,
  TableTd,
} from "@/components/ui/table";

const COLUNAS = ["Treino", "Categoria", "Início", "Duração", "Status"];

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoricoView() {
  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarHistorico().then((lista) => {
      setRegistros(lista);
      setCarregando(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Histórico"
        descricao="Sessões executadas nas telas da academia."
      />

      <Toolbar placeholder="Buscar por treino..." />

      {carregando ? (
        <Table>
          <TableHead>
            <TableRow>
              {COLUNAS.map((c) => (
                <TableTh key={c}>{c}</TableTh>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map((n) => (
              <TableRow key={n}>
                {COLUNAS.map((c) => (
                  <TableTd key={c}>
                    <Skeleton className="h-3 w-24" />
                  </TableTd>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : registros.length === 0 ? (
        <EmptyState
          icone={History}
          titulo="Nenhuma sessão registrada"
          descricao="As execuções aparecem aqui assim que os treinos começarem a rodar nas telas."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              {COLUNAS.map((c) => (
                <TableTh key={c}>{c}</TableTh>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((r) => (
              <TableRow key={r.id}>
                <TableTd className="font-medium">{r.treinoNome}</TableTd>
                <TableTd>
                  {r.categoria ? categoria(r.categoria).nome : "—"}
                </TableTd>
                <TableTd className="text-texto-suave">
                  {formatarDataHora(r.iniciadoEm)}
                </TableTd>
                <TableTd className="numeros-timer">
                  {r.duracaoSegundos ? formatarDuracao(r.duracaoSegundos) : "—"}
                </TableTd>
                <TableTd>
                  <Badge tom={r.concluido ? "sucesso" : "neutro"}>
                    {r.concluido ? "Concluído" : "Interrompido"}
                  </Badge>
                </TableTd>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
