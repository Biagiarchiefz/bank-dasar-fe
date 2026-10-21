import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { TransferView } from "@/features/transfers";

export const metadata: Metadata = { title: "Kiriman" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransferView />
    </Suspense>
  );
}
