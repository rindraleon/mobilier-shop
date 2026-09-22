import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../lib/api/carts.api";
import { queryKeys } from "../lib/query/keys";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";
import type { Cart } from "../types/api";

/** Panier serveur : une seule source de vérité, liée à l'utilisateur (§21). */
export function useCart(enabled = true) {
  return useQuery<Cart>({
    queryKey: queryKeys.cart.all,
    queryFn: () => cartApi.get(),
    enabled,
    staleTime: 0, // les prix/stocks doivent être revérifiés à chaque consultation
  });
}

/**
 * Mutations du panier.
 *
 * Pas d'update optimiste sur le total : le serveur est seul légitime pour
 * calculer les montants (§62). On invalide simplement le cache, ce qui
 * garantit un affichage toujours conforme au backend.
 */
export function useAddCartItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.all, cart);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      toast("Article ajouté au panier.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.all, cart);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.all, cart);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      toast("Article retiré du panier.", "info");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.all, cart);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    onError: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),
  });
}
