import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("gap-0 py-4", href && "transition-colors hover:border-primary/40")}>
      <CardContent className="flex items-start justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{value ?? "—"}</p>
          )}
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("rounded-lg p-2", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
