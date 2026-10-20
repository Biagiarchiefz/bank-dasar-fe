import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { TraceView } from "./trace-view";

export const metadata: Metadata = { title: "Lacak Kantong" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TraceView />
    </Suspense>
  );
}
