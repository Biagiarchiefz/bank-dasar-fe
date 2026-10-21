import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { RequestDetailView } from "@/features/bdrs";

export const metadata: Metadata = { title: "Detail Permintaan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequestDetailView />
    </Suspense>
  );
}
