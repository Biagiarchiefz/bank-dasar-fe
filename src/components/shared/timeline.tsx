import { eventLabel, fmtDateTime, inventoryStatus, qualityStatus } from "@/lib/format";
import type { ProductEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

const eventDot: Record<string, string> = {
  REJECTED: "bg-red-600",
  DISCARDED: "bg-zinc-500",
  TRANSFER_REJECTED: "bg-red-600",
  REACTION_REPORTED: "bg-red-600",
  RELEASED: "bg-emerald-600",
  TRANSFUSED: "bg-zinc-800",
};

/** Vertical timeline of product events, oldest first. */
export function Timeline({ events, compact }: { events: ProductEvent[]; compact?: boolean }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span
            className={cn(
              "absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-background",
              eventDot[e.event_type] ?? "bg-primary",
            )}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-semibold">{eventLabel[e.event_type] ?? e.event_type}</p>
            <time className="text-xs tabular-nums text-muted-foreground">{fmtDateTime(e.created_at)}</time>
          </div>
          {!compact && (e.to_quality_status || e.to_inventory_status) && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {e.to_quality_status && <StatusBadge map={qualityStatus} value={e.to_quality_status} />}
              {e.to_inventory_status && <StatusBadge map={inventoryStatus} value={e.to_inventory_status} />}
            </div>
          )}
          {e.note && <p className="mt-0.5 text-sm text-muted-foreground">{e.note}</p>}
          <p className="text-xs text-muted-foreground">
            {[e.actor, e.facility_name].filter(Boolean).join(" · ")}
          </p>
        </li>
      ))}
    </ol>
  );
}
