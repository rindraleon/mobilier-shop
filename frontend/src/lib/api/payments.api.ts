import { api, buildQuery } from "./client";
import type {
  MobileMoneyProvider,
  Paginated,
  Payment,
  PaymentProviderInfo,
  PaymentStatus,
  SubmitPaymentInput,
} from "../../types/api";

export interface PaymentQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  provider?: MobileMoneyProvider;
  orderId?: string;
  pendingOnly?: boolean;
}

export const paymentsApi = {
  /** Opérateurs disponibles + format de référence attendu (§27). */
  providers: () => api.get<PaymentProviderInfo[]>("/payments/providers"),

  /**
   * Soumet une référence Mobile Money. Le paiement reste `SUBMITTED` jusqu'à
   * vérification manuelle par un administrateur : jamais de validation
   * automatique simulée.
   */
  submitForOrder: (orderId: string, input: SubmitPaymentInput, idempotencyKey?: string) =>
    api.post<Payment>("/payments/orders/" + orderId, input, { idempotencyKey }),

  forOrder: (orderId: string) => api.get<Payment>("/payments/orders/" + orderId),

  /** [Admin] Tous les paiements. */
  list: (query: PaymentQuery = {}) =>
    api.get<Paginated<Payment>>("/payments" + buildQuery(query)),

  /** [Admin] Vérifier un paiement → commande `PAID`. */
  verify: (id: string) => api.post<Payment>("/payments/" + id + "/verify", {}),

  /** [Admin] Rejeter un paiement (référence introuvable, montant erroné…). */
  reject: (id: string, reason: string) =>
    api.post<Payment>("/payments/" + id + "/reject", { reason }),
};
