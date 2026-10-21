import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { ScreeningForm } from "@/features/screening";

export const metadata: Metadata = { title: "Form Skrining" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ScreeningForm />
    </Suspense>
  );
}
