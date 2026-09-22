import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../lib/api/orders.api";
import { queryKeys } from "../lib/query/keys";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";
import type { CreateOrderInput, Order, OrderQuery, OrderStatus } from "../types/api";

/** Historique personnel (le backend filtre : aucun IDOR possible, §34). */
export function useMyOrders(query: OrderQuery = {}) {
  return useQuery({
    queryKey: queryKeys.orders.mine(query),
    queryFn: () => ordersApi.mine(query),
    placeholderData: (previous) => previous,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<Order>({
    queryKey: queryKeys.orders.detail(id ?? ""),
    queryFn: () => ordersApi.byId(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Création de commande.
 *
 * `Idempotency-Key` générée côté client : un double-clic sur « Commander »
 * ne peut pas créer deux commandes (§89). Le backend recalcule le total —
 * aucun montant n'est envoyé par le frontend (§87).
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      ordersApi.create(input, crypto.randomUUID()),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      // Pas de `setQueryData` ici : la réponse de création ne contient ni
      // `payment` ni `statusHistory`. La page de suivi recharge la commande
      // complète via `GET /orders/:id`.
      toast("Commande " + order.orderNumber + " créée.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ordersApi.cancel(id, reason),
    onSuccess: () => {
      // `orders.all` est un préfixe de `orders.detail(id)` : l'invalidation
      // recharge donc aussi la page de suivi, avec `payment` et `statusHistory`.
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      toast("Commande annulée. Les articles ont été remis en stock.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/** [Vendeur/Admin] Transition de statut contrôlée (§66). */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      status,
      comment,
    }: {
      id: string;
      status: OrderStatus;
      comment?: string;
    }) => ordersApi.updateStatus(id, status, comment),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.all });
      // La réponse de transition est partielle : on recharge le détail
      // complet (avec `payment` et `statusHistory`) plutôt que de l'écrire.
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });
      toast("Statut mis à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}
