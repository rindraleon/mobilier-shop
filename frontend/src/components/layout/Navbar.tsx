import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useCartDrawer } from "../../context/CartDrawerContext";
import { useAuth } from "../../lib/auth/AuthProvider";
import { NAV_LINKS } from "../../utils/navigation";
import Avatar from "../ui/Avatar";
import NotificationsBell from "../notifications/NotificationsBell";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";

interface IconBtnProps {
  onClick: () => void;
  label: string;
  badge?: number;
  children: ReactNode;
}

function IconBtn({ onClick, label, badge = 0, children }: Readonly<IconBtnProps>) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-container hover:text-secondary"
    >
      {children}
      {badge > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-on-secondary">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, isAdmin, isSeller, isApprovedSeller, logout } = useAuth();
  const { openCart } = useCartDrawer();
  // Le panier est serveur : on ne le requête que pour une session active.
  const { data: cart } = useCart(isAuthenticated);
  const { data: wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async (): Promise<void> => {
    setUserMenuOpen(false);
    await logout();
    navigate("/");
  };

  const cartCount = cart?.quantity ?? 0;
  const wishlistCount = wishlist?.length ?? 0;

  return (
    <>
      
      <header
        className={`sticky top-0 z-50 border-b border-surface-container-highest bg-surface/90 backdrop-blur-md transition-all duration-300 ${
          scrolled ? "py-1.5 shadow-card" : "py-3.5"
        }`}
      >
        <div className="container-app flex items-center justify-between gap-4">
          <Link
            to="/"
            className="font-display text-2xl font-bold tracking-tight text-primary"
            aria-label="MOBILIER-SHOP — retour à l'accueil"
          >
            Mobilier<span className="text-secondary">Shop</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `border-b-2 pb-0.5 text-body-md transition-colors hover:text-secondary ${
                    isActive
                      ? "border-secondary font-semibold text-secondary"
                      : "border-transparent text-on-surface-variant"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <IconBtn onClick={() => setSearchOpen(true)} label="Rechercher">
              <Search size={21} />
            </IconBtn>
            <IconBtn onClick={() => navigate("/favoris")} label="Mes favoris" badge={wishlistCount}>
              <Heart size={21} />
            </IconBtn>
            <IconBtn onClick={openCart} label="Mon panier" badge={cartCount}>
              <ShoppingBag size={21} />
            </IconBtn>

            {isAuthenticated && <NotificationsBell />}

            {user ? (
              <div className="relative ml-1 hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-primary transition-colors hover:bg-surface-container"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <Avatar name={user.fullName} size="sm" />
                  <span className="hidden max-w-[110px] truncate text-body-sm font-medium xl:inline">
                    {user.firstName}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-lg border border-outline-variant/50 bg-white p-2 shadow-card-hover animate-scale-in">
                    <div className="border-b border-surface-container-highest px-3 py-2.5">
                      <p className="truncate text-body-sm font-semibold text-primary">
                        {user.fullName}
                      </p>
                      <p className="truncate text-label-sm text-on-surface-variant">{user.email}</p>
                    </div>
                    <div className="mt-2 flex flex-col">
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          >
                            <LayoutDashboard size={17} /> Administration
                          </Link>
                          <Link
                            to="/admin/vendeurs"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          >
                            <Store size={17} /> Vendeurs à valider
                          </Link>
                        </>
                      )}

                      {isSeller && (
                        <Link
                          to={isApprovedSeller ? "/vendeur" : "/devenir-vendeur"}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                        >
                          <Store size={17} /> Mon espace vendeur
                        </Link>
                      )}

                      {!isAdmin && !isSeller && (
                        <>
                          <Link
                            to="/espace-client"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          >
                            <User size={17} /> Mon espace client
                          </Link>
                          <Link
                            to="/espace-client/commandes"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          >
                            <Package size={17} /> Mes commandes
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => void handleLogout()}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-body-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut size={17} /> Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/connexion"
                className="ml-2 hidden items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary transition-all duration-300 hover:bg-secondary hover:shadow-card-hover md:inline-flex"
              >
                <User size={16} /> Connexion
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-container lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
