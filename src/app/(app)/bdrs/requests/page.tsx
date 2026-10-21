import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { RequestList } from "@/features/bdrs";

export const metadata: Metadata = { title: "Permintaan Darah" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequestList />
    </Suspense>
  );
}
