import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Address } from '../../users/entities/address.entity';
import { Seller } from '../../sellers/entities/seller.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { UserRole, SellerStatus, ProductStatus } from '../../common/enums';

export const SEED_PASSWORD = 'Motdepasse1!';

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  position: number;
}

/** Catégories : les 6 slugs du frontend + celles demandées dans le cahier des charges. */
const CATEGORIES: CategorySeed[] = [
  {
    name: 'Salon',
    slug: 'salon',
    description: 'Canapés, fauteuils et tables basses pour un salon chaleureux.',
    imageUrl: '/images/products/sofa-oslo.jpg',
    position: 1,
  },
  {
    name: 'Chambre',
    slug: 'chambre',
    description: 'Lits et rangements douillets pour des nuits apaisantes.',
    imageUrl: '/images/products/lit-alder.jpg',
    position: 2,
  },
  {
    name: 'Salle à manger',
    slug: 'salle-a-manger',
    description: 'Tables et chaises pour partager de beaux moments.',
    imageUrl: '/images/products/table-oakridge.jpg',
    position: 3,
  },
  {
    name: 'Bureau',
    slug: 'bureau',
    description: 'Des meubles pensés pour travailler avec plaisir.',
    imageUrl: '/images/products/bureau-nord.jpg',
    position: 4,
  },
  {
    name: 'Extérieur',
    slug: 'exterieur',
    description: 'Mobilier d’extérieur résistant et élégant.',
    imageUrl: '/images/products/terra-exterieur.jpg',
    position: 5,
  },
  {
    name: 'Rangement',
    slug: 'rangement',
    description: 'Des solutions de rangement intelligentes et discrètes.',
    imageUrl: '/images/products/armoire-ligne.jpg',
    position: 6,
  },
  {
    name: 'Canapés',
    slug: 'canapes',
    description: 'Canapés convertibles, d’angle et modulables.',
    imageUrl: '/images/products/sofa-oslo.jpg',
    position: 7,
  },
  {
    name: 'Fauteuils',
    slug: 'fauteuils',
    description: 'Fauteuils et bergères pour un coin lecture.',
    imageUrl: '/images/products/sofa-oslo.jpg',
    position: 8,
  },
  {
    name: 'Tables',
    slug: 'tables',
    description: 'Tables à manger, basses et d’appoint.',
    imageUrl: '/images/products/table-oakridge.jpg',
    position: 9,
  },
  {
    name: 'Chaises',
    slug: 'chaises',
    description: 'Chaises, tabourets et assises design.',
    imageUrl: '/images/products/table-oakridge.jpg',
    position: 10,
  },
  {
    name: 'Lits',
    slug: 'lits',
    description: 'Lits, sommiers et têtes de lit.',
    imageUrl: '/images/products/lit-alder.jpg',
    position: 11,
  },
  {
    name: 'Armoires',
    slug: 'armoires',
    description: 'Armoires, penderies et dressings.',
    imageUrl: '/images/products/armoire-ligne.jpg',
    position: 12,
  },
  {
    name: 'Bureaux',
    slug: 'bureaux',
    description: 'Bureaux, caissons et sièges de travail.',
    imageUrl: '/images/products/bureau-nord.jpg',
    position: 13,
  },
  {
    name: 'Décoration',
    slug: 'decoration',
    description: 'Miroirs, luminaires et objets décoratifs.',
    imageUrl: '/images/products/terra-exterieur.jpg',
    position: 14,
  },
  {
    name: 'Mobilier extérieur',
    slug: 'mobilier-exterieur',
    description: 'Salons de jardin, transats et parasols.',
    imageUrl: '/images/products/terra-exterieur.jpg',
    position: 15,
  },
];

interface ProductSeed {
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  shortDescription: string;
  description: string;
  material: string;
  dimensions: string;
  imageUrl: string;
  featured?: boolean;
  isNew?: boolean;
  sellerIndex: 0 | 1;
}

