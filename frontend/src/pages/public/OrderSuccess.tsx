import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useOrder } from "../../hooks/useOrders";
import { useOrderPayment, usePaymentProviders, useSubmitPayment } from "../../hooks/usePayments";
import { useToast } from "../../context/ToastContext";
import { paymentSchema, validateReference, normalizeReference } from "../../schemas/payment";
import type { PaymentFormInput } from "../../schemas/payment";
import { ORDER_STATUS, PAYMENT_PROVIDERS } from "../../utils/constants";
import type { PaymentProviderMeta } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Form";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import OrderStatusBadge from "../../components/ui/OrderStatusBadge";
import StatusBadge from "../../components/ui/StatusBadge";
import type { MobileMoneyProvider } from "../../types/api";

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { data: payment } = useOrderPayment(id);
  const submitPayment = useSubmitPayment();
  // La liste des opérateurs activés vient de l'API (`GET /payments/providers`) :
  // c'est le serveur qui fait foi, les constantes locales ne fournissent que
  // l'habillage (format de référence, couleur, initiales).
  const { data: serverProviders } = usePaymentProviders();
  const [provider, setProvider] = useState<MobileMoneyProvider>("mvola");


  const form = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { provider: "mvola", transactionReference: "", payerPhone: "" },
  });

  const operatorCards = useMemo<PaymentProviderMeta[]>(() => {
    if (!serverProviders?.length) return PAYMENT_PROVIDERS;
    const ordered = serverProviders
      .map((p) => PAYMENT_PROVIDERS.find((m) => m.id === p.name))
      .filter((m): m is PaymentProviderMeta => Boolean(m));
    return ordered.length
      ? ordered
      : PAYMENT_PROVIDERS.filter((m) =>
          serverProviders.some((p) => p.name === m.id),
        );
  }, [serverProviders]);

  // Si l'opérateur par défaut n'est pas (ou plus) activé côté serveur, on
  // sélectionne le premier disponible pour ne jamais soumettre un opérateur
  // désactivé.
  useEffect(() => {
    if (!operatorCards.length) return;
    if (operatorCards.some((p) => p.id === provider)) return;
    const first = operatorCards[0]!.id;
    setProvider(first);
    form.setValue("provider", first);
  }, [operatorCards, provider, form]);

  if (isLoading) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement de la commande…" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container-app py-20">
        <EmptyState
          title="Commande introuvable"
          text="Cette commande n'existe pas ou ne vous appartient pas."
          actionLabel="Mes commandes"
          actionTo="/espace-client/commandes"
        />
      </div>
    );
  }

  const activePayment = order.payment ?? payment ?? null;
  const canSubmit =
    !activePayment ||
    activePayment.status === "pending" ||
    activePayment.status === "rejected";
  const providerMeta = PAYMENT_PROVIDERS.find((p) => p.id === provider);

  const onSubmit = form.handleSubmit(async (values) => {
    const reference = normalizeReference(values.transactionReference);
    const invalid = validateReference(values.provider, reference);
    if (invalid) {
      form.setError("transactionReference", { message: invalid });
      return;
    }
    try {
      await submitPayment.mutateAsync({
        orderId: order.id,
        input: {
          provider: values.provider,
          transactionReference: reference,
          payerPhone: values.payerPhone || undefined,
        },
      });
      form.reset({ provider: values.provider, transactionReference: "", payerPhone: "" });
      void refetch();
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  const copyReference = (): void => {
    void navigator.clipboard?.writeText(order.orderNumber);
    toast("Numéro de commande copié.");
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Mes commandes", to: "/espace-client/commandes" },
          { label: order.orderNumber },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-primary">
            {order.status === "pending_payment"
              ? "Commande enregistrée"
              : "Merci pour votre commande !"}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-body-lg text-on-surface-variant">
            <span className="font-semibold text-primary">{order.orderNumber}</span>
            <button
              onClick={copyReference}
              aria-label="Copier le numéro de commande"
              className="rounded p-1 hover:bg-surface-container"
            >
              <Copy size={14} />
            </button>
            <span>· Passée le {formatDate(order.createdAt)}</span>
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="mt-4 max-w-2xl text-body-md text-on-surface-variant">
        {ORDER_STATUS[order.status]?.description}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Articles */}
          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <Package size={18} className="text-secondary" /> Articles
            </h2>
            <ul className="mt-4 divide-y divide-surface-container-high">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-container">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link
                      to={item.slug ? "/boutique/" + item.slug : "/boutique"}
                      className="block truncate text-body-sm font-semibold text-primary hover:text-secondary"
                    >
                      {item.name}
                    </Link>
                    <span className="block text-label-sm text-on-surface-variant">
                      {item.sellerName ?? "Vendeur"}
                    </span>
                  </span>
                  <span className="text-body-sm text-on-surface-variant">× {item.quantity}</span>
                  <span className="w-28 text-right text-body-sm font-semibold text-primary">
                    {formatPrice(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-surface-container-highest pt-4 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Remise {order.promoCode ? `(${order.promoCode})` : ""}</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Livraison</dt>
                <dd>{formatPrice(order.shippingCost)}</dd>
              </div>
              <div className="flex justify-between border-t border-surface-container-highest pt-2 text-body-lg">
                <dt className="font-semibold text-primary">Total</dt>
                <dd className="font-display text-xl text-primary">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Paiement */}
          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <CreditCard size={18} className="text-secondary" /> Paiement Mobile Money
            </h2>

            {activePayment && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low p-4">
                <StatusBadge kind="payment" status={activePayment.status} />
                <span className="text-body-sm text-on-surface-variant">
                  {PAYMENT_PROVIDERS.find((p) => p.id === activePayment.provider)?.label ??
                    activePayment.provider}{" "}
                  · réf. {activePayment.transactionReference}
                </span>
                <span className="ml-auto text-body-sm font-semibold text-primary">
                  {formatPrice(activePayment.amount)}
                </span>
              </div>
            )}

            {activePayment?.status === "submitted" && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-sky-50 p-4 text-body-sm text-sky-800">
                <Clock size={17} className="mt-0.5 shrink-0" />
                Référence reçue. Un administrateur vérifie la transaction auprès de l'opérateur.
                Vous serez notifié dès la validation — aucune validation automatique n'est simulée.
              </p>
            )}

            {activePayment?.status === "verified" && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-4 text-body-sm text-emerald-800">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                Paiement vérifié. Votre commande est en cours de traitement par le vendeur.
              </p>
            )}

            {activePayment?.status === "rejected" && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-body-sm text-red-800">
                <XCircle size={17} className="mt-0.5 shrink-0" />
                Paiement rejeté : {activePayment.rejectionReason ?? "référence non vérifiable"}.
                Vous pouvez soumettre une nouvelle référence ci-dessous.
              </p>
            )}

            {canSubmit && (
              <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
                <div className="grid gap-3 sm:grid-cols-3">
                  {operatorCards.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProvider(p.id);
                        form.setValue("provider", p.id);
                      }}
                      aria-pressed={provider === p.id}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-3 text-body-sm font-semibold transition-colors ${
                        provider === p.id
                          ? "border-secondary bg-secondary-container/40 text-on-secondary-container"
                          : "border-outline-variant text-on-surface-variant hover:border-secondary/60"
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold">
                        {p.initials}
                      </span>
                      {p.label}
                    </button>
                  ))}
                </div>

                <input type="hidden" {...form.register("provider")} />

                <p className="rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">
                  <ShieldCheck size={13} className="mr-1 inline text-secondary" />
                  Effectuez le virement de <strong>{formatPrice(order.total)}</strong> puis saisissez
                  la référence reçue. Elle sera vérifiée manuellement par un administrateur.
                </p>

                <Field
                  label="Référence de transaction"
                  required
                  hint={providerMeta?.hint}
                  error={form.formState.errors.transactionReference?.message}
                >
                  <Input
                    placeholder="MP2408151234A00001"
                    autoComplete="off"
                    {...form.register("transactionReference")}
                  />
                </Field>

                <Field
                  label="Numéro ayant payé"
                  error={form.formState.errors.payerPhone?.message}
                >
                  <Input placeholder="+261 34 12 345 67" {...form.register("payerPhone")} />
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={submitPayment.isPending}>
                  {submitPayment.isPending ? "Envoi…" : "Envoyer la référence"}
                </Button>
              </form>
            )}
          </section>
        </div>

        {/* Livraison */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-headline-sm text-primary">
              <MapPin size={18} className="text-secondary" /> Livraison
            </h2>
            <address className="mt-3 not-italic text-body-sm text-on-surface-variant">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              ) : null}
              <br />
              {order.shippingAddress.postalCode ? order.shippingAddress.postalCode + " " : ""}
              {order.shippingAddress.city}
              <br />
              {order.shippingAddress.country}
              <br />
              {order.shippingAddress.phone}
            </address>
            <p className="mt-3 text-body-sm text-on-surface-variant">
              Mode : {order.shippingMethod === "pickup" ? "Retrait en atelier" : "Livraison"}
            </p>
            {order.notes && (
              <p className="mt-2 text-body-sm text-on-surface-variant">Note : {order.notes}</p>
            )}
          </section>

          {order.statusHistory.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-headline-sm text-primary">Suivi</h2>
              <ol className="mt-3 space-y-3">
                {order.statusHistory.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                    <div>
                      <OrderStatusBadge status={entry.newStatus} />
                      {entry.comment && (
                        <p className="mt-1 text-label-sm text-on-surface-variant">{entry.comment}</p>
                      )}
                      <p className="mt-0.5 text-label-sm text-on-surface-variant">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="flex flex-col gap-2">
            <Button as={Link} to="/espace-client/commandes" variant="outline" className="w-full">
              Mes commandes
            </Button>
            <Button as={Link} to="/boutique" variant="ghost" className="w-full">
              Continuer mes achats
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
