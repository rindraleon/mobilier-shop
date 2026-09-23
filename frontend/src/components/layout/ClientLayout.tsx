import { Outlet } from "react-router-dom";
import { Bell, Heart, LayoutDashboard, MapPin, Package, Store, User, Warehouse } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import DashboardShell, { type ShellNavItem } from "./DashboardShell";
import { useAuth } from "../../lib/auth/AuthProvider";

const baseItems: ShellNavItem[] = [
  { to: "/espace-client", icon: LayoutDashboard, label: "Aperçu", end: true },
  { to: "/espace-client/commandes", icon: Package, label: "Mes commandes" },
  { to: "/espace-client/notifications", icon: Bell, label: "Notifications" },
  { to: "/favoris", icon: Heart, label: "Mes favoris" },
  { to: "/espace-client/adresses", icon: MapPin, label: "Mes adresses" },
  { to: "/espace-client/profil", icon: User, label: "Mon profil" },
];

const menuItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/espace-client/profil", label: "Mon profil", icon: User },
  { to: "/espace-client/adresses", label: "Mes adresses", icon: MapPin },
];

const breadcrumbs = [{ label: "Accueil", to: "/" }, { label: "Espace client" }];

export default function ClientLayout() {
  const { user, isAdmin, isSeller, isApprovedSeller } = useAuth();

  if (!user) return null;

  const items = [...baseItems];
  if (!isSeller) {
    items.push({ to: "/devenir-vendeur", icon: Store, label: "Devenir vendeur" });
  }
  if (isSeller) {
    items.push({
      to: isApprovedSeller ? "/vendeur" : "/devenir-vendeur",
      icon: Store,
      label: "Espace vendeur",
    });
  }
  if (isAdmin) {
    items.push({ to: "/admin", icon: Warehouse, label: "Espace admin" });
  }

  return (
    <DashboardShell
      variant="light"
      title="Espace client"
      brandInitial={user.firstName?.charAt(0)?.toUpperCase() ?? "C"}
      brandName={user.fullName}
      brandTagline={user.email}
      items={items}
      menuItems={menuItems}
      notificationsTo="/espace-client/notifications"
      breadcrumbs={breadcrumbs}
    >
      <Outlet />
    </DashboardShell>
  );
}
