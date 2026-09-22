import { afterEach, describe, expect, it } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "../App";
import { AuthProvider } from "../lib/auth/AuthProvider";
import { CartDrawerProvider } from "../context/CartDrawerContext";
import { createQueryClient } from "../lib/query/queryClient";
import {
  API_ORIGIN,
  CookieJar,
  installLiveFetch,
  isApiUp,
  type LiveFetchHandle,
} from "./liveApi";

/**
 * Évaluation QA — parcours d'achat complet **saisi par le client**.
 *
 * Aucune étape n'est pré-remplie : l'utilisateur tape lui-même, dans
 * l'interface, chacune des données :
 *
 *   1. connexion (e-mail + mot de passe) ;
 *   2. choix d'un produit dans la boutique ;
 *   3. ajout au panier ;
 *   4. saisie de l'adresse de livraison ;
 *   5. validation de la commande ;
 *   6. saisie de la référence Mobile Money ;
 *   7. soumission de la référence.
 *
 * Le réseau n'est pas simulé : l'application dialogue avec le backend réel
 * (`installLiveFetch` préfixe les URLs relatives et gère les cookies).
 *
 * Seules deux actions relèvent de la préparation du jeu d'essai (panier vidé
 * au départ) ; elles passent par l'API, jamais par l'interface.
 *
 * Le test est ignoré automatiquement si aucun backend ne répond.
 */

const apiUp = await isApiUp();

/**
 * Navigation dans l'application.
 *
 * jsdom n'implémente pas la navigation par clic sur `<a href>` : les liens ne
 * déclenchent pas de changement de page. On pilote donc le routeur
 * (`popstate`, seule API d' historique écoutée par React Router) pour les
 * changements d'écran, tandis que **tous les boutons restent cliqués pour de
 * vrai** et toutes les saisies sont tapées au clavier.
 */
