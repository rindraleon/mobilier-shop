import { useState } from "react";
import { Search, ShieldOff, UserCheck, Users } from "lucide-react";
import { useAdminUsers, useChangeUserRole, useSuspendUser, useReactivateUser } from "../../hooks/useAdmin";
import { formatDate } from "../../utils/format";
import { errorMessage } from "../../utils/errors";
import { useToast } from "../../context/ToastContext";
import PageLoader from "../../components/ui/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Avatar from "../../components/ui/Avatar";
import { Input, Select } from "../../components/ui/Form";
import type { UserProfile, UserRole } from "../../types/api";

const ROLE_LABEL: Record<UserRole, string> = {
  customer: "Client",
  seller: "Vendeur",
  admin: "Administrateur",
};

const ROLE_VARIANT: Record<UserRole, "neutral" | "success" | "secondary"> = {
  customer: "neutral",
  seller: "success",
  admin: "secondary",
};

export default function AdminCustomers() {
  const { toast } = useToast();
  const [page, setPage] = useState<number>(1);
  const [role, setRole] = useState<UserRole | "">("");
  const [search, setSearch] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [toSuspend, setToSuspend] = useState<UserProfile | null>(null);

  const { data, isLoading, isError, refetch, isPlaceholderData } = useAdminUsers({
    page,
    limit: 10,
    role: role || undefined,
    search: term || undefined,
  });
  const changeRole = useChangeUserRole();
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();

  const users = data?.items ?? [];

  return (
    <div>
      <h1 className="font-display text-headline-md text-primary">Clients</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(search);
          setPage(1);
        }}
        className="mt-5 flex flex-wrap gap-3"
      >
        <span className="relative min-w-[240px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom ou e-mail…"
            className="pl-9"
            aria-label="Rechercher un utilisateur"
          />
        </span>
        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as UserRole | "");
            setPage(1);
          }}
          aria-label="Filtrer par rôle"
          className="w-48"
        >
          <option value="">Tous les rôles</option>
          <option value="customer">Client</option>
          <option value="seller">Vendeur</option>
          <option value="admin">Administrateur</option>
        </Select>
      </form>

      {isLoading ? (
        <div className="py-16">
          <PageLoader label="Chargement des utilisateurs…" />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <EmptyState
            title="Impossible de charger les utilisateurs"
            actionLabel="Réessayer"
            onAction={() => void refetch()}
          />
        </div>
      ) : users.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Users} title="Aucun utilisateur" />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant/50">
            <table className="w-full min-w-[760px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 font-semibold">Téléphone</th>
                  <th className="px-4 py-3 font-semibold">Rôle</th>
                  <th className="px-4 py-3 font-semibold">Inscrit le</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-surface-container-high bg-surface-container-lowest ${isPlaceholderData ? "opacity-60" : ""}`}>
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <Avatar name={user.fullName} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-primary">
                            {user.fullName}
                          </span>
                          <span className="block truncate text-label-sm text-on-surface-variant">
                            {user.email}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{user.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge variant={ROLE_VARIANT[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                        {!user.isActive && <Badge variant="danger">Suspendu</Badge>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center justify-end gap-2">
                        <Select
                          value={user.role}
                          onChange={(e) => {
                            changeRole.mutate(
                              { id: user.id, role: e.target.value as UserRole },
                              { onError: (error: unknown) => toast(errorMessage(error), "error") },
                            );
                          }}
                          aria-label={"Rôle de " + user.fullName}
                          className="w-36"
                        >
                          <option value="customer">Client</option>
                          <option value="seller">Vendeur</option>
                          <option value="admin">Administrateur</option>
                        </Select>
                        {user.isActive ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setToSuspend(user)}
                            title="Suspendre"
                          >
                            <ShieldOff size={15} />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reactivateUser.mutate(user.id)}
                            title="Réactiver"
                          >
                            <UserCheck size={15} />
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

      <ConfirmDialog
        open={toSuspend !== null}
        onClose={() => setToSuspend(null)}
        onConfirm={() => {
          if (toSuspend) suspendUser.mutate({ id: toSuspend.id });
          setToSuspend(null);
        }}
        title="Suspendre le compte"
        message="Le compte perdra l'accès aux espaces privés. Cette action est journalisée."
        confirmLabel="Suspendre"
      />
    </div>
  );
}
