import { describe, expectTypeOf, it } from "vitest";
import type { Order, OrderMutationResult } from "../../types/api";

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
