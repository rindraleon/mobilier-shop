import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../../lib/api/auth.api";
import { useToast } from "../../context/ToastContext";
import { resetPasswordSchema } from "../../schemas/auth";
import type { ResetPasswordFormInput } from "../../schemas/auth";
import { errorMessage } from "../../utils/errors";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authApi.resetPassword(token, values.password);
      toast("Mot de passe réinitialisé. Vous pouvez vous connecter.");
      navigate("/connexion");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Réinitialisation" }]} />
      <div className="mx-auto mt-8 max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-headline-md text-primary">Choisir un nouveau mot de passe</h1>

          {!token ? (
            <p className="mt-4 text-body-md text-on-surface-variant">
              Lien invalide ou expiré.{" "}
              <Link to="/mot-de-passe-oublie" className="text-secondary underline-offset-2 hover:underline">
                Demandez un nouveau lien
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-4" noValidate>
              <Field
                label="Nouveau mot de passe"
                required
                hint="Au moins 8 caractères, dont une lettre et un chiffre."
                error={form.formState.errors.password?.message}
              >
                <Input type="password" autoComplete="new-password" {...form.register("password")} />
              </Field>
              <Field
                label="Confirmer"
                required
                error={form.formState.errors.confirmPassword?.message}
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                />
              </Field>
              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Enregistrement…" : "Réinitialiser"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
