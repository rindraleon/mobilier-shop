import { Link } from "react-router-dom";
import { Heart, MapPin, Package, Wallet } from "lucide-react";
import { useMyOrders } from "../../hooks/useOrders";
import { useWishlist } from "../../hooks/useWishlist";
import { useAddresses } from "../../hooks/useAccount";
import { useAuth } from "../../lib/auth/AuthProvider";
import { formatDate, formatPrice } from "../../utils/format";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";

export default function ClientDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useMyOrders({ limit: 5 });
  const { data: wishlist } = useWishlist();
  const { data: addresses = [] } = useAddresses();

  const orders = data?.items ?? [];
  const totalOrders = data?.meta.total ?? 0;
  // Uniquement les commandes réellement payées comptent comme dépense.
  const spent = orders
    .filter((o) => !["cancelled", "rejected", "pending_payment"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement de votre espace…" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">
        Bonjour {user?.firstName ?? ""} 👋
      </h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Retrouvez vos commandes, vos adresses et vos favoris.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Commandes" value={totalOrders} sub="depuis la création" />
        <StatCard icon={Wallet} label="Dépenses" value={formatPrice(spent)} sub="hors annulées" />
        <StatCard icon={Heart} label="Favoris" value={wishlist?.length ?? 0} sub="articles" />
        <StatCard icon={MapPin} label="Adresses" value={addresses.length} sub="enregistrées" />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-headline-sm text-primary">Commandes récentes</h2>
          <Button as={Link} to="/espace-client/commandes" variant="outline" size="sm">
            Tout voir
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Package}
              title="Aucune commande"
              text="Vous n'avez pas encore passé de commande."
              actionLabel="Découvrir la boutique"
              actionTo="/boutique"
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-surface-container-high rounded-lg border border-outline-variant/50 bg-surface-container-lowest">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={"/espace-client/commandes/" + order.id}
                  className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-surface-container-low"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-primary">
                      {order.orderNumber}
                    </span>
                    <span className="block text-label-sm text-on-surface-variant">
                      {formatDate(order.createdAt)} · {order.items.length} article
                      {order.items.length > 1 ? "s" : ""}
                    </span>
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <span className="font-display text-lg text-primary">{formatPrice(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
