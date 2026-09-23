import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "../lib/api/wishlist.api";
import { queryKeys } from "../lib/query/keys";
import { useAuth } from "../lib/auth/AuthProvider";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";

/** Favoris serveur (`wishlist` / `wishlist_items`, §12). */
export function useWishlist() {
  const { isAuthenticated, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.wishlist.all,
    queryFn: () => wishlistApi.get(),
    enabled: isAuthenticated && !isBooting,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, name }: { productId: string; name?: string }) =>
      wishlistApi
        .toggle(productId)
        .then((wishlist) => ({ wishlist, name, productId })),
    onSuccess: ({ wishlist, name, productId }) => {
      queryClient.setQueryData(queryKeys.wishlist.all, wishlist);
      // Le serveur renvoie la liste à jour : sa présence indique l'état final.
      const added = wishlist.some((item) => item.id === productId);
      const label = name ?? "L'article";
      toast(added ? `${label} ajouté à vos favoris.` : `${label} retiré de vos favoris.`);
    },
    onError: (error: unknown) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      toast(errorMessage(error), "error");
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.remove(productId),
    onSuccess: (wishlist) => {
      queryClient.setQueryData(queryKeys.wishlist.all, wishlist);
      toast("Article retiré des favoris.", "info");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}
