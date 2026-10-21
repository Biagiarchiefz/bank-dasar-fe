// Hospital blood bank: patients, requests, crossmatch, allocation, issue.

import type { ABO, Rh } from "./common.types";
import type { Product } from "./product.types";
import type { TransfusionStatus } from "./transfusion.types";

export type Patient = {
  id: number;
  mrn: string;
  full_name: string;
  gender: "M" | "F";
  birth_date: string;
  abo: ABO | null;
  rh: Rh | null;
  ward: string | null;
};

export type RequestStatus = "NEW" | "VERIFIED" | "IN_PROGRESS" | "READY" | "ISSUED" | "COMPLETED" | "CANCELLED";
export type Priority = "ROUTINE" | "URGENT" | "EMERGENCY";

export type BloodRequest = {
  id: number;
  request_no: string;
  patient_id: number;
  patient_mrn: string;
  patient_name: string;
  patient_abo: ABO | null;
  patient_rh: Rh | null;
  doctor_name: string;
  ward: string;
  diagnosis: string | null;
  indication: string | null;
  priority: Priority;
  status: RequestStatus;
  needed_at: string | null;
  verified_by_name: string | null;
  verified_at: string | null;
  cancel_reason: string | null;
  created_by_name: string | null;
  created_at: string;
  items_summary: string;
  total_requested: number;
  total_allocated: number;
  total_issued: number;
  total_transfused: number;
};

export type RequestItem = {
  id: number;
  component_code: string;
  component_name: string;
  compat_group: "RED_CELL" | "PLASMA" | "PLATELET";
  quantity: number;
  allocated: number;
  issued: number;
  transfused: number;
  requires_crossmatch: boolean;
};

export type Sample = {
  id: number;
  sample_no: string;
  collected_at: string;
  received_at: string;
  received_by_name: string | null;
  status: "ACCEPTED" | "REJECTED";
  reject_reason: string | null;
  abo: ABO | null;
  rh: Rh | null;
  antibody_screen: "NOT_DONE" | "NEGATIVE" | "POSITIVE";
  result_status: "PENDING" | "VALIDATED";
  validated_by_name: string | null;
  validated_at: string | null;
};

export type Crossmatch = {
  id: number;
  request_item_id: number;
  sample_no: string;
  product_id: number;
  product_no: string;
  method: string | null;
  result: "COMPATIBLE" | "INCOMPATIBLE";
  notes: string | null;
  tested_by_name: string | null;
  tested_at: string;
  validated_by_name: string | null;
  validated_at: string | null;
  allocation_id: number | null;
};

export type Allocation = {
  id: number;
  request_item_id: number;
  component_code: string;
  product_id: number;
  crossmatch_id: number | null;
  status: "ACTIVE" | "ISSUED" | "CANCELLED";
  allocated_by_name: string | null;
  allocated_at: string;
  cancel_reason: string | null;
  product: Product;
};

export type IssueItem = {
  id: number;
  allocation_id: number;
  product_id: number;
  transfusion_id: number | null;
  transfusion_status: TransfusionStatus | null;
  product: Product;
};

export type Issue = {
  id: number;
  issue_no: string;
  request_id: number;
  issued_by_name: string | null;
  received_by_name: string;
  ward: string;
  issued_at: string;
  notes: string | null;
  items: IssueItem[];
};

export type RequestDetail = BloodRequest & {
  patient: Patient;
  items: RequestItem[];
  samples: Sample[];
  crossmatches: Crossmatch[];
  allocations: Allocation[];
  issues: Issue[];
  recipient_group: { abo: ABO; rh: Rh; sample_no: string } | null;
};

export type CompatLevel = "IDENTICAL" | "COMPATIBLE" | "NON_IDENTICAL";
export type Candidate = { product: Product; level: CompatLevel; warnings: string[]; crossmatch: Crossmatch | null };
export type IssueDetail = Issue & { request: BloodRequest; patient: Patient };
