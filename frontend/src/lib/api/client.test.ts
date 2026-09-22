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
});
