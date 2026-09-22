import { useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { useSellerOrders } from "../../hooks/useSeller";
import { ORDER_STATUS } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import { Select } from "../../components/ui/Form";
import type { OrderStatus } from "../../types/api";

export default function SellerOrders() {
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const { data, isLoading, isError, refetch, isPlaceholderData } = useSellerOrders({
    page,
    limit: 10,
    status: status || undefined,
  });

  const orders = data?.items ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-headline-md text-primary">Mes commandes</h1>
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

      {isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement des commandes…" />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger les commandes"
            actionLabel="Réessayer"
            onAction={() => void refetch()}
          />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="Aucune commande"
            text="Les commandes contenant vos produits apparaîtront ici."
          />
        </div>
      ) : (
        <>
          <ul className={`mt-6 space-y-4 ${isPlaceholderData ? "opacity-60" : ""}`}>
            {orders.map((order) => (
              <li key={order.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={"/vendeur/commandes/" + order.id}
                    className="min-w-0 flex-1 truncate font-display text-headline-sm text-primary hover:text-secondary"
                  >
                    {order.orderNumber}
                  </Link>
                  <OrderStatusBadge status={order.status} />
                  <span className="font-display text-lg text-primary">{formatPrice(order.total)}</span>
                </div>
                <p className="mt-1 text-label-sm text-on-surface-variant">
                  {formatDate(order.createdAt)} · {order.shippingAddress.city},{" "}
                  {order.shippingAddress.country}
                </p>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s) ·{" "}
                  {order.items.map((item) => item.name).join(", ")}
                </p>
                <Link
                  to={"/vendeur/commandes/" + order.id}
                  className="mt-3 inline-block text-body-sm font-semibold text-secondary underline-offset-2 hover:underline"
                >
                  Traiter la commande →
                </Link>
              </li>
            ))}
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
      )}
    </div>
  );
}
