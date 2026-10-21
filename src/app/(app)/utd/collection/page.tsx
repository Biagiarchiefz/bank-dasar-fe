import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { CollectionWorklist } from "@/features/collection";

export const metadata: Metadata = { title: "Pengambilan Darah" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CollectionWorklist />
    </Suspense>
  );
}
