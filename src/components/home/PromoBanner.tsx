import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../ui/Reveal";

export default function PromoBanner() {
  return (
    <section className="container-app pb-14 md:pb-20 lg:pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl bg-primary px-6 py-12 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary-fixed-dim/10 blur-3xl" />

          <p className="text-label-md uppercase tracking-[0.2em] text-secondary-fixed-dim">Offre découverte</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-display-md text-on-primary">
            −10 % sur votre première commande
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-body-lg text-primary-fixed-dim">
            Utilisez le code ci-dessous lors du paiement. Cumulable avec la livraison offerte dès 300 €.
          </p>

          <div className="mx-auto mt-7 inline-flex items-center gap-3 rounded-lg border border-dashed border-secondary-fixed-dim/60 bg-white/5 px-6 py-3">
            <Tag size={18} className="text-secondary-fixed-dim" />
            <span className="font-display text-2xl tracking-[0.25em] text-on-primary">ANTI10</span>
          </div>

          <div className="mt-8">
            <Button as={Link} to="/boutique" variant="light" size="lg">
              J'en profite <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
