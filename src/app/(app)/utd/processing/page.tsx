import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { ProcessingBoard } from "@/features/processing";

export const metadata: Metadata = { title: "Pengolahan Komponen" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProcessingBoard />
    </Suspense>
  );
}
