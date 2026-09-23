import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { CartDrawerProvider } from "./context/CartDrawerContext";
import { createQueryClient } from "./lib/query/queryClient";
import "./index.css";

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
