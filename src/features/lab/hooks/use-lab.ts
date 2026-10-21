"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import { type LabFilters, type LabResultInput, labService } from "../services/lab.service";

export function useLabWorklist(filters: LabFilters) {
  return useQuery({
    queryKey: qk.labWorklist(filters),
    queryFn: () => labService.worklist(filters),
    placeholderData: keepPreviousData,
  });
}

export function useLabResult(donationId: number) {
  return useQuery({ queryKey: qk.labResult(donationId), queryFn: () => labService.result(donationId) });
}

export function useSaveLabResult(donationId: number) {
  return useApiMutation({
    mutationFn: (body: LabResultInput) => labService.save(donationId, body),
    success: "Hasil disimpan. Menunggu validasi.",
    invalidate: [qk.allLab],
  });
}

export function useValidateLabResult(donationId: number) {
  return useApiMutation({
    mutationFn: () => labService.validate(donationId),
    success: (r) => (r.is_reactive ? "Hasil divalidasi. Semua kantong donasi ini DITOLAK." : "Hasil divalidasi."),
    invalidate: [qk.allLab, qk.allProducts, qk.allRelease, qk.allProcessing, qk.allDonations],
    // Shown inline with its own title.
    silentCodes: ["BLOOD_GROUP_DISCREPANCY"],
  });
}
