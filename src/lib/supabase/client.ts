import { createBrowserClient } from "@supabase/ssr";

let cliente: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Cliente Supabase para Client Components (roda no navegador).
 * Singleton: uma conexão só, reaproveitada em toda a aplicação.
 *
 * Sem generic de schema: os tipos do banco (ver `tipos-db.ts`) são aplicados
 * por cast na camada de services, o que evita a inferência `never` dos tipos
 * escritos à mão. As linhas do banco são sempre mapeadas para o domínio.
 */
export function criarClienteNavegador() {
  if (cliente) return cliente;
  cliente = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return cliente;
}
