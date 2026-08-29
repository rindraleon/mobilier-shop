import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { formatDate, formatPrice } from "../../utils/format";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Form";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomers() {
  const { users, orders } = useStore();
  const [query, setQuery] = useState<string>("");

  const rows = useMemo<CustomerRow[]>(() => {
    const needle = query.trim().toLowerCase();
    return users
      .filter((u) => !needle || `${u.name} ${u.email}`.toLowerCase().includes(needle))
      .map((u) => {
        const userOrders = orders.filter((o) => o.userId === u.id && o.status !== "annulee");
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          orderCount: userOrders.length,
          totalSpent: userOrders.reduce((s, o) => s + o.total, 0),
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [users, orders, query]);

  return (
    <div>
      <h1 className="font-display text-headline-lg text-primary">Clients</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        {users.filter((u) => u.role === "client").length} client(s) enregistré(s) sur la boutique.
      </p>

      <div className="relative mt-6 max-w-md">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom ou email…"
          className="pl-10"
          aria-label="Rechercher un client"
        />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState icon={Users} title="Aucun client trouvé" text="Modifiez votre recherche." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-body-sm">
              <thead className="border-b border-surface-container-highest bg-surface-container-low text-label-sm uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Rôle</th>
                  <th className="px-4 py-3.5">Inscription</th>
                  <th className="px-4 py-3.5">Commandes</th>
                  <th className="px-5 py-3.5 text-right">Total dépensé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-container-low/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-primary">{row.name}</p>
                          <p className="truncate text-on-surface-variant/70">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {row.role === "admin" ? <Badge variant="secondary">Admin</Badge> : <Badge variant="neutral">Client</Badge>}
                    </td>
                    <td className="px-4 py-3.5 text-on-surface-variant">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3.5 font-medium text-primary">{row.orderCount}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-primary">
                      {row.totalSpent > 0 ? formatPrice(row.totalSpent) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
