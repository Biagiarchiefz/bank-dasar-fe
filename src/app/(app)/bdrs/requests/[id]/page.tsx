import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { RequestDetailView } from "./request-detail";

export const metadata: Metadata = { title: "Detail Permintaan" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequestDetailView />
    </Suspense>
  );
}
