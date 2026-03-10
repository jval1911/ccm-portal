"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getPortfolioDailyData } from "@/lib/queries";
import { formatCompactCurrency, cn } from "@/lib/utils";

const timeRanges = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "YTD", days: 0 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: 9999 },
];

interface DailyPoint {
  date: string;
  nav: number;
  benchmark_value: number;
}

export default function PerformanceChart() {
  const [activeRange, setActiveRange] = useState("1Y");
  const [data, setData] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const range = timeRanges.find((r) => r.label === activeRange);
    let days = range?.days ?? 365;

    if (activeRange === "YTD") {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      days = Math.ceil(
        (now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    setLoading(true);
    getPortfolioDailyData(days)
      .then((rows) => {
        setData(
          rows.map((r) => ({
            date: r.date,
            nav: Number(r.nav),
            benchmark_value: Number(r.benchmark_value),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [activeRange]);

  const startVal = data[0]?.nav || 0;
  const endVal = data[data.length - 1]?.nav || 0;
  const isPositive = endVal >= startVal;
  const chartColor = isPositive ? "#34c759" : "#ff3b30";

  return (
    <div>
      {loading ? (
        <div className="h-[320px] flex items-center justify-center text-muted text-sm">
          Loading chart...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.15} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8e8e93", fontSize: 11 }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              minTickGap={50}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8e8e93", fontSize: 11 }}
              tickFormatter={(val) => formatCompactCurrency(val)}
              width={70}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white rounded-xl px-3 py-2 shadow-lg shadow-black/10 border border-border/40">
                    <p className="text-[11px] text-muted">{d.date}</p>
                    <p className="text-[13px] font-semibold text-foreground">
                      {formatCompactCurrency(d.nav)}
                    </p>
                    <p className="text-[11px] text-muted">
                      Benchmark: {formatCompactCurrency(d.benchmark_value)}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="nav"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#chartGradient)"
            />
            <Area
              type="monotone"
              dataKey="benchmark_value"
              stroke="#c7c7cc"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Time range selector */}
      <div className="flex items-center gap-1 mt-4 justify-center">
        {timeRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => setActiveRange(range.label)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeRange === range.label
                ? "bg-accent-blue text-white"
                : "text-muted hover:text-foreground hover:bg-black/[0.04]"
            )}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
