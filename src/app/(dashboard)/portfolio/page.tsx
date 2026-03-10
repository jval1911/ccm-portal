"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import AllocationChart from "@/components/AllocationChart";
import { getPortfolioSummary, getHoldings } from "@/lib/queries";
import {
  formatCurrency,
  formatCurrencyExact,
  formatPercent,
  formatNumber,
  cn,
} from "@/lib/utils";

interface Holding {
  id: string;
  name: string;
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  dayChange: number;
  dayChangePct: number;
  totalReturn: number;
  totalReturnPct: number;
  allocation: number;
  sector: string;
}

interface Summary {
  totalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  dayChange: number;
  dayChangePct: number;
  ytdReturn: number;
  ytdReturnPct: number;
  inceptionDate: string;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHoldings(), getPortfolioSummary()]).then(([h, s]) => {
      const totalValue = h.reduce((sum, pos) => sum + pos.value, 0);
      const withAllocation = h.map((pos) => ({
        ...pos,
        allocation: Number(((pos.value / totalValue) * 100).toFixed(1)),
      }));
      setHoldings(withAllocation);
      setSummary(s);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-96 text-muted">
        Loading portfolio...
      </div>
    );
  }

  const filtered = holdings.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.ticker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] md:text-[34px] tracking-tight font-bold text-foreground">
          Portfolio
        </h1>
        <p className="text-[15px] text-muted mt-1">
          {formatCurrency(summary.totalValue)} total value across{" "}
          {holdings.length} positions
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Value",
            value: formatCurrency(summary.totalValue),
            sub: null,
          },
          {
            label: "Day P&L",
            value: formatCurrency(Math.abs(summary.dayChange)),
            sub: formatPercent(summary.dayChangePct),
            positive: summary.dayChange >= 0,
          },
          {
            label: "YTD Return",
            value: formatCurrency(Math.abs(summary.ytdReturn)),
            sub: formatPercent(summary.ytdReturnPct),
            positive: summary.ytdReturn >= 0,
          },
          {
            label: "Total Return",
            value: formatCurrency(Math.abs(summary.totalReturn)),
            sub: formatPercent(summary.totalReturnPct),
            positive: summary.totalReturn >= 0,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="ios-card-inset p-4"
          >
            <p className="text-xs text-muted">{card.label}</p>
            <p
              className={cn(
                "text-lg font-bold mt-1",
                card.positive === undefined
                  ? "text-foreground"
                  : card.positive
                    ? "text-accent-green"
                    : "text-accent-red"
              )}
            >
              {card.positive !== undefined && (card.positive ? "+" : "-")}
              {card.value}
            </p>
            {card.sub && (
              <p
                className={cn(
                  "text-xs mt-0.5",
                  card.positive ? "text-accent-green" : "text-accent-red"
                )}
              >
                {card.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Allocation chart */}
      <div className="ios-card p-6">
        <h2 className="text-[17px] font-semibold text-foreground mb-4">
          Asset Allocation
        </h2>
        <AllocationChart />
      </div>

      {/* Holdings table */}
      <div className="ios-card">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-[17px] font-semibold text-foreground">Holdings</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 rounded-lg bg-background/80 text-[15px] text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map((h) => (
            <div key={h.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{h.ticker}</p>
                  <p className="text-xs text-muted">{h.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {formatCurrency(h.value)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      h.dayChange >= 0
                        ? "text-accent-green"
                        : "text-accent-red"
                    )}
                  >
                    {formatPercent(h.dayChangePct)} today
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  {formatNumber(h.shares)} shares @{" "}
                  {formatCurrencyExact(h.avgCost)}
                </span>
                <span
                  className={cn(
                    h.totalReturn >= 0
                      ? "text-accent-green"
                      : "text-accent-red"
                  )}
                >
                  {formatPercent(h.totalReturnPct)} total
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium text-right">Shares</th>
                <th className="px-4 py-3 font-medium text-right">Avg Cost</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">
                  Market Value
                </th>
                <th className="px-4 py-3 font-medium text-right">Day P&L</th>
                <th className="px-4 py-3 font-medium text-right">
                  Total Return
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  Allocation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((h) => (
                <tr
                  key={h.id}
                  className="hover:bg-surface-hover transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{h.ticker}</p>
                    <p className="text-xs text-muted">{h.name}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {formatNumber(h.shares)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {formatCurrencyExact(h.avgCost)}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {formatCurrencyExact(h.currentPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatCurrency(h.value)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div
                      className={cn(
                        "flex items-center justify-end gap-1",
                        h.dayChange >= 0
                          ? "text-accent-green"
                          : "text-accent-red"
                      )}
                    >
                      {h.dayChange >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span>{formatPercent(h.dayChangePct)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        h.totalReturn >= 0
                          ? "text-accent-green"
                          : "text-accent-red"
                      )}
                    >
                      {formatCurrency(Math.abs(h.totalReturn))} (
                      {formatPercent(h.totalReturnPct)})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {h.allocation}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
