// UTD → BDRS distribution.

import type { Product } from "./product.types";

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
