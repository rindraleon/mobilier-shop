/**
 * Types miroir de l'API NestJS MOBILIER-SHOP.
 *
 * Règle (§52) : aucun `any`. Ces types sont la source de vérité du frontend et
 * doivent rester synchrones avec les DTO de réponse du backend
 * (`backend/src/**\/dto/*.dto.ts`).
 */

/* ------------------------------------------------------------------ */
/* Génériques                                                          */
/* ------------------------------------------------------------------ */

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** Enveloppe d'erreur normalisée (§38). */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  code?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

/* ------------------------------------------------------------------ */
/* Énumérations (alignées sur backend/src/common/enums)                */
/* ------------------------------------------------------------------ */

export type UserRole = "customer" | "seller" | "admin";
export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";
export type ProductStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "out_of_stock"
  | "archived";
export type OrderStatus =
  | "pending_payment"
  | "payment_submitted"
  | "paid"
  | "processing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "rejected";
export type MobileMoneyProvider = "mvola" | "orange_money" | "airtel_money";
export type PaymentStatus =
  | "pending"
  | "submitted"
  | "verified"
  | "rejected"
  | "refunded";
export type ShippingMethod = "standard" | "express" | "pickup";
export type ProductSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "popular"
  | "rating";
export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_PAID"
  | "ORDER_STATUS_CHANGED"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_REJECTED"
  | "SELLER_APPLICATION_RECEIVED"
  | "SELLER_APPROVED"
  | "SELLER_REJECTED"
  | "SELLER_SUSPENDED"
  | "LOW_STOCK";

/* ------------------------------------------------------------------ */
/* Auth & utilisateurs                                                 */
/* ------------------------------------------------------------------ */

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  /** Statut vendeur, `null` si l'utilisateur n'est pas vendeur (§10). */
  sellerStatus: SellerStatus | null;
  sellerId: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

/** Champs acceptés par `PATCH /users/me` — jamais de rôle (§62). */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/* ------------------------------------------------------------------ */
/* Adresses                                                            */
/* ------------------------------------------------------------------ */

export interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  city: string;
  country: string;
  isDefault: boolean;
}

export type AddressInput = {
  label?: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode?: string | null;
  city: string;
  country: string;
  isDefault?: boolean;
};

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageObjectKey: string | null;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProductImage {
  id: string;
  url: string | null;
  objectKey: string;
  sortOrder: number;
  isPrimary: boolean;
  alt: string | null;
}

export interface ProductSellerRef {
  id: string;
  shopName: string;
  slug: string;
}

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  /** Prix en **ariary (MGA), entier** (§88). */
  price: number;
  compareAtPrice: number | null;
  stock: number;
  /** Seuil en dessous duquel le produit est considéré en stock faible. */
  lowStockThreshold: number;
  sku: string | null;
  status: ProductStatus;
  material: string | null;
  dimensions: string | null;
  isFeatured: boolean;
  isNew: boolean;
  ratingAverage: number;
  ratingCount: number;
  categoryId: string;
  category: ProductCategoryRef | null;
  sellerId: string;
  seller: ProductSellerRef | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

/** Filtres du catalogue public (§45). */
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: boolean;
  featured?: boolean;
  sort?: ProductSort;
  status?: ProductStatus;
}

export interface ProductImageInput {
  objectKey: string;
  url?: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  categoryId: string;
  sku?: string;
  lowStockThreshold?: number;
  material?: string;
  dimensions?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  images?: ProductImageInput[];
}

export type UpdateProductInput = Partial<CreateProductInput> & {
  isNew?: boolean;
};

/* ------------------------------------------------------------------ */
/* Vendeurs                                                            */
/* ------------------------------------------------------------------ */

export interface Seller {
  id: string;
  userId: string;
  shopName: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  city: string | null;
  status: SellerStatus;
  documentKeys: string[];
  logoObjectKey: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `POST /sellers/apply` — aucun rôle ni statut n'est envoyé (§62). */
export interface ApplySellerInput {
  shopName: string;
  description?: string;
  phone?: string;
  email?: string;
  city?: string;
  addressLine?: string;
}

export interface UpdateSellerInput {
  shopName?: string;
  description?: string;
  phone?: string;
  email?: string;
  addressLine?: string;
}

/* ------------------------------------------------------------------ */
/* Panier (serveur)                                                    */
/* ------------------------------------------------------------------ */

export interface CartProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string | null;
  sellerId: string;
  sellerName: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  /** Prix unitaire **recalculé côté serveur** (§21). */
  unitPrice: number;
  lineTotal: number;
  product: CartProductSummary;
  available: boolean;
  issue: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  quantity: number;
  currency: string;
  warnings: string[];
}

