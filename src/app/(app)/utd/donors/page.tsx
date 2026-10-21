import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { DonorList } from "@/features/donors";

export const metadata: Metadata = { title: "Pendonor" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DonorList />
    </Suspense>
  );
}
