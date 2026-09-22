import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCatalog";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";

/** Catégories récupérées depuis l'API (plus aucune liste en dur). */
export default function CategorySection() {
  const { data: categories = [], isLoading } = useCategories();
  const visible = categories.slice(0, 6);

  if (isLoading || visible.length === 0) return null;

  return (
    <section className="section bg-surface-container-low/60">
      <div className="container-app">
        <SectionHeading
          eyebrow="Par univers"
          title="Trouvez le meuble qui vous ressemble"
          subtitle="Six familles de mobilier, sélectionnées auprès d'artisans et de boutiques malgaches."
          center
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {visible.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.06}>
              <Link
                to={"/boutique?categorie=" + category.slug}
                className="product-card card group block overflow-hidden"
              >
                <span className="block aspect-[4/3] overflow-hidden bg-surface-container">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </span>
                <span className="block p-4">
                  <span className="font-display text-headline-sm text-primary group-hover:text-secondary">
                    {category.name}
                  </span>
                  {category.description && (
                    <span className="mt-1 block text-body-sm text-on-surface-variant">
                      {category.description}
                    </span>
                  )}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
