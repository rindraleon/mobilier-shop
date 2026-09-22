/**
 * Registre central des clés TanStack Query (§7).
 *
 * Une clé = une ressource serveur. Les regrouper ici permet d'invalider
 * proprement après une mutation (`invalidateQueries({ queryKey: queryKeys.orders.all })`)
 * sans jamais retaper un tableau de chaînes à la main.
 */
export const queryKeys = {
  /* --- Session --- */
  me: ["auth", "me"] as const,

  /* --- Catalogue --- */
  products: {
    all: ["products"] as const,
    list: (params: unknown) => ["products", "list", params] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    mine: (params: unknown) => ["products", "mine", params] as const,
  },
  categories: {
    all: ["categories"] as const,
    detail: (slug: string) => ["categories", "detail", slug] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
  },

  /* --- Panier --- */
  cart: {
    all: ["cart"] as const,
  },

  /* --- Commandes & paiements --- */
  orders: {
    all: ["orders"] as const,
    mine: (params: unknown) => ["orders", "mine", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
    seller: (params: unknown) => ["orders", "seller", params] as const,
    admin: (params: unknown) => ["orders", "admin", params] as const,
  },
  payments: {
    all: ["payments"] as const,
    forOrder: (orderId: string) => ["payments", "order", orderId] as const,
    providers: ["payments", "providers"] as const,
    admin: (params: unknown) => ["payments", "admin", params] as const,
  },

  /* --- Profil --- */
  addresses: {
    all: ["addresses"] as const,
  },

  /* --- Vendeur --- */
  seller: {
    all: ["seller"] as const,
    dashboard: ["seller", "dashboard"] as const,
    products: (params: unknown) => ["seller", "products", params] as const,
    orders: (params: unknown) => ["seller", "orders", params] as const,
    order: (id: string) => ["seller", "orders", "detail", id] as const,
    analytics: (params: unknown) => ["seller", "analytics", params] as const,
    sales: (period: string) => ["seller", "sales", period] as const,
    profile: ["seller", "profile"] as const,
    payments: (params: unknown) => ["seller", "payments", params] as const,
  },
  sellerApplication: ["sellers", "me", "application"] as const,

  /* --- Admin --- */
  admin: {
    dashboard: (period: string) => ["admin", "dashboard", period] as const,
    analytics: (params: unknown) => ["admin", "analytics", params] as const,
    users: (params: unknown) => ["admin", "users", params] as const,
    sellers: ["admin", "sellers"] as const,
    pendingSellers: ["admin", "sellers", "pending"] as const,
    products: (params: unknown) => ["admin", "products", params] as const,
    categories: ["admin", "categories"] as const,
    orders: (params: unknown) => ["admin", "orders", params] as const,
    payments: (params: unknown) => ["admin", "payments", params] as const,
    auditLogs: (params: unknown) => ["admin", "audit-logs", params] as const,
  },

  /* --- Notifications --- */
  notifications: {
    all: ["notifications"] as const,
    list: (params: unknown) => ["notifications", "list", params] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
} as const;
