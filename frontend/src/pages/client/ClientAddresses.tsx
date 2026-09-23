import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  useAddresses,
  useDeleteAddress,
  useSaveAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "../../hooks/useAccount";
import { addressSchema, emptyAddress } from "../../schemas/address";
import type { AddressFormInput } from "../../schemas/address";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import PageLoader from "../../components/ui/PageLoader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Checkbox, Field, Input } from "../../components/ui/Form";
import type { Address } from "../../types/api";

export default function ClientAddresses() {
  const { toast } = useToast();
  const { data: addresses = [], isLoading } = useAddresses();
  const saveAddress = useSaveAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [toDelete, setToDelete] = useState<Address | null>(null);

  const form = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: emptyAddress,
  });

  const openCreate = (): void => {
    setEditing(null);
    form.reset(emptyAddress);
    setCreating(true);
  };

  const openEdit = (address: Address): void => {
    setEditing(address);
    form.reset({
      label: address.label ?? "",
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      postalCode: address.postalCode ?? "",
      city: address.city,
      country: address.country,
      isDefault: address.isDefault,
    });
    setCreating(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      label: values.label || undefined,
      fullName: values.fullName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || undefined,
      postalCode: values.postalCode || undefined,
      city: values.city,
      country: values.country || "Madagascar",
      isDefault: values.isDefault,
    };

    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing.id, input: payload });
      } else {
        await saveAddress.mutateAsync({ ...payload, isDefault: payload.isDefault ?? false });
      }
      setCreating(false);
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement des adresses…" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-headline-md text-primary">Mes adresses</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Ajouter une adresse
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={MapPin}
            title="Aucune adresse enregistrée"
            text="Ajoutez une adresse pour commander plus rapidement."
            actionLabel="Ajouter une adresse"
            onAction={openCreate}
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-headline-sm text-primary">
                    <MapPin size={16} className="text-secondary" />
                    {address.label || "Adresse"}
                  </p>
                  {address.isDefault && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">
                      <Star size={10} className="fill-current" /> PAR DÉFAUT
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(address)}
                    aria-label={"Modifier " + (address.label ?? "l'adresse")}
                    className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setToDelete(address)}
                    aria-label={"Supprimer " + (address.label ?? "l'adresse")}
                    className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <address className="mt-3 flex-1 not-italic text-body-sm text-on-surface-variant">
                {address.fullName}
                <br />
                {address.addressLine1}
                {address.addressLine2 ? (
                  <>
                    <br />
                    {address.addressLine2}
                  </>
                ) : null}
                <br />
                {address.postalCode ? address.postalCode + " " : ""}
                {address.city}
                <br />
                {address.country}
                <br />
                {address.phone}
              </address>

              {!address.isDefault && (
                <button
                  onClick={() => setDefault.mutate(address.id)}
                  className="mt-4 self-start text-body-sm font-semibold text-secondary underline-offset-2 hover:underline"
                >
                  Définir par défaut
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={editing ? "Modifier l'adresse" : "Nouvelle adresse"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button onClick={() => void onSubmit()} disabled={saveAddress.isPending || updateAddress.isPending}>
              {saveAddress.isPending || updateAddress.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Libellé" error={form.formState.errors.label?.message} className="sm:col-span-2">
            <Input placeholder="Domicile, Bureau…" {...form.register("label")} />
          </Field>
          <Field label="Destinataire" required error={form.formState.errors.fullName?.message}>
            <Input {...form.register("fullName")} />
          </Field>
          <Field label="Téléphone" required error={form.formState.errors.phone?.message}>
            <Input placeholder="+261 34 12 345 67" {...form.register("phone")} />
          </Field>
          <Field
            label="Adresse"
            required
            error={form.formState.errors.addressLine1?.message}
            className="sm:col-span-2"
          >
            <Input {...form.register("addressLine1")} />
          </Field>
          <Field
            label="Complément"
            error={form.formState.errors.addressLine2?.message}
            className="sm:col-span-2"
          >
            <Input {...form.register("addressLine2")} />
          </Field>
          <Field label="Code postal" error={form.formState.errors.postalCode?.message}>
            <Input {...form.register("postalCode")} />
          </Field>
          <Field label="Ville" required error={form.formState.errors.city?.message}>
            <Input {...form.register("city")} />
          </Field>
          <Field label="Pays" required error={form.formState.errors.country?.message}>
            <Input {...form.register("country")} />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox label="Définir comme adresse par défaut" {...form.register("isDefault")} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteAddress.mutate(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer l'adresse"
        message="Cette adresse sera définitivement supprimée de votre carnet."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
