import { api } from "./client";
import type { Cart } from "../../types/api";

export const cartApi = {
  get: () => api.get<Cart>("/cart"),

  addItem: (productId: string, quantity = 1) =>
    api.post<Cart>("/cart/items", { productId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    api.patch<Cart>("/cart/items/" + itemId, { quantity }),

  removeItem: (itemId: string) => api.delete<Cart>("/cart/items/" + itemId),

  clear: () => api.delete<Cart>("/cart"),
};
