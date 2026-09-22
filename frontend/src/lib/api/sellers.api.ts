import { api } from "./client";
import type { ApplySellerInput, Seller, UpdateSellerInput } from "../../types/api";

export const sellersApi = {
  /**
   * Demande vendeur. Le backend crée une demande `PENDING` : aucune publication
   * n'est possible avant validation par un administrateur (§14, §64).
   */
  apply: (input: ApplySellerInput) => api.post<Seller>("/sellers/apply", input),

  /** Ma boutique (vendeur approuvé). */
  me: () => api.get<Seller>("/sellers/me"),

  /** Ma demande, `null` si aucune. */
  myApplication: () => api.get<Seller | null>("/sellers/me/application"),

  updateMe: (input: UpdateSellerInput) => api.patch<Seller>("/sellers/me", input),
};
