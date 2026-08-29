import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Facebook, Instagram, Send, Twitter, Youtube } from "lucide-react";
import { useToast } from "../../context/ToastContext";

interface FooterLink {
  label: string;
  to: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const shopLinks: FooterLink[] = [
  { label: "Tous les produits", to: "/boutique" },
  { label: "Salon", to: "/boutique?categorie=salon" },
  { label: "Chambre", to: "/boutique?categorie=chambre" },
  { label: "Salle à manger", to: "/boutique?categorie=salle-a-manger" },
  { label: "Bureau", to: "/boutique?categorie=bureau" },
];

const companyLinks: FooterLink[] = [
  { label: "À propos", to: "/a-propos" },
  { label: "Nos collections", to: "/collections" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const supportLinks: FooterLink[] = [
  { label: "Centre d'aide", to: "/contact" },
  { label: "Livraison & retours", to: "/contact" },
  { label: "Conditions générales", to: "/contact" },
  { label: "Politique de confidentialité", to: "/contact" },
];

const columns: FooterColumn[] = [
  { title: "Boutique", links: shopLinks },
  { title: "Société", links: companyLinks },
  { title: "Aide", links: supportLinks },
];

const socials: { icon: LucideIcon; label: string }[] = [
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: Twitter, label: "Twitter" },
  { icon: Youtube, label: "YouTube" },
];

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");

  const subscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Veuillez saisir une adresse email valide.", "error");
      return;
    }
    setEmail("");
    toast("Merci ! Vous êtes bien inscrit(e) à notre newsletter.");
  };

  return (
    <footer className="bg-primary text-on-primary">
      {/* Newsletter */}
      <div className="border-b border-on-primary/10">
        <div className="container-app grid gap-6 py-12 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-display text-headline-md">Restons en contact</h3>
            <p className="mt-2 text-body-md text-primary-fixed-dim">
              Recevez nos nouveautés, conseils déco et offres exclusives. Une fois par mois, pas plus.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              aria-label="Votre adresse email"
              className="h-12 w-full rounded-lg border border-on-primary/20 bg-white/10 px-4 text-body-md text-on-primary outline-none transition placeholder:text-primary-fixed-dim/70 focus:border-secondary-fixed-dim focus:ring-2 focus:ring-secondary-fixed-dim/30"
            />
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-secondary-fixed-dim px-5 font-semibold text-primary transition-colors hover:bg-white"
            >
              <Send size={17} /> <span className="hidden sm:inline">S'inscrire</span>
            </button>
          </form>
        </div>
      </div>

      {/* Colonnes */}
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link to="/" className="font-display text-2xl font-bold">
            Anti
          </Link>
          <p className="mt-4 max-w-xs text-body-md text-primary-fixed-dim">
            Du mobilier conçu pour le confort, fabriqué pour durer — pensé pour la vie que vous menez.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                onClick={(e) => e.preventDefault()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-on-primary/15 text-primary-fixed-dim transition-all hover:border-secondary-fixed-dim hover:text-white"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="mb-5 text-label-md uppercase tracking-widest text-secondary-fixed-dim">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-block text-body-md text-primary-fixed-dim transition-all hover:translate-x-1 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-on-primary/10">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-6 text-body-sm text-primary-fixed-dim/70 md:flex-row">
          <p>© 2026 Anti. Tous droits réservés.</p>
          <p>Conçu avec soin à Paris — fabriqué en Europe.</p>
        </div>
      </div>
    </footer>
  );
}
