import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import Stars from "../ui/Stars";
import Avatar from "../ui/Avatar";

interface Testimonial {
  name: string;
  city: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Claire Dubois",
    city: "Lyon",
    rating: 5,
    text: "La qualité de fabrication est exceptionnelle. Mon canapé Oslo est devenu la pièce maîtresse de mon salon, et la livraison a été impeccable.",
  },
  {
    name: "Marc Lefèvre",
    city: "Bordeaux",
    rating: 5,
    text: "J'ai commandé la table Oakridge pour nos repas de famille. Superbe finition, bois magnifique. Je recommande vivement.",
  },
  {
    name: "Nadia Benali",
    city: "Lille",
    rating: 4,
    text: "Service client adorable et retours ultra simples. Les chaises Élise sont parfaites pour mon coin repas.",
  },
];

export default function Testimonials() {
  return (
    <section className="container-app section">
      <SectionHeading
        center
        eyebrow="Avis clients"
        title="Ils ont meublé leur vie avec Anti"
        subtitle="Plus de 12 000 clients nous font confiance pour équiper leur intérieur."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <figure className="card flex h-full flex-col p-6">
              <Stars value={t.rating} size={16} />
              <blockquote className="mt-4 flex-1 text-body-md italic leading-relaxed text-on-surface-variant">
                « {t.text} »
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-surface-container-highest pt-4">
                <Avatar name={t.name} />
                <div>
                  <p className="text-body-sm font-semibold text-primary">{t.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{t.city}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
