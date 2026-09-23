import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Lock, MapPin, Truck } from "lucide-react";
import { useCart } from "../../hooks/useCart";
import { useAddresses, useSaveAddress } from "../../hooks/useAccount";
import { useCreateOrder } from "../../hooks/useOrders";
import { useAuth } from "../../lib/auth/AuthProvider";
import { useToast } from "../../context/ToastContext";
import { addressSchema, emptyAddress } from "../../schemas/address";
import type { AddressFormInput } from "../../schemas/address";
import { SHIPPING_METHODS } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import { productImageUrl } from "../../utils/product";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Checkbox, Field, Input } from "../../components/ui/Form";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import type { CreateOrderInput, ShippingMethod } from "../../types/api";

const steps = [
  { label: "Panier", done: true },
  { label: "Informations", active: true },
  { label: "Paiement" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart(true);
  const { data: addresses = [] } = useAddresses();
  const createOrder = useCreateOrder();
  const saveAddress = useSaveAddress();

  const [addressId, setAddressId] = useState<string>("new");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [saveNewAddress, setSaveNewAddress] = useState<boolean>(true);

  const addressForm = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      ...emptyAddress,
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
    },
  });

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  const selected = useMemo(
    () => SHIPPING_METHODS.find((m) => m.id === shippingMethod) ?? SHIPPING_METHODS[0],
    [shippingMethod],
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <PageLoader label="Chargement du panier…" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-12">
        <EmptyState
          title="Votre panier est vide"
          text="Ajoutez des articles avant de passer commande."
          actionLabel="Voir la boutique"
          actionTo="/boutique"
        />
      </div>
    );
  }

  const onPlaceOrder = async (input: CreateOrderInput): Promise<void> => {
    const order = await createOrder.mutateAsync(input);
    navigate("/commande/succes/" + order.id, { replace: true });
  };

  const onSubmitNewAddress = async (values: AddressFormInput): Promise<void> => {
    // Adresse ponctuelle : éventuellement enregistrée dans le carnet.
    const orderAddress = {
      fullName: values.fullName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      postalCode: values.postalCode || undefined,
      city: values.city,
      country: values.country || "Madagascar",
    };

    if (saveNewAddress) {
      await saveAddress.mutateAsync({
        ...orderAddress,
        label: values.label || "Adresse de livraison",
        isDefault: addresses.length === 0,
      });
    }

    await onPlaceOrder({
      shippingAddress: orderAddress,
      shippingMethod,
      saveAddress: saveNewAddress,
      addressLabel: values.label || undefined,
    });
  };

  // La validation react-hook-form ne s'applique qu'au formulaire d'adresse
  // ponctuelle : si le client choisit une adresse enregistrée, il n'y a aucun
  // champ à saisir. Sans cette distinction, les champs invisibles (vides)
  // échoueraient la validation et bloqueraient la soumission de la commande.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    if (addressId === "new") {
      void addressForm.handleSubmit(async (values) => {
        try {
          await onSubmitNewAddress(values);
        } catch (error) {
          toast(errorMessage(error), "error");
        }
      })(event);
      return;
    }
    event.preventDefault();
    void onPlaceOrder({ addressId, shippingMethod }).catch((error) =>
      toast(errorMessage(error), "error"),
    );
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Panier", to: "/panier" },
          { label: "Commande" },
        ]}
      />

      <ol className="mt-6 flex items-center gap-2 text-label-md sm:gap-4">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-center gap-2 sm:gap-4">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                step.done
                  ? "bg-emerald-600 text-white"
                  : step.active
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {step.done ? <Check size={14} /> : i + 1}
            </span>
            <span className={step.active ? "font-semibold text-primary" : "text-on-surface-variant"}>
              {step.label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-outline-variant sm:w-10" />}
          </li>
        ))}
      </ol>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Adresse */}
          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-3 font-display text-headline-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                1
              </span>
              Adresse de livraison
            </h2>

            {addresses.length > 0 && (
              <ul className="mt-5 space-y-3">
                {addresses.map((addr) => (
                  <li key={addr.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                        addressId === addr.id
                          ? "border-secondary bg-secondary-container/30"
                          : "border-outline-variant hover:border-secondary/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === addr.id}
                        onChange={() => setAddressId(addr.id)}
                        className="mt-1 accent-secondary"
                      />
                      <span className="text-body-sm">
                        <span className="flex flex-wrap items-center gap-2 font-semibold text-primary">
                          <MapPin size={14} className="text-secondary" />
                          {addr.label || "Adresse"}
                          {addr.isDefault && (
                            <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">
                              PAR DÉFAUT
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-on-surface-variant">
                          {addr.fullName} — {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city},{" "}
                          {addr.country}
                        </span>
                        <span className="block text-on-surface-variant">{addr.phone}</span>
                      </span>
                    </label>
                  </li>
                ))}
                <li>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      addressId === "new"
                        ? "border-secondary bg-secondary-container/30"
                        : "border-outline-variant hover:border-secondary/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === "new"}
                      onChange={() => setAddressId("new")}
                      className="accent-secondary"
                    />
                    <span className="text-body-sm font-semibold text-primary">
                      Utiliser une nouvelle adresse
                    </span>
                  </label>
                </li>
              </ul>
            )}

            {addressId === "new" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Libellé"
                  error={addressForm.formState.errors.label?.message}
                  className="sm:col-span-2"
                >
                  <Input placeholder="Domicile, Bureau…" {...addressForm.register("label")} />
                </Field>
                <Field
                  label="Destinataire"
                  required
                  error={addressForm.formState.errors.fullName?.message}
                >
                  <Input {...addressForm.register("fullName")} />
                </Field>
                <Field
                  label="Téléphone"
                  required
                  error={addressForm.formState.errors.phone?.message}
                >
                  <Input placeholder="+261 34 12 345 67" {...addressForm.register("phone")} />
                </Field>
                <Field
                  label="Adresse"
                  required
                  error={addressForm.formState.errors.addressLine1?.message}
                  className="sm:col-span-2"
                >
                  <Input placeholder="Lot II M 12 Bis" {...addressForm.register("addressLine1")} />
                </Field>
                <Field
                  label="Complément"
                  error={addressForm.formState.errors.addressLine2?.message}
                  className="sm:col-span-2"
                >
                  <Input {...addressForm.register("addressLine2")} />
                </Field>
                <Field
                  label="Code postal"
                  error={addressForm.formState.errors.postalCode?.message}
                >
                  <Input {...addressForm.register("postalCode")} />
                </Field>
                <Field label="Ville" required error={addressForm.formState.errors.city?.message}>
                  <Input {...addressForm.register("city")} />
                </Field>
                <Field
                  label="Pays"
                  required
                  error={addressForm.formState.errors.country?.message}
                >
                  <Input {...addressForm.register("country")} />
                </Field>

                <div className="sm:col-span-2">
                  <Checkbox
                    label="Enregistrer cette adresse dans mon carnet"
                    checked={saveNewAddress}
                    onChange={(e) => setSaveNewAddress(e.target.checked)}
                  />
                </div>
              </div>
            )}
          </section>

          {/* 2. Livraison */}
          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-3 font-display text-headline-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                2
              </span>
              Mode de livraison
            </h2>
            <ul className="mt-5 space-y-3">
              {SHIPPING_METHODS.map((method) => (
                <li key={method.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      shippingMethod === method.id
                        ? "border-secondary bg-secondary-container/30"
                        : "border-outline-variant hover:border-secondary/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      className="mt-1 accent-secondary"
                    />
                    <span className="flex-1 text-body-sm">
                      <span className="flex items-center gap-2 font-semibold text-primary">
                        <Truck size={14} className="text-secondary" /> {method.label}
                      </span>
                      <span className="mt-0.5 block text-on-surface-variant">{method.delay}</span>
                    </span>
                    <span className="text-body-sm font-semibold text-primary">
                      {method.price === 0 ? "Offerte" : formatPrice(method.price)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="font-display text-headline-sm text-primary">Votre commande</h2>

            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto thin-scroll">
              {items.map((item) => {
                const image = productImageUrl(item.product);
                return (
                  <li key={item.id} className="flex gap-3">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-container">
                      {image ? (
                        <img src={image} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-semibold text-primary">
                        {item.product.name}
                      </span>
                      <span className="block text-label-sm text-on-surface-variant">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </span>
                    <span className="text-body-sm font-semibold text-primary">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-surface-container-highest pt-4 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Sous-total</dt>
                <dd className="font-semibold text-primary">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Livraison</dt>
                <dd className="text-on-surface-variant">{selected.label}</dd>
              </div>
            </dl>

            {/* Le total définitif est calculé et figé par le serveur (§87). */}
            <p className="mt-4 rounded-lg bg-surface-container-low p-3 text-label-sm text-on-surface-variant">
              Le montant exact, les frais de livraison et les éventuelles remises sont recalculés
              par le serveur au moment de la validation.
            </p>

            <Button
              type="submit"
              className="mt-5 w-full"
              size="lg"
              disabled={createOrder.isPending || saveAddress.isPending}
            >
              <Lock size={16} />
              {createOrder.isPending ? "Validation…" : "Valider la commande"}
            </Button>

            <Link
              to="/panier"
              className="mt-3 block text-center text-body-sm text-on-surface-variant underline-offset-2 hover:underline"
            >
              Retour au panier
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
