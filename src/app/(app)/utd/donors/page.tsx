import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { DonorList } from "./donor-list";

export const metadata: Metadata = { title: "Pendonor" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DonorList />
    </Suspense>
  );
}
