import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { DonorProfile } from "@/features/donors";

export const metadata: Metadata = { title: "Profil Pendonor" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DonorProfile />
    </Suspense>
  );
}
