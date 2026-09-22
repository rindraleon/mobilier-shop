import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText, PauseCircle, Store, XCircle } from "lucide-react";
import {
  useAdminSellers,
  usePendingSellers,
  useApproveSeller,
  useRejectSeller,
  useSuspendSeller,
} from "../../hooks/useAdmin";
import { SELLER_STATUS } from "../../utils/constants";
import { formatDate } from "../../utils/format";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { Field, Textarea } from "../../components/ui/Form";
import type { Seller } from "../../types/api";

type Action = { seller: Seller; kind: "reject" | "suspend" } | null;

export default function AdminSellers() {
  const { data: sellers = [], isLoading } = useAdminSellers();
  const { data: pending = [] } = usePendingSellers();
  const approve = useApproveSeller();
  const reject = useRejectSeller();
  const suspend = useSuspendSeller();

  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState<string>("");
  const [confirmApprove, setConfirmApprove] = useState<Seller | null>(null);

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader label="Chargement des vendeurs…" />
      </div>
    );
  }

  const runAction = (): void => {
    if (!action) return;
    const value = reason.trim();
    if (action.kind === "reject") {
      if (!value) return;
      reject.mutate({ id: action.seller.id, reason: value });
    } else {
      suspend.mutate({ id: action.seller.id, reason: value || undefined });
    }
    setAction(null);
    setReason("");
  };

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Vendeurs</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Seul un vendeur approuvé peut publier des produits et vendre (§17).
      </p>

      {pending.length > 0 && (
        <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="flex items-center gap-2 font-display text-headline-sm text-amber-900">
            <FileText size={18} /> Demandes en attente ({pending.length})
          </h2>
          <ul className="mt-4 space-y-3">
            {pending.map((seller) => (
              <li key={seller.id} className="rounded-lg bg-white p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-headline-sm text-primary">
                      {seller.shopName}
                    </p>
                    <p className="mt-0.5 text-label-sm text-on-surface-variant">
                      {[seller.city, seller.phone].filter(Boolean).join(" · ") || "—"} · soumis le{" "}
                      {seller.submittedAt ? formatDate(seller.submittedAt) : "—"}
                    </p>
                    {seller.description && (
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        {seller.description}
                      </p>
                    )}
                    {seller.documentKeys.length > 0 && (
                      <p className="mt-2 text-label-sm text-on-surface-variant">
                        {seller.documentKeys.length} pièce(s) justificative(s)
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" onClick={() => setConfirmApprove(seller)}>
                      <CheckCircle2 size={15} /> Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => setAction({ seller, kind: "reject" })}
                    >
                      <XCircle size={15} /> Refuser
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-headline-sm text-primary">Toutes les boutiques</h2>

        {sellers.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={Store} title="Aucune boutique" />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full min-w-[820px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Boutique</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Créée le</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-primary">{seller.shopName}</span>
                      <span className="block text-label-sm text-on-surface-variant">
                        /{seller.slug}
                      </span>
                      {seller.rejectionReason && (
                        <span className="mt-1 block text-label-sm text-red-600">
                          {seller.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {seller.email ?? "—"}
                      <br />
                      {seller.phone ?? ""}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="seller" status={seller.status} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{formatDate(seller.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-2">
                        <Link
                          to={"/boutique?vendeur=" + seller.slug}
                          className="text-body-sm font-semibold text-secondary underline-offset-2 hover:underline"
                        >
                          Voir
                        </Link>
                        {seller.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => setConfirmApprove(seller)}>
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => setAction({ seller, kind: "reject" })}
                            >
                              Refuser
                            </Button>
                          </>
                        )}
                        {seller.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAction({ seller, kind: "suspend" })}
                          >
                            <PauseCircle size={15} /> Suspendre
                          </Button>
                        )}
                        {seller.status === "suspended" && (
                          <Button size="sm" variant="outline" onClick={() => setConfirmApprove(seller)}>
                            Réactiver
                          </Button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={action !== null}
        onClose={() => {
          setAction(null);
          setReason("");
        }}
        title={action?.kind === "reject" ? "Refuser la demande" : "Suspendre la boutique"}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={runAction}
              disabled={action?.kind === "reject" && reason.trim().length === 0}
            >
              {action?.kind === "reject" ? "Refuser" : "Suspendre"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-body-sm text-on-surface-variant">
            {action?.seller.shopName}
            {action?.kind === "reject"
              ? " — le vendeur recevra un e-mail avec le motif."
              : " — la boutique ne pourra plus vendre jusqu'à réactivation."}
          </p>
          <Field label="Motif" required={action?.kind === "reject"}>
            <Textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={action?.kind === "reject" ? "Motif du refus…" : "Motif (optionnel)…"}
            />
          </Field>
          <p className="text-label-sm text-on-surface-variant">
            {SELLER_STATUS[action?.seller.status ?? "pending"]?.label}
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmApprove !== null}
        onClose={() => setConfirmApprove(null)}
        onConfirm={() => {
          if (confirmApprove) approve.mutate(confirmApprove.id);
          setConfirmApprove(null);
        }}
        title={
          confirmApprove?.status === "suspended" ? "Réactiver la boutique" : "Approuver la boutique"
        }
        message={
          confirmApprove?.status === "suspended"
            ? "La boutique pourra de nouveau vendre ses produits."
            : "Le vendeur pourra publier ses produits. Un e-mail lui sera envoyé."
        }
        confirmLabel={confirmApprove?.status === "suspended" ? "Réactiver" : "Approuver"}
      />
    </div>
  );
}
