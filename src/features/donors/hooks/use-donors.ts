"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { DonorDetail, Visit } from "@/types";
import { type DonorFilters, type DonorInput, donorsService } from "../services/donors.service";

export function useDonors(filters: DonorFilters) {
  return useQuery({
    queryKey: qk.donors(filters),
    queryFn: () => donorsService.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useDonor(id: number) {
  return useQuery({ queryKey: qk.donor(id), queryFn: () => donorsService.get(id) });
}

export function useDonorHistory(id: number) {
  return useQuery({ queryKey: qk.donorHistory(id), queryFn: () => donorsService.history(id) });
}

export function useCreateDonor(onSuccess: (d: DonorDetail) => void) {
  return useApiMutation({
    mutationFn: donorsService.create,
    success: (d) => `Pendonor ${d.donor_no} berhasil didaftarkan.`,
    invalidate: [qk.allDonors],
    onSuccess,
  });
}

export function useUpdateDonor(id: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (body: DonorInput) => donorsService.update(id, body),
    success: "Data pendonor diperbarui.",
    invalidate: [qk.allDonors],
    onSuccess,
  });
}

export function useRegisterVisit(donorId: number, onSuccess: (v: Visit) => void) {
  return useApiMutation({
    mutationFn: () => donorsService.registerVisit(donorId),
    success: (v) => `Kunjungan ${v.visit_no} terdaftar. Lanjutkan ke seleksi.`,
    invalidate: [qk.allDonors, qk.allVisits],
    onSuccess,
  });
}
