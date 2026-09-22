import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { useAdminPayments, useVerifyPayment, useRejectPayment } from "../../hooks/usePayments";
import { PAYMENT_PROVIDERS } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Select, Textarea } from "../../components/ui/Form";
import type { Payment, PaymentStatus } from "../../types/api";

export default function AdminPayments() {
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [toReject, setToReject] = useState<Payment | null>(null);
  const [toVerify, setToVerify] = useState<Payment | null>(null);
  const [reason, setReason] = useState<string>("");

  const { data, isLoading, isError, refetch } = useAdminPayments({
    page,
    limit: 10,
    status: status || undefined,
  });
  const verify = useVerifyPayment();
  const reject = useRejectPayment();

  const payments = data?.items ?? [];

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Paiements</h1>
      <p className="mt-1 flex items-start gap-2 text-body-md text-on-surface-variant">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-secondary" />
        Vérification manuelle obligatoire : aucune référence n'est validée automatiquement (§27).
      </p>

      <div className="mt-5">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PaymentStatus | "");
            setPage(1);
          }}
          aria-label="Filtrer par statut"
          className="w-56"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="submitted">Soumis</option>
          <option value="verified">Vérifié</option>
          <option value="rejected">Rejeté</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement des paiements…" />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger les paiements"
            actionLabel="Réessayer"
            onAction={() => void refetch()}
          />
        </div>
      ) : payments.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={CreditCard} title="Aucun paiement" />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full min-w-[840px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Commande</th>
                  <th className="px-4 py-3 font-semibold">Opérateur</th>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                  <th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Soumis le</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
                {payments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3">
                      <Link
                        to={"/admin/commandes/" + payment.orderId}
                        className="font-semibold text-primary hover:text-secondary"
                      >
                        {payment.orderId.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {PAYMENT_PROVIDERS.find((p) => p.id === payment.provider)?.label ??
                        payment.provider}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {payment.transactionReference}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge kind="payment" status={payment.status} />
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {payment.submittedAt ? formatDate(payment.submittedAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-2">
                        {payment.status !== "verified" && (
                          <Button size="sm" onClick={() => setToVerify(payment)}>
                            <CheckCircle2 size={15} /> Vérifier
                          </Button>
                        )}
                        {payment.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => {
                              setToReject(payment);
                              setReason("");
                            }}
                          >
                            <XCircle size={15} /> Rejeter
                          </Button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.meta && (
            <Pagination
              className="mt-6"
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <Modal
        open={toReject !== null}
        onClose={() => setToReject(null)}
        title="Rejeter le paiement"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToReject(null)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              disabled={reason.trim().length === 0}
              onClick={() => {
                if (toReject) reject.mutate({ id: toReject.id, reason: reason.trim() });
                setToReject(null);
              }}
            >
              Rejeter
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-body-sm text-on-surface-variant">
            Réf. {toReject?.transactionReference} ·{" "}
            {toReject ? formatPrice(toReject.amount) : ""}
          </p>
          <Field label="Motif" required>
            <Textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Référence introuvable, montant incorrect…"
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={toVerify !== null}
        onClose={() => setToVerify(null)}
        title="Vérifier le paiement"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setToVerify(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (toVerify) verify.mutate(toVerify.id);
                setToVerify(null);
              }}
            >
              Confirmer la vérification
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-body-sm text-on-surface-variant">
          <p>
            Réf. <span className="text-primary">{toVerify?.transactionReference}</span> ·{" "}
            {toVerify ? formatPrice(toVerify.amount) : ""}
          </p>
          <p>
            Opérateur :{" "}
            {PAYMENT_PROVIDERS.find((p) => p.id === toVerify?.provider)?.label ?? toVerify?.provider}
          </p>
          {toVerify?.payerPhone && <p>Payé depuis : {toVerify.payerPhone}</p>}
          <p className="rounded-lg bg-amber-50 p-3 text-amber-800">
            Ne confirmez qu'après avoir vérifié la transaction auprès de l'opérateur. Cette action
            est journalisée.
          </p>
        </div>
      </Modal>
    </div>
  );
}
