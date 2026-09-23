import { describe, expect, it } from "vitest";
import { buildQuery } from "./client";

describe("buildQuery", () => {
  it("construit une query string", () => {
    expect(buildQuery({ page: 2, limit: 10 })).toBe("?page=2&limit=10");
  });

  it("ignore les valeurs vides", () => {
    expect(buildQuery({ page: 1, search: "", category: undefined, sort: null })).toBe("?page=1");
  });

  it("sérialise les booléens en 'true'/'false'", () => {
    expect(buildQuery({ availability: true, featured: false })).toBe("?availability=true&featured=false");
  });

  it("renvoie une chaîne vide sans paramètres", () => {
    expect(buildQuery()).toBe("");
    expect(buildQuery({})).toBe("");
  });

  it("ne produit jamais « [object Object] » pour une valeur complexe", () => {
    const qs = buildQuery({ filter: { category: "salon", max: 500 } });
    expect(qs).not.toContain("[object Object]");
    expect(qs).toBe(`?filter=${encodeURIComponent('{"category":"salon","max":500}')}`);
  });

  it("répète la clé pour chaque entrée d'un tableau", () => {
    expect(buildQuery({ tag: ["a", "b"] })).toBe("?tag=a&tag=b");
  });

  it("sérialise une date en ISO", () => {
    expect(buildQuery({ from: new Date("2026-01-02T03:04:05.000Z") })).toBe(
      "?from=2026-01-02T03%3A04%3A05.000Z",
    );
  });
});
