import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { IssueReceipt } from "./issue-receipt";

export const metadata: Metadata = { title: "Bukti Serah Terima" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IssueReceipt />
    </Suspense>
  );
}
