import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { SessionGate } from "@/features/auth";

// Authenticated area: sidebar + header around every page.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <PageSkeleton />
        </div>
      }
    >
      <SessionGate>{children}</SessionGate>
    </Suspense>
  );
}
