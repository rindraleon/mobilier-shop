import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks/useAdmin";
import { slugify } from "../../utils/format";
import { formatDate } from "../../utils/format";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Checkbox, Field, Input, Textarea } from "../../components/ui/Form";
import type { Category } from "../../types/api";

const categorySchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères.").max(120),
  slug: z
    .string()
    .trim()
    .max(140)
    .regex(/^[a-z0-9-]*$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets.")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  position: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean(),
});

type CategoryForm = z.infer<typeof categorySchema>;

const emptyValues: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  position: 0,
  isActive: true,
};

export default function AdminCategories() {
  const { data: categories = [], isLoading } = useAdminCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyValues,
  });

  const openCreate = (): void => {
    setEditing(null);
    form.reset(emptyValues);
    setOpen(true);
  };

  const openEdit = (category: Category): void => {
    setEditing(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      position: category.position,
      isActive: category.isActive,
    });
    setOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      description: values.description || undefined,
      position: values.position ?? 0,
      isActive: values.isActive,
    };
    if (editing) update.mutate({ id: editing.id, input: payload });
    else create.mutate(payload);
    setOpen(false);
  });

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement des catégories…" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-headline-md text-primary">Catégories</h1>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} /> Nouvelle catégorie
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Layers} title="Aucune catégorie" />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
          <table className="w-full min-w-[720px] text-left text-body-sm">
            <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-semibold">Nom</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Position</th>
                <th className="px-4 py-3 font-semibold">État</th>
                <th className="px-4 py-3 font-semibold">Créée le</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
              {categories.map((category) => (
                <tr key={category.id} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-primary">{category.name}</span>
                    {category.description && (
                      <span className="block max-w-md truncate text-label-sm text-on-surface-variant">
                        {category.description}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">/{category.slug}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{category.position}</td>
                  <td className="px-4 py-3">
                    <Badge variant={category.isActive ? "success" : "neutral"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatDate(category.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(category)}
                        aria-label={"Modifier " + category.name}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setToDelete(category)}
                        aria-label={"Supprimer " + category.name}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={onSubmit} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Nom" required error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field
            label="Slug"
            hint="Généré automatiquement depuis le nom si laissé vide."
            error={form.formState.errors.slug?.message}
          >
            <Input {...form.register("slug")} />
          </Field>
          <Field label="Description" error={form.formState.errors.description?.message}>
            <Textarea rows={3} {...form.register("description")} />
          </Field>
          <Field label="Position" error={form.formState.errors.position?.message}>
            <Input type="number" min={0} step={1} {...form.register("position")} />
          </Field>
          <Checkbox label="Catégorie active" {...form.register("isActive")} />
        </form>
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer la catégorie"
        message="La catégorie sera supprimée (soft delete). Les produits associés restent intacts."
        confirmLabel="Supprimer"
      />
    </div>
  );
}
