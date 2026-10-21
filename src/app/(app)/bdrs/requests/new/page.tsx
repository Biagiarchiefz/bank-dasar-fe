import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { NewRequest } from "@/features/bdrs";

export const metadata: Metadata = { title: "Permintaan Baru" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewRequest />
    </Suspense>
  );
}
