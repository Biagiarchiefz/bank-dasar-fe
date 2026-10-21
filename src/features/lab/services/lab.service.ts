// Laboratorium endpoints: IMLTD screening and ABO/Rh per donation.

import { api, type Query } from "@/services/api-client";
import type { ABO, LabDetail, LabResult, LabStatus, Rh } from "@/types";

export type LabFilters = Query & { status?: LabStatus; page?: number; page_size?: number };

type Screen = "NON_REACTIVE" | "REACTIVE";
export type LabResultInput = {
  hiv: Screen;
  hbv: Screen;
  hcv: Screen;
  syphilis: Screen;
  abo: ABO;
  rh: Rh;
  method_note: string | null;
  notes: string | null;
};

export const labService = {
  worklist: (filters: LabFilters) => api.list<LabResult>("/lab/worklist", filters),
  result: (donationId: number) => api.get<LabDetail>(`/lab/results/${donationId}`),
  save: (donationId: number, body: LabResultInput) => api.put<LabDetail>(`/lab/results/${donationId}`, body),
  /** Reactive results reject every bag of the donation. */
  validate: (donationId: number) => api.post<LabDetail>(`/lab/results/${donationId}/validate`),
};
