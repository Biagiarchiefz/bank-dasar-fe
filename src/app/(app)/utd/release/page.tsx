import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { ReleaseWorklist } from "@/features/release";

export const metadata: Metadata = { title: "Pelulusan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReleaseWorklist />
    </Suspense>
  );
}
