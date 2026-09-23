import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "../../lib/auth/AuthProvider";
import { useUnreadNotificationsCount } from "../../hooks/useNotifications";
import Avatar from "../ui/Avatar";
import Breadcrumbs from "../ui/Breadcrumbs";

export interface ShellNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  badge?: number;
}

export interface DashboardShellProps {
  title: string;
  brandInitial: string;
  brandName: string;
  brandTagline?: string;
  items: ShellNavItem[];
  variant?: "dark" | "light";
  notificationsTo?: string;
  menuItems?: { to: string; label: string; icon: LucideIcon }[];
  breadcrumbs?: { label: string; to?: string }[];
  children: React.ReactNode;
}

const SIDEBAR = {
  dark: {
    panel: "bg-primary text-on-primary",
    muted: "text-primary-fixed-dim",
    hover: "hover:bg-primary-container hover:text-white",
    active: "bg-secondary text-on-secondary",
    divider: "border-on-primary/10",
    chip: "bg-secondary-fixed-dim text-primary",
  },
  light: {
    panel: "border-r border-outline-variant bg-surface text-on-surface",
    muted: "text-on-surface-variant",
    hover: "hover:bg-surface-container hover:text-primary",
    active: "bg-secondary-container text-on-secondary-container",
    divider: "border-outline-variant",
    chip: "bg-secondary-container text-on-secondary-container",
  },
} as const;

function UserMenu({
  items,
  variant,
}: {
  items: { to: string; label: string; icon: LucideIcon }[];
  variant: "dark" | "light";
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const dark = variant === "dark";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors ${
          dark ? "hover:bg-primary-container" : "hover:bg-surface-container"
        }`}
      >
        <Avatar name={user.fullName} size="sm" />
        <span
          className={`hidden max-w-[10rem] truncate text-body-sm font-medium sm:block ${
            dark ? "text-white" : "text-on-surface"
          }`}
        >
          {user.firstName || user.fullName}
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""} ${
            dark ? "text-primary-fixed-dim" : "text-on-surface-variant"
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-card-hover"
        >
          <div className="border-b border-outline-variant px-4 py-3">
            <p className="truncate text-body-sm font-semibold text-on-surface">{user.fullName}</p>
            <p className="truncate text-label-sm text-on-surface-variant">{user.email}</p>
          </div>
          <nav className="p-1.5">
            {items.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
              >
                <Icon size={17} /> {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-outline-variant p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void logout();
                navigate("/");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={17} /> Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardShell({
  title,
  brandInitial,
  brandName,
  brandTagline,
  items,
  variant = "dark",
  notificationsTo,
  menuItems = [],
  breadcrumbs,
  children,
}: DashboardShellProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const theme = SIDEBAR[variant];
  const dark = variant === "dark";
  const { data: unread } = useUnreadNotificationsCount();
  const unreadCount = typeof unread === "number" ? unread : (unread?.count ?? 0);

  useEffect(() => {
    setDrawer(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setDrawer(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const navList = (compact = false) => (
    <nav
      className={`thin-scroll flex flex-1 flex-col gap-1 overflow-y-auto ${compact ? "" : "pr-1"}`}
      aria-label={`Navigation ${title}`}
    >
      {items.map(({ to, icon: Icon, label, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setDrawer(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium transition-colors ${
              isActive ? theme.active : `${theme.muted} ${theme.hover}`
            }`
          }
        >
          <Icon size={18} />
          <span className="flex-1 truncate">{label}</span>
          {badge ? (
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                dark ? "bg-secondary text-on-secondary" : "bg-secondary text-on-secondary"
              }`}
            >
              {badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <div className={`space-y-1 border-t pt-4 ${theme.divider}`}>
      <NavLink
        to="/"
        className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-body-sm font-medium transition-colors ${theme.muted} ${theme.hover}`}
      >
        Voir la boutique
      </NavLink>
      <button
        type="button"
        onClick={() => {
          void logout();
          navigate("/");
        }}
        className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-body-sm font-medium transition-colors ${
          dark
            ? `${theme.muted} hover:bg-red-500/20 hover:text-white`
            : "text-red-600 hover:bg-red-50"
        }`}
      >
        <LogOut size={18} /> Se déconnecter
      </button>
    </div>
  );

  const brand = (
    <Link to={items[0]?.to ?? "/"} className="mb-8 flex items-center gap-2.5">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-lg font-bold ${theme.chip}`}
      >
        {brandInitial}
      </span>
      <div className="min-w-0">
        <p
          className={`truncate font-display text-lg font-bold leading-tight ${
            dark ? "" : "text-primary"
          }`}
        >
          {brandName}
        </p>
        {brandTagline ? (
          <p className={`truncate text-label-sm ${theme.muted}`}>{brandTagline}</p>
        ) : null}
      </div>
    </Link>
  );

  return (
    <div className={dark ? "min-h-screen bg-surface-container-low/60" : "min-h-screen bg-surface"}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden w-64 flex-col p-5 lg:flex ${theme.panel}`}
      >
        {brand}
        {navList()}
        {sidebarFooter}
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <div className={`relative h-full w-72 max-w-[85vw] p-5 shadow-2xl ${theme.panel}`}>
            <div className="mb-4 flex items-center justify-between">
              {brand}
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Fermer le menu"
                className={`rounded-lg p-1.5 ${theme.muted} ${theme.hover}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex h-[calc(100%-5.5rem)] flex-col">
              {navList(true)}
              {sidebarFooter}
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header
          className={`sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 sm:px-6 ${
            dark
              ? "border-outline-variant bg-surface/90 text-on-surface backdrop-blur"
              : "border-outline-variant bg-surface/90 backdrop-blur"
          }`}
        >
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Ouvrir le menu"
            className="-ml-1 rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container lg:hidden"
          >
            <Menu size={20} />
          </button>

          <h1 className="min-w-0 flex-1 truncate font-display text-headline-sm text-primary">
            {title}
          </h1>

          {notificationsTo ? (
            <Link
              to={notificationsTo}
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} non lues)` : ""}`}
              className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            >
              <Bell size={19} />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          <UserMenu items={menuItems} variant={variant} />
        </header>

        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {breadcrumbs?.length ? (
            <div className="mb-5">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
