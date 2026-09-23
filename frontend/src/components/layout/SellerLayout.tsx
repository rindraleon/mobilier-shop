import { Outlet } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Sofa,
  Store,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import DashboardShell, { type ShellNavItem } from "./DashboardShell";
import { useAuth } from "../../lib/auth/AuthProvider";

const navItems: ShellNavItem[] = [
  { to: "/vendeur", icon: LayoutDashboard, label: "Tableau de bord", end: true },
  { to: "/vendeur/produits", icon: Sofa, label: "Mes produits" },
  { to: "/vendeur/commandes", icon: ClipboardList, label: "Commandes" },
  { to: "/vendeur/ventes", icon: BarChart3, label: "Ventes & stats" },
  { to: "/vendeur/paiements", icon: Wallet, label: "Paiements" },
  { to: "/vendeur/profil", icon: Store, label: "Ma boutique" },
];

const menuItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/vendeur/profil", label: "Ma boutique", icon: Store },
  { to: "/", label: "Voir la boutique", icon: ArrowLeft },
];

export default function SellerLayout() {
  const { user } = useAuth();

  return (
    <DashboardShell
      title="Espace vendeur"
      brandInitial="V"
      brandName="Mobilier"
      brandTagline={user?.email}
      items={navItems}
      menuItems={menuItems}
      notificationsTo="/espace-client/notifications"
    >
      <Outlet />
    </DashboardShell>
  );
}
