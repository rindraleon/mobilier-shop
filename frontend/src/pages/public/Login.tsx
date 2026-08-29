import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";

interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

const demoAccounts: DemoAccount[] = [
  { label: "Client démo", email: "client@anti.fr", password: "client123" },
  { label: "Admin démo", email: "admin@anti.fr", password: "admin123" },
];

interface LoginForm {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

interface LoginErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  global?: string;
}

export default function Login() {
  const { login, register } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [form, setForm] = useState<LoginForm>({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<LoginErrors>({});

  const set = (key: keyof LoginForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const afterAuth = (name: string, role: string) => {
    toast(`Bienvenue, ${name.split(" ")[0]} !`);
    const fallback = role === "admin" ? "/admin" : "/espace-client";
    navigate(from ?? fallback, { replace: true });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: LoginErrors = {};
    if (mode === "register" && !form.name.trim()) errs.name = "Votre nom est requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Adresse email invalide.";
    if (form.password.length < 6) errs.password = "Le mot de passe doit contenir au moins 6 caractères.";
    if (mode === "register" && form.confirm !== form.password) {
      errs.confirm = "Les mots de passe ne correspondent pas.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = mode === "login" ? login(form.email, form.password) : register(form);
    if (!result.ok) {
      setErrors({ global: result.error });
      return;
    }
    afterAuth(result.user!.name, result.user!.role);
  };

  return (
    <div className="grid min-h-[70vh] lg:grid-cols-2">
      {/* Visuel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/images/hero.jpg"
          alt="Intérieur signé Anti"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative flex h-full flex-col justify-end p-12 text-on-primary">
          <p className="text-label-md uppercase tracking-[0.2em] text-secondary-fixed-dim">Anti</p>
          <h2 className="mt-3 max-w-md font-display text-display-md">
            Votre intérieur mérite le meilleur du mobilier.
          </h2>
          <p className="mt-4 max-w-md text-body-lg text-primary-fixed-dim">
            Rejoignez plus de 12 000 clients : suivi de commandes, favoris, adresses enregistrées et offres
            exclusives.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="font-display text-3xl font-bold text-primary">
              Anti
            </Link>
            <h1 className="mt-4 font-display text-headline-lg text-primary">
              {mode === "login" ? "Content de vous revoir" : "Créer un compte"}
            </h1>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {mode === "login"
                ? "Connectez-vous pour accéder à votre espace."
                : "Quelques secondes suffisent pour commander plus vite."}
            </p>
          </div>

          {/* Onglets */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-container p-1">
            {(
              [
                { id: "login", label: "Connexion" },
                { id: "register", label: "Inscription" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMode(tab.id);
                  setErrors({});
                }}
                className={`rounded-md py-2.5 text-body-sm font-semibold transition-colors ${
                  mode === tab.id ? "bg-white text-primary shadow-card" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {errors.global && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700">
              {errors.global}
            </p>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "register" && (
              <Field label="Nom complet" required error={errors.name}>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <Input
                    value={form.name}
                    onChange={set("name")}
                    placeholder="Camille Moreau"
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
              </Field>
            )}

            <Field label="Email" required error={errors.email}>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <Input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="vous@exemple.fr"
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </Field>

            <Field label="Mot de passe" required error={errors.password}>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="••••••••"
                  className="pl-10 pr-11"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            {mode === "register" && (
              <Field label="Confirmer le mot de passe" required error={errors.confirm}>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.confirm}
                    onChange={set("confirm")}
                    placeholder="••••••••"
                    className="pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </Field>
            )}

            <Button type="submit" variant="accent" size="lg" className="w-full">
              {mode === "login" ? (
                <>
                  <LogIn size={17} /> Se connecter
                </>
              ) : (
                <>
                  <UserPlus size={17} /> Créer mon compte
                </>
              )}
            </Button>
          </form>

          {/* Comptes de démo */}
          <div className="mt-8 rounded-lg border border-dashed border-secondary/40 bg-secondary-container/25 p-4">
            <p className="text-label-md text-on-secondary-container">Comptes de démonstration</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => {
                    setMode("login");
                    setForm({ name: "", email: acc.email, password: acc.password, confirm: "" });
                    setErrors({});
                  }}
                  className="rounded-lg border border-outline-variant/60 bg-white px-3 py-2.5 text-left text-body-sm transition-colors hover:border-secondary"
                >
                  <span className="block font-semibold text-primary">{acc.label}</span>
                  <span className="block truncate text-on-surface-variant">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
