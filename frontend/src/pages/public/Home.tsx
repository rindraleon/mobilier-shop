import { useFeaturedProducts, useNewProducts } from "../../hooks/useCatalog";
import Hero from "../../components/home/Hero";
import FeatureBar from "../../components/home/FeatureBar";
import CategorySection from "../../components/home/CategorySection";
import ProductSection from "../../components/home/ProductSection";
import PromoBanner from "../../components/home/PromoBanner";
import WhySection from "../../components/home/WhySection";
import Testimonials from "../../components/home/Testimonials";
import BlogTeaser from "../../components/home/BlogTeaser";

export default function Home() {
  // Catalogue servi par l'API : plus aucune donnée en dur.
  const { data: featured = [] } = useFeaturedProducts(4);
  const { data: news = [] } = useNewProducts(4);

  return (
    <>
      <Hero />
      <FeatureBar />
      <CategorySection />
      <ProductSection
        eyebrow="Sélection"
        title="Notre collection signature"
        subtitle="Des pièces emblématiques, conçues pour traverser toute une vie."
        products={featured}
        viewAllLabel="Voir toute la boutique"
      />
      <PromoBanner />
      <ProductSection
        eyebrow="Fraîchement arrivés"
        title="Les nouveautés de la saison"
        subtitle="Les dernières créations de nos ateliers, en stock limité."
        products={news}
      />
      <WhySection />
      <Testimonials />
      <BlogTeaser />
    </>
  );
}
