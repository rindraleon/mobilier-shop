

import type {
  MobileMoneyProvider,
  OrderStatus,
  PaymentStatus,
  ProductSort,
  ProductStatus,
  SellerStatus,
} from "../types/api";

/* ------------------------------------------------------------------ */
/* Livraison                                                           */
/* ------------------------------------------------------------------ */

export const FREE_SHIPPING_THRESHOLD = 1_500_000;

export type ShippingMethodId = "standard" | "express" | "pickup";

export interface ShippingMethod {
  id: ShippingMethodId;
  label: string;
  delay: string;
  price: number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Livraison standard",
    delay: "3 à 5 jours ouvrés",
    price: 10_000,
  },
  {
    id: "express",
    label: "Livraison express",
    delay: "24 à 48 h",
    price: 25_000,
  },
  {
    id: "pickup",
    label: "Retrait en atelier",
    delay: "Sur rendez-vous",
    price: 0,
  },
];

export const shippingLabel = (id: string): string =>
  SHIPPING_METHODS.find((m) => m.id === id)?.label ?? id;

/* ------------------------------------------------------------------ */
/* Paiement Mobile Money (§26)                                         */
/* ------------------------------------------------------------------ */

export interface PaymentProviderMeta {
  id: MobileMoneyProvider;
  label: string;
  /** Format de référence imposé par l'opérateur (§27). */
  hint: string;
  pattern: RegExp;
  color: string;
  initials: string;
}

export const PAYMENT_PROVIDERS: PaymentProviderMeta[] = [
  {
    id: "mvola",
    label: "MVola",
    hint: "8 à 30 caractères, lettres majuscules et chiffres (ex. MP2408151234A00001)",
    pattern: /^[A-Z0-9]{8,30}$/,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    initials: "MV",
  },
  {
    id: "orange_money",
    label: "Orange Money",
    hint: "6 à 30 caractères, avec ou sans le préfixe OM (ex. OM12345678)",
    pattern: /^(OM)?[A-Z0-9]{6,30}$/,
    color: "bg-amber-100 text-amber-800 border-amber-200",
    initials: "OM",
  },
  {
    id: "airtel_money",
    label: "Airtel Money",
    hint: "6 à 30 caractères, avec ou sans le préfixe AM (ex. AM12345678)",
    pattern: /^(AM)?[A-Z0-9]{6,30}$/,
    color: "bg-red-100 text-red-800 border-red-200",
    initials: "AM",
  },
];

export const paymentProviderLabel = (id: string): string =>
  PAYMENT_PROVIDERS.find((p) => p.id === id)?.label ?? id;

/** Normalise la saisie : majuscules, espaces et tirets superflus retirés. */
export const normalizeReference = (value: string): string =>
  value.toUpperCase().replace(/[\s-]+/g, "");

/* ------------------------------------------------------------------ */
/* Statuts de commande (§24)                                           */
/* ------------------------------------------------------------------ */

export interface OrderStatusMeta {
  label: string;
  badge: string;
  dot: string;
  step: number;
  description: string;
}

export const ORDER_STATUS: Record<OrderStatus, OrderStatusMeta> = {
  pending_payment: {
    label: "En attente de paiement",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    step: 1,
    description: "Commande créée. Effectuez le paiement puis saisissez la référence.",
  },
  payment_submitted: {
    label: "Paiement à vérifier",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
    step: 2,
    description: "Référence reçue. Un administrateur vérifie la transaction.",
  },
  paid: {
    label: "Payée",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    step: 3,
    description: "Paiement confirmé. Le vendeur prépare votre commande.",
  },
  processing: {
    label: "En préparation",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    step: 4,
    description: "Le vendeur prépare vos articles.",
  },
  ready: {
    label: "Prête",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    dot: "bg-violet-500",
    step: 5,
    description: "Commande prête à être expédiée ou retirée.",
  },
  shipped: {
    label: "Expédiée",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
    step: 6,
    description: "Votre commande est en cours de livraison.",
  },
  delivered: {
    label: "Livrée",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
    step: 7,
    description: "Commande livrée. Merci pour votre confiance !",
  },
  cancelled: {
    label: "Annulée",
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    step: 0,
    description: "Commande annulée.",
  },
  rejected: {
    label: "Paiement rejeté",
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-600",
    step: 0,
    description: "Le paiement n'a pas pu être vérifié.",
  },
};

