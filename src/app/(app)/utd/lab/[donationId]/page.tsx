import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { LabResultForm } from "@/features/lab";

export const metadata: Metadata = { title: "Hasil Laboratorium" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LabResultForm />
    </Suspense>
  );
}
