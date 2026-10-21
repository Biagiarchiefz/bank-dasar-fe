"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageSkeleton } from "@/components/feedback/loading";
import { AppShell } from "@/components/layout/app-shell";
import { routes } from "@/config/site";
import { SessionProvider } from "@/store/session";
import { useLogout, useMe } from "../hooks/use-auth";

/**
 * Loads the signed-in user, then renders the app shell inside the session
 * context. A temporary password must be replaced before any page is usable.
 */
export function SessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const { data: me, isLoading } = useMe();
  const mustChange = me?.must_change_password ?? false;

  useEffect(() => {
    if (mustChange) router.replace(`${routes.changePassword}?next=${encodeURIComponent(pathname)}`);
  }, [mustChange, pathname, router]);

  if (isLoading || !me || mustChange) {
    return (
      <div className="p-8">
        <PageSkeleton />
      </div>
    );
  }
  return (
    <SessionProvider me={me}>
      <AppShell me={me} onLogout={logout}>
        {children}
      </AppShell>
    </SessionProvider>
  );
}
