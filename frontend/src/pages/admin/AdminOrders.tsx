import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { ClipboardList, Eye, Search } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useToast } from "../../context/ToastContext";
import type { Order, OrderStatus } from "../../types";
import { ORDER_STATUS, paymentLabel, shippingLabel } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import Modal from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Form";

interface Tab {
  id: string;
  label: string;
  count: number;
}

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const { toast } = useToast();

  const [tab, setTab] = useState<string>("toutes");
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<Order | null>(null);

  const tabs: Tab[] = [
    { id: "toutes", label: "Toutes", count: orders.length },
    ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((id) => ({
      id,
      label: ORDER_STATUS[id].label,
      count: orders.filter((o) => o.status === id).length,
    })),
  ];

  const filtered = useMemo<Order[]>(() => {
    const needle = query.trim().toLowerCase();
    return orders
      .filter((o) => tab === "toutes" || o.status === tab)
      .filter((o) => !needle || `${o.id} ${o.customerName} ${o.customerEmail}`.toLowerCase().includes(needle))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, tab, query]);

  const changeStatus = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    toast(`Commande ${id} → ${ORDER_STATUS[status].label.toLowerCase()}.`);
  };

  const onRowStatusChange = (order: Order) => (e: ChangeEvent<HTMLSelectElement>) =>
    changeStatus(order.id, e.target.value as OrderStatus);

  return (
    <div>
      <h1 className="font-display text-headline-lg text-primary">Commandes</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">Suivez et gérez les commandes de vos clients.</p>

      {/* Onglets */}
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-body-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary bg-primary text-on-primary"
                : "border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 text-xs font-bold ${tab === t.id ? "bg-white/20" : "bg-surface-container-high"}`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative mt-4 max-w-md">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="N° de commande, client, email…"
          className="pl-10"
          aria-label="Rechercher une commande"
        />
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucune commande"
            text="Aucune commande ne correspond à ces critères."
          />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-body-sm">
              <thead className="border-b border-surface-container-highest bg-surface-container-low text-label-sm uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3.5">Commande</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Statut</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {filtered.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-surface-container-low/60">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-primary">{order.id}</p>
                      <p className="text-on-surface-variant/70">
                        {order.items.reduce((s, it) => s + it.qty, 0)} article(s)
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-primary">{order.customerName}</p>
                      <p className="text-on-surface-variant/70">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3.5 text-on-surface-variant">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3.5 font-semibold text-primary">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={order.status} />
                        <select
                          value={order.status}
                          onChange={onRowStatusChange(order)}
                          aria-label={`Changer le statut de ${order.id}`}
                          className="rounded-md border border-outline-variant bg-white px-2 py-1 text-xs text-on-surface-variant focus:border-secondary focus:outline-none"
                        >
                          {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((id) => (
                            <option key={id} value={id}>
                              {ORDER_STATUS[id].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelected(order)}
                        aria-label={`Voir la commande ${order.id}`}
                        className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Détail */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Commande ${selected.id}` : ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-body-sm text-on-surface-variant">
                {formatDate(selected.createdAt)} · {paymentLabel(selected.paymentMethod)} ·{" "}
                {shippingLabel(selected.shippingMethod)}
              </p>
              <div className="w-52">
                <Select
                  value={selected.status}
                  onChange={(e) => {
                    const status = e.target.value as OrderStatus;
                    changeStatus(selected.id, status);
                    setSelected({ ...selected, status });
                  }}
                  aria-label="Statut de la commande"
                >
                  {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((id) => (
                    <option key={id} value={id}>
                      {ORDER_STATUS[id].label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-outline-variant/40 p-4">
                <h4 className="text-label-md text-on-surface-variant">Client</h4>
                <p className="mt-1.5 font-semibold text-primary">{selected.customerName}</p>
                <p className="text-body-sm text-on-surface-variant">{selected.customerEmail}</p>
              </div>
              <div className="rounded-lg border border-outline-variant/40 p-4">
                <h4 className="text-label-md text-on-surface-variant">Adresse de livraison</h4>
                <p className="mt-1.5 text-body-sm text-on-surface-variant">
                  <span className="font-semibold text-primary">{selected.shippingAddress.fullName}</span>
                  <br />
                  {selected.shippingAddress.address}
                  {selected.shippingAddress.address2 ? `, ${selected.shippingAddress.address2}` : ""}
                  <br />
                  {selected.shippingAddress.postalCode} {selected.shippingAddress.city},{" "}
                  {selected.shippingAddress.country}
                </p>
              </div>
            </div>

            <ul className="divide-y divide-surface-container-highest rounded-lg border border-outline-variant/40">
              {selected.items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 p-4">
                  <img src={item.image} alt={item.name} className="h-14 w-12 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-primary">{item.name}</p>
                    <p className="text-body-sm text-on-surface-variant">
                      {item.qty} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">{formatPrice(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Sous-total</span> <span>{formatPrice(selected.subtotal)}</span>
              </div>
              {selected.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Remise {selected.promoCode}</span> <span>−{formatPrice(selected.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>Livraison</span>
                <span>{selected.shippingCost === 0 ? "Offerte" : formatPrice(selected.shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/50 pt-2 font-semibold text-primary">
                <span>Total</span> <span className="font-display text-lg">{formatPrice(selected.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
