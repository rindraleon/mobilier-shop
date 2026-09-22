import { api, buildQuery } from "./client";
import type {
  Order,
  OrderQuery,
  OrderStatus,
  Paginated,
  Payment,
  Product,
  ProductQuery,
  Seller,
} from "../../types/api";

/** Réponse réelle de `GET /seller/dashboard`. */
export interface SellerDashboardResponse {
  today: { revenue: number; orders: number; unitsSold: number };
  month: { revenue: number; orders: number; unitsSold: number };
  total: { revenue: number; orders: number; unitsSold: number };
  products: { total: number; active: number; lowStock: number };
  recentOrders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
  }[];
}

export interface SellerAnalyticsResponse {
  sales?: { date: string; revenue: number; orders: number }[];
  topProducts?: { productId: string; name: string; unitsSold: number; revenue: number }[];
  ordersByStatus: Record<string, number>;
}

export type SellerAnalyticsType = "sales" | "products";
export type SellerPeriod = "7d" | "30d" | "this_month" | "this_year";

export const sellerApi = {
  dashboard: () => api.get<SellerDashboardResponse>("/seller/dashboard"),

  products: (query: ProductQuery = {}) =>
    api.get<Paginated<Product>>("/seller/products" + buildQuery(query)),

  orders: (query: OrderQuery = {}) =>
    api.get<Paginated<Order>>("/seller/orders" + buildQuery(query)),

  order: (id: string) => api.get<Order>("/seller/orders/" + id),

  analytics: (type: SellerAnalyticsType = "sales", period: SellerPeriod = "30d") =>
    api.get<SellerAnalyticsResponse>(
      "/seller/analytics" + buildQuery({ type, period }),
    ),

  sales: (period: SellerPeriod = "30d") =>
    api.get<{ date: string; revenue: number; orders: number }[]>(
      "/seller/sales" + buildQuery({ period }),
    ),

  profile: () => api.get<Seller>("/seller/profile"),

  payments: (query: { page?: number; limit?: number } = {}) =>
    api.get<Paginated<Payment>>("/seller/payments" + buildQuery(query)),
};
