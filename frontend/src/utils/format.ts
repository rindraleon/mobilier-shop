import { categories } from "../data/products";
import type { Order } from "../types";

export const formatPrice = (value: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

export const formatDate = (value: string | Date, options: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
}): string => new Date(value).toLocaleDateString("fr-FR", options);

export const formatDateTime = (value: string | Date): string =>
  new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const discountRate = (price: number, oldPrice: number | null): number =>
  oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

export const initials = (name = ""): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export const categoryName = (id: string): string => categories.find((c) => c.id === id)?.name ?? id;

export const slugify = (str: string): string =>
  String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export interface ChartDatum {
  label: string;
  value: number;
}

export const monthlyRevenue = (orders: Order[], months = 6): ChartDatum[] => {
  const now = new Date();
  const arr: ChartDatum[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    const total = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return (
          od.getFullYear() === d.getFullYear() &&
          od.getMonth() === d.getMonth() &&
          o.status !== "annulee"
        );
      })
      .reduce((s, o) => s + o.total, 0);
    arr.push({ label, value: Math.round(total) });
  }
  return arr;
};
