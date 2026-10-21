"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/types";

// Two categorical series (validated palette: slot 1 blue, slot 2 orange).
const SERIES = [
  { key: "donations", label: "Donasi", color: "#2a78d6" },
  { key: "transfusions", label: "Transfusi", color: "#eb6834" },
] as const;

function dayLabel(ymd: string) {
  const [, m, d] = ymd.split("-").map(Number);
  return `${d}/${m}`;
}

/** Donations vs transfusions per day (WIB), one shared count axis. */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={dayLabel}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
            labelFormatter={(v) => `Tanggal ${dayLabel(String(v))}`}
            formatter={(value, name) => [`${value}`, name]}
            contentStyle={{ borderRadius: 8, borderColor: "var(--border)", fontSize: 13 }}
          />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 13, color: "var(--foreground)" }} />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, stroke: "var(--card)", fill: s.color }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
