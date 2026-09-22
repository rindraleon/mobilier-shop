import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sellerApi, type SellerAnalyticsType, type SellerPeriod } from "../lib/api/seller.api";
import { sellersApi } from "../lib/api/sellers.api";
import { productsApi } from "../lib/api/products.api";
import { queryKeys } from "../lib/query/keys";
import { useAuth } from "../lib/auth/AuthProvider";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";
import type {
  CreateProductInput,
  OrderQuery,
  ProductQuery,
  UpdateProductInput,
} from "../types/api";

/* ------------------------- Demande vendeur (§14) ------------------------- */

/** Ma demande vendeur (PENDING / APPROVED / REJECTED / SUSPENDED), ou `null`. */
export function useSellerApplication() {
  const { isAuthenticated, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.sellerApplication,
    queryFn: () => sellersApi.myApplication(),
    enabled: isAuthenticated && !isBooting,
  });
}

export function useApplySeller() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: sellersApi.apply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerApplication });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      toast("Demande envoyée. Un administrateur va l'examiner.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/* --------------------------- Produits vendeur ---------------------------- */

export function useSellerProducts(query: ProductQuery = {}) {
  const { isApprovedSeller, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.seller.products(query),
    queryFn: () => sellerApi.products(query),
    enabled: isApprovedSeller && !isBooting,
    placeholderData: (previous) => previous,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.dashboard });
      toast("Produit créé.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast("Produit mis à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.dashboard });
      toast("Produit supprimé.", "info");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/* --------------------------- Commandes vendeur --------------------------- */

export function useSellerOrders(query: OrderQuery = {}) {
  const { isApprovedSeller, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.seller.orders(query),
    queryFn: () => sellerApi.orders(query),
    enabled: isApprovedSeller && !isBooting,
    placeholderData: (previous) => previous,
  });
}

export function useSellerOrder(id: string | undefined) {
  const { isApprovedSeller } = useAuth();
  return useQuery({
    queryKey: queryKeys.seller.order(id ?? ""),
    queryFn: () => sellerApi.order(id as string),
    enabled: Boolean(id) && isApprovedSeller,
  });
}

/* ---------------------------- Statistiques ------------------------------- */

export function useSellerDashboard() {
  const { isApprovedSeller, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.seller.dashboard,
    queryFn: () => sellerApi.dashboard(),
    enabled: isApprovedSeller && !isBooting,
    staleTime: 30_000,
  });
}

export function useSellerAnalytics(
  type: SellerAnalyticsType = "sales",
  period: SellerPeriod = "30d",
) {
  const { isApprovedSeller, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.seller.analytics({ type, period }),
    queryFn: () => sellerApi.analytics(type, period),
    enabled: isApprovedSeller && !isBooting,
    staleTime: 60_000,
  });
}

export function useSellerProfile() {
  const { isApprovedSeller, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.seller.profile,
    queryFn: () => sellerApi.profile(),
    enabled: isApprovedSeller && !isBooting,
  });
}

export function useSellerPayments(query: { page?: number; limit?: number } = {}) {
  const { isApprovedSeller, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.seller.payments(query),
    queryFn: () => sellerApi.payments(query),
    enabled: isApprovedSeller && !isBooting,
    placeholderData: (previous) => previous,
  });
}
