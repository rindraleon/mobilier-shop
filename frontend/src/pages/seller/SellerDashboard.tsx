import { Link } from "react-router-dom";
import { AlertCircle, Package, TrendingUp, Wallet } from "lucide-react";
import { useSellerDashboard } from "../../hooks/useSeller";
import { useSellerApplication } from "../../hooks/useSeller";
import { formatDate, formatPrice } from "../../utils/format";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import PageLoader from "../../components/ui/PageLoader";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import EmptyState from "../../components/ui/EmptyState";

export default function SellerDashboard() {
  const { data: dash, isLoading } = useSellerDashboard();
  const { data: seller } = useSellerApplication();

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement du tableau de bord…" />
      </div>
    );
  }

  const today = dash?.today;
  const month = dash?.month;
  const products = dash?.products;
  const recent = dash?.recentOrders ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-headline-md text-primary">
            {seller?.shopName ?? "Ma boutique"}
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Voici l'activité de votre boutique.
          </p>
        </div>
        <Button as={Link} to="/vendeur/produits/nouveau" size="sm">
          <Package size={16} /> Nouveau produit
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Revenus du mois"
          value={formatPrice(month?.revenue ?? 0)}
          sub={`${month?.orders ?? 0} commande(s) · ${formatPrice(today?.revenue ?? 0)} aujourd'hui`}
        />
        <StatCard
          icon={TrendingUp}
          label="Unités vendues (mois)"
          value={month?.unitsSold ?? 0}
          sub={`dont ${today?.unitsSold ?? 0} aujourd'hui`}
        />
        <StatCard
          icon={Package}
          label="Produits"
          value={products?.active ?? 0}
          sub={`sur ${products?.total ?? 0} au total`}
        />
        <StatCard
          icon={AlertCircle}
          label="Stock faible"
          value={products?.lowStock ?? 0}
          sub="à réapprovisionner"
        />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-headline-sm text-primary">Dernières commandes</h2>
          <Button as={Link} to="/vendeur/commandes" variant="outline" size="sm">
            Tout voir
          </Button>
        </div>

        {recent.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Package}
              title="Aucune commande pour le moment"
              text="Publiez vos produits pour recevoir vos premières commandes."
              actionLabel="Créer un produit"
              actionTo="/vendeur/produits/nouveau"
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-surface-container-high rounded-lg border border-outline-variant/50 bg-surface-container-lowest">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  to={"/vendeur/commandes/" + order.id}
                  className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-surface-container-low"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-primary">
                      {order.orderNumber}
                    </span>
                    <span className="block text-label-sm text-on-surface-variant">
                      {formatDate(order.createdAt)}
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
