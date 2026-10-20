import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { ProcessingBoard } from "./processing-board";

export const metadata: Metadata = { title: "Pengolahan Komponen" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProcessingBoard />
    </Suspense>
  );
}
