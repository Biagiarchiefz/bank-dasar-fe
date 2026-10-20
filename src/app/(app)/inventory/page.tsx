import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { InventoryView } from "./inventory-view";

export const metadata: Metadata = { title: "Stok Darah" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InventoryView />
    </Suspense>
  );
}
