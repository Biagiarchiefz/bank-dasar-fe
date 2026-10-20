import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { RequestList } from "./request-list";

export const metadata: Metadata = { title: "Permintaan Darah" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequestList />
    </Suspense>
  );
}
