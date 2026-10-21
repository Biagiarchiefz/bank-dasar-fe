import { Barcode } from "@/components/data-display/barcode";
import { BloodGroupChip } from "@/components/data-display/blood-group-chip";
import { componentLabel, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ABO, Rh } from "@/types";

/**
 * Bag label: Code128 barcode, component, large blood group, expiry and
 * facility. Elements with class `print-area` are the only thing printed
 * (see globals.css @media print).
 */
export function ProductLabel({
  productNo,
  componentCode,
  abo,
  rh,
  expiresAt,
  collectedAt,
  facility,
  volumeML,
  className,
}: {
  productNo: string;
  componentCode: string;
  abo: ABO | null;
  rh: Rh | null;
  expiresAt: string | null;
  collectedAt?: string | null;
  facility: string;
  volumeML?: number | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "print-area w-full max-w-[380px] break-inside-avoid rounded-lg border-2 border-zinc-900 bg-white p-4 text-zinc-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{facility}</p>
          <p className="text-lg font-extrabold leading-tight">{componentCode}</p>
          <p className="text-xs text-zinc-600">{componentLabel[componentCode] ?? componentCode}</p>
        </div>
        <BloodGroupChip abo={abo} rh={rh} size="lg" className="border-zinc-900 bg-white text-zinc-900" />
      </div>
      <div className="my-3 overflow-hidden">
        <Barcode value={productNo} height={44} />
      </div>
      <p className="font-mono text-sm font-bold tracking-wider">{productNo}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
        {collectedAt && (
          <>
            <span className="text-zinc-500">Diambil</span>
            <span className="text-right">{fmtDateTime(collectedAt)}</span>
          </>
        )}
        <span className="text-zinc-500">Kedaluwarsa</span>
        <span className="text-right font-semibold">{fmtDateTime(expiresAt)}</span>
        {volumeML ? (
          <>
            <span className="text-zinc-500">Volume</span>
            <span className="text-right">{volumeML} mL</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
