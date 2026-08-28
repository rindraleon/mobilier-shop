/* ------------------------------------------------------------------ */
/* Types métier de l'application Anti                                  */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  image: string;
  description: string;
  longDescription: string;
  material: string;
  dimensions: string;
  stock: number;
  rating: number;
  reviews: number;
  isNew: boolean;
  featured: boolean;
}

/** Données d'un nouveau produit envoyées au catalogue (id/slug auto-générés). */
export type ProductDraft = Omit<Product, "id" | "slug" | "rating" | "reviews">;

export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  productIds: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: number;
  excerpt: string;
  content: string[];
}

export interface Address {
  id?: string;
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  address2?: string;
  postalCode: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

export type UserRole = "admin" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  addresses: Address[];
}

export type OrderStatus = "en_attente" | "confirmee" | "expediee" | "livree" | "annulee";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
  shippingMethod: string;
  shippingCost: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: Address;
  total: number;
}
