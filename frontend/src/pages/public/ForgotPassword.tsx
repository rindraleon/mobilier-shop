import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../../lib/api/auth.api";
import { useToast } from "../../context/ToastContext";
import { forgotPasswordSchema } from "../../schemas/auth";
import type { ForgotPasswordInput } from "../../schemas/auth";
import { errorMessage } from "../../utils/errors";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [sent, setSent] = useState<boolean>(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authApi.forgotPassword(values.email);
      // Réponse neutre : on ne révèle pas si le compte existe.
      setSent(true);
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Accueil", to: "/" }, { label: "Mot de passe oublié" }]}
      />
      <div className="mx-auto mt-8 max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-headline-md text-primary">Mot de passe oublié</h1>

          {sent ? (
            <>
              <p className="mt-4 text-body-md text-on-surface-variant">
                Si un compte existe pour cette adresse, un e-mail contenant un lien de
                réinitialisation vient d'être envoyé.
              </p>
              <Link
                to="/connexion"
                className="mt-6 inline-block text-body-sm text-secondary underline-offset-2 hover:underline"
              >
                Retour à la connexion
              </Link>
            </>
          ) : (
            <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-4" noValidate>
              <p className="text-body-sm text-on-surface-variant">
                Saisissez l'adresse e-mail de votre compte. Nous vous enverrons un lien pour
                choisir un nouveau mot de passe.
              </p>
              <Field label="Adresse e-mail" required error={form.formState.errors.email?.message}>
                <Input type="email" autoComplete="email" {...form.register("email")} />
              </Field>
              <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Envoi…" : "Envoyer le lien"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
