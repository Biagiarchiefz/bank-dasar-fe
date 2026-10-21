import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { DashboardView } from "@/features/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardView />
    </Suspense>
  );
}
