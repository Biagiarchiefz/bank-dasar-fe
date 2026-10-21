"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { dashboardService } from "../services/dashboard.service";

// Every dashboard panel refreshes once a minute.
const refetchInterval = 60_000;

export function useDashboardSummary(facilityId?: number) {
  return useQuery({
    queryKey: qk.dashboard("summary", facilityId),
    queryFn: () => dashboardService.summary(facilityId),
    refetchInterval,
  });
}

/** Donations vs transfusions over the last `days` days. */
export function useDashboardTrend(days = 14) {
  return useQuery({ queryKey: qk.dashboard("trend"), queryFn: () => dashboardService.trend(days), refetchInterval });
}

export function useExpiringProducts(facilityId?: number) {
  return useQuery({
    queryKey: qk.dashboard("expiring", facilityId),
    queryFn: () => dashboardService.expiring(facilityId),
    refetchInterval,
  });
}

export function useRecentActivity(facilityId?: number) {
  return useQuery({
    queryKey: qk.dashboard("activity", facilityId),
    queryFn: () => dashboardService.activity(facilityId),
    refetchInterval,
  });
}
