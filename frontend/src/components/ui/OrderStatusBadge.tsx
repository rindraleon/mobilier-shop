import { ORDER_STATUS } from "../../utils/constants";
import type { OrderStatus } from "../../types/api";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

/** Pastille de statut de commande (9 statuts serveur, §24). */
export default function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const meta = ORDER_STATUS[status] ?? ORDER_STATUS.pending_payment;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge} ${className}`}
    >
      {meta.label}
    </span>
  );
}
