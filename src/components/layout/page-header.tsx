import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Page title with optional description, back link and actions. */
export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1 rounded-full bg-background py-1 pr-3 pl-2 text-sm font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-slate-300"
          >
            <ChevronLeft className="size-4" />
            {back.label}
          </Link>
        )}
        <h1 className="truncate text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] md:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-base text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
