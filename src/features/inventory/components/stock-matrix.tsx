"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { componentLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStockMatrix } from "../hooks/use-products";

/**
 * Usable stock per component x blood group. Cells below the low-stock
 * threshold are red (PROTOTYPE_PLAN §10.3). Counts come from the API only.
 */
export function StockMatrix({
  facilityId,
  onCellClick,
}: {
  facilityId?: number;
  onCellClick?: (component: string, abo: string, rh: string) => void;
}) {
  const { data, isLoading } = useStockMatrix(facilityId);

  if (isLoading || !data) return <Skeleton className="h-40 w-full" />;

  const count = (comp: string, group: string) => {
    const [abo, rh] = group.split("|");
    return data.cells.find((c) => c.component_code === comp && c.abo === abo && c.rh === rh)?.count ?? 0;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-1.5 text-center">
        <thead>
          <tr>
            <th className="w-40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Komponen</th>
            {data.blood_groups.map((g) => {
              const [abo, rh] = g.split("|");
              return (
                <th key={g} className="text-sm font-extrabold text-red-800">
                  {abo}
                  {rh === "POS" ? "+" : "−"}
                </th>
              );
            })}
            <th className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.components.map((comp) => {
            const total = data.blood_groups.reduce((s, g) => s + count(comp, g), 0);
            return (
              <tr key={comp}>
                <td className="text-left">
                  <p className="font-semibold">{comp}</p>
                  <p className="text-[11px] text-muted-foreground">{componentLabel[comp]}</p>
                </td>
                {data.blood_groups.map((g) => {
                  const n = count(comp, g);
                  const low = n < data.low_stock_threshold;
                  const [abo, rh] = g.split("|");
                  return (
                    <td key={g}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={onCellClick ? () => onCellClick(comp, abo, rh) : undefined}
                            className={cn(
                              "h-12 w-full rounded-xl text-lg font-bold tabular-nums transition-colors",
                              n === 0
                                ? "bg-red-100 text-red-800 ring-1 ring-red-300"
                                : low
                                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                                  : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
                              onCellClick ? "cursor-pointer hover:brightness-95" : "cursor-default",
                            )}
                          >
                            {n}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {comp} {abo}
                          {rh === "POS" ? "+" : "−"}: {n} kantong siap pakai
                          {low ? ` (di bawah batas ${data.low_stock_threshold})` : ""}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
                <td className="text-lg font-bold tabular-nums">{total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        Siap pakai = lulus + di stok + belum kedaluwarsa. Merah = di bawah batas stok minimum ({data.low_stock_threshold}).
      </p>
    </div>
  );
}
