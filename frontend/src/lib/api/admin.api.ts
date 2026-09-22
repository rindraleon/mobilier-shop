import { api, buildQuery } from "./client";
import type {
  Address,
  AnalyticsRange,
  AuditLog,
  AuditLogQuery,
  Category,
  Order,
  OrderMutationResult,
  OrderQuery,
  OrderStatus,
  Paginated,
  Payment,
  Product,
  ProductQuery,
  Seller,
  UserProfile,
  UserRole,
} from "../../types/api";

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  inactiveOnly?: boolean;
}

export interface AdminDashboardResponse {
  period: string;
  range: { from: string; to: string };
  revenue: number;
  orders: number;
  averageBasket: number;
  customers: number;
  sellers: number;
  pendingSellers: number;
  activeProducts: number;
  pendingPayments: number;
  ordersInProgress: number;
  growth: { revenuePercent: number | null; previousRevenue: number };
}

/** Réponse réelle de `GET /admin/analytics` (agrégats SQL, §33). */
export interface AdminAnalyticsResponse {
  overTime?: { date: string; revenue: number; orders: number }[];
  topProducts?: {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }[];
  byCategory?: {
    categoryId: string;
    name: string;
    revenue: number;
    unitsSold: number;
  }[];
  bySeller?: {
    sellerId: string;
    shopName: string;
    revenue: number;
    unitsSold: number;
    orders: number;
  }[];
  ordersByStatus?: Record<string, number>;
  topCustomers?: {
    id: string;
    email: string;
    name: string;
    revenue: number;
    orders: number;
  }[];
  newCustomers?: number;
}

export type AdminAnalyticsType =
  | "sales"
  | "orders"
  | "products"
  | "customers"
  | "sellers";

export const adminApi = {
  dashboard: (period: AnalyticsRange = "30d") =>
    api.get<AdminDashboardResponse>("/admin/dashboard" + buildQuery({ period })),

  analytics: (type: AdminAnalyticsType = "sales", period: AnalyticsRange = "30d") =>
    api.get<AdminAnalyticsResponse>("/admin/analytics" + buildQuery({ type, period })),

  /* --- Utilisateurs --- */
  users: (query: AdminUsersQuery = {}) =>
    api.get<Paginated<UserProfile>>("/admin/users" + buildQuery(query)),

  changeRole: (id: string, role: UserRole) =>
    api.patch<UserProfile>("/admin/users/" + id + "/role", { role }),

  suspendUser: (id: string, reason?: string) =>
    api.post<UserProfile>("/admin/users/" + id + "/suspend", reason ? { reason } : {}),

  reactivateUser: (id: string) =>
    api.post<UserProfile>("/admin/users/" + id + "/reactivate", {}),

  /* --- Vendeurs --- */
  sellers: () => api.get<Paginated<Seller>>("/admin/sellers"),

  pendingSellers: () => api.get<Paginated<Seller>>("/admin/sellers/pending"),

  approveSeller: (id: string) => api.post<Seller>("/admin/sellers/" + id + "/approve", {}),

  rejectSeller: (id: string, reason: string) =>
    api.post<Seller>("/admin/sellers/" + id + "/reject", { reason }),

  suspendSeller: (id: string, reason?: string) =>
    api.post<Seller>("/admin/sellers/" + id + "/suspend", reason ? { reason } : {}),

  /* --- Catalogue --- */
  products: (query: ProductQuery = {}) =>
    api.get<Paginated<Product>>("/admin/products" + buildQuery(query)),

  categories: () => api.get<Category[]>("/admin/categories"),

  /* --- Commandes & paiements --- */
  orders: (query: OrderQuery = {}) =>
    api.get<Paginated<Order>>("/admin/orders" + buildQuery(query)),

  updateOrderStatus: (id: string, status: OrderStatus, comment?: string) =>
    api.patch<OrderMutationResult>("/admin/orders/" + id + "/status", { status, comment }),

  payments: (query: { page?: number; limit?: number; status?: string } = {}) =>
    api.get<Paginated<Payment>>("/admin/payments" + buildQuery(query)),

  verifyPayment: (id: string) => api.post<Payment>("/admin/payments/" + id + "/verify", {}),

  rejectPayment: (id: string, reason: string) =>
    api.post<Payment>("/admin/payments/" + id + "/reject", { reason }),

  /* --- Journal d'audit (§32, §72) --- */
  auditLogs: (query: AuditLogQuery = {}) =>
    api.get<Paginated<AuditLog>>("/admin/audit-logs" + buildQuery(query)),
};

export type { Address, Category, Order, Payment, Product, Seller };
