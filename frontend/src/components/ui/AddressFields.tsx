import type { Address } from "../../types";
import { Field, Input, Select } from "./Form";

export const COUNTRIES: string[] = [
  "France",
  "Belgique",
  "Suisse",
  "Luxembourg",
  "Canada",
  "Madagascar",
  "Autre",
];

export const emptyAddress: Address = {
  label: "",
  fullName: "",
  phone: "",
  address: "",
  address2: "",
  postalCode: "",
  city: "",
  country: "France",
  isDefault: false,
};

export type AddressErrors = Partial<Record<keyof Address, string>>;

export function validateAddress(a: Address): AddressErrors {
  const errors: AddressErrors = {};
  if (!a.fullName?.trim()) errors.fullName = "Le nom complet est requis.";
  if (!a.phone?.trim()) errors.phone = "Le téléphone est requis.";
  if (!a.address?.trim()) errors.address = "L'adresse est requise.";
  if (!a.postalCode?.trim()) errors.postalCode = "Le code postal est requis.";
  if (!a.city?.trim()) errors.city = "La ville est requise.";
  return errors;
}

interface AddressFieldsProps {
  value?: Partial<Address>;
  onChange?: (key: string, value: string) => void;
  errors?: AddressErrors;
  showLabel?: boolean;
}

/**
 * Champs d'adresse réutilisables (checkout + carnet d'adresses client).
 * value : objet adresse — onChange(clé, valeur)
 */
export default function AddressFields({
  value = {},
  onChange = () => {},
  errors = {},
  showLabel = false,
}: AddressFieldsProps) {
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange(key, e.target.value);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {showLabel && (
        <div className="sm:col-span-2">
          <Field label="Libellé (ex. Domicile, Bureau)">
            <Input value={value.label || ""} onChange={set("label")} placeholder="Domicile" />
          </Field>
        </div>
      )}
      <div className="sm:col-span-2">
        <Field label="Nom complet" required error={errors.fullName}>
          <Input
            value={value.fullName || ""}
            onChange={set("fullName")}
            placeholder="Camille Moreau"
            autoComplete="name"
          />
        </Field>
      </div>
      <Field label="Téléphone" required error={errors.phone}>
        <Input value={value.phone || ""} onChange={set("phone")} placeholder="06 12 34 56 78" autoComplete="tel" />
      </Field>
      <Field label="Pays">
        <Select value={value.country || "France"} onChange={set("country")}>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Adresse" required error={errors.address}>
          <Input
            value={value.address || ""}
            onChange={set("address")}
            placeholder="12 rue des Lilas"
            autoComplete="street-address"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Complément d'adresse">
          <Input value={value.address2 || ""} onChange={set("address2")} placeholder="Appartement, escalier, code…" />
        </Field>
      </div>
      <Field label="Code postal" required error={errors.postalCode}>
        <Input
          value={value.postalCode || ""}
          onChange={set("postalCode")}
          placeholder="75011"
          autoComplete="postal-code"
        />
      </Field>
      <Field label="Ville" required error={errors.city}>
        <Input value={value.city || ""} onChange={set("city")} placeholder="Paris" autoComplete="address-level2" />
      </Field>
    </div>
  );
}
