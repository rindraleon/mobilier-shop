export interface NavLinkItem {
  to: string;
  label: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { to: "/", label: "Accueil" },
  { to: "/boutique", label: "Boutique" },
  { to: "/collections", label: "Collections" },
  { to: "/a-propos", label: "À propos" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];
