import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { StartWizard } from "@/features/transfusions";

export const metadata: Metadata = { title: "Mulai Transfusi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StartWizard />
    </Suspense>
  );
}
