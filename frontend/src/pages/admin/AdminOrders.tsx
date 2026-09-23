import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useAdminOrders, useAdminUpdateOrderStatus } from "../../hooks/useAdmin";
import { ADMIN_ORDER_TRANSITIONS, ORDER_STATUS } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import { Select } from "../../components/ui/Form";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../utils/errors";
import type { OrderStatus } from "../../types/api";

export default function AdminOrders() {
  const { toast } = useToast();
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const { data, isLoading, isError, refetch, isPlaceholderData } = useAdminOrders({
    page,
    limit: 10,
    status: status || undefined,
  });
  const updateStatus = useAdminUpdateOrderStatus();

  const orders = data?.items ?? [];
  let content;

  if (isLoading) {
    content = (
      <div className="py-16">
        <PageLoader label="Chargement des commandes…" />
      </div>
    );
  } else if (isError) {
    content = (
      <div className="mt-6">
        <EmptyState
          title="Impossible de charger les commandes"
          actionLabel="Réessayer"
          onAction={() => void refetch()}
        />
      </div>
    );
  } else if (orders.length === 0) {
    content = (
      <div className="mt-6">
        <EmptyState icon={ShoppingCart} title="Aucune commande" />
      </div>
    );
  } else {
    content = (
      <>
        <ul className={`mt-6 space-y-4 ${isPlaceholderData ? "opacity-60" : ""}`}>
          {orders.map((order) => {
            const allowed = ADMIN_ORDER_TRANSITIONS[order.status] ?? [];

            return (
              <li key={order.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/admin/commandes/${order.id}`}
                    className="min-w-0 flex-1 truncate font-display text-headline-sm text-primary hover:text-secondary"
                  >
                    {order.orderNumber}
                  </Link>
                  <OrderStatusBadge status={order.status} />
                  <span className="font-display text-lg text-primary">{formatPrice(order.total)}</span>
                </div>

                <p className="mt-1 text-label-sm text-on-surface-variant">
                  {formatDate(order.createdAt)} · {order.shippingAddress.fullName},{" "}
                  {order.shippingAddress.city}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {allowed.length > 0 && (
                    <Select
                      value=""
                      onChange={(e) => {
                        const next = e.target.value as OrderStatus;
                        if (!next) return;
                        updateStatus.mutate(
                          { id: order.id, status: next },
                          { onError: (error: unknown) => toast(errorMessage(error), "error") },
                        );
                      }}
                      aria-label={`Changer le statut de ${order.orderNumber}`}
                      className="w-56"
                    >
                      <option value="">Changer le statut…</option>
                      {allowed.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS[s]?.label}
                        </option>
                      ))}
                    </Select>
                  )}
                  <Link
                    to={`/admin/commandes/${order.id}`}
                    className="text-body-sm font-semibold text-secondary underline-offset-2 hover:underline"
                  >
                    Détail →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        {data?.meta && (
          <Pagination
            className="mt-6"
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            onPageChange={setPage}
          />
        )}
      </>
    );
  }

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Commandes</h1>

      <div className="mt-5">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
            setPage(1);
          }}
          aria-label="Filtrer par statut"
          className="w-56"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </Select>
      </div>

      {content}
    </div>
  );
}
