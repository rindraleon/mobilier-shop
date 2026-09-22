import { describe, expectTypeOf, it } from "vitest";
import type { Order, OrderMutationResult } from "../../types/api";

/**
 * Verrou de régression — comportement observé sur l'API réelle.
 *
 * `POST /orders`, `POST /orders/:id/cancel` et `PATCH /orders/:id/status`
 * renvoient l'entité commande **sans** `payment` ni `statusHistory` : ces deux
 * champs ne sont chargés que par `GET /orders/:id`.
 *
 * Conséquence : mettre la réponse d'une mutation dans le cache
 * `orders.detail(id)` écrasait une commande complète par une commande
 * partielle, et faisait planter les pages de détail
 * (`order.statusHistory.length`).
 *
 * Ces assertions de types échouent à la compilation si quelqu'un réintroduit
 * la confusion entre `Order` et `OrderMutationResult`.
 */
describe("typage des mutations de commande", () => {
  it("une commande complète expose payment et statusHistory", () => {
    expectTypeOf<Order>().toHaveProperty("statusHistory");
    expectTypeOf<Order>().toHaveProperty("payment");
  });

  it("le résultat d'une mutation ne les expose PAS", () => {
    expectTypeOf<OrderMutationResult>().not.toHaveProperty("statusHistory");
    expectTypeOf<OrderMutationResult>().not.toHaveProperty("payment");
  });
});
