import { api } from "./client";
import type {
  Address,
  AddressInput,
  ChangePasswordInput,
  UpdateProfileInput,
  UserProfile,
} from "../../types/api";

export const usersApi = {
  me: () => api.get<UserProfile>("/users/me"),

  updateProfile: (input: UpdateProfileInput) =>
    api.patch<UserProfile>("/users/me", input),

  changePassword: (input: ChangePasswordInput) =>
    api.post<{ message: string }>("/users/me/password", input),

  listAddresses: () => api.get<Address[]>("/users/me/addresses"),

  createAddress: (input: AddressInput) => api.post<Address>("/users/me/addresses", input),

  updateAddress: (id: string, input: Partial<AddressInput>) =>
    api.patch<Address>("/users/me/addresses/" + id, input),

  deleteAddress: (id: string) => api.delete<void>("/users/me/addresses/" + id),

  setDefaultAddress: (id: string) =>
    api.post<Address>("/users/me/addresses/" + id + "/default"),
};
