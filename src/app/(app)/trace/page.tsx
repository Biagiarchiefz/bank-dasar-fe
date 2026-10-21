import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { TraceView } from "@/features/trace";

export const metadata: Metadata = { title: "Lacak Kantong" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TraceView />
    </Suspense>
  );
}
