"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { landingFor } from "@/config/navigation";
import { useMe } from "../hooks/use-auth";

export function HomeRedirect() {
  const router = useRouter();
  const { data: me } = useMe();
  useEffect(() => {
    if (me) router.replace(landingFor(me.role));
  }, [me, router]);
  return <PageSkeleton />;
}