/** Transitions de statut gérables depuis l'écran admin « Commandes ».
 *  Miroir de la matrice serveur (§64), réduit aux statuts qu'un administrateur
 *  peut réellement appliquer via `PATCH /orders/:id/status` :
 *  - « paid » est exclu (verrou anti-fraude : il ne s'obtient que par la
 *    vérification de la référence Mobile Money dans Paiements) ;
 *  - le cycle de paiement (payment_submitted / rejected / pending_payment)
 *    est exclu car il doit rester cohérent avec l'enregistrement Payment.
 */
export const ADMIN_ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_payment: ["cancelled"],
  payment_submitted: ["cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["ready", "shipped", "cancelled"],
  ready: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  rejected: [],
};

export const ORDER_STEPS: string[] = [
  "Commande passée",
  "Paiement reçu",
  "En préparation",
  "Expédiée",
  "Livrée",
];

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; badge: string }> = {
  pending: { label: "En attente", badge: "bg-surface-container text-on-surface-variant border-outline-variant" },
  submitted: { label: "À vérifier", badge: "bg-sky-100 text-sky-800 border-sky-200" },
  verified: { label: "Vérifié", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Rejeté", badge: "bg-red-100 text-red-700 border-red-200" },
  refunded: { label: "Remboursé", badge: "bg-violet-100 text-violet-800 border-violet-200" },
};

export interface StatusMeta { label: string; badge: string; description: string }

export const PRODUCT_STATUS: Record<ProductStatus, StatusMeta> = {
  draft: {
    label: "Brouillon",
    badge: "bg-surface-container text-on-surface-variant border-outline-variant",
    description: "Visible uniquement par vous. Non publié dans la boutique.",
  },
  pending_review: {
    label: "En relecture",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    description: "En attente de validation par un administrateur.",
  },
  published: {
    label: "Publié",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Visible et achetable par les clients.",
  },
  out_of_stock: {
    label: "Rupture",
    badge: "bg-red-100 text-red-700 border-red-200",
    description: "Stock épuisé : le produit ne peut plus être commandé.",
  },
  archived: {
    label: "Archivé",
    badge: "bg-surface-container-high text-on-surface-variant border-outline-variant",
    description: "Retiré de la vente. L'historique des commandes est conservé.",
  },
};

export const SELLER_STATUS: Record<SellerStatus, StatusMeta> = {
  pending: {
    label: "En attente",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Votre demande est en cours d'examen par un administrateur. Aucune vente possible pour l'instant.",
  },
  approved: {
    label: "Approuvé",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Votre boutique est active : vous pouvez publier et vendre vos produits.",
  },
  rejected: {
    label: "Refusé",
    badge: "bg-red-100 text-red-700 border-red-200",
    description: "Votre demande a été refusée. Consultez le motif envoyé par e-mail.",
  },
  suspended: {
    label: "Suspendu",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
    description: "Votre boutique est suspendue : la vente est temporairement bloquée.",
  },
};

/* ------------------------------------------------------------------ */
/* Catalogue : filtres et tri (§45)                                    */
/* ------------------------------------------------------------------ */

export interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRange[] = [
  { id: "0-500k", label: "Moins de 500 000 Ar", min: 0, max: 500_000 },
  { id: "500k-1m", label: "500 000 – 1 000 000 Ar", min: 500_000, max: 1_000_000 },
  { id: "1m-3m", label: "1 000 000 – 3 000 000 Ar", min: 1_000_000, max: 3_000_000 },
  { id: "3m+", label: "Plus de 3 000 000 Ar", min: 3_000_000, max: Number.MAX_SAFE_INTEGER },
];

export interface SortOption {
  id: ProductSort;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: "newest", label: "Nouveautés" },
  { id: "price_asc", label: "Prix croissant" },
  { id: "price_desc", label: "Prix décroissant" },
  { id: "name_asc", label: "Nom (A → Z)" },
  { id: "popular", label: "Les plus populaires" },
  { id: "rating", label: "Mieux notés" },
];

/** Seuil par défaut d'alerte de stock faible (§70). */
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
