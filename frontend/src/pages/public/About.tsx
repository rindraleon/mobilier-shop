import { Link } from "react-router-dom";
import { Hammer, HeartHandshake, Leaf, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import SectionHeading from "../../components/ui/SectionHeading";
import Reveal from "../../components/ui/Reveal";
import Button from "../../components/ui/Button";

interface Value {
  icon: LucideIcon;
  title: string;
  text: string;
}

const values: Value[] = [
  {
    icon: Hammer,
    title: "Savoir-faire",
    text: "Chaque meuble est assemblé par des artisans dont certains travaillent avec nous depuis le premier jour. Le détail est notre signature.",
  },
  {
    icon: Leaf,
    title: "Durabilité",
    text: "Bois certifié FSC, colles sans solvant, emballages recyclés : nous concevons des meubles qui ne se jettent pas, ils se transmettent.",
  },
  {
    icon: HeartHandshake,
    title: "Accessibilité",
    text: "Le beau meuble ne doit pas être un luxe. En vendant en direct, nous supprimons les intermédiaires et garantissons un juste prix.",
  },
];

interface Stat {
  value: string;
  label: string;
}

const numbers: Stat[] = [
  { value: "8", label: "ans d'expertise" },
  { value: "12 000+", label: "clients accompagnés" },
  { value: "40", label: "artisans partenaires" },
  { value: "98 %", label: "de clients satisfaits" },
];

export default function About() {
  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "À propos" }]} />

      {/* Intro */}
      <div className="mt-4 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-display-md text-primary">
            Le mobilier comme art de vivre — depuis 2018
          </h1>
          <p className="mt-5 text-body-lg text-on-surface-variant">
            Anti est né d'un constat simple : la plupart des meubles modernes sont soit beaux mais fragiles, soit
            solides mais tristes. Nous avons choisi un troisième chemin — celui de pièces élégantes, fabriquées
            pour durer et vendues au juste prix.
          </p>
          <p className="mt-4 text-body-lg text-on-surface-variant">
            Huit ans plus tard, nos meubles habitent plus de 12 000 foyers, de Paris à Antananarivo, et notre
            exigence n'a pas bougé d'un millimètre.
          </p>
        </div>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-xl shadow-card-hover">
            <img
              src="/images/atelier.jpg"
              alt="Notre atelier de fabrication"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
      </div>

      {/* Chiffres */}
      <div className="mt-14 grid grid-cols-2 gap-6 rounded-xl bg-primary p-8 text-center md:grid-cols-4 md:p-12">
        {numbers.map((n) => (
          <div key={n.label}>
            <p className="font-display text-4xl text-secondary-fixed-dim">{n.value}</p>
            <p className="mt-2 text-label-sm uppercase tracking-wide text-primary-fixed-dim">{n.label}</p>
          </div>
        ))}
      </div>

      {/* Valeurs */}
      <div className="section">
        <SectionHeading center eyebrow="Nos valeurs" title="Ce qui nous anime" />
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="card h-full p-7">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                  <Icon size={22} />
                </span>
                <h3 className="font-display text-headline-sm text-primary">{title}</h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Reveal>
        <div className="rounded-xl bg-secondary-container/40 p-8 text-center md:p-12">
          <h2 className="font-display text-headline-lg text-primary">Prêt à nous rejoindre ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-body-lg text-on-surface-variant">
            Découvrez la collection signature et trouvez la pièce qui manquait à votre intérieur.
          </p>
          <Button as={Link} to="/boutique" variant="accent" size="lg" className="mt-7">
            <ShoppingBag size={18} /> Découvrir la boutique
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