/** Montants en MGA (entiers). */
const PRODUCTS: ProductSeed[] = [
  {
    name: 'Canapé Oslo',
    slug: 'canape-oslo',
    categorySlug: 'salon',
    price: 4_495_000,
    compareAtPrice: 5_495_000,
    stock: 8,
    shortDescription: 'Canapé trois places en bouclé crème et chêne massif.',
    description:
      'Le canapé Oslo associe l’élégance du bouclé crème à la chaleur du chêne massif. Ses coussins à mémoire de forme offrent un confort durable. Pieds à monter en quelques minutes.',
    material: 'Bouclé 100 % polyester & chêne massif',
    dimensions: '220 × 95 × 85 cm',
    imageUrl: '/images/products/sofa-oslo.jpg',
    featured: true,
    sellerIndex: 0,
  },
  {
    name: 'Fauteuil Alder',
    slug: 'fauteuil-alder',
    categorySlug: 'fauteuils',
    price: 1_395_000,
    stock: 14,
    shortDescription: 'Fauteuil lounge en rotin tressé main.',
    description:
      'Un fauteuil au tressage artisanal, pensé pour le coin lecture. Assise généreuse et structure en rotin naturel.',
    material: 'Rotin naturel tressé',
    dimensions: '78 × 82 × 74 cm',
    imageUrl: '/images/products/sofa-oslo.jpg',
    sellerIndex: 0,
  },
  {
    name: 'Table Oakridge',
    slug: 'table-oakridge',
    categorySlug: 'tables',
    price: 2_790_000,
    compareAtPrice: 3_290_000,
    stock: 6,
    shortDescription: 'Table à manger 6 couverts en chêne massif.',
    description:
      'Une table robuste au plateau huilé, capable d’accueillir six convives. Fabrication locale à Antananarivo.',
    material: 'Chêne massif huilé',
    dimensions: '180 × 90 × 75 cm',
    imageUrl: '/images/products/table-oakridge.jpg',
    featured: true,
    sellerIndex: 0,
  },
  {
    name: 'Chaise Nord',
    slug: 'chaise-nord',
    categorySlug: 'chaises',
    price: 495_000,
    stock: 40,
    shortDescription: 'Chaise scandinave en frêne et corde papier.',
    description: 'Légère, empilable et confortable : la chaise Nord s’adapte à toutes les tables.',
    material: 'Frêne massif & corde papier',
    dimensions: '46 × 52 × 82 cm',
    imageUrl: '/images/products/table-oakridge.jpg',
    sellerIndex: 0,
  },
  {
    name: 'Lit Alder',
    slug: 'lit-alder',
    categorySlug: 'lits',
    price: 3_250_000,
    stock: 5,
    shortDescription: 'Lit double 160×200 avec tête de lit capitonnée.',
    description:
      'Un lit aux lignes douces, avec sommier à lattes inclus et tête de lit capitonnée tissu lin.',
    material: 'Structure pin massif & lin',
    dimensions: '170 × 215 × 110 cm',
    imageUrl: '/images/products/lit-alder.jpg',
    featured: true,
    sellerIndex: 0,
  },
  {
    name: 'Armoire Ligne',
    slug: 'armoire-ligne',
    categorySlug: 'armoires',
    price: 2_450_000,
    stock: 3,
    shortDescription: 'Armoire 3 portes avec penderie et étagères.',
    description:
      'Une armoire spacieuse aux portes à fermeture douce, idéale pour une chambre familiale.',
    material: 'MDF plaqué chêne',
    dimensions: '150 × 60 × 210 cm',
    imageUrl: '/images/products/armoire-ligne.jpg',
    sellerIndex: 0,
  },
  {
    name: 'Bureau Nord',
    slug: 'bureau-nord',
    categorySlug: 'bureau',
    price: 1_850_000,
    stock: 11,
    shortDescription: 'Bureau 140 cm avec caisson intégré.',
    description:
      'Un plan de travail généreux, un passe-câbles discret et trois tiroirs : le bureau Nord est pensé pour le télétravail.',
    material: 'Chêne massif & acier noir',
    dimensions: '140 × 70 × 75 cm',
    imageUrl: '/images/products/bureau-nord.jpg',
    isNew: true,
    sellerIndex: 1,
  },
  {
    name: 'Étagère Ligne',
    slug: 'etagere-ligne',
    categorySlug: 'rangement',
    price: 985_000,
    stock: 18,
    shortDescription: 'Étagère bibliothèque 5 niveaux.',
    description:
      'Une bibliothèque modulable qui s’adapte à la hauteur de vos livres et objets décoratifs.',
    material: 'MDF peint & chêne',
    dimensions: '80 × 35 × 190 cm',
    imageUrl: '/images/products/armoire-ligne.jpg',
    sellerIndex: 1,
  },
  {
    name: 'Salon de jardin Terra',
    slug: 'terra-exterieur',
    categorySlug: 'exterieur',
    price: 3_950_000,
    compareAtPrice: 4_450_000,
    stock: 4,
    shortDescription: 'Salon de jardin 4 places en teck et résine tressée.',
    description:
      'Un ensemble complet (canapé 2 places, 2 fauteuils, table basse) en teck certifié, résistant aux intempéries.',
    material: 'Teck massif & résine tressée',
    dimensions: 'Ensemble 4 places',
    imageUrl: '/images/products/terra-exterieur.jpg',
    featured: true,
    sellerIndex: 1,
  },
  {
    name: 'Miroir Rond Éclat',
    slug: 'miroir-rond-eclat',
    categorySlug: 'decoration',
    price: 420_000,
    stock: 25,
    shortDescription: 'Miroir rond Ø 80 cm, cadre chêne.',
    description:
      'Un miroir rond au cadre fin en chêne, parfait pour agrandir visuellement une pièce.',
    material: 'Verre & chêne massif',
    dimensions: 'Ø 80 cm',
    imageUrl: '/images/products/terra-exterieur.jpg',
    isNew: true,
    sellerIndex: 1,
  },
  {
    name: 'Table basse Néa',
    slug: 'table-basse-nea',
    categorySlug: 'salon',
    price: 1_150_000,
    stock: 0,
    shortDescription: 'Table basse en travertin et chêne.',
    description:
      'Plateau en travertin naturel posé sur un piètement chêne : une pièce de caractère.',
    material: 'Travertin & chêne massif',
    dimensions: '110 × 60 × 38 cm',
    imageUrl: '/images/products/sofa-oslo.jpg',
    sellerIndex: 0,
  },
  {
    name: 'Banquette Rangement',
    slug: 'banquette-rangement',
    categorySlug: 'rangement',
    price: 1_295_000,
    stock: 9,
    shortDescription: 'Banquette coffre avec assise capitonnée.',
    description:
      'Une banquette coffre idéale dans une entrée ou au pied du lit : rangement et assise en un seul meuble.',
    material: 'Tissu polyester & pin massif',
    dimensions: '120 × 45 × 50 cm',
    imageUrl: '/images/products/armoire-ligne.jpg',
    sellerIndex: 1,
  },
];

