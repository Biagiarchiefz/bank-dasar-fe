"use client";

import { Droplet, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { sections } from "./content";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Droplet className="size-5" />
      </span>
      {process.env.NEXT_PUBLIC_APP_NAME ?? "SI UTD & BDRS"}
    </Link>
  );
}

/** Sticky landing navigation; gains a border once the page scrolls. */
export function SiteHeader({ cta }: { cta: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled ? "border-stone-200/70 bg-[#FDFBF7]/85 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Logo className="text-base" />
        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-primary/5 hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">{cta}</div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Buka menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 gap-0 p-6">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Logo className="mb-8 text-base" />
              <nav className="flex flex-col gap-1" aria-label="Navigasi utama">
                {sections.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-lg font-semibold tracking-tight hover:bg-primary/5"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8">{cta}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
