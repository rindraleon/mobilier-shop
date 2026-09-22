import { useState } from "react";
import { ScrollText } from "lucide-react";
import { useAuditLogs } from "../../hooks/useAdmin";
import { formatDate } from "../../utils/format";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import { Select } from "../../components/ui/Form";

const ENTITIES = [
  "auth",
  "user",
  "seller",
  "product",
  "category",
  "cart",
  "order",
  "payment",
  "wishlist",
];

export default function AdminAuditLogs() {
  const [page, setPage] = useState<number>(1);
  const [entity, setEntity] = useState<string>("");
  const logs = useAuditLogs({ page, limit: 20, entity: entity || undefined });

  const items = logs.data?.items ?? [];

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Journal d'audit</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Traçabilité des actions sensibles : qui a fait quoi, quand et depuis quelle adresse IP
        (§32, §72).
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Select
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
          aria-label="Filtrer par entité"
          className="w-52"
        >
          <option value="">Toutes les entités</option>
          {ENTITIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>

      {logs.isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement du journal…" />
        </div>
      ) : logs.isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger le journal"
            actionLabel="Réessayer"
            onAction={() => void logs.refetch()}
          />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={ScrollText} title="Aucune entrée" />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full min-w-[900px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Entité</th>
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">IP</th>
                  <th className="px-4 py-3 font-semibold">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high bg-surface-container-lowest">
                {items.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                      {formatDate(log.createdAt, { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">{log.action}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{log.entity}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {log.user?.email ?? log.userId?.slice(0, 8) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{log.ipAddress ?? "—"}</td>
                    <td className="max-w-xs px-4 py-3">
                      {Object.keys(log.metadata ?? {}).length > 0 ? (
                        <code className="block truncate text-label-sm text-on-surface-variant">
                          {JSON.stringify(log.metadata)}
                        </code>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.data?.meta && (
            <Pagination
              className="mt-6"
              page={logs.data.meta.page}
              totalPages={logs.data.meta.totalPages}
              total={logs.data.meta.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
