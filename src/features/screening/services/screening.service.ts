// Seleksi endpoints: today's visits and the pre-donation screening decision.

import { api, type Query } from "@/services/api-client";
import type { Visit } from "@/types";

export type VisitFilters = Query & { date?: string; status?: string; page_size?: number };

export type ScreeningInput = {
  questionnaire: { code: string; answer: boolean }[];
  weight_kg: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  temperature_c: number;
  hb_g_dl: number;
  decision: "ELIGIBLE" | "DEFERRED";
  decision_note: string | null;
  deferral_type?: "TEMPORARY" | "PERMANENT";
  deferral_reason?: string;
  deferral_until?: string | null;
};

export const screeningService = {
  visits: (filters: VisitFilters) => api.list<Visit>("/visits", filters),
  visit: (id: number) => api.get<Visit>(`/visits/${id}`),
  submit: (visitId: number, body: ScreeningInput) => api.post<Visit>(`/visits/${visitId}/screening`, body),
};
