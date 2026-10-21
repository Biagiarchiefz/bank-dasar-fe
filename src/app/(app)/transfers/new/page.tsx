import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { NewTransfer } from "@/features/transfers";

export const metadata: Metadata = { title: "Buat Kiriman" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewTransfer />
    </Suspense>
  );
}
