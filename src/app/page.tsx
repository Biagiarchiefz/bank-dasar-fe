import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { HomeRedirect } from "./home-redirect";

// "/" sends each user to the first page of their role.
export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <Suspense fallback={<PageSkeleton />}>
        <HomeRedirect />
      </Suspense>
    </main>
  );
}
