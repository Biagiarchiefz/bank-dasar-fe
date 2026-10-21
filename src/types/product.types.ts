// Blood bags (products), stock, processing and release.

import type { ABO, InventoryStatus, QualityStatus, Rh } from "./common.types";

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
