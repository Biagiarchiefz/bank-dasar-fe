import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { TransferList } from "@/features/transfers";

export const metadata: Metadata = { title: "Distribusi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransferList />
    </Suspense>
  );
}
