import { useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useToast } from "../../context/ToastContext";
import type { Address } from "../../types";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import AddressFields, { emptyAddress, validateAddress } from "../../components/ui/AddressFields";
import EmptyState from "../../components/ui/EmptyState";
import { Checkbox } from "../../components/ui/Form";

interface ModalState {
  id: string | null;
}

export default function ClientAddresses() {
  const { user, saveAddress, deleteAddress, setDefaultAddress } = useStore();
  const { toast } = useToast();

  const [modal, setModal] = useState<ModalState | null>(null);
  const [form, setForm] = useState<Address>(emptyAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!user) return null;

  const openAdd = () => {
    setForm({ ...emptyAddress, fullName: user.name });
    setErrors({});
    setModal({ id: null });
  };

  const openEdit = (addr: Address) => {
    setForm({ ...emptyAddress, ...addr });
    setErrors({});
    setModal({ id: addr.id ?? null });
  };

  const submit = () => {
    const errs = validateAddress(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const isDefault = form.isDefault || user.addresses.length === 0;
    if (isDefault && !modal?.id) {
      // Nouvelle adresse par défaut → réinitialiser les autres
      user.addresses.forEach((a) => {
        if (a.isDefault && a.id) setDefaultAddress(user.id, a.id);
      });
    }
    saveAddress(user.id, { ...form, isDefault }, modal?.id ?? null);
    setModal(null);
    toast(modal?.id ? "Adresse modifiée." : "Adresse ajoutée à votre carnet.");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-primary">Mes adresses</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Vos adresses de livraison, pour commander en un clin d'œil.
          </p>
        </div>
        <Button onClick={openAdd} variant="accent">
          <Plus size={17} /> Ajouter une adresse
        </Button>
      </div>

      <div className="mt-6">
        {user.addresses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Aucune adresse enregistrée"
            text="Ajoutez une adresse pour accélérer vos prochaines commandes."
            actionLabel="Ajouter ma première adresse"
            onAction={openAdd}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {user.addresses.map((addr) => (
              <div key={addr.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold text-primary">
                    <MapPin size={16} className="text-secondary" />
                    {addr.label || "Adresse"}
                  </p>
                  {addr.isDefault && (
                    <span className="rounded-full bg-secondary-container px-2.5 py-0.5 text-[10px] font-bold text-on-secondary-container">
                      PAR DÉFAUT
                    </span>
                  )}
                </div>
                <div className="mt-2 flex-1 text-body-sm text-on-surface-variant">
                  <p className="font-medium text-primary">{addr.fullName}</p>
                  <p>
                    {addr.address}
                    {addr.address2 ? `, ${addr.address2}` : ""}
                  </p>
                  <p>
                    {addr.postalCode} {addr.city}, {addr.country}
                  </p>
                  <p>{addr.phone}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 border-t border-surface-container-highest pt-3">
                  {!addr.isDefault && addr.id && (
                    <button
                      onClick={() => {
                        setDefaultAddress(user.id, addr.id!);
                        toast("Adresse par défaut mise à jour.");
                      }}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:bg-secondary-container/50 hover:text-on-secondary-container"
                    >
                      <Star size={15} /> Par défaut
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                  >
                    <Pencil size={15} /> Modifier
                  </button>
                  <button
                    onClick={() => setConfirmId(addr.id ?? null)}
                    className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire ajout / édition */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.id ? "Modifier l'adresse" : "Nouvelle adresse"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Annuler
            </Button>
            <Button variant="accent" onClick={submit}>
              {modal?.id ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <AddressFields
            value={form}
            onChange={(key, val) => setForm((f) => ({ ...f, [key]: val }))}
            errors={errors}
            showLabel
          />
          <Checkbox
            label="Définir comme adresse par défaut"
            checked={!!form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) deleteAddress(user.id, confirmId);
          setConfirmId(null);
          toast("Adresse supprimée.", "info");
        }}
        title="Supprimer l'adresse"
        message="Cette adresse sera définitivement retirée de votre carnet."
      />
    </div>
  );
}
