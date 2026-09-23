import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, User } from "lucide-react";
import { useCurrentUser, useChangePassword, useUpdateProfile } from "../../hooks/useAccount";
import { changePasswordSchema, profileSchema } from "../../schemas/auth";
import type { ChangePasswordFormInput, ProfileFormInput } from "../../schemas/auth";
import { formatDate } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";
import PageLoader from "../../components/ui/PageLoader";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";

const ROLE_LABEL: Record<string, string> = {
  customer: "Client",
  seller: "Vendeur",
  admin: "Administrateur",
};

export default function ClientProfile() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone ?? "",
        }
      : undefined,
  });

  const passwordForm = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  if (isLoading || !profile) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement du profil…" />
      </div>
    );
  }

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
      });
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Mon profil</h1>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile.fullName} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-headline-sm text-primary">{profile.fullName}</p>
            <p className="truncate text-body-sm text-on-surface-variant">{profile.email}</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1.5">
            <Badge variant="secondary">{ROLE_LABEL[profile.role] ?? profile.role}</Badge>
            <span className="text-label-sm text-on-surface-variant">
              Membre depuis {formatDate(profile.createdAt, { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
          <User size={18} className="text-secondary" /> Informations personnelles
        </h2>

        <form onSubmit={(event) => void onProfileSubmit(event)} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Prénom" required error={profileForm.formState.errors.firstName?.message}>
            <Input {...profileForm.register("firstName")} />
          </Field>
          <Field label="Nom" required error={profileForm.formState.errors.lastName?.message}>
            <Input {...profileForm.register("lastName")} />
          </Field>
          <Field label="Adresse e-mail" required error={profileForm.formState.errors.email?.message}>
            <Input type="email" {...profileForm.register("email")} />
          </Field>
          <Field label="Téléphone" error={profileForm.formState.errors.phone?.message}>
            <Input placeholder="+261 34 12 345 67" {...profileForm.register("phone")} />
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
          <KeyRound size={18} className="text-secondary" /> Changer de mot de passe
        </h2>

        <form onSubmit={(event) => void onPasswordSubmit(event)} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          <Field
            label="Mot de passe actuel"
            required
            error={passwordForm.formState.errors.currentPassword?.message}
            className="sm:col-span-2"
          >
            <Input type="password" autoComplete="current-password" {...passwordForm.register("currentPassword")} />
          </Field>
          <Field
            label="Nouveau mot de passe"
            required
            hint="Au moins 10 caractères, dont une lettre et un chiffre."
            error={passwordForm.formState.errors.newPassword?.message}
          >
            <Input type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
          </Field>
          <Field
            label="Confirmer"
            required
            error={passwordForm.formState.errors.confirmPassword?.message}
          >
            <Input type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Modification…" : "Modifier le mot de passe"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
