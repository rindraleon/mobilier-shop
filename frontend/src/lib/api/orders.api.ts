import { api, buildQuery } from "./client";
import type {
  CreateOrderInput,
  Order,
  OrderMutationResult,
  OrderQuery,
  OrderStatus,
  Paginated,
} from "../../types/api";

export const ordersApi = {
  /**
   * Crée la commande. Le montant est recalculé côté serveur (§21, §87) et
   * `Idempotency-Key` protège contre la double soumission (§89, §90).
   */
  create: (input: CreateOrderInput, idempotencyKey?: string) =>
    api.post<OrderMutationResult>("/orders", input, { idempotencyKey }),

  /** Mes commandes (contrôle d'appartenance côté serveur, §34). */
  mine: (query: OrderQuery = {}) =>
    api.get<Paginated<Order>>("/orders/me" + buildQuery(query)),

  byId: (id: string) => api.get<Order>("/orders/" + id),

  cancel: (id: string, reason?: string) =>
    api.post<OrderMutationResult>("/orders/" + id + "/cancel", reason ? { reason } : {}),

  /** [Vendeur/Admin] Transition de statut contrôlée et historisée (§66, §67). */
  updateStatus: (id: string, status: OrderStatus, comment?: string) =>
    api.patch<OrderMutationResult>("/orders/" + id + "/status", { status, comment }),
};