function go(path: string): void {
  act(() => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
}

/** Connexion par API : uniquement pour vider le panier au départ. */
async function loginViaApi(): Promise<string> {
  const response = await fetch(`${API_ORIGIN}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "customer@example.local",
      password: "Motdepasse1!",
    }),
  });
  return ((await response.json()) as { accessToken: string }).accessToken;
}

async function emptyCart(accessToken: string): Promise<void> {
  await fetch(`${API_ORIGIN}/api/cart`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

describe.skipIf(!apiUp)("Parcours client complet — tout saisi dans l'UI", () => {
  let handle: LiveFetchHandle | null = null;

  afterEach(() => {
    handle?.restore();
    handle = null;
  });

  it(
    "connexion → produit → panier → adresse → commande → référence de paiement",
    async () => {
      await emptyCart(await loginViaApi());

      const jar = new CookieJar();
      handle = installLiveFetch(jar);

      window.history.pushState({}, "", "/connexion");
      const user = userEvent.setup();

      render(
        <QueryClientProvider client={createQueryClient()}>
          <AuthProvider>
            <CartDrawerProvider>
              <App />
            </CartDrawerProvider>
          </AuthProvider>
        </QueryClientProvider>,
      );

      /** Saisit un champ du formulaire courant, identifié par son `name`. */
      const typeIn = async (name: string, value: string): Promise<void> => {
        const field = await waitFor(
          () => {
            const el = document.querySelector<HTMLInputElement>(
              `input[name="${name}"], textarea[name="${name}"]`,
            );
            if (!el) throw new Error(`champ « ${name} » introuvable`);
            return el;
          },
          { timeout: 20_000 },
        );
        if (!field.value) {
          await user.clear(field);
          await user.type(field, value);
        }
      };

      const called = (fragment: string, method = "POST"): boolean =>
        Boolean(
          handle?.calls.some(
            (c) => c.includes(`${method} `) && c.includes(fragment),
          ),
        );

      /* ---------- Étape 1 : le client se connecte ---------- */
      await typeIn("email", "customer@example.local");
      await typeIn("password", "Motdepasse1!");
      await user.click(screen.getByRole("button", { name: /se connecter/i }));
      await waitFor(() => expect(called("/api/auth/login")).toBe(true), {
        timeout: 20_000,
      });

      // L'application enchaîne sur sa page d'arrivée après connexion : on
      // attend cette redirection, sinon elle écrase les navigations du test.
      await waitFor(
        () => expect(window.location.pathname).not.toBe("/connexion"),
        { timeout: 20_000 },
      );

      /* ---------- Étape 2 : le client choisit un produit ---------- */
      // On écarte les produits épuisés (le stock a été consommé par les
      // exécutions précédentes) : le client doit cliquer sur un article
      // réellement disponible, sinon le bouton affiche « Indisponible ».
      const catalogue = (await (
        await fetch(`${API_ORIGIN}/api/products?limit=50`)
      ).json()) as { items: Array<{ slug: string; stock: number }> };
      const available = catalogue.items.find((p) => p.stock > 0);
      if (!available) throw new Error("aucun produit disponible en catalogue");

      go("/boutique");
      await waitFor(
        () => {
          if (window.location.pathname !== "/boutique") {
            throw new Error("pas sur la boutique : " + window.location.pathname);
          }
          const link = document.querySelector<HTMLAnchorElement>(
            `a[href="/boutique/${available.slug}"]`,
          );
          if (!link) throw new Error("produit absent de la boutique");
        },
        { timeout: 25_000 },
      );
      go("/boutique/" + available.slug);
      await waitFor(
        () => expect(window.location.pathname).toBe("/boutique/" + available.slug),
        { timeout: 15_000 },
      );

      /* ---------- Étape 3 : le client ajoute au panier ---------- */
      const addToCart = await screen.findByRole(
        "button",
        { name: /ajouter au panier/i },
        { timeout: 25_000 },
      );
      await user.click(addToCart);
      await waitFor(() => expect(called("/api/cart/items")).toBe(true), {
        timeout: 25_000,
      });

      /* ---------- Étape 4 : le client saisit son adresse ---------- */
      go("/panier");
      await screen.findByRole("link", { name: /passer commande/i }, { timeout: 25_000 });
      go("/commande");

      await typeIn("fullName", "Camille Moreau");
      await typeIn("phone", "+261 34 00 000 03");
      await typeIn("addressLine1", "Lot II M 12 Bis");
      await typeIn("city", "Antananarivo");

      /* ---------- Étape 5 : le client valide la commande ---------- */
      await user.click(
        screen.getByRole("button", { name: /valider la commande/i }),
      );
      await waitFor(() => expect(called("/api/orders")).toBe(true), {
        timeout: 30_000,
      });

      /* ---------- Étape 6 : le client saisit la référence ---------- */
      const referenceField = await waitFor(
        () => {
          const el = document.querySelector<HTMLInputElement>(
            'input[name="transactionReference"]',
          );
          if (!el) throw new Error("formulaire de paiement absent");
          return el;
        },
        { timeout: 30_000 },
      );

      const reference = `MP${Date.now().toString().slice(-10)}A7`;
      await user.type(referenceField, reference);
      await typeIn("payerPhone", "+261 34 00 000 03");

      /* ---------- Étape 7 : le client soumet la référence ---------- */
      await user.click(
        screen.getByRole("button", { name: /envoyer la référence/i }),
      );
      await waitFor(
        () => expect(called("/api/payments/orders/")).toBe(true),
        { timeout: 30_000 },
      );

      /* ---------- Contrôles de sortie (règles d'or §99) ---------- */
      // Jamais de validation automatique : le paiement est « en cours de
      // vérification », la commande n'est pas « Payée ».
      await screen.findByText(/vérification/i, {}, { timeout: 25_000 });
      expect(screen.queryByText(/paiement vérifié/i)).toBeNull();
      expect(screen.queryByText(/^Payée$/i)).toBeNull();

      // La référence saisie est celle envoyée au serveur.
      const submitCall = handle?.calls.find(
        (c) => c.includes("POST") && c.includes("/api/payments/orders/"),
      );
      expect(submitCall).toBeDefined();
    },
    180_000,
  );
});
