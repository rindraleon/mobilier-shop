import { ORDER_STATUS } from "../../utils/constants";
import type { OrderStatus } from "../../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const meta = ORDER_STATUS[status] ?? ORDER_STATUS.en_attente;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
}
