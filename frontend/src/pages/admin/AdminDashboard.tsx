import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  CreditCard,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAdminDashboard, useAdminAnalytics } from "../../hooks/useAdmin";
import { usePendingSellers } from "../../hooks/useAdmin";
import type { AnalyticsRange } from "../../types/api";
import { formatDate, formatPrice, toChartData } from "../../utils/format";
import StatCard from "../../components/ui/StatCard";
import BarChart from "../../components/ui/BarChart";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import { Select } from "../../components/ui/Form";

const PERIODS: { id: AnalyticsRange; label: string }[] = [
  { id: "7d", label: "7 derniers jours" },
  { id: "30d", label: "30 derniers jours" },
  { id: "last_month", label: "Mois dernier" },
  { id: "this_month", label: "Ce mois-ci" },
  { id: "this_year", label: "Cette année" },
];

export default function AdminDashboard() {
  const [period, setPeriod] = useState<AnalyticsRange>("30d");
  const { data: dash, isLoading, isError, refetch } = useAdminDashboard(period);
  const { data: analytics } = useAdminAnalytics("sales", period);
  const { data: pendingSellers = [] } = usePendingSellers();

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement du tableau de bord…" />
      </div>
    );
  }

  if (isError || !dash) {
    return (
      <EmptyState
        title="Impossible de charger le tableau de bord"
        actionLabel="Réessayer"
        onAction={() => void refetch()}
      />
    );
  }

  const growth = dash.growth.revenuePercent;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-headline-md text-primary">Tableau de bord</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {formatDate(dash.range.from)} — {formatDate(dash.range.to)}
          </p>
        </div>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as AnalyticsRange)}
          aria-label="Période"
          className="w-52"
        >
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Chiffre d'affaires"
          value={formatPrice(dash.revenue)}
          sub={growth !== null ? `${growth >= 0 ? "+" : ""}${growth.toFixed(1)} % vs période précédente` : "Pas de comparaison"}
          trend={growth}
        />
        <StatCard
          icon={ShoppingCart}
          label="Commandes"
          value={dash.orders}
          sub={`${dash.ordersInProgress} en cours`}
        />
        <StatCard
          icon={Users}
          label="Clients"
          value={dash.customers}
          sub={`${dash.sellers} vendeur(s)`}
        />
        <StatCard
          icon={Package}
          label="Produits actifs"
          value={dash.activeProducts}
          sub="publiés"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Store}
          label="Vendeurs en attente"
          value={dash.pendingSellers}
          sub="à examiner"
        />
        <StatCard
          icon={CreditCard}
          label="Paiements à vérifier"
          value={dash.pendingPayments}
          sub="références soumises"
        />
        <StatCard
          icon={BarChart3}
          label="Panier moyen"
          value={formatPrice(dash.averageBasket)}
          sub="par commande"
        />
      </div>

      {pendingSellers.length > 0 && (
        <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 font-display text-headline-sm text-amber-900">
            <AlertCircle size={18} /> {pendingSellers.length} demande(s) de vendeur en attente
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {pendingSellers.slice(0, 6).map((seller) => (
              <li
                key={seller.id}
                className="rounded-full bg-white px-3 py-1.5 text-body-sm text-amber-900"
              >
                {seller.shopName}
              </li>
            ))}
          </ul>
          <Button as={Link} to="/admin/vendeurs" size="sm" className="mt-4">
            Examiner les demandes
          </Button>
        </section>
      )}

      <section className="card mt-6 p-5">
        <h2 className="font-display text-headline-sm text-primary">Revenus</h2>
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[560px]">
            <BarChart
              data={toChartData(analytics?.overTime ?? [])}
              formatValue={(value) => formatPrice(value)}
            />
          </div>
        </div>
      </section>

      {analytics?.ordersByStatus && (
        <section className="card mt-6 p-5">
          <h2 className="font-display text-headline-sm text-primary">Commandes par statut</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
              <li
                key={status}
                className="flex flex-col items-start gap-1.5 rounded-lg bg-surface-container-low px-4 py-3"
              >
                <OrderStatusBadge status={status as never} />
                <span className="font-display text-xl text-primary">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
