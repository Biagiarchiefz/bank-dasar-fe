import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { TransfusionRun } from "@/features/transfusions";

export const metadata: Metadata = { title: "Transfusi Berjalan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransfusionRun />
    </Suspense>
  );
}
