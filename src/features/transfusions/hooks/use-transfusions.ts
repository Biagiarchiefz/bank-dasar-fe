"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { TransfusionDetail } from "@/types";
import {
  type FinishInput,
  type ObservationInput,
  type ReactionInput,
  transfusionsService,
} from "../services/transfusions.service";

// A transfusion updates its request, the bag and the dashboard counters.
const affected = [qk.allTransfusions, qk.allRequests, qk.allProducts, qk.allDashboard];

/** Bags handed to the wards, refreshed every 30 s. */
export function useTransfusionWorklist() {
  return useQuery({
    queryKey: qk.transfusionWorklist,
    queryFn: transfusionsService.worklist,
    refetchInterval: 30_000,
  });
}

export function useIssueItem(issueItemId: number) {
  return useQuery({ queryKey: qk.issueItem(issueItemId), queryFn: () => transfusionsService.issueItem(issueItemId) });
}

export function useTransfusion(id: number) {
  return useQuery({ queryKey: qk.transfusion(id), queryFn: () => transfusionsService.get(id) });
}

export function useVerifyIdentity(onSuccess: () => void) {
  return useApiMutation({
    mutationFn: transfusionsService.verifyIdentity,
    // The wizard shows a mismatch as a full-screen warning instead of a toast.
    silentCodes: ["IDENTITY_MISMATCH"],
    onSuccess,
  });
}

export function useStartTransfusion(onSuccess: (t: TransfusionDetail) => void) {
  return useApiMutation({
    mutationFn: transfusionsService.start,
    success: "Transfusi dimulai.",
    invalidate: [qk.allTransfusions, qk.allRequests, qk.allProducts],
    onSuccess,
  });
}

export function useAddObservation(id: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (body: ObservationInput) => transfusionsService.addObservation(id, body),
    success: "Observasi dicatat.",
    invalidate: affected,
    onSuccess,
  });
}

export function useFinishTransfusion(id: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (body: FinishInput) => transfusionsService.finish(id, body),
    success: (_, body) => (body.status === "COMPLETED" ? "Transfusi selesai." : "Transfusi dihentikan."),
    invalidate: affected,
    onSuccess,
  });
}

export function useReportReaction(id: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (body: ReactionInput) => transfusionsService.reportReaction(id, body),
    success: (_, body) =>
      body.stop_transfusion ? "Reaksi dilaporkan dan transfusi dihentikan." : "Reaksi transfusi dilaporkan.",
    invalidate: affected,
    onSuccess,
  });
}
