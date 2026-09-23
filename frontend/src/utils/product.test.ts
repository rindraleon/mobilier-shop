import { describe, expect, it } from "vitest";
import { cartSubtotal, isLowStock, isPurchasable, productImageUrl, toNumber } from "./product";
import type { Product } from "../types/api";

const baseProduct = {
  id: "p1",
  name: "Canapé Oslo",
  slug: "canape-oslo",
  price: 4_495_000,
  compareAtPrice: 5_495_000,
  stock: 5,
  lowStockThreshold: 3,
  status: "published",
  images: [],
} as unknown as Product;

describe("toNumber", () => {
  it("convertit les numeric PostgreSQL renvoyés en chaînes", () => {
    expect(toNumber("4.50")).toBe(4.5);
    expect(toNumber(42)).toBe(42);
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber("abc")).toBe(0);
  });
});

describe("productImageUrl", () => {
  it("préfère l'url publique de l'image primaire", () => {
    const product = {
      ...baseProduct,
      images: [
        { id: "i2", url: "/images/b.jpg", objectKey: "products/b.jpg", sortOrder: 1, isPrimary: false },
        { id: "i1", url: "/images/a.jpg", objectKey: "products/a.jpg", sortOrder: 0, isPrimary: true },
      ],
    } as unknown as Product;
    expect(productImageUrl(product)).toBe("/images/a.jpg");
  });

  it("ignore une image sans url publique (clé MinIO non servie)", () => {
    const product = {
      ...baseProduct,
      images: [{ id: "i1", url: null, objectKey: "products/a.jpg", sortOrder: 0, isPrimary: true }],
    } as unknown as Product;
    expect(productImageUrl(product)).toBeNull();
  });
});

describe("isPurchasable", () => {
  it("autorise un produit publié et en stock", () => {
    expect(isPurchasable(baseProduct)).toBe(true);
  });

  it("refuse un produit en rupture", () => {
    expect(isPurchasable({ ...baseProduct, stock: 0 })).toBe(false);
  });

  it("refuse un produit non publié", () => {
    expect(isPurchasable({ ...baseProduct, status: "draft" })).toBe(false);
  });
});

describe("isLowStock", () => {
  it("détecte un stock inférieur ou égal au seuil", () => {
    expect(isLowStock(2, 3)).toBe(true);
    expect(isLowStock(3, 3)).toBe(true);
    expect(isLowStock(40, 3)).toBe(false);
  });

  it("ne signale jamais une rupture comme stock faible", () => {
    expect(isLowStock(0, 3)).toBe(false);
  });

  it("utilise un seuil par défaut", () => {
    expect(isLowStock(4)).toBe(true);
    expect(isLowStock(50)).toBe(false);
  });
});

describe("cartSubtotal", () => {
  it("additionne les lignes à partir des montants serveur", () => {
    const items = [
      { lineTotal: 1_000, quantity: 1, available: true },
      { lineTotal: 2_500, quantity: 2, available: true },
      // Ligne indisponible : le serveur ne la facturera pas, on l'exclut.
      { lineTotal: 9_999, quantity: 1, available: false },
    ] as never;
    expect(cartSubtotal(items)).toBe(3_500);
  });

  it("vaut 0 sur un panier vide", () => {
    expect(cartSubtotal([] as never)).toBe(0);
  });
});
