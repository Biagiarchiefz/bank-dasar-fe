// Pengambilan Darah endpoints. Completing a donation creates a WB bag on HOLD.

import { api, type Query } from "@/services/api-client";
import type { Donation, Visit } from "@/types";

export type DonationFilters = Query & { status?: string; date?: string; page_size?: number };

export const collectionService = {
  /** Visits that passed screening and wait for collection. */
  eligibleVisits: () => api.list<Visit>("/visits", { status: "ELIGIBLE", page_size: 100 }),
  donations: (filters: DonationFilters) => api.list<Donation>("/donations", filters),
  donation: (id: number) => api.get<Donation>(`/donations/${id}`),
  start: (visitId: number, bagType: string) => api.post<Donation>(`/visits/${visitId}/donations`, { bag_type: bagType }),
  complete: (id: number, volumeMl: number) => api.post<Donation>(`/donations/${id}/complete`, { volume_ml: volumeMl }),
  fail: (id: number, reason: string) => api.post<Donation>(`/donations/${id}/fail`, { reason }),
};
