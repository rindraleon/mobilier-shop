import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { useSellerPayments } from "../../hooks/useSeller";
import { PAYMENT_PROVIDERS } from "../../utils/constants";
import { formatDate, formatPrice } from "../../utils/format";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";

export default function SellerPayments() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading, isError, refetch } = useSellerPayments({ page, limit: 10 });

  const payments = data?.items ?? [];

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Paiements reçus</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Les références sont vérifiées manuellement par un administrateur. Aucune validation
        automatique n'est simulée.
      </p>

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
          <EmptyState
            icon={CreditCard}
            title="Aucun paiement"
            text="Les paiements liés à vos commandes apparaîtront ici."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full min-w-[640px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Commande</th>
                  <th className="px-4 py-3 font-semibold">Opérateur</th>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                  <th className="px-4 py-3 font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
                {payments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3">
                      <Link
                        to={"/vendeur/commandes/" + payment.orderId}
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
                      {formatDate(payment.createdAt)}
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
    </div>
  );
}
