import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Clock, Store } from "lucide-react";
import { useSellerApplication, useApplySeller } from "../../hooks/useSeller";
import { sellerApplicationSchema } from "../../schemas/seller";
import type { SellerApplicationInput } from "../../schemas/seller";
import { SELLER_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Field, Input, Textarea } from "../../components/ui/Form";
import StatusBadge from "../../components/ui/StatusBadge";
import PageLoader from "../../components/ui/PageLoader";

export default function BecomeSeller() {
  const { toast } = useToast();
  const { data: seller, isLoading } = useSellerApplication();
  const apply = useApplySeller();

  const form = useForm<SellerApplicationInput>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: { shopName: "", description: "", phone: "", city: "", addressLine: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await apply.mutateAsync({
        shopName: values.shopName,
        description: values.description || undefined,
        phone: values.phone || undefined,
        city: values.city || undefined,
        addressLine: values.addressLine || undefined,
      });
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  if (isLoading) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement de votre demande…" />
      </div>
    );
  }

  // Une demande existe déjà : on affiche son état d'avancement.
  if (seller) {
    const meta = SELLER_STATUS[seller.status];
    return (
      <div className="container-app py-8 lg:py-12">
        <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Devenir vendeur" }]} />

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                {seller.status === "approved" ? (
                  <CheckCircle2 size={22} />
                ) : seller.status === "rejected" ? (
                  <AlertCircle size={22} />
                ) : (
                  <Clock size={22} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-headline-md text-primary">{seller.shopName}</h1>
                <div className="mt-2">
                  <StatusBadge kind="seller" status={seller.status} />
                </div>
                <p className="mt-3 text-body-md text-on-surface-variant">{meta?.description}</p>
                {seller.rejectionReason && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-body-sm text-red-800">
                    Motif : {seller.rejectionReason}
                  </p>
                )}
                {seller.submittedAt && (
                  <p className="mt-3 text-label-sm text-on-surface-variant">
                    Demandé le {formatDate(seller.submittedAt)}
                  </p>
                )}
              </div>
            </div>

            {seller.status === "approved" && (
              <Button as={Link} to="/vendeur" className="mt-6 w-full" size="lg">
                <Store size={16} /> Accéder à mon espace vendeur
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Devenir vendeur" }]} />

      <div className="mx-auto mt-8 grid max-w-3xl gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="card p-6 sm:p-8">
            <h1 className="font-display text-headline-md text-primary">Devenir vendeur</h1>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Créez votre boutique et vendez vos meubles. Votre demande sera examinée par un
              administrateur avant activation.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <Field label="Nom de la boutique" required error={form.formState.errors.shopName?.message}>
                <Input placeholder="Atelier Rindra" {...form.register("shopName")} />
              </Field>

              <Field
                label="Description"
                hint="Présentez votre atelier, vos matériaux, vos délais."
                error={form.formState.errors.description?.message}
              >
                <Textarea rows={4} {...form.register("description")} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Téléphone" error={form.formState.errors.phone?.message}>
                  <Input placeholder="+261 34 12 345 67" {...form.register("phone")} />
                </Field>
                <Field label="Ville" error={form.formState.errors.city?.message}>
                  <Input placeholder="Antananarivo" {...form.register("city")} />
                </Field>
              </div>

              <Field label="Adresse de l'atelier" error={form.formState.errors.addressLine?.message}>
                <Input {...form.register("addressLine")} />
              </Field>

              <p className="rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">
                Vous pourrez téléverser vos pièces justificatives après la création de la demande,
                depuis votre espace vendeur.
              </p>

              <Button type="submit" size="lg" className="w-full" disabled={apply.isPending}>
                {apply.isPending ? "Envoi…" : "Envoyer ma demande"}
              </Button>
            </form>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-display text-headline-sm text-primary">Comment ça marche ?</h2>
            <ol className="mt-4 space-y-4">
              {[
                "Vous envoyez votre demande avec les informations de votre atelier.",
                "Un administrateur vérifie la demande et vos pièces justificatives.",
                "Une fois approuvée, votre boutique est active : vous publiez vos produits.",
                "Vous suivez vos commandes, vos stocks et vos revenus en temps réel.",
              ].map((text, i) => (
                <li key={text} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-on-secondary">
                    {i + 1}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">{text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-label-sm text-amber-800">
              Aucune vente n'est possible tant que la boutique n'est pas approuvée (§17).
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
