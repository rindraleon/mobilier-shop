import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type AdminAnalyticsType,
  type AdminUsersQuery,
} from "../lib/api/admin.api";
import { categoriesApi, type CreateCategoryInput } from "../lib/api/categories.api";
import { queryKeys } from "../lib/query/keys";
import { useAuth } from "../lib/auth/AuthProvider";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";
import type {
  AnalyticsRange,
  AuditLogQuery,
  OrderQuery,
  OrderStatus,
  ProductQuery,
  UserRole,
} from "../types/api";

/* --------------------------- Tableau de bord ----------------------------- */

export function useAdminDashboard(period: AnalyticsRange = "30d") {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.dashboard(period),
    queryFn: () => adminApi.dashboard(period),
    enabled: isAdmin && !isBooting,
    staleTime: 30_000,
  });
}

export function useAdminAnalytics(
  type: AdminAnalyticsType = "sales",
  period: AnalyticsRange = "30d",
) {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.analytics({ type, period }),
    queryFn: () => adminApi.analytics(type, period),
    enabled: isAdmin && !isBooting,
    staleTime: 60_000,
  });
}

/* ------------------------------ Utilisateurs ----------------------------- */

export function useAdminUsers(query: AdminUsersQuery = {}) {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.users(query),
    queryFn: () => adminApi.users(query),
    enabled: isAdmin && !isBooting,
    placeholderData: (previous) => previous,
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      adminApi.changeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users({}) });
      toast("Rôle modifié.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users({}) });
      toast("Compte suspendu.", "warning");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users({}) });
      toast("Compte réactivé.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/* -------------------------------- Vendeurs ------------------------------- */

export function useAdminSellers() {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.sellers,
    queryFn: () => adminApi.sellers(),
    enabled: isAdmin && !isBooting,
    select: (data) => data.items,
  });
}

export function usePendingSellers() {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.pendingSellers,
    queryFn: () => adminApi.pendingSellers(),
    enabled: isAdmin && !isBooting,
    select: (data) => data.items,
  });
}

export function useApproveSeller() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => adminApi.approveSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.sellers });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingSellers });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard("30d") });
      toast("Vendeur approuvé. Il peut désormais publier ses produits.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useRejectSeller() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectSeller(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.sellers });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingSellers });
      toast("Demande vendeur refusée.", "warning");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useSuspendSeller() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      adminApi.suspendSeller(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.sellers });
      toast("Boutique suspendue.", "warning");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/* ------------------------------- Catalogue ------------------------------- */

export function useAdminProducts(query: ProductQuery = {}) {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.products(query),
    queryFn: () => adminApi.products(query),
    enabled: isAdmin && !isBooting,
    placeholderData: (previous) => previous,
  });
}

export function useAdminCategories() {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => adminApi.categories(),
    enabled: isAdmin && !isBooting,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast("Catégorie créée.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCategoryInput> }) =>
      categoriesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast("Catégorie mise à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast("Catégorie supprimée.", "info");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/* ------------------------- Commandes & audit ----------------------------- */

export function useAdminOrders(query: OrderQuery = {}) {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.orders(query),
    queryFn: () => adminApi.orders(query),
    enabled: isAdmin && !isBooting,
    placeholderData: (previous) => previous,
  });
}

export function useAdminUpdateOrderStatus() {
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
    }) => adminApi.updateOrderStatus(id, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders({}) });
      toast("Statut de la commande mis à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useAuditLogs(query: AuditLogQuery = {}) {
  const { isAdmin, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(query),
    queryFn: () => adminApi.auditLogs(query),
    enabled: isAdmin && !isBooting,
    placeholderData: (previous) => previous,
  });
}
