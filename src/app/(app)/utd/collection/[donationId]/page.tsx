import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { DonationView } from "@/features/collection";

export const metadata: Metadata = { title: "Donasi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DonationView />
    </Suspense>
  );
}
