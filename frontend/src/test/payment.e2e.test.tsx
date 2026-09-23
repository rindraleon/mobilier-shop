import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "../App";
import { AuthProvider } from "../lib/auth/AuthProvider";
import { CartDrawerProvider } from "../context/CartDrawerContext";
import { createQueryClient } from "../lib/query/queryClient";
import { setTokens } from "../lib/api/client";
import {
  createPendingOrder,
  installLiveFetch,
  isApiUp,
  type OrderFixture,
} from "./liveApi";

const apiUp = await isApiUp();

describe.skipIf(!apiUp)("Parcours de paiement — application réelle", () => {
  let fixture: OrderFixture | null = null;

  beforeAll(async () => {
    fixture = await createPendingOrder();
  }, 30_000);

  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it(
    "atteint la dernière étape et soumet une référence Mobile Money",
    async () => {
      const order = fixture;
      if (!order) throw new Error("Jeu d'essai non préparé.");

      setTokens({
        accessToken: order.accessToken,
        refreshToken: order.refreshToken,
      });
      const live = installLiveFetch(order.jar);

      window.history.pushState({}, "", `/commande/succes/${order.orderId}`);

      render(
        <QueryClientProvider client={createQueryClient()}>
          <AuthProvider>
            <CartDrawerProvider>
              <App />
            </CartDrawerProvider>
          </AuthProvider>
        </QueryClientProvider>,
      );

      // 1. La page de la commande s'affiche (le numéro figure dans le fil
      //    d'Ariane ET dans le titre : on accepte plusieurs occurrences).
      await waitFor(
        () => expect(screen.getAllByText(order.orderNumber).length).toBeGreaterThan(0),
        { timeout: 15_000 },
      );

      // 2. Le formulaire de paiement — dernière étape — est présent.
      const referenceField = await screen.findByLabelText(
        /référence de transaction/i,
        {},
        { timeout: 15_000 },
      );
      expect(referenceField).toBeInTheDocument();

      // 3. Les opérateurs viennent du serveur (`GET /payments/providers`).
      expect(await screen.findByRole("button", { name: /mvola/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /orange money/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /airtel money/i })).toBeInTheDocument();

      // 4. Le montant affiché est celui de la commande, pas celui du panier.
      expect(live.calls.some((c) => c.includes("/api/payments/providers"))).toBe(true);

      // 5. Une référence trop courte est refusée localement (§27).
      const user = userEvent.setup();
      await user.type(referenceField, "ABC");
      await user.click(screen.getByRole("button", { name: /envoyer la référence/i }));
      expect(
        await screen.findByText(/au moins 6 caractères/i, {}, { timeout: 5_000 }),
      ).toBeInTheDocument();
      expect(
        live.calls.some((c) => c.includes("POST") && c.includes("/api/payments/orders/")),
      ).toBe(false);

      // 6. Une référence conforme est envoyée au backend.
      const reference = `MP${Date.now().toString().slice(-10)}A1`;
      await user.clear(referenceField);
      await user.type(referenceField, reference);
      await user.click(screen.getByRole("button", { name: /envoyer la référence/i }));

      await waitFor(
        () =>
          expect(
            live.calls.some(
              (c) => c.includes("POST") && c.includes("/api/payments/orders/"),
            ),
          ).toBe(true),
        { timeout: 15_000 },
      );

      // 7. Règle d'or (§99) : le paiement n'est JAMAIS validé automatiquement.
      await screen.findByText(/vérification/i, {}, { timeout: 15_000 });
      expect(screen.queryByText(/paiement vérifié/i)).toBeNull();

      live.restore();
    },
    60_000,
  );
});
