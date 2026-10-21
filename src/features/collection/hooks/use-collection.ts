"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { Donation } from "@/types";
import { collectionService, type DonationFilters } from "../services/collection.service";

export function useEligibleVisits() {
  return useQuery({
    queryKey: qk.visits({ status: "ELIGIBLE" }),
    queryFn: collectionService.eligibleVisits,
    refetchInterval: 30_000,
  });
}

export function useDonations(filters: DonationFilters) {
  return useQuery({ queryKey: qk.donations(filters), queryFn: () => collectionService.donations(filters) });
}

export function useDonation(id: number) {
  return useQuery({ queryKey: qk.donation(id), queryFn: () => collectionService.donation(id) });
}

export function useStartDonation(onSuccess: (d: Donation) => void) {
  return useApiMutation({
    mutationFn: ({ visitId, bag }: { visitId: number; bag: string }) => collectionService.start(visitId, bag),
    success: (d) => `Donasi ${d.donation_no} dimulai.`,
    invalidate: [qk.allVisits, qk.allDonations],
    onSuccess,
  });
}

export function useCompleteDonation(id: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (volumeMl: number) => collectionService.complete(id, volumeMl),
    success: (r) => `Donasi selesai. Kantong ${r.product_no} dibuat (karantina).`,
    invalidate: [qk.allDonations, qk.allVisits, qk.allLab, qk.allProcessing],
    onSuccess,
  });
}

export function useFailDonation(id: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (reason: string) => collectionService.fail(id, reason),
    success: "Donasi dicatat gagal.",
    invalidate: [qk.allDonations, qk.allVisits],
    onSuccess,
  });
}
