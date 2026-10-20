import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { TransfusionWorklistView } from "./transfusion-worklist";

export const metadata: Metadata = { title: "Transfusi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransfusionWorklistView />
    </Suspense>
  );
}
