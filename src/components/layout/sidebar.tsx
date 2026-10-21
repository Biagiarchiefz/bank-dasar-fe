"use client";

import { Droplet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { landingFor, navFor } from "@/config/navigation";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Me } from "@/types";

function Brand({ me }: { me: Me }) {
  return (
    <Link href={landingFor(me.role)} className="flex items-center gap-3 px-6 py-6">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <Droplet className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight">{site.name}</span>
        <span className="block text-xs text-muted-foreground">{site.owner} · Prototipe</span>
      </span>
    </Link>
  );
}

/** Role menu (desktop aside and mobile sheet). */
export function Sidebar({ me, onNavigate }: { me: Me; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <Brand me={me} />
      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-2">
        {navFor(me.role).map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/25"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
      <p className="m-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-muted-foreground">Data contoh untuk demo tender.</p>
    </div>
  );
}