/* ------------------------------------------------------------------ */
/* Commandes                                                           */
/* ------------------------------------------------------------------ */

export interface OrderAddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode?: string | null;
  city: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  sellerId: string;
  sellerName: string | null;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  sku: string | null;
  /** Prix figé au moment de la commande (§22). */
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string | null;
  comment: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  promoCode: string | null;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress: OrderAddressSnapshot;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  payment: Payment | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Réponse d'une mutation de commande (création, annulation, transition).
 *
 * Vérifié sur l'API : ces endpoints renvoient l'entité **sans** `payment` ni
 * `statusHistory`, qui ne sont chargés que par `GET /orders/:id`. On le
 * matérialise dans le typage pour interdire de mettre cette réponse en cache
 * à la place d'une commande complète — ce qui ferait planter les pages de
 * détail (`order.statusHistory.length`).
 */
export type OrderMutationResult = Omit<Order, "payment" | "statusHistory">;

export interface CreateOrderInput {
  addressId?: string;
  shippingAddress?: OrderAddressSnapshot;
  items?: { productId: string; quantity: number }[];
  shippingMethod?: ShippingMethod;
  notes?: string;
  saveAddress?: boolean;
  addressLabel?: string;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  from?: string;
  to?: string;
}

/* ------------------------------------------------------------------ */
/* Paiements                                                           */
/* ------------------------------------------------------------------ */

export interface Payment {
  id: string;
  orderId: string;
  provider: MobileMoneyProvider;
  transactionReference: string;
  /** Montant attendu, recalculé côté serveur. */
  amount: number;
  currency: string;
  status: PaymentStatus;
  payerPhone: string | null;
  proofObjectKey: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface SubmitPaymentInput {
  provider: MobileMoneyProvider;
  transactionReference: string;
  payerPhone?: string;
  proofObjectKey?: string;
}

export interface PaymentProviderInfo {
  name: MobileMoneyProvider;
  label: string;
  /** `false` = vérification manuelle par un administrateur (jamais auto). */
  automatic: boolean;
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  channel: "in_app" | "email" | "both";
  /** Charge utile métier (numéro de commande, montant…). */
  data: Record<string, unknown>;
  emailSentAt: string | null;
  readAt: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Vendeur — statistiques                                              */
/* ------------------------------------------------------------------ */

export interface SellerDashboard {
  seller: {
    id: string;
    shopName: string;
    status: SellerStatus;
  } | null;
  todayRevenue: number;
  monthRevenue: number;
  orders: number;
  products: number;
  activeProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentOrders: Order[];
  currency: string;
}

export interface SellerAnalyticsSeries {
  label: string;
  value: number;
}

export interface SellerAnalytics {
  range: { from: string; to: string };
  revenue: number;
  orders: number;
  itemsSold: number;
  averageBasket: number;
  salesSeries: SellerAnalyticsSeries[];
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStock: {
    productId: string;
    name: string;
    stock: number;
    threshold: number;
  }[];
  currency: string;
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export interface AdminDashboard {
  period: string;
  range: { from: string; to: string };
  revenue: number;
  orders: number;
  averageBasket: number;
  customers: number;
  sellers: number;
  pendingSellers: number;
  activeProducts: number;
  pendingPayments: number;
  ordersInProgress: number;
  growth: { revenuePercent: number | null; previousRevenue: number };
  currency?: string;
}

export type AnalyticsRange =
  | "today"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export interface AdminAnalytics {
  range: AnalyticsRange;
  from: string;
  to: string;
  revenue: SeriesPoint[];
  orders: SeriesPoint[];
  topProducts: { id: string; name: string; quantity: number; revenue: number }[];
  topCategories: { id: string; name: string; quantity: number; revenue: number }[];
  topSellers: { id: string; shopName: string; revenue: number; orders: number }[];
  totals: {
    revenue: number;
    orders: number;
    customers: number;
    productsSold: number;
  };
  currency: string;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  user?: { id: string; email: string; fullName: string } | null;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
}

/* ------------------------------------------------------------------ */
/* Fichiers (MinIO)                                                    */
/* ------------------------------------------------------------------ */

export interface UploadedFile {
  bucket: string;
  objectKey: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface UploadRules {
  maxFileSize: number;
  maxFiles: number;
  allowedMimeTypes: string[];
}

/* ------------------------------------------------------------------ */
/* Favoris                                                             */
/* ------------------------------------------------------------------ */

/**
 * Article de la liste de favoris.
 *
 * `GET /wishlist` renvoie un **tableau plat** (vérifié sur l'API) et non un
 * objet `{ items }` : on colle exactement à la réponse du serveur.
 */
export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  addedAt: string;
}

export type Wishlist = WishlistItem[];
