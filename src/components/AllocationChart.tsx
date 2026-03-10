"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getHoldings } from "@/lib/queries";

const sectorColors: Record<string, string> = {
  Technology: "#007aff",
  Index: "#5ac8fa",
  "Fixed Income": "#34c759",
  Financials: "#af52de",
  Consumer: "#ff9500",
  Commodities: "#ffcc00",
  Cash: "#8e8e93",
};

interface Slice {
  name: string;
  value: number;
  color: string;
}

export default function AllocationChart() {
  const [data, setData] = useState<Slice[]>([]);

  useEffect(() => {
    getHoldings().then((holdings) => {
      const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
      const bySector: Record<string, number> = {};
      for (const h of holdings) {
        bySector[h.sector] = (bySector[h.sector] || 0) + h.value;
      }
      const slices = Object.entries(bySector)
        .map(([name, val]) => ({
          name,
          value: Number(((val / totalValue) * 100).toFixed(1)),
          color: sectorColors[name] || "#94a3b8",
        }))
        .sort((a, b) => b.value - a.value);
      setData(slices);
    });
  }, []);

  if (!data.length) {
    return <div className="h-48 flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-48 h-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white rounded-xl px-3 py-2 shadow-lg shadow-black/10 border border-border/40">
                    <p className="text-sm font-medium text-foreground">
                      {d.name}
                    </p>
                    <p className="text-xs text-muted">{d.value}%</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-muted flex-1">{slice.name}</span>
            <span className="text-sm font-medium text-foreground">
              {slice.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
