// Blood collection and IMLTD/ABO lab results.

import type { ABO, Rh } from "./common.types";
import type { Product } from "./product.types";

export type DonationStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type Donation = {
  id: number;
  donation_no: string;
  visit_id: number;
  visit_no: string;
  donor_id: number;
  donor_no: string;
  donor_name: string;
  donor_gender: "M" | "F";
  donor_birth_date: string;
  donor_abo: ABO | null;
  donor_rh: Rh | null;
  facility_name: string;
  bag_type: string | null;
  volume_ml: number | null;
  started_at: string;
  ended_at: string | null;
  status: DonationStatus;
  failure_reason: string | null;
  collector_name: string | null;
  product_id: number | null;
  product_no: string | null;
  product_expires_at: string | null;
  lab_status: LabStatus | null;
};

export type LabStatus = "PENDING" | "ENTERED" | "VALIDATED";
export type TestValue = "PENDING" | "NON_REACTIVE" | "REACTIVE";

export type LabResult = {
  id: number;
  donation_id: number;
  hiv: TestValue;
  hbv: TestValue;
  hcv: TestValue;
  syphilis: TestValue;
  abo: ABO | null;
  rh: Rh | null;
  method_note: string | null;
  status: LabStatus;
  notes: string | null;
  entered_by_name: string | null;
  entered_at: string | null;
  validated_by_name: string | null;
  validated_at: string | null;
  donation_no: string;
  collected_at: string | null;
  donor_id: number;
  donor_no: string;
  donor_name: string;
  donor_abo: ABO | null;
  donor_rh: Rh | null;
  donor_group_confirmed: boolean;
  is_reactive: boolean;
};

export type LabDetail = LabResult & { products: Product[] };
