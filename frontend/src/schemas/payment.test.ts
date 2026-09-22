import { describe, expect, it } from "vitest";
import { normalizeReference, validateReference } from "./payment";
import { PAYMENT_PROVIDERS } from "../utils/constants";

describe("validateReference", () => {
  it("accepte une référence MVola conforme", () => {
    expect(validateReference("mvola", "MP2408151234A00001")).toBeNull();
  });

  it("accepte les références Orange et Airtel avec ou sans préfixe", () => {
    expect(validateReference("orange_money", "OM12345678")).toBeNull();
    expect(validateReference("orange_money", "12345678")).toBeNull();
    expect(validateReference("airtel_money", "AM12345678")).toBeNull();
    expect(validateReference("airtel_money", "12345678")).toBeNull();
  });

  it("refuse une référence trop courte", () => {
    expect(validateReference("mvola", "AB1")).not.toBeNull();
  });

  it("refuse les caractères interdits (espaces, tirets, minuscules non normalisées)", () => {
    expect(validateReference("mvola", "mp 2408-15")).not.toBeNull();
  });

  it("refuse un opérateur inconnu", () => {
    expect(validateReference("inconnu", "MP2408151234A00001")).not.toBeNull();
  });

  it("reste synchronisé avec les motifs exposés au client", () => {
    // Les motifs front doivent exister pour chaque opérateur déclaré.
    for (const provider of PAYMENT_PROVIDERS) {
      expect(provider.pattern).toBeInstanceOf(RegExp);
    }
  });
});

describe("normalizeReference", () => {
  it("met en majuscules et supprime espaces et tirets", () => {
    expect(normalizeReference("mp 2408-15")).toBe("MP240815");
  });
});
