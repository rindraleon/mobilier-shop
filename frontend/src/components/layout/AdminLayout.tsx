import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Sofa,
  Store,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthProvider";
import { usePendingSellers } from "../../hooks/useAdmin";

interface AdminNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  badge?: number;
}

/** Navigation complète de l'espace administrateur (§15). */
const navItems: AdminNavItem[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord", end: true },
  { to: "/admin/vendeurs", icon: Store, label: "Vendeurs" },
  { to: "/admin/produits", icon: Sofa, label: "Produits" },
  { to: "/admin/commandes", icon: ClipboardList, label: "Commandes" },
  { to: "/admin/paiements", icon: Wallet, label: "Paiements" },
  { to: "/admin/clients", icon: Users, label: "Clients" },
  { to: "/admin/categories", icon: Tags, label: "Catégories" },
  { to: "/admin/statistiques", icon: BarChart3, label: "Statistiques" },
  { to: "/admin/journal", icon: ClipboardCheck, label: "Journal d'audit" },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // Les demandes en attente sont signalées directement dans la barre latérale.
  const { data: pending } = usePendingSellers();
  const pendingCount = pending?.length ?? 0;

  const items = navItems.map((item) =>
    item.to === "/admin/vendeurs" ? { ...item, badge: pendingCount } : item,
  );

  return (
    <div className="min-h-screen bg-surface-container-low/60">
      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-primary p-5 text-on-primary lg:flex">
          <Link to="/admin" className="mb-8 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-fixed-dim font-display text-lg font-bold text-primary">
              M
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight">Mobilier</p>
              <p className="text-label-sm text-primary-fixed-dim">Administration</p>
            </div>
          </Link>

          <nav className="thin-scroll flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Navigation admin">
            {items.map(({ to, icon: Icon, label, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-on-secondary"
                      : "text-primary-fixed-dim hover:bg-primary-container hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span className="flex-1 truncate">{label}</span>
                {badge ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-bold text-on-secondary">
                    {badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-1 border-t border-on-primary/10 pt-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium text-primary-fixed-dim transition-colors hover:bg-primary-container hover:text-white"
            >
              <ArrowLeft size={18} /> Voir la boutique
            </Link>
            <button
              onClick={() => {
                void logout();
                navigate("/");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-body-sm font-medium text-primary-fixed-dim transition-colors hover:bg-red-500/20 hover:text-white"
            >
              <LogOut size={18} /> Se déconnecter
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Barre mobile */}
          <header className="sticky top-0 z-40 bg-primary px-4 py-3 text-on-primary lg:hidden">
            <div className="flex items-center justify-between">
              <Link to="/admin" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-fixed-dim font-display text-base font-bold text-primary">
                  M
                </span>
                <p className="font-display text-lg font-bold">Admin</p>
              </Link>
              <div className="flex items-center gap-1">
                <Link to="/" aria-label="Voir la boutique" className="rounded-lg p-2 text-primary-fixed-dim hover:text-white">
                  <ArrowLeft size={19} />
                </Link>
                <button
                  onClick={() => {
                    void logout();
                    navigate("/");
                  }}
                  aria-label="Se déconnecter"
                  className="rounded-lg p-2 text-primary-fixed-dim hover:text-white"
                >
                  <LogOut size={19} />
                </button>
              </div>
            </div>
            <nav
              className="no-scrollbar -mx-1 mt-3 flex gap-1 overflow-x-auto pb-1"
              aria-label="Navigation admin mobile"
            >
              {items.map(({ to, icon: Icon, label, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-body-sm font-medium transition-colors ${
                      isActive ? "bg-secondary text-on-secondary" : "text-primary-fixed-dim hover:bg-primary-container"
                    }`
                  }
                >
                  <Icon size={16} /> {label}
                  {badge ? <span className="text-[10px] font-bold">({badge})</span> : null}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
