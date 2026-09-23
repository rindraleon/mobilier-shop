import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "lucide-react";
import { useSellerProfile, useSellerApplication } from "../../hooks/useSeller";
import { sellerApplicationSchema } from "../../schemas/seller";
import type { SellerApplicationInput } from "../../schemas/seller";
import { SELLER_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { Field, Input, Textarea } from "../../components/ui/Form";
import PageLoader from "../../components/ui/PageLoader";
import StatusBadge from "../../components/ui/StatusBadge";
import { sellersApi } from "../../lib/api/sellers.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/query/keys";

export default function SellerProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: seller, isLoading } = useSellerProfile();
  const { data: application } = useSellerApplication();

  const form = useForm<SellerApplicationInput>({
    resolver: zodResolver(sellerApplicationSchema),
    values: seller
      ? {
          shopName: seller.shopName,
          description: seller.description ?? "",
          phone: seller.phone ?? "",
          city: seller.city ?? "",
          addressLine: seller.addressLine ?? "",
        }
      : undefined,
  });

  const update = useMutation({
    mutationFn: (input: SellerApplicationInput) =>
      sellersApi.apply({
        shopName: input.shopName,
        description: input.description || undefined,
        phone: input.phone || undefined,
        city: input.city || undefined,
        addressLine: input.addressLine || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.seller.profile });
      void queryClient.invalidateQueries({ queryKey: queryKeys.sellerApplication });
      toast("Boutique mise à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });

  if (isLoading || !seller) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement de votre boutique…" />
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => update.mutate(values));

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Ma boutique</h1>

      <div className="card mt-6 flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <Store size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-headline-sm text-primary">{seller.shopName}</p>
          <p className="truncate text-body-sm text-on-surface-variant">/{seller.slug}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge kind="seller" status={seller.status} />
          <span className="text-label-sm text-on-surface-variant">
            {seller.status === "approved"
              ? "Boutique active"
              : SELLER_STATUS[seller.status]?.description}
          </span>
        </div>
      </div>

      {seller.rejectionReason && (
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-body-sm text-red-800">
          Motif de refus : {seller.rejectionReason}
        </p>
      )}

      <form onSubmit={(event) => void onSubmit(event)} className="card mt-6 space-y-4 p-5 sm:p-6" noValidate>
        <h2 className="font-display text-headline-sm text-primary">Informations</h2>

        <Field label="Nom de la boutique" required error={form.formState.errors.shopName?.message}>
          <Input {...form.register("shopName")} />
        </Field>

        <Field label="Description" error={form.formState.errors.description?.message}>
          <Textarea rows={4} {...form.register("description")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone" error={form.formState.errors.phone?.message}>
            <Input {...form.register("phone")} />
          </Field>
          <Field label="Ville" error={form.formState.errors.city?.message}>
            <Input {...form.register("city")} />
          </Field>
        </div>

        <Field label="Adresse de l'atelier" error={form.formState.errors.addressLine?.message}>
          <Input {...form.register("addressLine")} />
        </Field>

        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>

      <section className="card mt-6 p-5">
        <h2 className="font-display text-headline-sm text-primary">Historique de la demande</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3 text-body-sm">
          <div>
            <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Soumise le
            </dt>
            <dd className="text-primary">
              {seller.submittedAt ? formatDate(seller.submittedAt) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Révisée le
            </dt>
            <dd className="text-primary">
              {seller.reviewedAt ? formatDate(seller.reviewedAt) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Créée le
            </dt>
            <dd className="text-primary">{formatDate(seller.createdAt)}</dd>
          </div>
        </dl>
        {application === null && (
          <p className="mt-3 text-label-sm text-on-surface-variant">
            Aucune demande enregistrée côté serveur.
          </p>
        )}
      </section>
    </div>
  );
}
