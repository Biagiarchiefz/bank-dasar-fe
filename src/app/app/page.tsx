import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { HomeRedirect } from "@/features/auth";

export const metadata: Metadata = { title: "Membuka aplikasi" };

// "/app" sends each signed-in user to the first page of their role.
export default function AppHome() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <Suspense fallback={<PageSkeleton />}>
        <HomeRedirect />
      </Suspense>
    </main>
  );
}
