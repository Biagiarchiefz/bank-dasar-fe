import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { ProductDetailView } from "@/features/inventory";

export const metadata: Metadata = { title: "Detail Kantong" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductDetailView />
    </Suspense>
  );
}
