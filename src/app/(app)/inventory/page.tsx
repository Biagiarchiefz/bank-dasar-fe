import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { InventoryView } from "@/features/inventory";

export const metadata: Metadata = { title: "Stok Darah" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InventoryView />
    </Suspense>
  );
}
