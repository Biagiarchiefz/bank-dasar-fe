"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageSkeleton } from "@/components/shared/loading";
import { landingFor } from "@/lib/nav";
import { useMe } from "@/lib/session";

export function HomeRedirect() {
  const router = useRouter();
  const { data: me } = useMe();
  useEffect(() => {
    if (me) router.replace(landingFor(me.role));
  }, [me, router]);
  return <PageSkeleton />;
}
