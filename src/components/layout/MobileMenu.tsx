import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, X } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { NAV_LINKS } from "../../utils/navigation";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, logout } = useStore();
  const navigate = useNavigate();

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
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-surface-container-lowest shadow-drawer animate-slide-left">
        <div className="flex items-center justify-between border-b border-surface-container-highest p-4">
          <span className="font-display text-xl font-bold text-primary">Anti</span>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4" aria-label="Navigation mobile">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-body-md transition-colors ${
                      isActive
                        ? "bg-secondary-container font-semibold text-on-secondary-container"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-surface-container-highest p-4">
          {user ? (
            <>
              <div className="mb-3 flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold text-primary">{user.name}</p>
                  <p className="truncate text-label-sm text-on-surface-variant">
                    {user.role === "admin" ? "Administrateur" : "Espace client"}
                  </p>
                </div>
              </div>
              <Button
                as={Link}
                to={user.role === "admin" ? "/admin" : "/espace-client"}
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                <LayoutDashboard size={16} />
                {user.role === "admin" ? "Tableau de bord" : "Mon espace"}
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  logout();
                  onClose();
                  navigate("/");
                }}
              >
                Se déconnecter
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/connexion" onClick={onClose} className="w-full">
                Connexion / Inscription
              </Button>
              <Button as={Link} to="/boutique" onClick={onClose} variant="outline" className="w-full">
                Découvrir la boutique
              </Button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
