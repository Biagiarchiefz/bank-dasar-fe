import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageSkeleton } from "@/components/shared/loading";

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
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
