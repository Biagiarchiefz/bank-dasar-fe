import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { IssueReceipt } from "@/features/bdrs";

export const metadata: Metadata = { title: "Bukti Serah Terima" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IssueReceipt />
    </Suspense>
  );
}
