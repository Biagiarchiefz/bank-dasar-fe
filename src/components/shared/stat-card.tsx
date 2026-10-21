import { ArrowUpRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** KPI card for the dashboard. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  href,
  loading,
}: {
  label: string;
  value: number | string | undefined;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "success";
  href?: string;
  loading?: boolean;
}) {
  const tones = {
    default: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    success: "bg-emerald-100 text-emerald-700",
  };
  const body = (
    <div
      className={cn(
        "group flex h-full flex-col gap-5 rounded-3xl border border-border/80 bg-card p-6 shadow-soft transition-all",
        href && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex size-10 items-center justify-center rounded-full", tones[tone])}>
          <Icon className="size-5" />
        </span>
        {href && (
          <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </div>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-extrabold tracking-[-0.03em] tabular-nums">{value ?? "—"}</p>
        )}
        <p className="mt-1 text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="rounded-3xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}
