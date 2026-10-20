import { bloodGroup } from "@/lib/format";
import type { ABO, Rh } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Bold blood group such as "A+" or "O−"; "Belum diketahui" when unknown. */
export function BloodGroupChip({
  abo,
  rh,
  size = "md",
  className,
}: {
  abo: ABO | null | undefined;
  rh: Rh | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const text = bloodGroup(abo, rh);
  if (!text) {
    return <span className={cn("text-xs italic text-muted-foreground", className)}>Belum diketahui</span>;
  }
  const sizes = {
    sm: "min-w-8 px-1.5 py-0.5 text-xs",
    md: "min-w-10 px-2 py-0.5 text-sm",
    lg: "min-w-14 px-3 py-1 text-xl",
    xl: "min-w-20 px-4 py-2 text-4xl",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 font-extrabold tracking-tight text-red-800",
        rh === "NEG" && "border-red-300 bg-white",
        sizes[size],
        className,
      )}
      title={`Golongan darah ${text}`}
    >
      {text}
    </span>
  );
}
