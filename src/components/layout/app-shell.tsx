"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Droplet, LogOut, Menu, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { EmptyState } from "@/components/shared/empty-state";
import { FacilitySwitcher } from "@/components/shared/facility-switcher";
import { PageSkeleton } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { apiPost } from "@/lib/api";
import { roleLabel } from "@/lib/format";
import { canAccess, landingFor, navFor } from "@/lib/nav";
import { SessionProvider, useMe } from "@/lib/session";
import type { Me } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { data: me, isLoading } = useMe();
  if (isLoading || !me) {
    return (
      <div className="p-8">
        <PageSkeleton />
      </div>
    );
  }
  return (
    <SessionProvider me={me}>
      <Shell me={me}>{children}</Shell>
    </SessionProvider>
  );
}

function Shell({ me, children }: { me: Me; children: ReactNode }) {
  const pathname = usePathname();
  const allowed = canAccess(me.role, pathname);
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-sidebar lg:block print:hidden">
        <Sidebar me={me} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header me={me} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-6 print:max-w-none print:p-0">
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

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 px-5 py-4">
      <span className="rounded-lg bg-primary p-1.5 text-primary-foreground">
        <Droplet className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold">{process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS"}</span>
        <span className="block text-[11px] text-muted-foreground">RS Demo · Prototipe</span>
      </span>
    </Link>
  );
}

function Sidebar({ me, onNavigate }: { me: Me; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {navFor(me.role).map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border-l-2 px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-transparent text-foreground/80 hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <p className="border-t px-5 py-3 text-[11px] text-muted-foreground">Data contoh untuk demo tender.</p>
    </div>
  );
}

function Header({ me }: { me: Me }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const canTrace = canAccess(me.role, "/trace");

  async function logout() {
    await apiPost("/api/v1/auth/logout").catch(() => undefined);
    qc.clear();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur print:hidden">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Sidebar me={me} onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {canTrace && (
        <BarcodeInput
          className="w-full max-w-md"
          autoFocus={false}
          placeholder="Lacak kantong… (pindai / ketik nomor)"
          buttonLabel="Lacak"
          onScan={(v) => router.push(`/trace?q=${encodeURIComponent(v)}`)}
        />
      )}

      <div className="ml-auto flex items-center gap-3">
        <FacilitySwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-2 px-2 py-1">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {me.full_name.charAt(0)}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-medium">{me.full_name}</span>
                <span className="block text-xs text-muted-foreground">{roleLabel[me.role]}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block">{me.full_name}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {roleLabel[me.role]}
                {me.facility_name ? ` · ${me.facility_name}` : ""}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
