// BDRS endpoints: patients (mock SIMRS), blood requests, samples, crossmatch,
// allocation and hand-over to the ward.

import { api, type Query } from "@/services/api-client";
import type { ABO, BloodRequest, Candidate, IssueDetail, Patient, Priority, RequestDetail, Rh } from "@/types";

export type RequestFilters = Query & { status?: string; q?: string; page?: number; page_size?: number };

export type RequestInput = {
  patient_id: number;
  doctor_name: string;
  ward: string;
  diagnosis: string | null;
  indication: string | null;
  priority: Priority;
  needed_at: string | null;
  items: { component_code: string; quantity: number }[];
};

export type SampleInput = {
  collected_at: string;
  status: "ACCEPTED" | "REJECTED";
  abo?: ABO;
  rh?: Rh;
  antibody_screen?: string;
  reject_reason?: string;
};

export type CrossmatchInput = {
  request_item_id: number;
  sample_id: number;
  product_id: number;
  method: string;
  result: "COMPATIBLE" | "INCOMPATIBLE";
  notes: string | null;
  /** Compatible + validated right away = the bag is allocated immediately. */
  validate_now: boolean;
};

export type IssueInput = { allocation_ids: number[]; received_by_name: string; notes: string | null };

export const bdrsService = {
  patients: (q: string) => api.list<Patient>("/patients", { q, page_size: 8 }),

  requests: (filters: RequestFilters) => api.list<BloodRequest>("/bdrs/requests", filters),
  request: (id: number) => api.get<RequestDetail>(`/bdrs/requests/${id}`),
  createRequest: (body: RequestInput) => api.post<RequestDetail>("/bdrs/requests", body),
  verifyRequest: (id: number) => api.post<RequestDetail>(`/bdrs/requests/${id}/verify`),
  cancelRequest: (id: number, reason: string) => api.post<RequestDetail>(`/bdrs/requests/${id}/cancel`, { reason }),

  addSample: (requestId: number, body: SampleInput) => api.post<RequestDetail>(`/bdrs/requests/${requestId}/samples`, body),
  validateSample: (sampleId: number) => api.post<RequestDetail>(`/bdrs/samples/${sampleId}/validate`),

  candidates: (itemId: number) => api.get<Candidate[]>(`/bdrs/request-items/${itemId}/candidates`),
  saveCrossmatch: (body: CrossmatchInput) => api.post<RequestDetail>("/bdrs/crossmatches", body),
  validateCrossmatch: (id: number) => api.post<RequestDetail>(`/bdrs/crossmatches/${id}/validate`),
  allocate: (itemId: number, productId: number) =>
    api.post<RequestDetail>("/bdrs/allocations", { request_item_id: itemId, product_id: productId }),
  cancelAllocation: (id: number, reason: string) => api.post<RequestDetail>(`/bdrs/allocations/${id}/cancel`, { reason }),

  issue: (requestId: number, body: IssueInput) => api.post<IssueDetail>(`/bdrs/requests/${requestId}/issues`, body),
  issueDetail: (id: number) => api.get<IssueDetail>(`/bdrs/issues/${id}`),
};
