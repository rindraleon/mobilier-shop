import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../lib/api/users.api";
import { queryKeys } from "../lib/query/keys";
import { useAuth } from "../lib/auth/AuthProvider";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/errors";
import type { AddressInput, ChangePasswordInput, UpdateProfileInput } from "../types/api";

/** Profil de l'utilisateur connecté. */
export function useCurrentUser() {
  const { user, isAuthenticated, isBooting } = useAuth();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => usersApi.me(),
    // L'état d'auth fournit déjà l'essentiel : cette requête apporte les
    // champs complémentaires (avatar, isActive, date de création).
    enabled: isAuthenticated && !isBooting,
    initialData: user
      ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          avatarUrl: null,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      : undefined,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser, user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => usersApi.updateProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.me, profile);
      // Garde le jeton/portée vendeur intacts après changement d'e-mail.
      if (user) {
        setUser({
          ...user,
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
        });
      }
      toast("Profil mis à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useChangePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => usersApi.changePassword(input),
    onSuccess: () => toast("Mot de passe modifié."),
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

/* ------------------------------ Adresses ----------------------------- */

export function useAddresses(enabled = true) {
  const { isAuthenticated, isBooting } = useAuth();
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: () => usersApi.listAddresses(),
    enabled: enabled && isAuthenticated && !isBooting,
  });
}

export function useSaveAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: AddressInput) => usersApi.createAddress(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast("Adresse enregistrée.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AddressInput> }) =>
      usersApi.updateAddress(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast("Adresse mise à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast("Adresse supprimée.", "info");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      toast("Adresse par défaut mise à jour.");
    },
    onError: (error: unknown) => toast(errorMessage(error), "error"),
  });
}
