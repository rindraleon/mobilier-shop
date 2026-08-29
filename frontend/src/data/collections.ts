import type { Collection } from "../types";

export const collections: Collection[] = [
  {
    id: "c1",
    slug: "signature",
    name: "La Collection Signature",
    tagline: "Nos classiques intemporels",
    description:
      "Les pièces qui ont fait la réputation d'Anti : des lignes épurées et des matériaux nobles, conçues pour traverser les années.",
    image: "/images/salon-lecture.jpg",
    productIds: ["p1", "p2", "p4", "p7"],
  },
  {
    id: "c2",
    slug: "esprit-nordique",
    name: "Esprit nordique",
    tagline: "Chaleurs scandinaves",
    description:
      "Bois clair, lin et lumière douce : une collection inspirée du design scandinave pour un intérieur apaisé.",
    image: "/images/collection-nordique.jpg",
    productIds: ["p6", "p8", "p7", "p12"],
  },
  {
    id: "c3",
    slug: "plein-air",
    name: "Plein air",
    tagline: "Le jardin s'invite à l'intérieur",
    description:
      "Teck, lignes architecturales et confort d'extérieur : prolongez votre art de vivre sous le soleil.",
    image: "/images/products/terra-exterieur.jpg",
    productIds: ["p11", "p3"],
  },
  {
    id: "c4",
    slug: "nouveautes",
    name: "Nouveautés 2026",
    tagline: "Les dernières arrivées",
    description:
      "Fraîchement sorties de nos ateliers : découvrez les créations de la saison avant tout le monde.",
    image: "/images/products/bureau-nord.jpg",
    productIds: ["p5", "p6", "p8", "p11"],
  },
];
