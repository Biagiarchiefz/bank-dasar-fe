import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { NewRequest } from "./new-request";

export const metadata: Metadata = { title: "Permintaan Baru" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewRequest />
    </Suspense>
  );
}
