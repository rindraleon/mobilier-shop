import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { collections } from "../../data/collections";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import Reveal from "../../components/ui/Reveal";
import Badge from "../../components/ui/Badge";

const [first, ...rest] = collections;

export default function Collections() {
  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Collections" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-display-md text-primary">Nos collections</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Des univers pensés par nos designers pour s'accorder pièce par pièce. Chaque collection raconte une
          histoire — à vous de choisir la vôtre.
        </p>
      </div>

      {/* Collection vedette */}
      <Reveal className="mt-10">
        <Link
          to={`/boutique?collection=${first.slug}`}
          className="group grid overflow-hidden rounded-xl bg-primary shadow-card-hover md:grid-cols-2"
        >
          <div className="overflow-hidden">
            <img
              src={first.image}
              alt={first.name}
              className="h-full max-h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <Badge variant="neutral" className="w-fit border-secondary-fixed-dim/40 text-secondary-fixed-dim">
              Collection vedette
            </Badge>
            <h2 className="mt-4 font-display text-display-md text-on-primary">{first.name}</h2>
            <p className="mt-1 text-label-md uppercase tracking-widest text-secondary-fixed-dim">{first.tagline}</p>
            <p className="mt-4 text-body-lg text-primary-fixed-dim">{first.description}</p>
            <p className="mt-6 inline-flex items-center gap-2 font-semibold text-on-primary transition-colors group-hover:text-white">
              Découvrir les {first.productIds.length} pièces
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
            </p>
          </div>
        </Link>
      </Reveal>

      {/* Autres collections */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {rest.map((col, i) => (
          <Reveal key={col.id} delay={i * 0.1}>
            <Link
              to={`/boutique?collection=${col.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="aspect-[16/10] overflow-hidden bg-surface-container">
                <img
                  src={col.image}
                  alt={col.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-label-md uppercase tracking-widest text-secondary">{col.tagline}</p>
                <h3 className="mt-2 font-display text-headline-md text-primary">{col.name}</h3>
                <p className="mt-2 flex-1 text-body-sm text-on-surface-variant">{col.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-label-md text-on-surface-variant">
                    {col.productIds.length} pièce{col.productIds.length > 1 ? "s" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-label-md text-secondary">
                    Explorer <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-secondary-container/40 p-8 text-center md:p-10">
        <h2 className="font-display text-headline-md text-primary">Un projet d'aménagement complet ?</h2>
        <p className="mx-auto mt-3 max-w-xl text-body-md text-on-surface-variant">
          Nos conseillers vous aident à composer un intérieur cohérent, collection après collection, avec des
          remises dès 3 pièces achetées.
        </p>
        <Button as={Link} to="/contact" variant="accent" className="mt-6">
          Prendre rendez-vous
        </Button>
      </div>
    </div>
  );
}
