"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import { type ReleaseDecisionInput, releaseService } from "../services/release.service";

// A release changes stock and the dashboard, not only this worklist.
const affected = [qk.allRelease, qk.allProducts, qk.allStock, qk.allDashboard];

export function useReleaseWorklist() {
  return useQuery({ queryKey: qk.releaseWorklist, queryFn: releaseService.worklist });
}

export function useBulkRelease(onSuccess: () => void) {
  return useApiMutation({
    mutationFn: releaseService.bulk,
    success: (res) => `${res.filter((r) => r.released).length} dari ${res.length} kantong diluluskan.`,
    invalidate: affected,
    onSuccess,
  });
}

export function useReleaseChecklist(productId: number) {
  return useQuery({ queryKey: qk.releaseChecklist(productId), queryFn: () => releaseService.checklist(productId) });
}

export function useReleaseDecision(productId: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (body: ReleaseDecisionInput) => releaseService.decide(productId, body),
    success: (p) => (p.quality_status === "RELEASED" ? `${p.product_no} diluluskan.` : `${p.product_no} ditolak.`),
    invalidate: affected,
    onSuccess,
  });
}
