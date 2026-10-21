"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { Account, CreatedAccount, TempPassword } from "@/types";
import { type AccountUpdate, type UserFilters, usersService } from "../services/users.service";

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: qk.users(filters),
    queryFn: () => usersService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser(onSuccess: (res: CreatedAccount) => void) {
  return useApiMutation({
    mutationFn: usersService.create,
    invalidate: [qk.allUsers],
    // Field errors (incl. duplicate username) are shown in the form.
    silentCodes: ["VALIDATION_ERROR", "CONFLICT"],
    onSuccess,
  });
}

export function useUpdateUser(onSuccess: () => void) {
  return useApiMutation({
    mutationFn: ({ id, body }: { id: number; body: AccountUpdate }) => usersService.update(id, body),
    invalidate: [qk.allUsers],
    success: "Perubahan akun disimpan.",
    silentCodes: ["VALIDATION_ERROR", "CONFLICT"],
    onSuccess,
  });
}

export type AccountAction = "reset" | "deactivate" | "activate";

export type AccountActionVars = { kind: AccountAction; account: Account };

/** Reset password / deactivate / activate. Reset resolves to the new temporary password. */
export function useAccountAction(onSuccess: (temp: TempPassword | null, vars: AccountActionVars) => void) {
  return useApiMutation({
    mutationFn: async ({ kind, account }: AccountActionVars) => {
      if (kind === "reset") return usersService.resetPassword(account.id);
      await (kind === "deactivate" ? usersService.deactivate(account.id) : usersService.activate(account.id));
      return null;
    },
    invalidate: [qk.allUsers],
    success: (temp) => (temp ? "Password direset." : "Status akun diperbarui."),
    onSuccess,
  });
}
