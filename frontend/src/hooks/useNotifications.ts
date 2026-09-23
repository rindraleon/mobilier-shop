import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../lib/api/notifications.api";
import { queryKeys } from "../lib/query/keys";
import { useAuth } from "../lib/auth/AuthProvider";
import { errorMessage } from "../utils/errors";

export function useNotifications(params: { page?: number; limit?: number } = {}) {
  const { isAuthenticated, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationsApi.list(params),
    enabled: isAuthenticated && !isBooting,
    // Rafraîchissement régulier : les notifications arrivent en masse.
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationsCount() {
  const { isAuthenticated, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationsApi.unreadCount(),
    enabled: isAuthenticated && !isBooting,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error: unknown) => void(errorMessage(error)),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
