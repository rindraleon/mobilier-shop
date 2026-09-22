import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Loader2, Save, X } from "lucide-react";
import { useCreateProduct, useUpdateProduct, useSellerProducts } from "../../hooks/useSeller";
import { useCategories } from "../../hooks/useCatalog";
import { filesApi } from "../../lib/api/files.api";
import { productSchema } from "../../schemas/product";
import type { ProductFormInput } from "../../schemas/product";
import { PRODUCT_STATUS } from "../../utils/constants";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../components/ui/Form";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import type { ProductImageInput } from "../../types/api";

const emptyValues: ProductFormInput = {
  name: "",
  shortDescription: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  categoryId: "",
  sku: "",
  material: "",
  dimensions: "",
  lowStockThreshold: undefined,
  status: "draft",
};

export default function SellerProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Le produit est récupéré dans la liste du vendeur : le serveur garantit
  // qu'un vendeur ne peut pas accéder au produit d'un autre (§17).
  const { data: list, isLoading } = useSellerProducts({ limit: 100 });
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const existing = id ? list?.items.find((p) => p.id === id) : undefined;
  const [images, setImages] = useState<ProductImageInput[]>([]);

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
    values: existing
      ? {
          name: existing.name,
          shortDescription: existing.shortDescription ?? "",
          description: existing.description ?? "",
          price: existing.price,
          compareAtPrice: existing.compareAtPrice ?? undefined,
          stock: existing.stock,
          categoryId: existing.category?.id ?? "",
          sku: existing.sku ?? "",
          material: existing.material ?? "",
          dimensions: existing.dimensions ?? "",
          lowStockThreshold: existing.lowStockThreshold,
          status: existing.status,
        }
      : undefined,
  });

  // `useWatch` abonne le rendu au champ sans appeler `watch()` pendant le
  // rendu (ce que le compilateur React ne peut pas mémoïser).
  const currentStatus = useWatch({ control: form.control, name: "status" });

  const upload = useMutation({
    mutationFn: (file: File) => filesApi.upload("products", file),
    onSuccess: (uploaded) => {
      setImages((prev) => [
        ...prev,
        { objectKey: uploaded.objectKey, url: uploaded.url, isPrimary: prev.length === 0 },
      ]);
      toast("Image ajoutée.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) upload.mutate(file);
    event.target.value = "";
  };

  if (isEdit && isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement du produit…" />
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <EmptyState
        title="Produit introuvable"
        text="Ce produit n'existe pas ou ne vous appartient pas."
        actionLabel="Mes produits"
        actionTo="/vendeur/produits"
      />
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      shortDescription: values.shortDescription || undefined,
      description: values.description || undefined,
      price: values.price,
      compareAtPrice: values.compareAtPrice ? values.compareAtPrice : undefined,
      stock: values.stock,
      categoryId: values.categoryId,
      sku: values.sku || undefined,
      material: values.material || undefined,
      dimensions: values.dimensions || undefined,
      lowStockThreshold: values.lowStockThreshold,
      status: values.status,
      images: images.length > 0 ? images : undefined,
    };

    try {
      if (isEdit && id) {
        await updateProduct.mutateAsync({ id, input: payload });
        toast("Produit mis à jour.");
      } else {
        await createProduct.mutateAsync(payload);
        toast("Produit créé.");
        navigate("/vendeur/produits");
        return;
      }
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  });

  const busy = createProduct.isPending || updateProduct.isPending;

  return (
    <div>
      <Link
        to="/vendeur/produits"
        className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant underline-offset-2 hover:text-secondary hover:underline"
      >
        <ArrowLeft size={15} /> Mes produits
      </Link>

      <h1 className="mt-3 font-display text-headline-md text-primary">
        {isEdit ? "Modifier le produit" : "Nouveau produit"}
      </h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Informations</h2>

            <div className="mt-5 space-y-4">
              <Field label="Nom du produit" required error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} />
              </Field>

              <Field
                label="Résumé"
                hint="Affiché dans les listes de produits."
                error={form.formState.errors.shortDescription?.message}
              >
                <Input {...form.register("shortDescription")} />
              </Field>

              <Field label="Description" error={form.formState.errors.description?.message}>
                <Textarea rows={6} {...form.register("description")} />
              </Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Prix et stock</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label="Prix (Ar)"
                required
                hint="Montant entier en ariary."
                error={form.formState.errors.price?.message}
              >
                <Input type="number" min={0} step={1} {...form.register("price")} />
              </Field>

              <Field
                label="Prix barré (Ar)"
                hint="Optionnel, pour afficher une remise."
                error={form.formState.errors.compareAtPrice?.message}
              >
                <Input type="number" min={0} step={1} {...form.register("compareAtPrice")} />
              </Field>

              <Field label="Stock" required error={form.formState.errors.stock?.message}>
                <Input type="number" min={0} step={1} {...form.register("stock")} />
              </Field>

              <Field
                label="Seuil de stock bas"
                hint={`Par défaut : 5.`}
                error={form.formState.errors.lowStockThreshold?.message}
              >
                <Input type="number" min={0} step={1} {...form.register("lowStockThreshold")} />
              </Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-headline-sm text-primary">Détails</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Référence (SKU)" error={form.formState.errors.sku?.message}>
                <Input {...form.register("sku")} />
              </Field>
              <Field label="Matière" error={form.formState.errors.material?.message}>
                <Input placeholder="Chêne massif" {...form.register("material")} />
              </Field>
              <Field label="Dimensions" error={form.formState.errors.dimensions?.message}>
                <Input placeholder="L 200 × P 90 × H 75 cm" {...form.register("dimensions")} />
              </Field>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-headline-sm text-primary">Publication</h2>

            <div className="mt-4">
              <Field label="Statut" required error={form.formState.errors.status?.message}>
                <Select {...form.register("status")}>
                  {Object.entries(PRODUCT_STATUS).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <p className="mt-2 text-label-sm text-on-surface-variant">
                {PRODUCT_STATUS[currentStatus]?.description}
              </p>
            </div>

            <div className="mt-5">
              <Field label="Catégorie" required error={form.formState.errors.categoryId?.message}>
                <Select {...form.register("categoryId")}>
                  <option value="">Choisir…</option>
                  {(categories ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-headline-sm text-primary">Images</h2>

            <ul className="mt-4 grid grid-cols-3 gap-2">
              {(existing?.images ?? images).map((image, index) => (
                <li key={image.objectKey ?? index} className="relative">
                  <span className="block aspect-square overflow-hidden rounded-md bg-surface-container">
                    {image.url ? (
                      <img src={image.url} alt={image.alt ?? ""} className="h-full w-full object-cover" />
                    ) : null}
                  </span>
                  {isPrimaryBadge(image)}
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                      aria-label="Retirer l'image"
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-1 text-red-600 shadow-card"
                    >
                      <X size={12} />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {!isEdit && (
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant px-4 py-6 text-body-sm text-on-surface-variant transition-colors hover:border-secondary hover:text-secondary">
                {upload.isPending ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <ImagePlus size={17} />
                )}
                {upload.isPending ? "Envoi…" : "Ajouter une image"}
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
            )}
          </section>

          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              <Save size={16} /> {busy ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/vendeur/produits")}
            >
              Annuler
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function isPrimaryBadge(image: { url?: string | null; isPrimary?: boolean }) {
  if (!image.isPrimary) return null;
  return (
    <span className="absolute bottom-1 left-1 rounded bg-primary/85 px-1.5 py-0.5 text-[9px] font-bold text-on-primary">
      PRINCIPALE
    </span>
  );
}
