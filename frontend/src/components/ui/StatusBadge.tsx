import { ORDER_STATUS, PAYMENT_STATUS, PRODUCT_STATUS, SELLER_STATUS } from "../../utils/constants";
import type { OrderStatus, PaymentStatus, ProductStatus, SellerStatus } from "../../types/api";

type AnyStatus = OrderStatus | PaymentStatus | ProductStatus | SellerStatus;

const MAPS = {
  order: ORDER_STATUS,
  payment: PAYMENT_STATUS,
  product: PRODUCT_STATUS,
  seller: SELLER_STATUS,
} as const;

interface StatusBadgeProps {
  kind: keyof typeof MAPS;
  status: AnyStatus;
  className?: string;
}

/** Pastille générique : commande / produit / paiement / vendeur. */
export default function StatusBadge({ kind, status, className = "" }: StatusBadgeProps) {
  const map = MAPS[kind] as Record<string, { label: string; badge: string }>;
  const meta = map[status] ?? { label: String(status), badge: "bg-surface-container text-on-surface-variant border-outline-variant" };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge} ${className}`}
    >
      {meta.label}
    </span>
  );
}
