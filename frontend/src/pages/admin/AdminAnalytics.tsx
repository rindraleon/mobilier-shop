import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Crown, Layers, TrendingUp, Users } from "lucide-react";
import { useAdminAnalytics } from "../../hooks/useAdmin";
import type { AnalyticsRange } from "../../types/api";
import type { AdminAnalyticsType } from "../../lib/api/admin.api";
import { formatPrice, toChartData } from "../../utils/format";
import StatCard from "../../components/ui/StatCard";
import BarChart from "../../components/ui/BarChart";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import { Select } from "../../components/ui/Form";
import type { OrderStatus } from "../../types/api";

const PERIODS: { id: AnalyticsRange; label: string }[] = [
  { id: "7d", label: "7 derniers jours" },
  { id: "30d", label: "30 derniers jours" },
  { id: "last_month", label: "Mois dernier" },
  { id: "this_month", label: "Ce mois-ci" },
  { id: "this_year", label: "Cette année" },
];

const TYPES: { id: AdminAnalyticsType; label: string }[] = [
  { id: "sales", label: "Ventes" },
  { id: "products", label: "Produits" },
  { id: "customers", label: "Clients" },
  { id: "sellers", label: "Vendeurs" },
];

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<AnalyticsRange>("30d");
  const [type, setType] = useState<AdminAnalyticsType>("sales");
  const { data, isLoading, isError, refetch } = useAdminAnalytics(type, period);

  const overTime = data?.overTime ?? [];
  const total = overTime.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-headline-md text-primary">Statistiques</h1>
        <div className="flex flex-wrap gap-3">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as AdminAnalyticsType)}
            aria-label="Type de statistique"
            className="w-40"
          >
            {TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as AnalyticsRange)}
            aria-label="Période"
            className="w-48"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement des statistiques…" />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger les statistiques"
            actionLabel="Réessayer"
            onAction={() => void refetch()}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={TrendingUp} label="Revenus" value={formatPrice(total)} sub="sur la période" />
            <StatCard
              icon={BarChart3}
              label="Commandes"
              value={overTime.reduce((sum, p) => sum + p.orders, 0)}
              sub="sur la période"
            />
            {typeof data?.newCustomers === "number" && (
              <StatCard icon={Users} label="Nouveaux clients" value={data.newCustomers} sub="sur la période" />
            )}
            {data?.topProducts && (
              <StatCard
                icon={Crown}
                label="Produit n°1"
                value={data.topProducts[0]?.name ?? "—"}
                sub={data.topProducts[0] ? formatPrice(data.topProducts[0].revenue) : "aucune vente"}
              />
            )}
          </div>

          {overTime.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Évolution</h2>
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[560px]">
                  <BarChart
                    data={toChartData(overTime)}
                    formatValue={(value) => formatPrice(value)}
                  />
                </div>
              </div>
            </section>
          )}

          {data?.topProducts && data.topProducts.length > 0 && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
                <Crown size={18} className="text-secondary" /> Meilleurs produits
              </h2>
              <ul className="mt-4 divide-y divide-surface-container-high">
                {data.topProducts.map((product, index) => (
                  <li key={product.productId} className="flex items-center gap-3 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-sm font-bold text-on-secondary-container">
                      {index + 1}
                    </span>
                    <Link
                      to={"/boutique"}
                      className="min-w-0 flex-1 truncate text-body-sm font-semibold text-primary hover:text-secondary"
                    >
                      {product.name}
                    </Link>
                    <span className="text-body-sm text-on-surface-variant">
                      {product.unitsSold} vendu(s)
                    </span>
                    <span className="w-28 text-right text-body-sm font-semibold text-primary">
                      {formatPrice(product.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data?.byCategory && data.byCategory.length > 0 && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
                <Layers size={18} className="text-secondary" /> Par catégorie
              </h2>
              <ul className="mt-4 space-y-3">
                {data.byCategory.map((category) => (
                  <li key={category.categoryId} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-body-sm text-primary">
                      {category.name}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {category.unitsSold} vendu(s)
                    </span>
                    <span className="w-28 text-right text-body-sm font-semibold text-primary">
                      {formatPrice(category.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data?.bySeller && data.bySeller.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Par vendeur</h2>
              <ul className="mt-4 space-y-3">
                {data.bySeller.map((seller) => (
                  <li key={seller.sellerId} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-body-sm text-primary">
                      {seller.shopName}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {seller.orders} commande(s)
                    </span>
                    <span className="w-28 text-right text-body-sm font-semibold text-primary">
                      {formatPrice(seller.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data?.topCustomers && data.topCustomers.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Meilleurs clients</h2>
              <ul className="mt-4 space-y-3">
                {data.topCustomers.map((customer) => (
                  <li key={customer.id} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm text-primary">{customer.name}</span>
                      <span className="block truncate text-label-sm text-on-surface-variant">
                        {customer.email}
                      </span>
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {customer.orders} commande(s)
                    </span>
                    <span className="w-28 text-right text-body-sm font-semibold text-primary">
                      {formatPrice(customer.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data?.ordersByStatus && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Commandes par statut</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {Object.entries(data.ordersByStatus).map(([status, count]) => (
                  <li
                    key={status}
                    className="flex flex-col items-start gap-1.5 rounded-lg bg-surface-container-low px-4 py-3"
                  >
                    <OrderStatusBadge status={status as OrderStatus} />
                    <span className="font-display text-xl text-primary">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
