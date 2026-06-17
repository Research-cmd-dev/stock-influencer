"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

import type { PricePoint } from "@/lib/market";

export interface SparklineProps {
  data: PricePoint[];
  /** Direction tints the stroke; defaults to neutral. */
  trend?: "up" | "down" | "flat";
  height?: number;
  className?: string;
}

const STROKE: Record<NonNullable<SparklineProps["trend"]>, string> = {
  up: "hsl(var(--bullish))",
  down: "hsl(var(--bearish))",
  flat: "hsl(var(--neutral))",
};

/** Compact, axis-less price sparkline. */
export function Sparkline({ data, trend = "flat", height = 40, className }: SparklineProps) {
  if (data.length === 0) return null;
  return (
    <div className={className} style={{ height }} data-testid="sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="close"
            stroke={STROKE[trend]}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
