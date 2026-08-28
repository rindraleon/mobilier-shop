import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Banknote, Check, CreditCard, Lock, MapPin, Tag, Truck, Wallet, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useStore } from "../../context/StoreContext";
import type { PromoResult } from "../../context/StoreContext";
import { useToast } from "../../context/ToastContext";
import type { Address } from "../../types";
import { FREE_SHIPPING_THRESHOLD, PAYMENT_METHODS, SHIPPING_METHODS } from "../../utils/constants";
import { formatPrice } from "../../utils/format";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Button from "../../components/ui/Button";
import { Checkbox, Field, Input } from "../../components/ui/Form";
import AddressFields, { emptyAddress, validateAddress } from "../../components/ui/AddressFields";

const paymentIcons: Record<string, LucideIcon> = { card: CreditCard, paypal: Wallet, cod: Banknote };

const formatCardNumber = (v: string): string =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

const formatExpiry = (v: string): string => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

interface CardForm {
  number: string;
  holder: string;
  expiry: string;
  cvc: string;
}

interface CheckoutErrors {
  [key: string]: string | undefined;
}

export default function Checkout() {
  const { user, placeOrder, validatePromo, saveAddress } = useStore();
  const { detailedItems, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultAddress = user?.addresses.find((a) => a.isDefault) || user?.addresses[0] || null;
  const [addressId, setAddressId] = useState<string>(defaultAddress ? defaultAddress.id ?? "new" : "new");
  const [addressForm, setAddressForm] = useState<Address>({ ...emptyAddress, fullName: user?.name ?? "" });
  const [saveNewAddress, setSaveNewAddress] = useState<boolean>(true);
  const [shippingMethod, setShippingMethod] = useState<string>("standard");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [card, setCard] = useState<CardForm>({ number: "", holder: "", expiry: "", cvc: "" });
  const [promoInput, setPromoInput] = useState<string>("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const totals = useMemo(() => {
    const discount = +(subtotal * (promo?.ok ? promo.rate : 0)).toFixed(2);
    const method = SHIPPING_METHODS.find((m) => m.id === shippingMethod) ?? SHIPPING_METHODS[0];
    const shippingCost = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : method.price;
    return { discount, shippingCost, total: +(subtotal - discount + shippingCost).toFixed(2) };
  }, [subtotal, promo, shippingMethod]);

  if (!user) return <Navigate to="/connexion" state={{ from: "/commande" }} replace />;
  if (detailedItems.length === 0 && !submitting) {
    return <Navigate to="/panier" replace />;
  }

  const { id: userId, name: userName, email: userEmail, addresses: userAddresses } = user;

  const applyPromo = () => {
    const result = validatePromo(promoInput);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    setPromo(result);
    toast(`Code ${result.code} appliqué : −${Math.round(result.rate * 100)} % sur votre commande.`);
  };

  const validate = (): CheckoutErrors => {
    const errs: CheckoutErrors = {};
    if (addressId === "new") {
      Object.entries(validateAddress(addressForm)).forEach(([k, v]) => {
        errs[k] = v;
      });
    }
    if (paymentMethod === "card") {
      if (!card.holder.trim()) errs.holder = "Nom du titulaire requis.";
      if (card.number.replace(/\s/g, "").length !== 16) errs.number = "Le numéro doit contenir 16 chiffres.";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) errs.expiry = "Format attendu : MM/AA.";
      if (!/^\d{3,4}$/.test(card.cvc)) errs.cvc = "3 chiffres.";
    }
    return errs;
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Veuillez corriger les champs signalés.", "error");
      return;
    }

    const shippingAddress: Address =
      addressId === "new"
        ? { ...addressForm, label: addressForm.label || "Nouvelle adresse" }
        : userAddresses.find((a) => a.id === addressId) ?? { ...addressForm };

    if (addressId === "new" && saveNewAddress) {
      saveAddress(userId, { ...addressForm, isDefault: userAddresses.length === 0 });
    }

    setSubmitting(true);
    // Simulation du paiement
    setTimeout(() => {
      const order = placeOrder({
        items: detailedItems.map(({ product, qty }) => ({ productId: product.id, qty })),
        shippingAddress,
        shippingMethod,
        paymentMethod,
        promoCode: promo?.ok ? promo.code : null,
        userId,
        customerName: userName,
        customerEmail: userEmail,
      });
      clearCart();
      navigate(`/commande/succes/${order.id}`, { replace: true });
    }, 900);
  };

  const onAddressChange = (key: string, value: string) => setAddressForm((f) => ({ ...f, [key]: value }));
  const onCardChange = (key: keyof CardForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setCard((c) => ({ ...c, [key]: e.target.value }));

  const steps = [
    { label: "Panier", done: true },
    { label: "Informations", active: true },
    { label: "Confirmation" },
  ];

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Accueil", to: "/" }, { label: "Panier", to: "/panier" }, { label: "Commande" }]}
      />

      {/* Étapes */}
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

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Adresse */}
          <section className="card p-6">
            <h2 className="flex items-center gap-3 font-display text-headline-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                1
              </span>
              Adresse de livraison
            </h2>

            {userAddresses.length > 0 && (
              <ul className="mt-5 space-y-3">
                {userAddresses.map((addr) => (
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
                        onChange={() => setAddressId(addr.id ?? "new")}
                        className="mt-1 accent-secondary"
                      />
                      <span className="text-body-sm">
                        <span className="flex items-center gap-2 font-semibold text-primary">
                          <MapPin size={14} className="text-secondary" />
                          {addr.label || "Adresse"}
                          {addr.isDefault && (
                            <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">
                              PAR DÉFAUT
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-on-surface-variant">
                          {addr.fullName} — {addr.address}
                          {addr.address2 ? `, ${addr.address2}` : ""}, {addr.postalCode} {addr.city}, {addr.country}
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
                    <span className="text-body-sm font-semibold text-primary">Utiliser une nouvelle adresse</span>
                  </label>
                </li>
              </ul>
            )}

            {addressId === "new" && (
              <div className="mt-5 space-y-4">
                <AddressFields value={addressForm} onChange={onAddressChange} errors={errors} showLabel />
                <Checkbox
                  label="Enregistrer cette adresse dans mon carnet"
                  checked={saveNewAddress}
                  onChange={(e) => setSaveNewAddress(e.target.checked)}
                />
              </div>
            )}
          </section>

          {/* 2. Livraison */}
          <section className="card p-6">
            <h2 className="flex items-center gap-3 font-display text-headline-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                2
              </span>
              Mode de livraison
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {SHIPPING_METHODS.map((method) => {
                const free = subtotal - totals.discount >= FREE_SHIPPING_THRESHOLD;
                return (
                  <label
                    key={method.id}
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
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-body-sm font-semibold text-primary">
                          <Truck size={15} className="text-secondary" /> {method.label}
                        </span>
                        <span className={`text-body-sm font-semibold ${free ? "text-emerald-600" : "text-primary"}`}>
                          {free ? "Offerte" : formatPrice(method.price)}
                        </span>
                      </span>
                      <span className="mt-1 block text-body-sm text-on-surface-variant">{method.delay}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* 3. Paiement */}
          <section className="card p-6">
            <h2 className="flex items-center gap-3 font-display text-headline-sm text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary">
                3
              </span>
              Paiement
            </h2>
            <div className="mt-5 space-y-3">
              {PAYMENT_METHODS.map(({ id, label, description }) => {
                const Icon = paymentIcons[id];
                return (
                  <div key={id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                        paymentMethod === id
                          ? "border-secondary bg-secondary-container/30"
                          : "border-outline-variant hover:border-secondary/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === id}
                        onChange={() => setPaymentMethod(id)}
                        className="accent-secondary"
                      />
                      <Icon size={18} className="text-secondary" />
                      <span>
                        <span className="block text-body-sm font-semibold text-primary">{label}</span>
                        <span className="block text-body-sm text-on-surface-variant">{description}</span>
                      </span>
                    </label>

                    {id === "card" && paymentMethod === "card" && (
                      <div className="mt-4 grid gap-4 rounded-lg bg-surface-container-low p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Field label="Numéro de carte" required error={errors.number}>
                            <Input
                              inputMode="numeric"
                              value={card.number}
                              onChange={(e) =>
                                setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))
                              }
                              placeholder="4242 4242 4242 4242"
                            />
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <Field label="Titulaire" required error={errors.holder}>
                            <Input
                              value={card.holder}
                              onChange={onCardChange("holder")}
                              placeholder="CAMILLE MOREAU"
                            />
                          </Field>
                        </div>
                        <Field label="Expiration" required error={errors.expiry}>
                          <Input
                            inputMode="numeric"
                            value={card.expiry}
                            onChange={(e) => setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                            placeholder="MM/AA"
                          />
                        </Field>
                        <Field label="CVC" required error={errors.cvc}>
                          <Input
                            inputMode="numeric"
                            maxLength={4}
                            value={card.cvc}
                            onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "") }))}
                            placeholder="123"
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <Lock size={14} className="text-secondary" /> Paiement simulé pour cette démonstration — aucune carte
              n'est débitée.
            </p>
          </section>
        </div>

        {/* Récapitulatif */}
        <aside className="h-fit space-y-5 rounded-lg border border-outline-variant/40 bg-surface-container-low p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-headline-sm text-primary">Votre commande</h2>

          <ul className="thin-scroll max-h-64 space-y-3 overflow-y-auto">
            {detailedItems.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="relative shrink-0">
                  <img src={product.image} alt={product.name} className="h-14 w-12 rounded-md object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                    {qty}
                  </span>
                </span>
                <span className="min-w-0 flex-1 truncate text-body-sm text-on-surface-variant">{product.name}</span>
                <span className="text-body-sm font-semibold text-primary">
                  {formatPrice(product.price * qty)}
                </span>
              </li>
            ))}
          </ul>

          {/* Code promo */}
          {promo?.ok ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-body-sm font-semibold text-emerald-700">
                <Tag size={15} /> {promo.code} (−{Math.round(promo.rate * 100)} %)
              </span>
              <button
                onClick={() => setPromo(null)}
                aria-label="Retirer le code promo"
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Code promo (ex. ANTI10)"
                aria-label="Code promo"
              />
              <Button type="button" variant="outline" onClick={applyPromo} className="shrink-0">
                Appliquer
              </Button>
            </div>
          )}

          <div className="space-y-2.5 border-t border-outline-variant/50 pt-4 text-body-md">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Sous-total</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {totals.discount > 0 && promo?.ok && (
              <div className="flex justify-between text-emerald-700">
                <span>Remise {promo.code}</span>
                <span className="font-medium">−{formatPrice(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Livraison</span>
              <span className={`font-medium ${totals.shippingCost === 0 ? "text-emerald-600" : ""}`}>
                {totals.shippingCost === 0 ? "Offerte" : formatPrice(totals.shippingCost)}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-outline-variant/50 pt-3">
              <span className="font-semibold text-primary">Total</span>
              <span className="font-display text-2xl text-primary">{formatPrice(totals.total)}</span>
            </div>
            <p className="text-right text-label-sm text-on-surface-variant">TVA incluse</p>
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-secondary/40 border-t-on-secondary" />
                Traitement…
              </>
            ) : (
              <>
                <Lock size={16} /> Confirmer et payer {formatPrice(totals.total)}
              </>
            )}
          </Button>

          <p className="text-center text-label-sm text-on-surface-variant">
            En confirmant, vous acceptez nos{" "}
            <Link to="/contact" className="underline hover:text-secondary">
              conditions générales
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}
