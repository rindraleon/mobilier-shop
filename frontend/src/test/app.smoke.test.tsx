import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RenderResult } from "@testing-library/react";

const authState = { user: null as { fullName: string; role: string; firstName: string } | null };

vi.mock("../lib/api/client", () => ({
  api: {
    get: vi.fn(async () => ({ items: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } })),
    post: vi.fn(async () => ({})),
    patch: vi.fn(async () => ({})),
    delete: vi.fn(async () => undefined),
  },
  buildQuery: (params: object = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      search.set(k, String(v));
    });
    const qs = search.toString();
    return qs ? `?${qs}` : "";
  },
  clearTokens: vi.fn(),
  setTokens: vi.fn(),
  onSessionChange: vi.fn(),
  ApiError: class extends Error {},
  NetworkError: class extends Error {},
}));

vi.mock("../lib/api/categories.api", () => ({
  categoriesApi: {
    list: vi.fn(async () => [
      { id: "c1", name: "Salon", slug: "salon", description: null, imageUrl: null, position: 1, isActive: true },
    ]),
    bySlug: vi.fn(async () => ({ id: "c1", name: "Salon", slug: "salon" })),
  },
}));

vi.mock("../lib/api/auth.api", () => ({
  authApi: {
    me: vi.fn(async () => authState.user),
    session: vi.fn(async () => (authState.user ? { user: authState.user } : null)),
    login: vi.fn(async () => ({})),
    register: vi.fn(async () => ({})),
    logout: vi.fn(async () => undefined),
    refresh: vi.fn(async () => ({ user: null })),
    forgotPassword: vi.fn(async () => ({})),
    resetPassword: vi.fn(async () => ({})),
  },
}));

import App from "../App";
import { AuthProvider } from "../lib/auth/AuthProvider";
import { CartDrawerProvider } from "../context/CartDrawerContext";

function renderAt(path: string): RenderResult {
  // `App` pose son propre `BrowserRouter` : on pilote donc l'URL du document.
  window.history.pushState({}, "", path);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <CartDrawerProvider>
          <App />
        </CartDrawerProvider>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  authState.user = null;
});

describe("Application — montage des pages", () => {
  it("affiche la page d'accueil sans erreur", async () => {
    renderAt("/");
    await waitFor(() => expect(document.querySelector("h1, h2")).toBeTruthy());
    expect(document.body.textContent).toBeTruthy();
  });

  it("affiche la boutique avec son moteur de filtres", async () => {
    renderAt("/boutique");
    await waitFor(() => expect(screen.getByText(/La Boutique/i)).toBeTruthy());
    // Aucun produit en base simulée → l'état vide doit apparaître, pas un crash.
    await waitFor(() => expect(screen.getByText(/Aucun produit trouvé/i)).toBeTruthy());
  });

  it("affiche la page de connexion avec l'onglet inscription", async () => {
    renderAt("/connexion");
    await waitFor(() => expect(screen.getByText(/Créer un compte/i)).toBeTruthy());
    expect(screen.getByLabelText(/Adresse e-mail/i)).toBeTruthy();
  });

  it("redirige un visiteur anonyme vers la connexion (garde de route)", async () => {
    renderAt("/espace-client");
    // Le garde `RequireAuth` renvoie le visiteur vers /connexion.
    await waitFor(() => expect(window.location.pathname).toBe("/connexion"), { timeout: 3000 });
    await waitFor(() => expect(screen.getByLabelText(/Adresse e-mail/i)).toBeTruthy());
  });

  it("redirige un visiteur anonyme vers la connexion depuis l'espace vendeur", async () => {
    renderAt("/vendeur");
    await waitFor(() => expect(window.location.pathname).toBe("/connexion"), { timeout: 3000 });
  });

  it("redirige un visiteur anonyme vers la connexion depuis l'espace admin", async () => {
    renderAt("/admin");
    await waitFor(() => expect(window.location.pathname).toBe("/connexion"), { timeout: 3000 });
  });
});
