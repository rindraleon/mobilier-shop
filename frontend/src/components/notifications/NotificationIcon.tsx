import {
  Bell,
  CheckCircle2,
  Package,
  ShieldAlert,
  Store,
  TrendingDown,
  Wallet,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Icône et couleur associées à chaque type de notification.
 * La liste reprend exactement l'enum serveur `NotificationType`.
 */
export const NOTIFICATION_META: Record<string, { icon: LucideIcon; color: string }> = {
  ORDER_CREATED: { icon: Package, color: "text-sky-600" },
  ORDER_PAID: { icon: Wallet, color: "text-emerald-600" },
  ORDER_STATUS_CHANGED: { icon: Package, color: "text-secondary" },
  PAYMENT_SUBMITTED: { icon: Wallet, color: "text-amber-600" },
  PAYMENT_VERIFIED: { icon: CheckCircle2, color: "text-emerald-600" },
  PAYMENT_REJECTED: { icon: XCircle, color: "text-red-600" },
  SELLER_APPLICATION_RECEIVED: { icon: Store, color: "text-sky-600" },
  SELLER_APPROVED: { icon: CheckCircle2, color: "text-emerald-600" },
  SELLER_REJECTED: { icon: XCircle, color: "text-red-600" },
  SELLER_SUSPENDED: { icon: ShieldAlert, color: "text-violet-600" },
  LOW_STOCK: { icon: TrendingDown, color: "text-amber-600" },
};

export function notificationMeta(type: string): { icon: LucideIcon; color: string } {
  return NOTIFICATION_META[type] ?? { icon: Bell, color: "text-on-surface-variant" };
}
