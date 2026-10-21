// Transfusi endpoints: ward worklist, bedside identity check, observations,
// finish and transfusion reactions.

import { api } from "@/services/api-client";
import type { Severity, TransfusionDetail, TransfusionWorklist, WorklistEntry } from "@/types";

/** Vital signs in numbers (temperature °C, blood pressure mmHg, per-minute rates). */
export type Vitals = Record<"temperature_c" | "systolic" | "diastolic" | "pulse" | "resp_rate", number>;

export type IdentityCheck = { issue_item_id: number; scanned_product_no: string; scanned_patient_mrn: string };

export type StartInput = IdentityCheck & {
  bedside_check: Record<string, boolean>;
  second_verifier_name: string;
  pre_vitals: Vitals;
};

export type ObservationInput = Vitals & { label: string; notes: string | null };

export type FinishInput = { status: "COMPLETED" | "STOPPED"; volume_given_ml: number; stop_reason: string | null };

export type ReactionInput = {
  symptoms: string[];
  severity: Severity;
  action_taken: string | null;
  outcome: string | null;
  stop_transfusion: boolean;
  volume_given_ml: number | null;
};

export const transfusionsService = {
  worklist: () => api.get<TransfusionWorklist>("/transfusions/worklist"),
  issueItem: (issueItemId: number) => api.get<WorklistEntry>(`/transfusions/issue-items/${issueItemId}`),
  /** Answers IDENTITY_MISMATCH when the bag or wristband does not match. */
  verifyIdentity: (body: IdentityCheck) => api.post<WorklistEntry>("/transfusions/verify-identity", body),
  start: (body: StartInput) => api.post<TransfusionDetail>("/transfusions", body),
  get: (id: number) => api.get<TransfusionDetail>(`/transfusions/${id}`),
  addObservation: (id: number, body: ObservationInput) =>
    api.post<TransfusionDetail>(`/transfusions/${id}/observations`, body),
  finish: (id: number, body: FinishInput) => api.post<TransfusionDetail>(`/transfusions/${id}/finish`, body),
  reportReaction: (id: number, body: ReactionInput) => api.post<TransfusionDetail>(`/transfusions/${id}/reactions`, body),
};
