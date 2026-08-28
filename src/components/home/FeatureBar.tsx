import { Award, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Reveal from "../ui/Reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

const features: Feature[] = [
  { icon: Award, title: "Qualité premium", text: "Matériaux nobles et finitions soignées" },
  { icon: Truck, title: "Livraison offerte", text: "Dès 300 € d'achat, partout en France" },
  { icon: RotateCcw, title: "Retours faciles", text: "30 jours pour changer d'avis" },
  { icon: ShieldCheck, title: "Paiement sécurisé", text: "Transactions 100 % protégées" },
];

export default function FeatureBar() {
  return (
    <section className="border-y border-surface-container-highest bg-surface-container-low">
      <div className="container-app grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {features.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.1} className="flex flex-col items-center text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
              <Icon size={22} />
            </span>
            <h3 className="text-label-md text-primary">{title}</h3>
            <p className="mt-1 text-label-sm text-on-surface-variant">{text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
