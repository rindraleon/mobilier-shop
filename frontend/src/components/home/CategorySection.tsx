import { Link } from "react-router-dom";
import { categories } from "../../data/products";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";

export default function CategorySection() {
  return (
    <section className="container-app section">
      <SectionHeading
        eyebrow="Univers"
        title="Parcourir par catégorie"
        subtitle="Six univers complémentaires pour meubler toute votre maison avec cohérence."
        action={
          <Button as={Link} to="/boutique" variant="outline">
            Tous les produits
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:gap-6 lg:grid-cols-6">
        {categories.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 0.07}>
            <Link to={`/boutique?categorie=${cat.id}`} className="group flex flex-col items-center text-center">
              <div className="mb-3 aspect-square w-full max-w-[150px] overflow-hidden rounded-full bg-surface-container shadow-card transition-shadow duration-300 group-hover:shadow-card-hover">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>
              <span className="text-label-md text-primary transition-colors group-hover:text-secondary">{cat.name}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
