import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Euro, Receipt, ShoppingBag, Users } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { ORDER_STATUS } from "../../utils/constants";
import type { OrderStatus } from "../../types";
import { formatDate, formatPrice, monthlyRevenue } from "../../utils/format";
import StatCard from "../../components/ui/StatCard";
import BarChart from "../../components/ui/BarChart";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";

export default function AdminDashboard() {
  const { orders, users, products } = useStore();

  const validOrders = orders.filter((o) => o.status !== "annulee");
  const revenue = validOrders.reduce((s, o) => s + o.total, 0);
  const clients = users.filter((u) => u.role === "client");
  const avgBasket = validOrders.length ? revenue / validOrders.length : 0;
  const chartData = monthlyRevenue(orders, 6);
  const thisMonth = chartData[chartData.length - 1]?.value ?? 0;
  const lastMonth = chartData[chartData.length - 2]?.value ?? 0;
  const trend = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;
  const trendPrefix = trend !== null && trend >= 0 ? "+" : "";
  const trendLabel = trend !== null ? `${trendPrefix}${trend} % vs mois dernier` : undefined;

  const statusCounts = (Object.keys(ORDER_STATUS) as OrderStatus[]).map((id) => ({
    id,
    ...ORDER_STATUS[id],
    count: orders.filter((o) => o.status === id).length,
  }));

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  return (
    <div>
      <h1 className="font-display text-headline-lg text-primary">Tableau de bord</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">Vue d'ensemble de votre boutique.</p>

      {/* KPI */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Euro} label="Chiffre d'affaires" value={formatPrice(revenue)} sub="commandes non annulées" />
        <StatCard
          icon={ShoppingBag}
          label="Commandes"
          value={orders.length}
          sub={`${orders.filter((o) => o.status === "en_attente").length} en attente de traitement`}
        />
        <StatCard icon={Users} label="Clients" value={clients.length} sub="comptes enregistrés" />
        <StatCard
          icon={Receipt}
          label="Panier moyen"
          value={formatPrice(avgBasket)}
          sub={trendLabel}
          trend={trend}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Graphique */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-headline-sm text-primary">Revenus — 6 derniers mois</h2>
            {trend !== null && (
              <span className={`text-body-sm font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} % ce mois-ci
              </span>
            )}
          </div>
          <div className="mt-6">
            <BarChart data={chartData} formatValue={(v) => (v > 0 ? formatPrice(v).replace(",00", "") : "—")} />
          </div>
        </div>

        {/* Répartition */}
        <div className="card p-6">
          <h2 className="font-display text-headline-sm text-primary">Statuts des commandes</h2>
          <ul className="mt-5 space-y-3">
            {statusCounts.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                <span className="flex-1 text-body-sm text-on-surface-variant">{s.label}</span>
                <span className="text-body-sm font-semibold text-primary">{s.count}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/admin/commandes"
            className="mt-5 inline-flex items-center gap-1.5 text-label-md text-secondary hover:underline"
          >
            Gérer les commandes <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Dernières commandes */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-surface-container-highest px-6 py-4">
            <h2 className="font-display text-headline-sm text-primary">Dernières commandes</h2>
            <Link to="/admin/commandes" className="text-label-md text-secondary hover:underline">
              Tout voir
            </Link>
          </div>
          <ul className="divide-y divide-surface-container-highest">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
                <span className="font-semibold text-primary">{order.id}</span>
                <span className="min-w-0 flex-1 truncate text-body-sm text-on-surface-variant">
                  {order.customerName} · {formatDate(order.createdAt)}
                </span>
                <OrderStatusBadge status={order.status} />
                <span className="w-20 text-right font-semibold text-primary">{formatPrice(order.total)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stock faible */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface-container-highest px-6 py-4">
            <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <AlertTriangle size={17} className="text-amber-500" /> Stock faible
            </h2>
            <Link to="/admin/produits" className="text-label-md text-secondary hover:underline">
              Gérer
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-6 py-8 text-center text-body-sm text-on-surface-variant">
              Tous les stocks sont confortables. 👍
            </p>
          ) : (
            <ul className="divide-y divide-surface-container-highest">
              {lowStock.map((p) => {
                let stockLabel = `${p.stock} restant`;
                if (p.stock === 0) stockLabel = "Rupture";
                else if (p.stock > 1) stockLabel += "s";

                return (
                  <li key={p.id} className="flex items-center gap-3 px-6 py-3">
                    <img src={p.image} alt={p.name} className="h-11 w-9 rounded-md object-cover" />
                    <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-primary">{p.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {stockLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
