import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { ProductDetailView } from "./product-detail";

export const metadata: Metadata = { title: "Detail Kantong" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductDetailView />
    </Suspense>
  );
}
