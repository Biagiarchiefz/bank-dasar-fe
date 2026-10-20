import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { DonorProfile } from "./donor-profile";

export const metadata: Metadata = { title: "Profil Pendonor" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DonorProfile />
    </Suspense>
  );
}
