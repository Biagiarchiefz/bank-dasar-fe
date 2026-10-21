import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { ReleaseDecision } from "@/features/release";

export const metadata: Metadata = { title: "Keputusan Pelulusan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReleaseDecision />
    </Suspense>
  );
}
