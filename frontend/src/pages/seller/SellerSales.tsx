import { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { useSellerAnalytics } from "../../hooks/useSeller";
import type { SellerPeriod } from "../../lib/api/seller.api";
import { formatPrice } from "../../utils/format";
import { toChartData } from "../../utils/format";
import StatCard from "../../components/ui/StatCard";
import BarChart from "../../components/ui/BarChart";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Form";
import StatusBadge from "../../components/ui/StatusBadge";
import type { OrderStatus } from "../../types/api";

const PERIODS: { id: SellerPeriod; label: string }[] = [
  { id: "7d", label: "7 derniers jours" },
  { id: "30d", label: "30 derniers jours" },
  { id: "this_month", label: "Ce mois-ci" },
  { id: "this_year", label: "Cette année" },
];

export default function SellerSales() {
  const [period, setPeriod] = useState<SellerPeriod>("30d");
  const { data, isLoading, isError, refetch } = useSellerAnalytics("sales", period);

  const sales = data?.sales ?? [];
  const total = sales.reduce((sum, point) => sum + point.revenue, 0);
  const orders = sales.reduce((sum, point) => sum + point.orders, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-headline-md text-primary">Mes ventes</h1>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as SellerPeriod)}
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
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={formatPrice(total)} sub="sur la période" />
            <StatCard icon={BarChart3} label="Commandes" value={orders} sub="sur la période" />
            <StatCard
              icon={TrendingUp}
              label="Panier moyen"
              value={formatPrice(orders > 0 ? Math.round(total / orders) : 0)}
              sub="par commande"
            />
            <StatCard
              icon={BarChart3}
              label="Jours avec ventes"
              value={sales.filter((s) => s.revenue > 0).length}
              sub={`sur ${sales.length} jours`}
            />
          </div>

          <section className="card mt-6 p-5">
            <h2 className="font-display text-headline-sm text-primary">Revenus</h2>
            <div className="mt-4">
              <BarChart data={toChartData(sales)} formatValue={(v) => formatPrice(v)} />
            </div>
          </section>

          {data?.ordersByStatus && (
            <section className="card mt-6 p-5">
              <h2 className="font-display text-headline-sm text-primary">Commandes par statut</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {Object.entries(data.ordersByStatus).map(([status, count]) => (
                  <li
                    key={status}
                    className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3"
                  >
                    <StatusBadge kind="order" status={status as OrderStatus} />
                    <span className="font-display text-lg text-primary">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
