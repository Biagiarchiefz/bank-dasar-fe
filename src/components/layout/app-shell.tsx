"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { canAccess, landingFor } from "@/config/navigation";
import { roleLabel } from "@/lib/format";
import type { Me } from "@/types";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";

/**
 * Authenticated chrome: sidebar, header and the page, or an access notice when
 * the role may not open this path. Session loading lives in features/auth.
 */
export function AppShell({ me, onLogout, children }: { me: Me; onLogout: () => void; children: ReactNode }) {
  const pathname = usePathname();
  const allowed = canAccess(me.role, pathname);
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r bg-sidebar lg:block print:hidden">
        <Sidebar me={me} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader me={me} onLogout={onLogout} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-8 md:py-10 lg:px-10 print:max-w-none print:p-0">
          {allowed ? (
            children
          ) : (
            <EmptyState
              icon={ShieldAlert}
              title="Anda tidak memiliki akses ke halaman ini"
              description={`Peran ${roleLabel[me.role]} tidak dapat membuka menu ini.`}
              action={
                <Button asChild>
                  <Link href={landingFor(me.role)}>Kembali ke halaman utama</Link>
                </Button>
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
