import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { ORDER_STATUS } from "../../utils/constants";
import type { Order, OrderStatus } from "../../types";
import { formatDate, formatPrice } from "../../utils/format";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import { Select } from "../../components/ui/Form";

export default function ClientOrders() {
  const { user, orders } = useStore();
  const [status, setStatus] = useState<string>("toutes");

  const myOrders = useMemo<Order[] | null>(
    () =>
      user
        ? orders
            .filter((o) => o.userId === user.id && (status === "toutes" || o.status === status))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : null,
    [orders, user, status]
  );

  if (!user || !myOrders) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-primary">Mes commandes</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Historique et suivi de vos achats.</p>
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-52"
          aria-label="Filtrer par statut"
        >
          <option value="toutes">Toutes les commandes</option>
          {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((id) => (
            <option key={id} value={id}>
              {ORDER_STATUS[id].label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 space-y-4">
        {myOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune commande"
            text="Vous n'avez pas encore passé commande — ou aucune ne correspond à ce filtre."
            actionLabel="Découvrir la boutique"
            actionTo="/boutique"
          />
        ) : (
          myOrders.map((order) => (
            <Link
              key={order.id}
              to={`/espace-client/commandes/${order.id}`}
              className="card group flex flex-wrap items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-card-hover sm:gap-6"
            >
              <div className="flex -space-x-3">
                {order.items.slice(0, 3).map((item) => (
                  <img
                    key={item.productId}
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-14 rounded-md border-2 border-white object-cover"
                  />
                ))}
                {order.items.length > 3 && (
                  <span className="flex h-16 w-14 items-center justify-center rounded-md border-2 border-white bg-surface-container text-body-sm font-semibold text-on-surface-variant">
                    +{order.items.length - 3}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-primary group-hover:text-secondary">{order.id}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {formatDate(order.createdAt)} · {order.items.reduce((s, it) => s + it.qty, 0)} article
                  {order.items.reduce((s, it) => s + it.qty, 0) > 1 ? "s" : ""}
                </p>
              </div>

              <OrderStatusBadge status={order.status} />
              <span className="font-display text-lg text-primary">{formatPrice(order.total)}</span>
              <ChevronRight
                size={18}
                className="text-on-surface-variant transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
