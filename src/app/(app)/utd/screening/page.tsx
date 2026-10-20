import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { ScreeningWorklist } from "./screening-worklist";

export const metadata: Metadata = { title: "Seleksi Donor" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ScreeningWorklist />
    </Suspense>
  );
}
