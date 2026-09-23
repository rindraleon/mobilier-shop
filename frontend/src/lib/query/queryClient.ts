import { QueryClient } from "@tanstack/react-query";
import { ApiError, NetworkError } from "../api/client";

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
