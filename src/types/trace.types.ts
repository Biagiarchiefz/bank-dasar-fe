// Vein-to-vein trace of a bag.

import type { LabStatus, TestValue } from "./collection.types";
import type { ABO, Rh } from "./common.types";
import type { Product, ProductEvent } from "./product.types";
import type { Severity, TransfusionStatus } from "./transfusion.types";

export type TraceProduct = Product & {
  batch: { batch_no: string; processed_at: string } | null;
  release: { decision: string; reason: string | null; decided_at: string; decided_by_name: string | null } | null;
  transfers: {
    transfer_id: number;
    transfer_no: string;
    from_facility: string;
    to_facility: string;
    sent_at: string;
    received_at: string | null;
    receive_status: string;
    courier_name: string | null;
  }[];
  allocation: {
    status: string;
    allocated_at: string;
    request_id: number;
    request_no: string;
    crossmatch_result: string | null;
  } | null;
  issue: { issue_no: string; issued_at: string; ward: string; received_by_name: string } | null;
  transfusion: {
    id: number;
    patient_mrn: string;
    patient_name: string;
    ward: string;
    status: TransfusionStatus;
    started_at: string;
    ended_at: string | null;
    volume_given_ml: number | null;
    reactions: { severity: Severity; reported_at: string; symptoms: string[] }[];
  } | null;
  events: ProductEvent[];
};

export type Trace = {
  query: string;
  matched_product_id: number | null;
  donor: { donor_no: string; display_name: string; abo: ABO | null; rh: Rh | null; gender: string; masked: boolean };
  visit: {
    visit_no: string;
    visit_at: string;
    screened_at: string | null;
    screened_by_name: string | null;
    hb_g_dl: number | null;
    status: string;
  } | null;
  donation: {
    id: number;
    donation_no: string;
    started_at: string;
    collected_at: string | null;
    volume_ml: number | null;
    bag_type: string | null;
    status: string;
    facility: string;
    collector_name: string | null;
  };
  lab: {
    status: LabStatus;
    imltd: "NON_REACTIVE" | "REACTIVE" | "PENDING";
    tests?: Record<string, TestValue>;
    abo: ABO | null;
    rh: Rh | null;
    entered_at: string | null;
    entered_by_name: string | null;
    validated_at: string | null;
    validated_by_name: string | null;
  } | null;
  products: TraceProduct[];
};
