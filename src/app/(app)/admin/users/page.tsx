import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { UserList } from "@/features/users";

export const metadata: Metadata = { title: "Pengguna" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UserList />
    </Suspense>
  );
}