export async function runSeed(dataSource: DataSource): Promise<void> {
  const users = dataSource.getRepository(User);
  const addresses = dataSource.getRepository(Address);
  const sellers = dataSource.getRepository(Seller);
  const categories = dataSource.getRepository(Category);
  const products = dataSource.getRepository(Product);
  const images = dataSource.getRepository(ProductImage);

  // Nettoyage idempotent
  await dataSource.query(
    'TRUNCATE TABLE "order_status_history", "order_items", "payments", "orders", "cart_items", "carts", "wishlist_items", "wishlists", "product_images", "products", "notifications", "audit_logs", "idempotency_keys", "password_reset_tokens", "refresh_tokens", "sellers", "categories", "addresses", "users" RESTART IDENTITY CASCADE',
  );

  const passwordHash = await argon2.hash(SEED_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  /* ------------------------------- Utilisateurs ------------------------------ */

  const admin = users.create({
    email: 'admin@example.local',
    passwordHash,
    firstName: 'Alexandre',
    lastName: 'Bernard',
    phone: '+261 34 00 000 01',
    role: UserRole.ADMIN,
  });
  await users.save(admin);

  const sellerUser = users.create({
    email: 'seller@example.local',
    passwordHash,
    firstName: 'Hery',
    lastName: 'Rakoto',
    phone: '+261 34 00 000 02',
    role: UserRole.SELLER,
  });
  await users.save(sellerUser);

  const secondSellerUser = users.create({
    email: 'seller2@example.local',
    passwordHash,
    firstName: 'Voara',
    lastName: 'Andria',
    phone: '+261 34 00 000 04',
    role: UserRole.SELLER,
  });
  await users.save(secondSellerUser);

  const pendingSellerUser = users.create({
    email: 'pending@example.local',
    passwordHash,
    firstName: 'Nirina',
    lastName: 'Raso',
    phone: '+261 34 00 000 05',
    role: UserRole.SELLER,
  });
  await users.save(pendingSellerUser);

  const customer = users.create({
    email: 'customer@example.local',
    passwordHash,
    firstName: 'Camille',
    lastName: 'Moreau',
    phone: '+261 34 00 000 03',
    role: UserRole.CUSTOMER,
  });
  await users.save(customer);

  await addresses.save(
    addresses.create({
      userId: customer.id,
      label: 'Domicile',
      isDefault: true,
      fullName: 'Camille Moreau',
      phone: '+261 34 00 000 03',
      addressLine1: 'Lot II M 12 Bis Ankadifotsy',
      addressLine2: 'Appartement 4B',
      postalCode: '101',
      city: 'Antananarivo',
      country: 'Madagascar',
    }),
  );

  await addresses.save(
    addresses.create({
      userId: customer.id,
      label: 'Bureau',
      isDefault: false,
      fullName: 'Camille Moreau',
      phone: '+261 34 00 000 03',
      addressLine1: 'Immeuble ARO, Ankorondrano',
      postalCode: '101',
      city: 'Antananarivo',
      country: 'Madagascar',
    }),
  );

  /* --------------------------------- Vendeurs -------------------------------- */

  const approvedSeller = sellers.create({
    userId: sellerUser.id,
    shopName: 'Atelier Bois de Rose',
    slug: 'atelier-bois-de-rose',
    description: 'Fabrication artisanale de mobilier en bois massif, à Antananarivo.',
    phone: '+261 34 00 000 02',
    city: 'Antananarivo',
    addressLine: 'Lot IV J 78 Ambohidratrimo',
    status: SellerStatus.APPROVED,
    submittedAt: new Date(),
    reviewedAt: new Date(),
    reviewedById: admin.id,
  });
  await sellers.save(approvedSeller);

  const secondSeller = sellers.create({
    userId: secondSellerUser.id,
    shopName: 'Maison Teck & Co',
    slug: 'maison-teck-co',
    description: 'Mobilier d’extérieur et décoration en teck certifié.',
    phone: '+261 34 00 000 04',
    city: 'Antsirabe',
    addressLine: 'Rue des Artisans, Antsirabe',
    status: SellerStatus.APPROVED,
    submittedAt: new Date(),
    reviewedAt: new Date(),
    reviewedById: admin.id,
  });
  await sellers.save(secondSeller);

  await sellers.save(
    sellers.create({
      userId: pendingSellerUser.id,
      shopName: 'Créations Anjara',
      slug: 'creations-anjara',
      description: 'Petite série de mobilier contemporain.',
      phone: '+261 34 00 000 05',
      city: 'Toamasina',
      status: SellerStatus.PENDING,
      submittedAt: new Date(),
    }),
  );

  /* -------------------------------- Catégories ------------------------------- */

  const savedCategories = new Map<string, Category>();
  for (const seed of CATEGORIES) {
    const category = await categories.save(
      categories.create({
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        imageUrl: seed.imageUrl,
        position: seed.position,
        isActive: true,
      }),
    );
    savedCategories.set(seed.slug, category);
  }

  /* --------------------------------- Produits -------------------------------- */

  const sellerIds = [approvedSeller.id, secondSeller.id];
  for (const seed of PRODUCTS) {
    const category = savedCategories.get(seed.categorySlug);
    if (!category) continue;

    const product = await products.save(
      products.create({
        sellerId: sellerIds[seed.sellerIndex],
        categoryId: category.id,
        name: seed.name,
        slug: seed.slug,
        shortDescription: seed.shortDescription,
        description: seed.description,
        price: seed.price,
        compareAtPrice: seed.compareAtPrice ?? null,
        stock: seed.stock,
        status: seed.stock > 0 ? ProductStatus.PUBLISHED : ProductStatus.OUT_OF_STOCK,
        material: seed.material,
        dimensions: seed.dimensions,
        isFeatured: seed.featured ?? false,
        isNew: seed.isNew ?? false,
        lowStockThreshold: 3,
        sku: `SKU-${seed.slug.toUpperCase().slice(0, 12)}`,
        publishedAt: new Date(),
      }),
    );

    await images.save(
      images.create({
        productId: product.id,
        objectKey: `products/seed/${seed.slug}.jpg`,
        url: seed.imageUrl,
        isPrimary: true,
        sortOrder: 0,
        alt: seed.name,
      }),
    );
  }
}
