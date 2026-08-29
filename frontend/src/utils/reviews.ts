export interface Review {
  name: string;
  rating: number;
  date: string;
  title: string;
  text: string;
}

export const sampleReviews: Review[] = [
  {
    name: "Claire D.",
    rating: 5,
    date: "12 juin 2026",
    title: "Qualité au rendez-vous",
    text: "Encore plus beau en vrai qu'en photo. Les matériaux sont nobles, l'assemblage est impeccable et la livraison a été très soignée. Je recommande les yeux fermés.",
  },
  {
    name: "Thomas R.",
    rating: 4,
    date: "28 mai 2026",
    title: "Très satisfait",
    text: "Excellent rapport qualité-prix. Un léger délai de livraison mais le service client a été très réactif et prévenant. Le meuble sublime notre intérieur.",
  },
  {
    name: "Nadia B.",
    rating: 5,
    date: "3 avril 2026",
    title: "Coup de cœur",
    text: "J'ai commandé deux pièces de la même gamme : elles s'accordent parfaitement. On sent le souci du détail jusque dans l'emballage. Bravo !",
  },
];
