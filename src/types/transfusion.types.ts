// Bedside transfusion, observations and reactions.

import type { Priority } from "./bdrs.types";
import type { ABO, Rh } from "./common.types";

export type TransfusionStatus = "IN_PROGRESS" | "COMPLETED" | "STOPPED";
export type Severity = "MILD" | "MODERATE" | "SEVERE";

export type WorklistEntry = {
  issue_item_id: number;
  issue_no: string;
  issued_at: string;
  received_by_name: string;
  request_id: number;
  request_no: string;
  priority: Priority;
  ward: string;
  patient_id: number;
  patient_mrn: string;
  patient_name: string;
  patient_abo: ABO | null;
  patient_rh: Rh | null;
  product_id: number;
  product_no: string;
  component_code: string;
  product_abo: ABO | null;
  product_rh: Rh | null;
  expires_at: string;
  transfusion_id: number | null;
  transfusion_status: TransfusionStatus | null;
  started_at: string | null;
};

export type TransfusionWorklist = { waiting: WorklistEntry[]; in_progress: WorklistEntry[] };

export type Observation = {
  id: number;
  label: string;
  observed_at: string;
  temperature_c: number | null;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  resp_rate: number | null;
  notes: string | null;
  recorded_by_name: string | null;
};

export type Reaction = {
  id: number;
  reported_at: string;
  symptoms: string[];
  severity: Severity;
  action_taken: string | null;
  outcome: string | null;
  reported_by_name: string | null;
};

export type Transfusion = {
  id: number;
  issue_item_id: number;
  product_id: number;
  product_no: string;
  component_code: string;
  component_name: string;
  product_abo: ABO | null;
  product_rh: Rh | null;
  product_volume_ml: number | null;
  expires_at: string;
  patient_id: number;
  patient_mrn: string;
  patient_name: string;
  patient_abo: ABO | null;
  patient_rh: Rh | null;
  request_id: number;
  request_no: string;
  ward: string;
  bedside_check: { key: string; label: string; checked: boolean }[];
  second_verifier_name: string;
  started_by_name: string | null;
  started_at: string;
  ended_at: string | null;
  status: TransfusionStatus;
  volume_given_ml: number | null;
  stop_reason: string | null;
  reaction_count: number;
};

export type TransfusionDetail = Transfusion & { observations: Observation[]; reactions: Reaction[] };
