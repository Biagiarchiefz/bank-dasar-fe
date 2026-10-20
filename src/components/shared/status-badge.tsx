import { cn } from "@/lib/utils";
import { expiredStatus, inventoryStatus, qualityStatus, type Tone } from "@/lib/format";

const toneClass: Record<Tone, string> = {
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  red: "bg-red-100 text-red-800 border-red-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  purple: "bg-violet-100 text-violet-800 border-violet-200",
  blue: "bg-sky-100 text-sky-800 border-sky-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  darkgray: "bg-zinc-700 text-zinc-50 border-zinc-700",
  gray: "bg-zinc-100 text-zinc-600 border-zinc-200",
  redOutline: "bg-white text-red-700 border-red-400",
};

type StatusMap = Record<string, { label: string; tone: Tone }>;

/** A status pill with an Indonesian label and a consistent color. */
export function StatusBadge({ map, value, className }: { map: StatusMap; value: string; className?: string }) {
  const def = map[value] ?? { label: value, tone: "gray" as Tone };
  return <Pill tone={def.tone} label={def.label} className={className} />;
}

export function Pill({ tone, label, className }: { tone: Tone; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        toneClass[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

/**
 * Both product statuses side by side, plus a computed "Kedaluwarsa" badge.
 * Quality (mutu) and inventory (posisi) are separate on purpose.
 */
export function ProductStatus({
  quality,
  inventory,
  expired,
}: {
  quality: string;
  inventory: string;
  expired?: boolean;
}) {
  const showExpired = expired && (inventory === "IN_STOCK" || inventory === "RESERVED" || inventory === "IN_TRANSIT");
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <StatusBadge map={qualityStatus} value={quality} />
      <StatusBadge map={inventoryStatus} value={inventory} />
      {showExpired && <Pill tone={expiredStatus.tone} label={expiredStatus.label} />}
    </span>
  );
}
