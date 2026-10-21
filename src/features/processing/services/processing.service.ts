// Pengolahan endpoints: split released WB bags into PRC/FFP/TC in one batch.

import { api } from "@/services/api-client";
import type { Batch, Product } from "@/types";

export type BatchInput = {
  notes: string | null;
  items: {
    source_product_id: number;
    outputs: { component_code: string; volume_ml: number | null }[];
  }[];
};

export const processingService = {
  queue: () => api.get<Product[]>("/processing/queue"),
  createBatch: (body: BatchInput) => api.post<Batch>("/processing/batches", body),
};
