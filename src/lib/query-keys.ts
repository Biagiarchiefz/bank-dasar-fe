// TanStack Query keys in one place, so invalidation after a mutation always
// hits the right caches (PROTOTYPE_PLAN §10.5).

export const qk = {
  me: ["me"] as const,
  facilities: ["master", "facilities"] as const,
  locations: (facilityId?: number) => ["master", "locations", facilityId ?? "all"] as const,
  screeningConfig: ["config", "screening"] as const,

  donors: (filters: object) => ["donors", filters] as const,
  donor: (id: number) => ["donors", id] as const,
  donorHistory: (id: number) => ["donors", id, "history"] as const,
  visits: (filters: object) => ["visits", filters] as const,
  visit: (id: number) => ["visits", id] as const,

  donations: (filters: object) => ["donations", filters] as const,
  donation: (id: number) => ["donations", id] as const,
  labWorklist: (filters: object) => ["lab", "worklist", filters] as const,
  labResult: (donationId: number) => ["lab", "result", donationId] as const,

  processingQueue: ["processing", "queue"] as const,
  releaseWorklist: ["release", "worklist"] as const,
  releaseChecklist: (productId: number) => ["release", "checklist", productId] as const,

  products: (filters: object) => ["products", filters] as const,
  product: (id: number) => ["products", id] as const,
  productEvents: (id: number) => ["products", id, "events"] as const,
  stockMatrix: (facilityId?: number | null) => ["stock", "matrix", facilityId ?? "all"] as const,

  transfers: (filters: object) => ["transfers", filters] as const,
  transfer: (id: number) => ["transfers", id] as const,

  patients: (q: string) => ["patients", q] as const,
  requests: (filters: object) => ["requests", filters] as const,
  request: (id: number) => ["requests", id] as const,
  candidates: (itemId: number) => ["requests", "candidates", itemId] as const,
  issue: (id: number) => ["issues", id] as const,

  transfusionWorklist: ["transfusions", "worklist"] as const,
  transfusion: (id: number) => ["transfusions", id] as const,
  issueItem: (id: number) => ["transfusions", "issue-item", id] as const,

  dashboard: (part: string, facilityId?: number | null) => ["dashboard", part, facilityId ?? "all"] as const,
  trace: (q: string) => ["trace", q] as const,
};
