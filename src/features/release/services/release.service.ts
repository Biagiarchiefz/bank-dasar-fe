// Pelulusan endpoints: checklist and release/reject of quarantined (HOLD) bags.

import { api } from "@/services/api-client";
import type { BulkReleaseResult, Product, ReleaseChecklist, ReleaseWorklistItem } from "@/types";

/** Checks the officer confirms by hand (the rest are verified by the API). */
export type ManualChecks = Record<string, boolean>;

export type ReleaseDecisionInput = {
  decision: "RELEASED" | "REJECTED";
  manual_checks: ManualChecks;
  reason: string | null;
};

export type BulkReleaseInput = { product_ids: number[]; manual_checks: ManualChecks };

export const releaseService = {
  worklist: () => api.get<ReleaseWorklistItem[]>("/release/worklist"),
  bulk: (body: BulkReleaseInput) => api.post<BulkReleaseResult[]>("/release/bulk", body),
  checklist: (productId: number) => api.get<ReleaseChecklist>(`/products/${productId}/release-checklist`),
  decide: (productId: number, body: ReleaseDecisionInput) =>
    api.post<Product>(`/products/${productId}/release-decision`, body),
};
