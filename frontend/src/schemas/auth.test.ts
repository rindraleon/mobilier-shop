import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

const valid = {
  firstName: "Rindra",
  lastName: "Leon",
  email: "rindra@example.mg",
  phone: "",
  password: "Motdepasse1",
  confirmPassword: "Motdepasse1",
};

describe("registerSchema", () => {
  it("accepte un mot de passe conforme (8 caractères, une lettre, un chiffre)", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un mot de passe sans chiffre", () => {
    const result = registerSchema.safeParse({ ...valid, password: "Motdepasse", confirmPassword: "Motdepasse" });
    expect(result.success).toBe(false);
  });

  it("refuse un mot de passe trop court", () => {
    const result = registerSchema.safeParse({ ...valid, password: "Ab1", confirmPassword: "Ab1" });
    expect(result.success).toBe(false);
  });

  it("refuse deux mots de passe différents", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "AutreMot2" });
    expect(result.success).toBe(false);
  });

  it("refuse une adresse e-mail invalide", () => {
    expect(registerSchema.safeParse({ ...valid, email: "pas-un-email" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepte des identifiants valides", () => {
    expect(loginSchema.safeParse({ email: "a@b.mg", password: "x" }).success).toBe(true);
  });

  it("exige un mot de passe", () => {
    expect(loginSchema.safeParse({ email: "a@b.mg", password: "" }).success).toBe(false);
  });
});
