// Donors, visits and pre-donation screening.

import type { DonationStatus } from "./collection.types";
import type { ABO, Rh } from "./common.types";

export type Donor = {
  id: number;
  donor_no: string;
  nik: string | null;
  full_name: string;
  gender: "M" | "F";
  birth_date: string;
  phone: string | null;
  address: string | null;
  abo: ABO | null;
  rh: Rh | null;
  blood_group_confirmed: boolean;
  donation_count: number;
  last_donation_at: string | null;
  deferred_until: string | null;
  is_permanently_deferred: boolean;
  created_at: string;
};

export type DonorDetail = Donor & {
  eligibility: { can_register: boolean; reasons: string[]; next_eligible_date: string | null };
  open_visit_id: number | null;
};

export type VisitStatus = "REGISTERED" | "ELIGIBLE" | "DEFERRED" | "DONATED" | "CANCELLED";

export type Visit = {
  id: number;
  visit_no: string;
  donor_id: number;
  visit_at: string;
  status: VisitStatus;
  questionnaire: { code: string; question: string; answer: boolean }[] | null;
  weight_kg: number | null;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  temperature_c: number | null;
  hb_g_dl: number | null;
  decision_note: string | null;
  deferral_type: "TEMPORARY" | "PERMANENT" | null;
  deferral_reason: string | null;
  deferral_until: string | null;
  screened_by_name: string | null;
  screened_at: string | null;
  donor_no: string;
  donor_name: string;
  donor_gender: "M" | "F";
  donor_abo: ABO | null;
  donor_rh: Rh | null;
  donation_id: number | null;
  donation_no: string | null;
  donation_status: DonationStatus | null;
  donation_volume_ml: number | null;
};

export type DonorHistory = { visits: Visit[]; deferrals: Visit[] };
