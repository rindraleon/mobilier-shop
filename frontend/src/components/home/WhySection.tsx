import { Hammer, HeartHandshake, Leaf, Ruler } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";

interface Reason {
  icon: LucideIcon;
  title: string;
  text: string;
}

const reasons: Reason[] = [
  { icon: Leaf, title: "Matériaux durables", text: "Bois certifié FSC et tissus naturels, sélectionnés pour durer." },
  { icon: Hammer, title: "Fabrication soignée", text: "Des ateliers partenaires européens, attachés au détail." },
  { icon: Ruler, title: "Design intemporel", text: "Des lignes épurées qui traversent les modes sans vieillir." },
  { icon: HeartHandshake, title: "Service attentionné", text: "Une équipe à votre écoute, avant comme après l'achat." },
];

interface StatNumber {
  value: string;
  label: string;
}

const numbers: StatNumber[] = [
  { value: "98 %", label: "de clients satisfaits" },
  { value: "5 ans", label: "de garantie" },
  { value: "100 %", label: "de bois certifié FSC" },
];

export default function WhySection() {
  return (
    <section className="bg-surface-container-low">
      <div className="container-app section grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative order-2 lg:order-1">
          <div className="h-full overflow-hidden rounded-xl shadow-card-hover">
            <img
              src="/images/atelier.jpg"
              alt="Artisan façonnant un meuble en chêne massif dans notre atelier"
              loading="lazy"
              className="aspect-[4/3] h-full w-full object-cover lg:aspect-auto lg:min-h-[560px]"
            />
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Nos engagements"
            title="Pourquoi choisir Anti ?"
            subtitle="Nous conjuguons design, confort et durabilité pour créer des meubles que vous aimerez longtemps — très longtemps."
          />
          <ul className="-mt-4 space-y-5">
            {reasons.map(({ icon: Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 0.1} className="group flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container transition-transform duration-300 group-hover:scale-110">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="text-label-lg text-primary">{title}</h3>
                  <p className="mt-0.5 text-body-md text-on-surface-variant">{text}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.3}>
            <div className="mt-10 grid grid-cols-3 gap-4 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6">
              {numbers.map((n) => (
                <div key={n.label} className="text-center">
                  <p className="font-display text-2xl text-secondary md:text-3xl">{n.value}</p>
                  <p className="mt-1 text-label-sm leading-snug text-on-surface-variant">{n.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
