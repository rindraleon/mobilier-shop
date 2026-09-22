import { api, buildQuery } from "./client";
import type { Notification, Paginated } from "../../types/api";

export const notificationsApi = {
  list: (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    api.get<Paginated<Notification>>("/notifications" + buildQuery(params)),

  unreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),

  markAsRead: (id: string) => api.patch<Notification>("/notifications/" + id + "/read", {}),

  markAllAsRead: () => api.post<{ message: string }>("/notifications/read-all", {}),
};
