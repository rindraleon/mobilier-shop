import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, LogOut, Package, Store, User, X } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthProvider";
import { NAV_LINKS } from "../../utils/navigation";
import Avatar from "../ui/Avatar";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, isAuthenticated, isAdmin, isSeller, isApprovedSeller, logout } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <aside className="absolute left-0 top-0 flex h-full w-full max-w-xs flex-col bg-surface-container-lowest shadow-drawer">
        <div className="flex items-center justify-between border-b border-surface-container-highest px-5 py-4">
          <span className="font-display text-xl font-bold text-primary">Menu</span>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
          >
            <X size={20} />
          </button>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-3 border-b border-surface-container-highest px-5 py-4">
            <Avatar name={user.fullName} size="md" />
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold text-primary">{user.fullName}</p>
              <p className="truncate text-label-sm text-on-surface-variant">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 text-body-md text-on-surface transition-colors hover:bg-surface-container"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-4 h-px bg-surface-container-high" />

          <ul className="space-y-1">
            {!isAuthenticated && (
              <li>
                <Link
                  to="/connexion"
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-body-md hover:bg-surface-container"
                >
                  <User size={18} /> Connexion / Inscription
                </Link>
              </li>
            )}

            {isAuthenticated && !isAdmin && !isSeller && (
              <>
                <li>
                  <Link
                    to="/espace-client"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-body-md hover:bg-surface-container"
                  >
                    <User size={18} /> Mon espace
                  </Link>
                </li>
                <li>
                  <Link
                    to="/espace-client/commandes"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-body-md hover:bg-surface-container"
                  >
                    <Package size={18} /> Mes commandes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/devenir-vendeur"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-body-md hover:bg-surface-container"
                  >
                    <Store size={18} /> Devenir vendeur
                  </Link>
                </li>
              </>
            )}

            {isSeller && (
              <li>
                <Link
                  to={isApprovedSeller ? "/vendeur" : "/devenir-vendeur"}
                  onClick={onClose}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-body-md hover:bg-surface-container"
                >
                  <Store size={18} /> Espace vendeur
                </Link>
              </li>
            )}

            {isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-body-md hover:bg-surface-container"
                  >
                    <LayoutDashboard size={18} /> Administration
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/vendeurs"
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-body-md hover:bg-surface-container"
                  >
                    <Store size={18} /> Vendeurs à valider
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {isAuthenticated && (
          <div className="border-t border-surface-container-highest p-3">
            <button
              onClick={() => {
                void logout();
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-body-md text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} /> Se déconnecter
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
