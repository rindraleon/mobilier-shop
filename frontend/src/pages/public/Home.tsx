import { useStore } from "../../context/StoreContext";
import Hero from "../../components/home/Hero";
import FeatureBar from "../../components/home/FeatureBar";
import CategorySection from "../../components/home/CategorySection";
import ProductSection from "../../components/home/ProductSection";
import PromoBanner from "../../components/home/PromoBanner";
import WhySection from "../../components/home/WhySection";
import Testimonials from "../../components/home/Testimonials";
import BlogTeaser from "../../components/home/BlogTeaser";

export default function Home() {
  const { products } = useStore();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const news = products.filter((p) => p.isNew).slice(0, 4);

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
