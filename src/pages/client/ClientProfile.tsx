import { useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Save, User } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/format";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";
import Avatar from "../../components/ui/Avatar";

interface InfoForm {
  name: string;
  email: string;
}

interface InfoErrors {
  name?: string;
  email?: string;
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

interface PasswordErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

export default function ClientProfile() {
  const { user, updateProfile, changePassword } = useStore();
  const { toast } = useToast();

  const [info, setInfo] = useState<InfoForm>({ name: user?.name ?? "", email: user?.email ?? "" });
  const [infoErrors, setInfoErrors] = useState<InfoErrors>({});

  const [pwd, setPwd] = useState<PasswordForm>({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState<PasswordErrors>({});

  if (!user) return null;

  const submitInfo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: InfoErrors = {};
    if (!info.name.trim()) errs.name = "Le nom est requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) errs.email = "Adresse email invalide.";
    setInfoErrors(errs);
    if (Object.keys(errs).length) return;
    const result = updateProfile(user.id, info);
    if (!result.ok) {
      setInfoErrors({ email: result.error });
      return;
    }
    toast("Vos informations ont été mises à jour.");
  };

  const submitPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: PasswordErrors = {};
    if (pwd.next.length < 6) errs.next = "Au moins 6 caractères.";
    if (pwd.confirm !== pwd.next) errs.confirm = "Les mots de passe ne correspondent pas.";
    setPwdErrors(errs);
    if (Object.keys(errs).length) return;
    const result = changePassword(user.id, pwd.current, pwd.next);
    if (!result.ok) {
      setPwdErrors({ current: result.error });
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    toast("Votre mot de passe a été modifié.");
  };

  return (
    <div>
      <h1 className="font-display text-headline-lg text-primary">Mon profil</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">Gérez vos informations personnelles.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Informations */}
        <form onSubmit={submitInfo} className="card p-6" noValidate>
          <div className="flex items-center gap-4 border-b border-surface-container-highest pb-5">
            <Avatar name={info.name} size="lg" />
            <div>
              <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
                <User size={18} className="text-secondary" /> Informations
              </h2>
              <p className="text-label-sm text-on-surface-variant">Membre depuis le {formatDate(user.createdAt)}</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Nom complet" required error={infoErrors.name}>
              <Input value={info.name} onChange={(e) => setInfo((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Email" required error={infoErrors.email}>
              <Input
                type="email"
                value={info.email}
                onChange={(e) => setInfo((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="accent">
              <Save size={16} /> Enregistrer
            </Button>
          </div>
        </form>

        {/* Mot de passe */}
        <form onSubmit={submitPassword} className="card h-fit p-6" noValidate>
          <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
            <KeyRound size={18} className="text-secondary" /> Mot de passe
          </h2>
          <div className="mt-5 space-y-4">
            <Field label="Mot de passe actuel" required error={pwdErrors.current}>
              <Input
                type="password"
                value={pwd.current}
                onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>
            <Field label="Nouveau mot de passe" required error={pwdErrors.next}>
              <Input
                type="password"
                value={pwd.next}
                onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirmer" required error={pwdErrors.confirm}>
              <Input
                type="password"
                value={pwd.confirm}
                onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="outline">
              Modifier le mot de passe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
