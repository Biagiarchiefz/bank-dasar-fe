import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { ScreeningWorklist } from "@/features/screening";

export const metadata: Metadata = { title: "Seleksi Donor" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ScreeningWorklist />
    </Suspense>
  );
}
