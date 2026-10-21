"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import { type ScreeningInput, screeningService, type VisitFilters } from "../services/screening.service";

/** Visits of a day; refreshed every 30 s because the front desk keeps adding them. */
export function useVisits(filters: VisitFilters) {
  return useQuery({
    queryKey: qk.visits(filters),
    queryFn: () => screeningService.visits(filters),
    refetchInterval: 30_000,
  });
}

export function useVisit(id: number) {
  return useQuery({ queryKey: qk.visit(id), queryFn: () => screeningService.visit(id) });
}

export function useSubmitScreening(visitId: number) {
  return useApiMutation({
    mutationFn: (body: ScreeningInput) => screeningService.submit(visitId, body),
    success: (v) => (v.status === "ELIGIBLE" ? "Pendonor dinyatakan layak donor." : "Pendonor ditunda."),
    invalidate: [qk.allVisits, qk.allDonors],
  });
}
