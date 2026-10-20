import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { CollectionWorklist } from "./collection-worklist";

export const metadata: Metadata = { title: "Pengambilan Darah" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CollectionWorklist />
    </Suspense>
  );
}
