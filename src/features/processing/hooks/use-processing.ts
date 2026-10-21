"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import type { Batch } from "@/types";
import { processingService } from "../services/processing.service";

export function useProcessingQueue() {
  return useQuery({ queryKey: qk.processingQueue, queryFn: processingService.queue });
}

export function useCreateBatch(onSuccess: (b: Batch) => void) {
  return useApiMutation({
    mutationFn: processingService.createBatch,
    success: (b) => `Batch ${b.batch_no}: ${b.outputs.length} kantong komponen dibuat (karantina).`,
    invalidate: [qk.processingQueue, qk.allRelease, qk.allProducts],
    onSuccess,
  });
}
