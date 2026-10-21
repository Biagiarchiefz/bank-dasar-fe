// Pengguna endpoints (ADMIN only). There is no DELETE: accounts are deactivated.

import { api, type Query } from "@/services/api-client";
import type { Account, CreatedAccount, Role, TempPassword } from "@/types";

export type AccountInput = {
  username: string;
  full_name: string;
  email: string | null;
  role: Role;
  facility_id: number | null;
};
/** PATCH body: only the fields that changed (username cannot change). */
export type AccountUpdate = Partial<Omit<AccountInput, "username">>;

export type UserFilters = Query & {
  q?: string;
  role?: Role;
  facility_id?: number;
  status?: "active" | "inactive";
  page?: number;
  page_size?: number;
};

export const usersService = {
  list: (filters: UserFilters) => api.list<Account>("/admin/users", filters),
  create: (body: AccountInput) => api.post<CreatedAccount>("/admin/users", body),
  update: (id: number, body: AccountUpdate) => api.patch<Account>(`/admin/users/${id}`, body),
  resetPassword: (id: number) => api.post<TempPassword>(`/admin/users/${id}/reset-password`),
  deactivate: (id: number) => api.post<Account>(`/admin/users/${id}/deactivate`),
  activate: (id: number) => api.post<Account>(`/admin/users/${id}/activate`),
};
