import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { StartWizard } from "./start-wizard";

export const metadata: Metadata = { title: "Mulai Transfusi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StartWizard />
    </Suspense>
  );
}
