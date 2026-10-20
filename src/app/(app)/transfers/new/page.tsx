import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { NewTransfer } from "./new-transfer";

export const metadata: Metadata = { title: "Buat Kiriman" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewTransfer />
    </Suspense>
  );
}
