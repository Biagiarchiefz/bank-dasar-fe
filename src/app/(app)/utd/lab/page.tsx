import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { LabWorklist } from "./lab-worklist";

export const metadata: Metadata = { title: "Laboratorium" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LabWorklist />
    </Suspense>
  );
}
