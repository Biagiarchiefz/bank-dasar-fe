import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { ReleaseWorklist } from "./release-worklist";

export const metadata: Metadata = { title: "Pelulusan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReleaseWorklist />
    </Suspense>
  );
}
