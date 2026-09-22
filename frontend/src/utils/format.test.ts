import { describe, expect, it } from "vitest";
import { discountRate, formatPrice, initials, slugify, toChartData } from "./format";

describe("formatPrice (MGA)", () => {
  it("formate un montant entier en ariary avec séparateur de milliers", () => {
    expect(formatPrice(8_990_000)).toContain("8");
    expect(formatPrice(8_990_000)).toContain("Ar");
    expect(formatPrice(0)).toContain("0");
    expect(formatPrice(1_000)).toContain("1");
  });

  it("n'affiche jamais de décimales (montants entiers uniquement)", () => {
    const formatted = formatPrice(1_234_567);
    expect(formatted).not.toMatch(/,\\d{2}/);
  });
});

describe("discountRate", () => {
  it("calcule le pourcentage de remise", () => {
    expect(discountRate(7_500, 10_000)).toBe(25);
    expect(discountRate(10_000, 10_000)).toBe(0);
  });

  it("renvoie 0 sans prix barré", () => {
    expect(discountRate(10_000, null)).toBe(0);
    expect(discountRate(10_000, undefined)).toBe(0);
  });

  it("ne remonte jamais une remise négative", () => {
    // Prix barré inférieur au prix de vente : cas aberrant, remise nulle.
    expect(discountRate(10_000, 5_000)).toBe(0);
  });
});

describe("slugify", () => {
  it("génère un slug URL-safe", () => {
    expect(slugify("Chaise en Chêne Massif")).toBe("chaise-en-chene-massif");
    expect(slugify("Canapé d'Angle")).toBe("canape-d-angle");
  });
});

describe("initials", () => {
  it("conserve les initiales", () => {
    expect(initials("Rindra Leon")).toBe("RL");
    expect(initials("rindra")).toBe("R");
    expect(initials("")).toBe("");
  });
});

describe("toChartData", () => {
  it("convertit des points de revenus en données de graphique", () => {
    const data = toChartData([
      { date: "2026-01-01T00:00:00Z", revenue: 1000 },
      { date: "2026-01-02T00:00:00Z", revenue: 2500 },
    ]);
    expect(data).toHaveLength(2);
    expect(data[1]!.value).toBe(2500);
    expect(typeof data[0]!.label).toBe("string");
  });

  it("tolère une liste vide", () => {
    expect(toChartData()).toEqual([]);
  });
});
