import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { TransfusionRun } from "./transfusion-run";

export const metadata: Metadata = { title: "Transfusi Berjalan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransfusionRun />
    </Suspense>
  );
}
