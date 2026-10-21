import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { LabWorklist } from "@/features/lab";

export const metadata: Metadata = { title: "Laboratorium" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LabWorklist />
    </Suspense>
  );
}
