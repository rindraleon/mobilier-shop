import { Link } from "react-router-dom";
import type { Product } from "../../types/api";
import ProductCard from "../product/ProductCard";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";

interface ProductSectionProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllTo?: string;
  viewAllLabel?: string;
}

/**
 * Section produits réutilisable (collection signature, nouveautés…).
 */
export default function ProductSection({
  eyebrow,
  title,
  subtitle,
  products,
  viewAllTo = "/boutique",
  viewAllLabel = "Voir tout",
}: ProductSectionProps) {
  if (products.length === 0) return null;
  return (
    <section className="container-app pb-14 md:pb-20 lg:pb-24">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        action={
          <Button as={Link} to={viewAllTo} variant="outline">
            {viewAllLabel}
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
