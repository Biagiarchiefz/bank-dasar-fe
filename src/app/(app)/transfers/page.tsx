import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { TransferList } from "./transfer-list";

export const metadata: Metadata = { title: "Distribusi" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransferList />
    </Suspense>
  );
}
