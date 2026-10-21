// Dashboard endpoints: aggregated indicators. facility_id is honoured only for
// ADMIN/PIMPINAN; other roles always get their own facility.

import { api } from "@/services/api-client";
import type { Activity, DashboardSummary, Product, TrendPoint } from "@/types";

export const dashboardService = {
  summary: (facilityId?: number) => api.get<DashboardSummary>("/dashboard/summary", { facility_id: facilityId }),
  trend: (days: number) => api.get<TrendPoint[]>("/dashboard/trend", { days }),
  expiring: (facilityId?: number) => api.get<Product[]>("/dashboard/expiring", { facility_id: facilityId }),
  activity: (facilityId?: number, limit = 12) =>
    api.get<Activity[]>("/dashboard/activity", { facility_id: facilityId, limit }),
};
