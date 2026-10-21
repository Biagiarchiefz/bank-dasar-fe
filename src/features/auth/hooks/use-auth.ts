"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { routes } from "@/config/site";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { Me } from "@/types";
import { authService } from "../services/auth.service";

/** The signed-in user (GET /auth/me). */
export function useMe() {
  return useQuery({ queryKey: qk.me, queryFn: authService.me, staleTime: 5 * 60_000 });
}

/** Login; on success the cache is reset to the new user before `onSuccess` runs. */
export function useLogin(onSuccess: (me: Me) => void) {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: authService.login,
    // Shown inline under the form (locked/inactive/expired carry their own message).
    silentCodes: [
      "UNAUTHENTICATED",
      "FORBIDDEN",
      "VALIDATION_ERROR",
      "ACCOUNT_INACTIVE",
      "ACCOUNT_LOCKED",
      "TEMP_PASSWORD_EXPIRED",
    ],
    onSuccess: (me) => {
      qc.clear();
      qc.setQueryData(qk.me, me);
      onSuccess(me);
    },
  });
}

/** Ends the session, drops every cached query and returns to the login page. */
export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return useCallback(async () => {
    await authService.logout().catch(() => undefined);
    qc.clear();
    router.replace(routes.login);
  }, [qc, router]);
}

export function useChangePassword(onSuccess: (me: Me) => void) {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: authService.changePassword,
    success: "Password berhasil diganti.",
    silentCodes: ["VALIDATION_ERROR"],
    onSuccess: (me) => {
      qc.setQueryData(qk.me, me);
      onSuccess(me);
    },
  });
}
