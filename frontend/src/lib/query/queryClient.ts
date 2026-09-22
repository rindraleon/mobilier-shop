import { QueryClient } from "@tanstack/react-query";
import { ApiError, NetworkError } from "../api/client";

/**
 * Configuration globale de TanStack Query (§7).
 *
 * - `staleTime` : les données de catalogue restent fraîches 60 s (peu volatiles).
 * - `gcTime` : 15 min de cache après démontage des composants.
 * - `retry` : on ne réessaie **jamais** une erreur métier (4xx). Réessayer un
 *   403 ou un 422 ne peut pas réussir et ferait paraître l'UI bloquée. En
 *   revanche une panne réseau ou un 5xx mérite une seconde chance.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 15 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Erreurs réseau / 5xx : une seule nouvelle tentative.
          if (error instanceof NetworkError) return failureCount < 1;
          if (error instanceof ApiError) {
            if (error.statusCode >= 500) return failureCount < 1;
            if (error.statusCode === 429 || error.statusCode === 408) {
              return failureCount < 1;
            }
            return false; // 401/403/404/409/422 : erreur définitive
          }
          return failureCount < 1;
        },
      },
      mutations: {
        // Une mutation rejouée automatiquement pourrait créer une double commande.
        retry: 0,
      },
    },
  });
}
