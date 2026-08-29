import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, User, Warehouse } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import Avatar from "../ui/Avatar";
import Breadcrumbs from "../ui/Breadcrumbs";

interface ClientNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

const items: ClientNavItem[] = [
  { to: "/espace-client", icon: LayoutDashboard, label: "Aperçu", end: true },
  { to: "/espace-client/commandes", icon: Package, label: "Mes commandes" },
  { to: "/favoris", icon: Heart, label: "Mes favoris" },
  { to: "/espace-client/adresses", icon: MapPin, label: "Mes adresses" },
  { to: "/espace-client/profil", icon: User, label: "Mon profil" },
];

export default function ClientLayout() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Espace client" }]} />
      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="card p-4 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 border-b border-surface-container-highest pb-4">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-headline-sm text-primary">{user.name}</p>
                <p className="truncate text-label-sm text-on-surface-variant">{user.email}</p>
              </div>
            </div>
            <nav
              className="no-scrollbar mt-4 flex gap-1 overflow-x-auto lg:flex-col"
              aria-label="Navigation espace client"
            >
              {items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary-container text-on-secondary-container"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                    }`
                  }
                >
                  <Icon size={18} /> {label}
                </NavLink>
              ))}
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className="flex shrink-0 items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium text-secondary transition-colors hover:bg-surface-container"
                >
                  <Warehouse size={18} /> Espace admin
                </NavLink>
              )}
            </nav>
            <div className="mt-4 border-t border-surface-container-highest pt-4">
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} /> Se déconnecter
              </button>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
