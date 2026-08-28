import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Pencil, Plus, Search, Sofa, Trash2 } from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { useToast } from "../../context/ToastContext";
import type { ProductDraft } from "../../types";
import { categories } from "../../data/products";
import { categoryName, formatPrice } from "../../utils/format";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import { Checkbox, Field, Input, Select, Textarea } from "../../components/ui/Form";

interface ProductFormState {
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  stock: string;
  image: string;
  description: string;
  longDescription: string;
  material: string;
  dimensions: string;
  isNew: boolean;
  featured: boolean;
}

const blankForm: ProductFormState = {
  name: "",
  category: "salon",
  price: "",
  oldPrice: "",
  stock: "",
  image: "/images/products/sofa-oslo.jpg",
  description: "",
  longDescription: "",
  material: "",
  dimensions: "",
  isNew: false,
  featured: false,
};

const EXTRA_IMAGES = [
  "/images/products/fauteuil-luna.jpg",
  "/images/products/table-nova.jpg",
  "/images/products/chaise-elise.jpg",
  "/images/products/lampe-halo.jpg",
  "/images/products/pouf-nuage.jpg",
];

interface ImagePickerProps {
  value: string;
  onChange: (value: string) => void;
}

function ImagePicker({ value, onChange }: ImagePickerProps) {
  const all = useMemo<string[]>(
    () => Array.from(new Set([...categories.map((c) => c.image), ...EXTRA_IMAGES, value])),
    [value]
  );
  return (
    <div>
      <Field label="Image (URL ou fichier local dans /public)">
        <Input
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder="/images/products/…"
        />
      </Field>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {all.map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => onChange(src)}
            className={`shrink-0 overflow-hidden rounded-md border-2 transition-all ${
              value === src ? "border-secondary" : "border-transparent opacity-70 hover:opacity-100"
            }`}
            aria-label={`Choisir l'image ${src}`}
          >
            <img src={src} alt="" className="h-14 w-12 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

type ModalState = { mode: "add" } | { mode: "edit"; product: { id: string; name: string } } | null;

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const { toast } = useToast();

  const [query, setQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("toutes");
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<ProductFormState>(blankForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormState, string>>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (categoryFilter === "toutes" || p.category === categoryFilter) &&
          p.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [products, query, categoryFilter]
  );

  const openAdd = () => {
    setForm(blankForm);
    setErrors({});
    setModal({ mode: "add" });
  };

  const openEdit = (product: typeof products[number]) => {
    setForm({
      ...blankForm,
      ...product,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      stock: String(product.stock),
    });
    setErrors({});
    setModal({ mode: "edit", product });
  };

  const setField = (key: keyof ProductFormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const errs: Partial<Record<keyof ProductFormState, string>> = {};
    if (!form.name.trim()) errs.name = "Le nom est requis.";
    if (!form.price || Number(form.price) <= 0) errs.price = "Prix invalide.";
    if (form.oldPrice && Number(form.oldPrice) <= Number(form.price)) {
      errs.oldPrice = "Le prix barré doit être supérieur au prix.";
    }
    if (form.stock === "" || Number(form.stock) < 0) errs.stock = "Stock invalide.";
    if (!form.image.trim()) errs.image = "Image requise.";
    if (!form.description.trim()) errs.description = "Description courte requise.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload: ProductDraft = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Math.round(Number(form.stock)),
      image: form.image.trim(),
      description: form.description.trim(),
      longDescription: form.longDescription.trim() || form.description.trim(),
      material: form.material.trim() || "Non renseigné",
      dimensions: form.dimensions.trim() || "Non renseignées",
      isNew: form.isNew,
      featured: form.featured,
    };

    if (modal?.mode === "add") {
      addProduct(payload);
      toast(`« ${payload.name} » a été ajouté au catalogue.`);
    } else if (modal?.mode === "edit") {
      updateProduct(modal.product.id, payload);
      toast(`« ${payload.name} » a été mis à jour.`);
    }
    setModal(null);
  };

  const stockBadge = (stock: number) =>
    stock === 0 ? (
      <Badge variant="danger">Rupture</Badge>
    ) : stock <= 5 ? (
      <Badge variant="warning">{stock} restants</Badge>
    ) : (
      <Badge variant="success">{stock}</Badge>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-primary">Produits</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {products.length} référence{products.length > 1 ? "s" : ""} au catalogue.
          </p>
        </div>
        <Button onClick={openAdd} variant="accent">
          <Plus size={17} /> Ajouter un produit
        </Button>
      </div>

      {/* Recherche */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit…"
            className="pl-10"
            aria-label="Rechercher un produit"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="sm:w-56"
          aria-label="Filtrer par catégorie"
        >
          <option value="toutes">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Sofa}
            title="Aucun produit trouvé"
            text="Modifiez votre recherche ou ajoutez un nouveau produit."
            actionLabel="Ajouter un produit"
            onAction={openAdd}
          />
        ) : (
          <>
            {/* Table desktop */}
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full text-left text-body-sm">
                <thead className="border-b border-surface-container-highest bg-surface-container-low text-label-sm uppercase tracking-wide text-on-surface-variant">
                  <tr>
                    <th className="px-5 py-3.5">Produit</th>
                    <th className="px-4 py-3.5">Catégorie</th>
                    <th className="px-4 py-3.5">Prix</th>
                    <th className="px-4 py-3.5">Stock</th>
                    <th className="px-4 py-3.5">Étiquettes</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {filtered.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-surface-container-low/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="h-12 w-10 rounded-md object-cover" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-primary">{p.name}</p>
                            <p className="truncate text-on-surface-variant/70">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">{categoryName(p.category)}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-primary">{formatPrice(p.price)}</span>
                        {p.oldPrice && (
                          <span className="ml-1.5 text-on-surface-variant line-through">
                            {formatPrice(p.oldPrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{stockBadge(p.stock)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {p.isNew && <Badge variant="info">Nouveau</Badge>}
                          {p.featured && <Badge variant="secondary">Vedette</Badge>}
                          {!p.isNew && !p.featured && <span className="text-on-surface-variant/40">—</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            aria-label={`Modifier ${p.name}`}
                            className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmId(p.id)}
                            aria-label={`Supprimer ${p.name}`}
                            className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartes mobile */}
            <div className="grid gap-4 md:hidden">
              {filtered.map((p) => (
                <div key={p.id} className="card flex gap-4 p-4">
                  <img src={p.image} alt={p.name} className="h-20 w-16 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-primary">{p.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{categoryName(p.category)}</p>
                    <p className="mt-1 font-semibold text-primary">{formatPrice(p.price)}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {stockBadge(p.stock)}
                      {p.isNew && <Badge variant="info">Nouveau</Badge>}
                      {p.featured && <Badge variant="secondary">Vedette</Badge>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      aria-label={`Modifier ${p.name}`}
                      className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container hover:text-primary"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmId(p.id)}
                      aria-label={`Supprimer ${p.name}`}
                      className="rounded-md p-2 text-on-surface-variant hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Formulaire produit */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? "Modifier le produit" : "Nouveau produit"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Annuler
            </Button>
            <Button variant="accent" onClick={submit}>
              {modal?.mode === "edit" ? "Enregistrer" : "Ajouter au catalogue"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nom du produit" required error={errors.name}>
              <Input
                value={form.name}
                onChange={setField("name")}
                placeholder="Canapé Oslo"
              />
            </Field>
          </div>
          <Field label="Catégorie" required>
            <Select value={form.category} onChange={setField("category")}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Stock" required error={errors.stock}>
            <Input
              type="number"
              min="0"
              value={form.stock}
              onChange={setField("stock")}
              placeholder="10"
            />
          </Field>
          <Field label="Prix (€)" required error={errors.price}>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={setField("price")}
              placeholder="499"
            />
          </Field>
          <Field label="Prix barré (€)" error={errors.oldPrice} hint="Laisser vide si pas de promotion">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.oldPrice}
              onChange={setField("oldPrice")}
              placeholder="599"
            />
          </Field>
          <div className="sm:col-span-2">
            <ImagePicker value={form.image} onChange={(image) => setForm((f) => ({ ...f, image }))} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Description courte" required error={errors.description}>
              <Input
                value={form.description}
                onChange={setField("description")}
                placeholder="Canapé trois places en bouclé crème…"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description longue">
              <Textarea
                rows={4}
                value={form.longDescription}
                onChange={setField("longDescription")}
                placeholder="L'histoire du produit, ses matériaux, son confort…"
              />
            </Field>
          </div>
          <Field label="Matériau">
            <Input value={form.material} onChange={setField("material")} placeholder="Chêne massif" />
          </Field>
          <Field label="Dimensions">
            <Input value={form.dimensions} onChange={setField("dimensions")} placeholder="90 × 32 × 180 cm" />
          </Field>
          <div className="flex items-center gap-6 sm:col-span-2">
            <Checkbox
              label="Nouveauté"
              checked={form.isNew}
              onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
            />
            <Checkbox
              label="Produit vedette (page d'accueil)"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          const product = products.find((p) => p.id === confirmId);
          if (confirmId) deleteProduct(confirmId);
          setConfirmId(null);
          toast(`« ${product?.name ?? "Produit"} » a été supprimé du catalogue.`, "info");
        }}
        title="Supprimer le produit"
        message="Le produit sera retiré du catalogue. Cette action est irréversible."
      />
    </div>
  );
}
