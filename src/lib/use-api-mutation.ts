"use client";

// useMutation with the app's conventions: toast on success/failure and
// invalidation of related query keys (PROTOTYPE_PLAN §10.1, §10.5).

import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { ApiError } from "./api";

type Options<TData, TVars> = {
  mutationFn: (vars: TVars) => Promise<TData>;
  /** Toast shown on success (string or built from the result). */
  success?: string | ((data: TData) => string);
  /** Query keys to refetch after success. */
  invalidate?: QueryKey[];
  onSuccess?: (data: TData, vars: TVars) => void;
  /** Error toast is skipped for these codes (the page shows them inline). */
  silentCodes?: string[];
};

export function useApiMutation<TData, TVars = void>(opts: Options<TData, TVars>) {
  const qc = useQueryClient();
  return useMutation<TData, ApiError, TVars>({
    mutationFn: opts.mutationFn,
    onSuccess: async (data, vars) => {
      await Promise.all((opts.invalidate ?? []).map((queryKey) => qc.invalidateQueries({ queryKey })));
      if (opts.success) toast.success(typeof opts.success === "string" ? opts.success : opts.success(data));
      opts.onSuccess?.(data, vars);
    },
    onError: (err) => {
      if (opts.silentCodes?.includes(err.code)) return;
      toast.error(err.message, {
        description: err.details?.length ? err.details.join(" • ") : undefined,
      });
    },
  });
}

/** Copies API field errors into a React Hook Form instance. */
export function applyFieldErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>) {
  if (!(err instanceof ApiError) || !err.fields) return;
  for (const [field, message] of Object.entries(err.fields)) {
    setError(field.replace(/\[(\d+)\]/g, ".$1") as Path<T>, { type: "server", message });
  }
}
