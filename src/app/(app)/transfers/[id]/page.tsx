import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { TransferView } from "./transfer-view";

export const metadata: Metadata = { title: "Kiriman" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransferView />
    </Suspense>
  );
}
