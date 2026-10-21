// Pendonor endpoints: donor registry and the visits opened from a profile.

import { api, type Query } from "@/services/api-client";
import type { Donor, DonorDetail, DonorHistory, Visit } from "@/types";

export type DonorInput = {
  full_name: string;
  nik: string | null;
  gender: "M" | "F";
  birth_date: string;
  phone: string | null;
  address: string | null;
};

export type DonorFilters = Query & { q?: string; abo?: string; rh?: string; page?: number; page_size?: number };

export const donorsService = {
  list: (filters: DonorFilters) => api.list<Donor>("/donors", filters),
  get: (id: number) => api.get<DonorDetail>(`/donors/${id}`),
  history: (id: number) => api.get<DonorHistory>(`/donors/${id}/history`),
  create: (body: DonorInput) => api.post<DonorDetail>("/donors", body),
  update: (id: number, body: DonorInput) => api.put<DonorDetail>(`/donors/${id}`, body),
  /** Opens a donation visit; screening continues on the visit. */
  registerVisit: (id: number) => api.post<Visit>(`/donors/${id}/visits`),
};
