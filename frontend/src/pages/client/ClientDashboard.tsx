import { Link } from "react-router-dom";
import { ArrowRight, Heart, MapPin, Package, Sparkles, User, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useCart } from "../../context/CartContext";
import { formatDate, formatPrice } from "../../utils/format";
import StatCard from "../../components/ui/StatCard";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";

interface Shortcut {
  to: string;
  icon: LucideIcon;
  label: string;
  text: string;
}

const shortcuts: Shortcut[] = [
  { to: "/espace-client/commandes", icon: Package, label: "Mes commandes", text: "Suivre et consulter vos achats" },
  { to: "/favoris", icon: Heart, label: "Mes favoris", text: "Vos coups de cœur sauvegardés" },
  { to: "/espace-client/adresses", icon: MapPin, label: "Mes adresses", text: "Gérer vos adresses de livraison" },
  { to: "/espace-client/profil", icon: User, label: "Mon profil", text: "Modifier vos informations" },
];

export default function ClientDashboard() {
  const { user, orders } = useStore();
  const { wishlistCount } = useCart();

  if (!user) return null;

  const myOrders = orders
    .filter((o) => o.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalSpent = myOrders.filter((o) => o.status !== "annulee").reduce((s, o) => s + o.total, 0);
  const loyaltyPoints = Math.floor(totalSpent / 10);
  const lastOrder = myOrders[0];

  return (
    <div>
      <h1 className="font-display text-display-md text-primary">Bonjour {user.name.split(" ")[0]} 👋</h1>
      <p className="mt-2 text-body-lg text-on-surface-variant">Voici un aperçu de votre activité chez Anti.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Commandes" value={myOrders.length} sub="depuis votre inscription" />
        <StatCard icon={Wallet} label="Total dépensé" value={formatPrice(totalSpent)} sub="hors commandes annulées" />
        <StatCard icon={Heart} label="Favoris" value={wishlistCount} sub="articles mis de côté" />
        <StatCard icon={Sparkles} label="Points fidélité" value={loyaltyPoints} sub="1 € dépensé = 1 point" />
      </div>

      {/* Dernière commande */}
      {lastOrder && (
        <div className="card mt-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-headline-sm text-primary">Dernière commande</h2>
            <Link
              to={`/espace-client/commandes/${lastOrder.id}`}
              className="group inline-flex items-center gap-1.5 text-label-md text-secondary hover:underline"
            >
              Voir le détail <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-outline-variant/40 bg-surface-container-low p-4">
            <div className="flex -space-x-3">
              {lastOrder.items.slice(0, 3).map((item) => (
                <img
                  key={item.productId}
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-12 rounded-md border-2 border-white object-cover"
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">{lastOrder.id}</p>
              <p className="text-body-sm text-on-surface-variant">Passée le {formatDate(lastOrder.createdAt)}</p>
            </div>
            <OrderStatusBadge status={lastOrder.status} />
            <p className="font-display text-lg text-primary">{formatPrice(lastOrder.total)}</p>
          </div>
        </div>
      )}

      {/* Raccourcis */}
      <h2 className="mt-10 font-display text-headline-sm text-primary">Accès rapide</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map(({ to, icon: Icon, label, text }) => (
          <Link key={to} to={to} className="card group p-5 transition-all hover:-translate-y-1 hover:shadow-card-hover">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
              <Icon size={19} />
            </span>
            <p className="mt-3 font-semibold text-primary group-hover:text-secondary">{label}</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
