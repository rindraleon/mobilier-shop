import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Reveal from "../ui/Reveal";
import Stars from "../ui/Stars";
import Button from "../ui/Button";

interface HeroStat {
  value: string;
  label: string;
}

const stats: HeroStat[] = [
  { value: "12 000+", label: "clients satisfaits" },
  { value: "4,8/5", label: "note moyenne" },
  { value: "30 j", label: "retours offerts" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Décor */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-secondary-container/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[360px] w-[360px] rounded-full bg-secondary-container/25 blur-3xl" />

      <div className="container-app grid items-center gap-12 py-14 md:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary-container/50 px-4 py-1.5 text-label-md text-on-secondary-container">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Nouvelle collection · Saison 2026
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-display-md text-primary md:text-display-lg">
              Conçu pour le <em className="text-secondary">confort</em>.
              <br />
              Fait pour la vie.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-body-lg text-on-surface-variant">
              Des meubles dessinés pour durer, fabriqués avec des matériaux nobles et livrés chez vous en quelques
              jours. Élégance, confort et fonctionnalité — sans compromis.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button as={Link} to="/boutique" variant="accent" size="lg">
                <ShoppingBag size={19} /> Découvrir la boutique
              </Button>
              <Link
                to="/collections"
                className="group inline-flex items-center gap-2 text-label-lg text-primary transition-colors hover:text-secondary"
              >
                Explorer les collections
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <dl className="mt-12 flex flex-wrap gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-2xl text-primary">{s.value}</dd>
                  <dd className="text-label-sm uppercase tracking-wide text-on-surface-variant">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="relative">
          <div className="overflow-hidden rounded-xl shadow-card-hover">
            <img
              src="/images/hero.jpg"
              alt="Salon moderne et chaleureux signé Anti"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          {/* Cartes flottantes */}
          <div className="absolute -bottom-5 left-5 hidden rounded-lg bg-white/95 p-4 shadow-card-hover backdrop-blur sm:block">
            <Stars value={4.8} size={14} />
            <p className="mt-1 text-label-md text-primary">4,8/5 — 2 400 avis vérifiés</p>
          </div>
          <div className="absolute -top-4 right-4 rounded-lg bg-primary px-4 py-3 shadow-card-hover">
            <p className="text-label-sm uppercase tracking-widest text-primary-fixed-dim">Offre découverte</p>
            <p className="font-display text-lg text-on-primary">−10 % avec ANTI10</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
