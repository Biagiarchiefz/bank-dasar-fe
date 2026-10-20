// DTOs returned by the Go API (JSON snake_case). Keep in sync with the
// backend models in bank-darah-be/internal/modules/*/model.go.

export type Role = "ADMIN" | "PETUGAS_UTD" | "LAB_UTD" | "PETUGAS_BDRS" | "PERAWAT" | "PIMPINAN";
export type ABO = "A" | "B" | "AB" | "O";
export type Rh = "POS" | "NEG";
export type QualityStatus = "HOLD" | "RELEASED" | "REJECTED";
export type InventoryStatus =
  | "IN_STOCK"
  | "PROCESSED"
  | "RESERVED"
  | "IN_TRANSIT"
  | "ISSUED"
  | "TRANSFUSED"
  | "DISCARDED";

export type Paged<T> = { data: T[]; meta: { page: number; page_size: number; total: number } };

export type Me = {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  facility_id: number | null;
  facility_name: string | null;
  facility_type: "UTD" | "BDRS" | null;
};

// ---------------------------------------------------------------------------
// Master
// ---------------------------------------------------------------------------

export type Facility = { id: number; code: string; name: string; type: "UTD" | "BDRS" };
export type Location = {
  id: number;
  facility_id: number;
  code: string;
  name: string;
  temp_min_c: number | null;
  temp_max_c: number | null;
};
export type Component = {
  id: number;
  code: string;
  name: string;
  compat_group: "RED_CELL" | "PLASMA" | "PLATELET";
  shelf_life_days: number;
};
export type ScreeningQuestion = { code: string; question: string; defer_if_yes: boolean };
export type ScreeningRanges = {
  hb_min: number;
  hb_max: number;
  weight_min: number;
  systolic_min: number;
  systolic_max: number;
  diastolic_min: number;
  diastolic_max: number;
};
export type ScreeningConfig = { questions: ScreeningQuestion[]; ranges: ScreeningRanges };

// ---------------------------------------------------------------------------
// Donors
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Collection & lab
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type Product = {
  id: number;
  product_no: string;
  donation_id: number;
  donation_no: string;
  component_id: number;
  component_code: string;
  component_name: string;
  compat_group: "RED_CELL" | "PLASMA" | "PLATELET";
  parent_product_id: number | null;
  batch_id: number | null;
  abo: ABO | null;
  rh: Rh | null;
  volume_ml: number | null;
  collected_at: string;
  produced_at: string;
  expires_at: string;
  quality_status: QualityStatus;
  inventory_status: InventoryStatus;
  hold_reason: string | null;
  facility_id: number;
  facility_name: string;
  facility_type: "UTD" | "BDRS";
  location_id: number | null;
  location_code: string | null;
  location_name: string | null;
  is_expired: boolean;
  is_usable: boolean;
};

export type ProductEvent = {
  id: number;
  product_id: number;
  event_type: string;
  from_quality_status: QualityStatus | null;
  to_quality_status: QualityStatus | null;
  from_inventory_status: InventoryStatus | null;
  to_inventory_status: InventoryStatus | null;
  facility_name: string | null;
  ref_type: string | null;
  ref_id: number | null;
  note: string | null;
  actor: string | null;
  created_at: string;
};

export type ProductDetail = { product: Product; parent: Product | null; children: Product[] };

export type StockMatrix = {
  components: string[];
  blood_groups: string[];
  cells: { component_code: string; abo: ABO; rh: Rh; count: number }[];
  low_stock_threshold: number;
};

export type Batch = {
  id: number;
  batch_no: string;
  processed_by_name: string | null;
  processed_at: string;
  notes: string | null;
  sources: Product[];
  outputs: Product[];
};

export type ChecklistItem = { key: string; label: string; auto: boolean; passed: boolean | null };
export type ReleaseChecklist = {
  product: Product;
  items: ChecklistItem[];
  auto_checks_pass: boolean;
  can_decide: boolean;
};
export type ReleaseWorklistItem = Product & { auto_checks_pass: boolean; failed_checks: string[] };
export type BulkReleaseResult = {
  product_id: number;
  product_no: string;
  released: boolean;
  message?: string;
  details?: string[];
};

// ---------------------------------------------------------------------------
// Transfers
// ---------------------------------------------------------------------------

export type TransferStatus = "IN_TRANSIT" | "RECEIVED" | "PARTIAL" | "CANCELLED";

export type Transfer = {
  id: number;
  transfer_no: string;
  from_facility_name: string;
  to_facility_id: number;
  to_facility_name: string;
  status: TransferStatus;
  courier_name: string | null;
  packing_temp_c: number | null;
  arrival_temp_c: number | null;
  sent_by_name: string | null;
  sent_at: string;
  received_by_name: string | null;
  received_at: string | null;
  notes: string | null;
  item_count: number;
  accepted_count: number;
  rejected_count: number;
};

export type TransferItem = {
  id: number;
  product_id: number;
  receive_status: "PENDING" | "ACCEPTED" | "REJECTED";
  reject_reason: string | null;
  product: Product;
};

export type TransferDetail = Transfer & { items: TransferItem[] };

// ---------------------------------------------------------------------------
// BDRS
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Transfusions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Dashboard & trace
// ---------------------------------------------------------------------------

export type DashboardSummary = {
  ready_units: number;
  hold_units: number;
  expiring_soon_units: number;
  low_stock_groups: { component_code: string; abo: ABO; rh: Rh; count: number }[];
  donors_today: number;
  donations_today: number;
  active_requests: number;
  transfusions_in_progress: number;
  reactions_30d: number;
  expiring_soon_days: number;
  low_stock_threshold: number;
  generated_at: string;
};

export type TrendPoint = { day: string; donations: number; transfusions: number };

export type Activity = {
  id: number;
  event_type: string;
  created_at: string;
  note: string | null;
  product_id: number;
  product_no: string;
  component_code: string;
  facility_name: string | null;
  actor: string | null;
};

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
