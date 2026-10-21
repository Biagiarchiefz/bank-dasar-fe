// Distribusi endpoints: UTD -> BDRS shipments and per-bag receipt.

import { api, type Query } from "@/services/api-client";
import type { Transfer, TransferDetail } from "@/types";

export type TransferFilters = Query & { status?: string; page?: number; page_size?: number };

export type TransferInput = {
  to_facility_id: number;
  product_ids: number[];
  courier_name: string;
  packing_temp_c: number;
  notes: string | null;
};

export type ReceiveInput = {
  arrival_temp_c: number;
  items: { product_id: number; accepted: boolean; reject_reason: string | null }[];
};

export const transfersService = {
  list: (filters: TransferFilters) => api.list<Transfer>("/transfers", filters),
  get: (id: number) => api.get<TransferDetail>(`/transfers/${id}`),
  create: (body: TransferInput) => api.post<TransferDetail>("/transfers", body),
  receive: (id: number, body: ReceiveInput) => api.post<TransferDetail>(`/transfers/${id}/receive`, body),
};
