import { Outlet } from "react-router-dom";
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Sofa,
  Store,
  Tags,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import DashboardShell, { type ShellNavItem } from "./DashboardShell";
import { usePendingSellers } from "../../hooks/useAdmin";

const navItems: ShellNavItem[] = [
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

const menuItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Voir la boutique", icon: Store },
  { to: "/espace-client/profil", label: "Mon profil", icon: User },
];

export default function AdminLayout() {
  const { data: pending } = usePendingSellers();
  const pendingCount = pending?.length ?? 0;

  const items = navItems.map((item) =>
    item.to === "/admin/vendeurs" ? { ...item, badge: pendingCount } : item,
  );

  return (
    <DashboardShell
      title="Administration"
      brandInitial="A"
      brandName="Mobilier"
      brandTagline="Administration"
      items={items}
      menuItems={menuItems}
      notificationsTo="/espace-client/notifications"
    >
      <Outlet />
    </DashboardShell>
  );
}
