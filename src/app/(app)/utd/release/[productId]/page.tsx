import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { ReleaseDecision } from "./release-decision";

export const metadata: Metadata = { title: "Keputusan Pelulusan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReleaseDecision />
    </Suspense>
  );
}
