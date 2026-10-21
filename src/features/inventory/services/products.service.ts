// Produk & Stok endpoints: blood bags, their event history and the stock matrix.

import { api, type Query } from "@/services/api-client";
import type { InventoryStatus, Product, ProductDetail, ProductEvent, QualityStatus, StockMatrix } from "@/types";

export type ProductFilters = Query & {
  q?: string;
  facility_id?: number;
  component?: string;
  abo?: string;
  rh?: string;
  quality_status?: QualityStatus;
  inventory_status?: InventoryStatus;
  usable?: boolean;
  expiring_days?: number;
  page?: number;
  page_size?: number;
};

export const productsService = {
  list: (filters: ProductFilters) => api.list<Product>("/products", filters),
  get: (id: number) => api.get<ProductDetail>(`/products/${id}`),
  /** Lookup by the printed/scanned bag number. */
  byNumber: (productNo: string) => api.get<Product>(`/products/by-number/${encodeURIComponent(productNo)}`),
  events: (id: number) => api.get<ProductEvent[]>(`/products/${id}/events`),
  discard: (id: number, reason: string) => api.post<Product>(`/products/${id}/discard`, { reason }),
  stockMatrix: (facilityId?: number) => api.get<StockMatrix>("/stock/matrix", { facility_id: facilityId }),
};
