import type { OrderStatus } from "../types";

export const FREE_SHIPPING_THRESHOLD = 300;

export type ShippingMethodId = "standard" | "express";

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  delay: string;
  price: number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: "standard", label: "Livraison standard", delay: "3 à 5 jours ouvrés", price: 4.9 },
  { id: "express", label: "Livraison express", delay: "24 à 48 h", price: 14.9 },
];

export type PaymentMethodId = "card" | "paypal" | "cod";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "card", label: "Carte bancaire", description: "Visa, Mastercard, CB" },
  { id: "paypal", label: "PayPal", description: "Redirection sécurisée" },
  { id: "cod", label: "Paiement à la livraison", description: "Espèces ou carte à réception" },
];

export const shippingLabel = (id: string): string =>
  SHIPPING_METHODS.find((m) => m.id === id)?.label ?? id;

export const paymentLabel = (id: string): string => PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;

export const PROMO_CODES: Record<string, number> = { ANTI10: 0.1, BIENVENUE: 0.15 };

export interface OrderStatusMeta {
  label: string;
  badge: string;
  dot: string;
  step: number;
}

export const ORDER_STATUS: Record<OrderStatus, OrderStatusMeta> = {
  en_attente: {
    label: "En attente",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    step: 1,
  },
  confirmee: {
    label: "Confirmée",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
    step: 2,
  },
  expediee: {
    label: "Expédiée",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    step: 3,
  },
  livree: {
    label: "Livrée",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    step: 4,
  },
  annulee: {
    label: "Annulée",
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    step: 0,
  },
};

export const ORDER_STEPS: string[] = ["Commande passée", "Confirmée", "Expédiée", "Livrée"];

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRange[] = [
  { id: "0-200", label: "Moins de 200 €", min: 0, max: 200 },
  { id: "200-500", label: "200 € – 500 €", min: 200, max: 500 },
  { id: "500-800", label: "500 € – 800 €", min: 500, max: 800 },
  { id: "800+", label: "Plus de 800 €", min: 800, max: Infinity },
];

export interface SortOption {
  id: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: "recommande", label: "Recommandés" },
  { id: "prix-asc", label: "Prix croissant" },
  { id: "prix-desc", label: "Prix décroissant" },
  { id: "nouveautes", label: "Nouveautés" },
  { id: "note", label: "Mieux notés" },
];
