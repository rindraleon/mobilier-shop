import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Lock, Mail, Store } from "lucide-react";
import { useAuth } from "../../lib/auth/AuthProvider";
import { useToast } from "../../context/ToastContext";
import { loginSchema, registerSchema } from "../../schemas/auth";
import type { LoginInput, RegisterFormInput } from "../../schemas/auth";
import { errorMessage } from "../../utils/errors";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";

type Tab = "login" | "register";

interface LocationState {
  from?: string;
}

export default function Login() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? "/espace-client";

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      asSeller: false,
    },
  });

  const onLogin = loginForm.handleSubmit(async (values) => {
    try {
      const user = await login(values.email, values.password);
      toast("Bonjour " + user.firstName + ", vous êtes connecté.");
      navigate(user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    try {
      const user = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
        asSeller: values.asSeller,
      });
      toast(
        values.asSeller
          ? "Compte créé. Votre demande vendeur est en cours de validation."
          : "Compte créé. Bienvenue !",
      );
      navigate(user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  const busy = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting;

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Connexion" }]} />

      <div className="mx-auto mt-8 max-w-lg">
        <div className="card p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-container p-1">
            <button
              onClick={() => setTab("login")}
              aria-pressed={tab === "login"}
              className={`rounded-md px-4 py-2.5 text-body-sm font-semibold transition-colors ${
                tab === "login" ? "bg-white text-primary shadow-card" : "text-on-surface-variant"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setTab("register")}
              aria-pressed={tab === "register"}
              className={`rounded-md px-4 py-2.5 text-body-sm font-semibold transition-colors ${
                tab === "register" ? "bg-white text-primary shadow-card" : "text-on-surface-variant"
              }`}
            >
              Créer un compte
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={onLogin} className="mt-6 space-y-4" noValidate>
              <Field label="Adresse e-mail" required error={loginForm.formState.errors.email?.message}>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.mg"
                  {...loginForm.register("email")}
                />
              </Field>

              <Field
                label="Mot de passe"
                required
                error={loginForm.formState.errors.password?.message}
              >
                <span className="relative block">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-11"
                    {...loginForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </Field>

              <div className="flex justify-end">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-body-sm text-secondary underline-offset-2 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                <Lock size={16} /> {busy ? "Connexion…" : "Se connecter"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onRegister} className="mt-6 space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom" required error={registerForm.formState.errors.firstName?.message}>
                  <Input autoComplete="given-name" {...registerForm.register("firstName")} />
                </Field>
                <Field label="Nom" required error={registerForm.formState.errors.lastName?.message}>
                  <Input autoComplete="family-name" {...registerForm.register("lastName")} />
                </Field>
              </div>

              <Field label="Adresse e-mail" required error={registerForm.formState.errors.email?.message}>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.mg"
                  {...registerForm.register("email")}
                />
              </Field>

              <Field label="Téléphone" error={registerForm.formState.errors.phone?.message}>
                <Input
                  autoComplete="tel"
                  placeholder="+261 34 12 345 67"
                  {...registerForm.register("phone")}
                />
              </Field>

              <Field
                label="Mot de passe"
                required
                hint="Au moins 8 caractères, dont une lettre et un chiffre."
                error={registerForm.formState.errors.password?.message}
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-11"
                  {...registerForm.register("password")}
                />
              </Field>

              <Field
                label="Confirmer le mot de passe"
                required
                error={registerForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...registerForm.register("confirmPassword")}
                />
              </Field>

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-body-sm text-secondary underline-offset-2 hover:underline"
              >
                {showPassword ? "Masquer" : "Afficher"} les mots de passe
              </button>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low p-3.5">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded accent-secondary"
                  {...registerForm.register("asSeller")}
                />
                <span className="text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1.5 font-semibold text-primary">
                    <Store size={15} /> Je veux vendre mes meubles
                  </span>
                  Une demande vendeur sera créée. Un administrateur doit la valider avant toute
                  publication (aucune vente possible avant approbation).
                </span>
              </label>

              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                <Check size={16} /> {busy ? "Création…" : "Créer mon compte"}
              </Button>
            </form>
          )}

          <p className="mt-6 flex items-center justify-center gap-2 text-label-sm text-on-surface-variant">
            <Mail size={13} /> Vos données sont traitées par notre API sécurisée.
          </p>
        </div>

        {/* Comptes de démonstration — utiles pour évaluer le projet. */}
        <div className="card mt-5 p-5">
          <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
            Comptes de démonstration
          </p>
          <ul className="mt-3 space-y-1.5 text-body-sm text-on-surface-variant">
            <li>
              <strong className="text-primary">Admin</strong> — admin@example.local
            </li>
            <li>
              <strong className="text-primary">Vendeur approuvé</strong> — seller@example.local
            </li>
            <li>
              <strong className="text-primary">Vendeur en attente</strong> — pending@example.local
            </li>
            <li>
              <strong className="text-primary">Client</strong> — customer@example.local
            </li>
          </ul>
          <p className="mt-3 text-label-sm text-on-surface-variant">
            Mot de passe commun : <code className="text-primary">Motdepasse1!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
