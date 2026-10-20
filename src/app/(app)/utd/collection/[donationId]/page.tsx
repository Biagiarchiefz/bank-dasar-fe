import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { DonationView } from "./donation-view";

export const metadata: Metadata = { title: "Donasi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DonationView />
    </Suspense>
  );
}
