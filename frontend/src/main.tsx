import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { CartDrawerProvider } from "./context/CartDrawerContext";
import { createQueryClient } from "./lib/query/queryClient";
import "./index.css";

/**
 * Le cache serveur est géré par TanStack Query (§15) :
 * il remplace `StoreContext`/`CartContext` comme source de vérité.
 *
 * La configuration (durées de cache, et surtout la politique de `retry` qui ne
 * rejoue jamais une erreur métier 4xx) est centralisée dans
 * `lib/query/queryClient.ts`.
 */
const queryClient = createQueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartDrawerProvider>
          <App />
        </CartDrawerProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
