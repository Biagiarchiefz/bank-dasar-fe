"use client";

// Input for USB barcode scanners, which behave like a keyboard: they type the
// code and press Enter. Enter submits; the field clears for the next scan.

import { ScanLine } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function BarcodeInput({
  onScan,
  placeholder = "Pindai atau ketik nomor kantong…",
  autoFocus = true,
  keepValue = false,
  size = "default",
  disabled,
  buttonLabel = "Cari",
  className,
}: {
  onScan: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  keepValue?: boolean;
  size?: "default" | "lg";
  disabled?: boolean;
  buttonLabel?: string;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  function submit() {
    const v = value.trim().toUpperCase();
    if (!v) return;
    onScan(v);
    if (!keepValue) setValue("");
    ref.current?.focus();
  }

  return (
    <form
      className={cn("flex gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="relative flex-1">
        <ScanLine
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "lg" ? "size-5" : "size-4",
          )}
        />
        <Input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={cn("font-mono uppercase", size === "lg" ? "h-12 pl-10 text-lg" : "pl-9")}
        />
      </div>
      <Button type="submit" disabled={disabled || !value.trim()} size={size === "lg" ? "lg" : "default"} className={size === "lg" ? "h-12" : undefined}>
        {buttonLabel}
      </Button>
    </form>
  );
}
