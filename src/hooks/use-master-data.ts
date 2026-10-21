"use client";

// Master data rarely changes, so it is cached for the whole session.

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { masterService } from "@/services/master.service";

export function useFacilities() {
  return useQuery({ queryKey: qk.facilities, queryFn: masterService.facilities, staleTime: Infinity });
}

export function useScreeningConfig() {
  return useQuery({ queryKey: qk.screeningConfig, queryFn: masterService.screeningConfig, staleTime: Infinity });
}
