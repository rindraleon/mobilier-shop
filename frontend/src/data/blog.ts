import type { BlogPost } from "../types";

const daysAgo = (n: number): string => new Date(Date.now() - n * 86400000).toISOString();

export const initialBlogPosts: BlogPost[] = [
  {
    id: "b1",
    slug: "choisir-canape-ideal",
    title: "Comment choisir le canapé idéal pour votre salon ?",
    category: "Guides",
    image: "/images/hero.jpg",
    author: "Équipe Anti",
    date: daysAgo(12),
    readTime: 6,
    excerpt:
      "Dimensions, assise, tissu, couleur… Nos experts vous livrent leur méthode en 5 étapes pour trouver LE canapé fait pour votre intérieur.",
    content: [
      "Le canapé est la pièce maîtresse de tout salon : c'est autour de lui que s'organisent les conversations, les siestes et les soirées cinéma. Le choisir demande donc un minimum de méthode.",
      "Commencez par mesurer votre espace. Comptez au minimum 60 à 80 cm de circulation autour du canapé et pensez à vérifier les accès : escaliers, ascenseurs et angles des couloirs déterminent souvent la taille maximale possible.",
      "Vient ensuite le confort d'assise. Une assise ferme et peu profonde conviendra à une pièce de vie dynamique, tandis qu'une assise moelleuse et profonde invite à la détente. En boutique, testez toujours assis au moins dix minutes.",
      "Côté tissu, privilégiez les matières résistantes si vous avez des enfants ou des animaux. Le bouclé, très tendance, a l'avantage de ne pas accrocher les poils ; le velours, lui, apporte une profondeur visuelle incomparable.",
      "Enfin, choisissez une teinte intemporelle pour l'assise et osez la couleur dans les coussins et accessoires : c'est la recette d'un salon qui vous ressemble, sans risque de lasser.",
    ],
  },
  {
    id: "b2",
    slug: "entretenir-meubles-bois-massif",
    title: "Entretenir ses meubles en bois massif : le guide complet",
    category: "Entretien",
    image: "/images/atelier.jpg",
    author: "Équipe Anti",
    date: daysAgo(34),
    readTime: 8,
    excerpt:
      "Un meuble en bois massif peut durer des générations… à condition d'en prendre soin. Huile, savon noir, gestes à éviter : on vous explique tout.",
    content: [
      "Le bois massif est une matière vivante : il respire, se patine et se répare. C'est précisément ce qui fait son charme et sa longévité, pour peu qu'on lui accorde quelques attentions régulières.",
      "Au quotidien, un chiffon microfibre légèrement humide suffit pour dépoussiérer. Évitez les produits ménagers agressifs, les nettoyants vitres et surtout l'eau stagnante, qui font gonfler les fibres et blanchir les finitions.",
      "Une à deux fois par an, nourrissez le bois avec une huile adaptée (lin, teck ou huile spécifique selon l'essence). Appliquez au pinceau dans le sens des fibres, laissez pénétrer vingt minutes puis essuyez soigneusement l'excédent.",
      "Les marques de verres et les micro-rayures se gomment souvent avec un peu de mayo ou d'huile de noix frottée délicatement. Pour les dégâts plus profonds, nos ateliers proposent un service de rénovation.",
      "Enfin, pensez à éloigner vos meubles des sources de chaleur directe et de l'ensoleillement prolongé : le bois vous remerciera en gardant sa teinte et sa stabilité pendant des décennies.",
    ],
  },
  {
    id: "b3",
    slug: "tendances-decoration-2026",
    title: "Tendances décoration 2026 : la chaleur avant tout",
    category: "Inspirations",
    image: "/images/collection-nordique.jpg",
    author: "Équipe Anti",
    date: daysAgo(58),
    readTime: 5,
    excerpt:
      "Tons terreux, matières naturelles et courbes douces : tour d'horizon des tendances qui vont habiter nos intérieurs cette année.",
    content: [
      "Après des années de minimalisme froid, 2026 confirme le retour en force de la chaleur : nos intérieurs se veulent des cocons, des refuges douillets où le bien-être prime sur l'apparence.",
      "Côté palette, les tons terreux dominent : terracotta, ocre, beige sable et bruns profonds remplacent les gris polaires. Ces teintes se marient à merveille avec le bois clair et les textiles naturels comme le lin lavé.",
      "Les formes s'arrondissent. Canapés enveloppants, tables basses organiques, arches architecturales : la courbe adoucit les espaces et invite à la décontraction.",
      "Matière phare de l'année : le bouclé. Ce tissu à l'aspect cape de mouton habille canapés, fauteuils et poufs d'une texture immédiatement réconfortante.",
      "Enfin, la consom'attention continue de guider nos choix : acheter moins, mais mieux, privilégier le meuble fabriqué en Europe et réparable — une philosophie qui, chez Anti, n'est pas une tendance mais une évidence.",
    ],
  },
  {
    id: "b4",
    slug: "petit-espace-grandes-idees",
    title: "Petit espace, grandes idées : optimiser un petit intérieur",
    category: "Guides",
    image: "/images/salon-lecture.jpg",
    author: "Équipe Anti",
    date: daysAgo(85),
    readTime: 7,
    excerpt:
      "Studio, deux-pièces compact… Pas question de sacrifier le style ! Nos astuces d'aménagement pour gagner de la place sans rien perdre en confort.",
    content: [
      "Un petit intérieur bien pensé peut se révéler plus agréable qu'un grand espace mal distribué. La clé : chaque meuble doit mériter sa place.",
      "Misez sur des pièces polyvalentes : une table basse avec rangement intégré, un bout de canapé qui sert d'assise d'appoint, une étagère ouverte qui fait office de séparation de pièce.",
      "Exploitez la hauteur : les étagères murales libèrent le sol tandis que les armoires hautes canalisent le regard vers le haut, donnant instantanément une impression d'espace.",
      "Choisissez des meubles surélevés à pieds fins : le sol reste visible, la pièce paraît plus légère et le nettoyage devient un jeu d'enfant.",
      "Enfin, unifiez les teintes : une palette claire et cohérente sur murs et grands meubles agrandit visuellement l'espace. Les touches de couleur se logent dans le petit mobilier et le linge de maison.",
    ],
  },
];
