"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { IssueDetail, RequestDetail } from "@/types";
import {
  bdrsService,
  type CrossmatchInput,
  type IssueInput,
  type RequestFilters,
  type RequestInput,
  type SampleInput,
} from "../services/bdrs.service";

/** Every action on a request can move bags, so stock and transfusions refresh too. */
const affected = [qk.allRequests, qk.allProducts, qk.allStock, qk.allDashboard, qk.allTransfusions];

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function usePatients(q: string, options?: { enabled?: boolean }) {
  return useQuery({ queryKey: qk.patients(q), queryFn: () => bdrsService.patients(q), enabled: options?.enabled });
}

/** Request list, refreshed every 30 s for incoming ward requests. */
export function useRequests(filters: RequestFilters) {
  return useQuery({
    queryKey: qk.requests(filters),
    queryFn: () => bdrsService.requests(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });
}

export function useRequest(id: number) {
  return useQuery({ queryKey: qk.request(id), queryFn: () => bdrsService.request(id) });
}

export function useCandidates(itemId: number) {
  return useQuery({ queryKey: qk.candidates(itemId), queryFn: () => bdrsService.candidates(itemId) });
}

export function useIssue(id: number) {
  return useQuery({ queryKey: qk.issue(id), queryFn: () => bdrsService.issueDetail(id) });
}

// ---------------------------------------------------------------------------
// Request lifecycle
// ---------------------------------------------------------------------------

export function useCreateRequest(onSuccess: (r: RequestDetail) => void) {
  return useApiMutation({
    mutationFn: (body: RequestInput) => bdrsService.createRequest(body),
    success: (r) => `Permintaan ${r.request_no} dibuat.`,
    invalidate: [qk.allRequests, qk.allDashboard],
    onSuccess,
  });
}

export function useVerifyRequest(id: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: () => bdrsService.verifyRequest(id),
    success: "Permintaan diverifikasi. Lanjutkan dengan penerimaan sampel.",
    invalidate: affected,
    onSuccess,
  });
}

export function useCancelRequest(id: number) {
  return useApiMutation({
    mutationFn: (reason: string) => bdrsService.cancelRequest(id, reason),
    success: "Permintaan dibatalkan. Kantong yang dialokasikan kembali ke stok.",
    invalidate: affected,
  });
}

// ---------------------------------------------------------------------------
// Samples
// ---------------------------------------------------------------------------

export function useAddSample(requestId: number, onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (body: SampleInput) => bdrsService.addSample(requestId, body),
    success: (_, body) =>
      body.status === "ACCEPTED" ? "Sampel diterima. Validasi hasil golongan darah." : "Sampel ditolak.",
    invalidate: affected,
    onSuccess,
  });
}

export function useValidateSample(sampleId: number) {
  return useApiMutation({
    mutationFn: () => bdrsService.validateSample(sampleId),
    success: "Golongan darah pasien tervalidasi.",
    invalidate: affected,
    // Shown inline with its own title.
    silentCodes: ["BLOOD_GROUP_DISCREPANCY"],
  });
}

// ---------------------------------------------------------------------------
// Crossmatch & allocation
// ---------------------------------------------------------------------------

export function useSaveCrossmatch(onSuccess: () => void) {
  return useApiMutation({
    mutationFn: (body: CrossmatchInput) => bdrsService.saveCrossmatch(body),
    success: (_, body) =>
      body.result === "COMPATIBLE"
        ? body.validate_now
          ? "Crossmatch kompatibel — kantong dialokasikan."
          : "Crossmatch dicatat, menunggu validasi."
        : "Crossmatch TIDAK kompatibel — kantong tidak dialokasikan.",
    invalidate: [...affected, qk.allCandidates],
    onSuccess,
  });
}

export function useValidateCrossmatch() {
  return useApiMutation({
    mutationFn: (id: number) => bdrsService.validateCrossmatch(id),
    success: "Crossmatch divalidasi.",
    invalidate: affected,
  });
}

export function useAllocate(itemId: number) {
  return useApiMutation({
    mutationFn: (productId: number) => bdrsService.allocate(itemId, productId),
    success: "Kantong dialokasikan untuk pasien.",
    invalidate: [...affected, qk.candidates(itemId)],
  });
}

export function useCancelAllocation(onSuccess: () => void) {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => bdrsService.cancelAllocation(id, reason),
    success: "Alokasi dibatalkan. Kantong kembali ke stok.",
    invalidate: affected,
    onSuccess,
  });
}

// ---------------------------------------------------------------------------
// Hand-over to the ward
// ---------------------------------------------------------------------------

export function useIssueBags(requestId: number, onSuccess: (i: IssueDetail) => void) {
  return useApiMutation({
    mutationFn: (body: IssueInput) => bdrsService.issue(requestId, body),
    success: (i) => `Serah terima ${i.issue_no} tercatat (${i.items.length} kantong).`,
    invalidate: affected,
    onSuccess,
  });
}
