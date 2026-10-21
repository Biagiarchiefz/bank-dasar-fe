"use client";

import { KeyRound, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BarcodeInput } from "@/components/forms/barcode-input";
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
import { canAccess } from "@/config/navigation";
import { routes } from "@/config/site";
import { roleLabel } from "@/lib/format";
import type { Me } from "@/types";
import { FacilitySwitcher } from "./facility-switcher";
import { Sidebar } from "./sidebar";

/** Top bar: mobile menu, bag search, facility switcher and account menu. */
export function AppHeader({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const canTrace = canAccess(me.role, "/trace");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:h-20 md:px-8 lg:px-10 print:hidden">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
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
            <Button variant="ghost" className="h-auto gap-2.5 py-1 pr-3 pl-1 hover:bg-slate-100">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {me.full_name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block text-sm font-semibold">{me.full_name}</span>
                <span className="block text-xs font-normal text-muted-foreground">{roleLabel[me.role]}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <span className="block">{me.full_name}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {roleLabel[me.role]}
                {me.facility_name ? ` · ${me.facility_name}` : ""}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`${routes.changePassword}?next=${encodeURIComponent(pathname)}`}>
                <KeyRound />
                Ganti password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
