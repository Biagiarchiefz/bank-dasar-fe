"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { qk } from "@/lib/query-keys";
import { type ProductFilters, productsService } from "../services/products.service";

export function useProducts(filters: ProductFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: qk.products(filters),
    queryFn: () => productsService.list(filters),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
}

export function useProduct(id: number) {
  return useQuery({ queryKey: qk.product(id), queryFn: () => productsService.get(id) });
}

export function useProductEvents(id: number) {
  return useQuery({ queryKey: qk.productEvents(id), queryFn: () => productsService.events(id) });
}

/** Usable stock per component x blood group, refreshed every minute. */
export function useStockMatrix(facilityId?: number) {
  return useQuery({
    queryKey: qk.stockMatrix(facilityId),
    queryFn: () => productsService.stockMatrix(facilityId),
    refetchInterval: 60_000,
  });
}

export function useDiscardProduct(onSuccess: () => void) {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => productsService.discard(id, reason),
    success: (p) => `${p.product_no} dimusnahkan.`,
    invalidate: [qk.allProducts, qk.allStock, qk.allDashboard],
    onSuccess,
  });
}
