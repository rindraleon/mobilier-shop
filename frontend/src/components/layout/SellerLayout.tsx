import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Sofa,
  Store,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthProvider";

interface SellerNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

/** Navigation de l'espace vendeur (§13). */
const navItems: SellerNavItem[] = [
  { to: "/vendeur", icon: LayoutDashboard, label: "Tableau de bord", end: true },
  { to: "/vendeur/produits", icon: Sofa, label: "Mes produits" },
  { to: "/vendeur/commandes", icon: ClipboardList, label: "Commandes" },
  { to: "/vendeur/ventes", icon: BarChart3, label: "Ventes & stats" },
  { to: "/vendeur/paiements", icon: Wallet, label: "Paiements" },
  { to: "/vendeur/profil", icon: Store, label: "Ma boutique" },
];

export default function SellerLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-container-low/60">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-primary p-5 text-on-primary lg:flex">
          <Link to="/vendeur" className="mb-8 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary-fixed-dim font-display text-lg font-bold text-primary">
              V
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-tight">Espace vendeur</p>
              <p className="truncate text-label-sm text-primary-fixed-dim">{user?.email}</p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-1" aria-label="Navigation vendeur">
            {navItems.map(({ to, icon: Icon, label, end }) => (
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
                <Icon size={18} /> {label}
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
          <header className="sticky top-0 z-40 bg-primary px-4 py-3 text-on-primary lg:hidden">
            <div className="flex items-center justify-between">
              <Link to="/vendeur" className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-fixed-dim font-display text-base font-bold text-primary">
                  V
                </span>
                <p className="font-display text-lg font-bold">Vendeur</p>
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
            <nav
              className="no-scrollbar -mx-1 mt-3 flex gap-1 overflow-x-auto pb-1"
              aria-label="Navigation vendeur mobile"
            >
              {navItems.map(({ to, icon: Icon, label, end }) => (
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
