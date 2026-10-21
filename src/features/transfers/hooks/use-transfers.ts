"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { TransferDetail } from "@/types";
import { type ReceiveInput, type TransferFilters, transfersService } from "../services/transfers.service";

// Moving bags changes stock at both facilities and the dashboard.
const affected = [qk.allTransfers, qk.allProducts, qk.allStock, qk.allDashboard];

export function useTransfers(filters: TransferFilters) {
  return useQuery({
    queryKey: qk.transfers(filters),
    queryFn: () => transfersService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTransfer(id: number) {
  return useQuery({ queryKey: qk.transfer(id), queryFn: () => transfersService.get(id) });
}

export function useCreateTransfer(onSuccess: (t: TransferDetail) => void) {
  return useApiMutation({
    mutationFn: transfersService.create,
    success: (t) => `Kiriman ${t.transfer_no} dibuat (${t.item_count} kantong).`,
    invalidate: affected,
    onSuccess,
  });
}

export function useReceiveTransfer(id: number) {
  return useApiMutation({
    mutationFn: (body: ReceiveInput) => transfersService.receive(id, body),
    success: (r) => `Kiriman ${r.transfer_no} diterima (${r.accepted_count} diterima, ${r.rejected_count} ditolak).`,
    invalidate: affected,
  });
}
