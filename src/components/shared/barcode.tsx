"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

/** Code128 barcode rendered as SVG (prints sharply). */
export function Barcode({ value, height = 48, width = 1.6, showText = false }: {
  value: string;
  height?: number;
  width?: number;
  showText?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    JsBarcode(ref.current, value, {
      format: "CODE128",
      height,
      width,
      margin: 0,
      displayValue: showText,
      fontSize: 12,
      background: "transparent",
    });
  }, [value, height, width, showText]);
  return <svg ref={ref} aria-label={`Barcode ${value}`} role="img" />;
}
