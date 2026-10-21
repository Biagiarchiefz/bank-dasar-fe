"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";
import { traceService } from "../services/trace.service";

/** Runs only once something was scanned or typed. */
export function useTrace(q: string) {
  return useQuery({ queryKey: qk.trace(q), queryFn: () => traceService.trace(q), enabled: q !== "" });
}
