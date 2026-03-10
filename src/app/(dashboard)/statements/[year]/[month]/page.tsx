"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getMonthlyStatementData } from "@/lib/queries";
import {
  formatCurrency,
  formatCurrencyExact,
  formatPercent,
  formatNumber,
  cn,
} from "@/lib/utils";

const sectorColors: Record<string, string> = {
  Technology: "#007aff",
  Index: "#5ac8fa",
  "Fixed Income": "#34c759",
  Financials: "#af52de",
  Consumer: "#ff9500",
  Commodities: "#ffcc00",
  Cash: "#8e8e93",
};

type StatementData = NonNullable<
  Awaited<ReturnType<typeof getMonthlyStatementData>>
>;

export default function StatementDetailPage() {
  const params = useParams();
  const year = Number(params.year);
  const month = Number(params.month);
  const [data, setData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMonthlyStatementData(year, month)
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [year, month]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted">
        Loading statement...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-muted gap-4">
        <p>No statement data available for this period.</p>
        <Link href="/statements" className="text-accent-blue hover:underline">
          Back to Statements
        </Link>
      </div>
    );
  }

  const ca = data.capitalAccount;
  const perf = data.performance;

  return (
    <div className="space-y-6">
      {/* Header - hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/statements"
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold text-foreground">
              {data.period.label}
            </h1>
            <p className="text-muted text-[15px]">Monthly Account Statement</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/90 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Printable statement */}
      <div ref={printRef} className="print:p-0 space-y-6">
        {/* ========== COVER / HEADER ========== */}
        <div className="ios-card p-6 print:bg-white print:border-gray-200 print:rounded-none print:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-accent-blue flex items-center justify-center print:bg-gray-800">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground print:text-black">
                  CCM Capital
                </span>
              </div>
              <h2 className="text-[19px] font-bold text-foreground print:text-black">
                Monthly Account Statement
              </h2>
              <p className="text-muted print:text-gray-500 text-sm mt-1">
                For the Period Ending{" "}
                {new Date(data.period.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium text-foreground print:text-black">
                {data.fundInfo.name}
              </p>
              <p className="text-muted print:text-gray-500">
                Investor: Joe Valentine
              </p>
              <p className="text-muted print:text-gray-500">
                Account: CCM-00001
              </p>
              <p className="text-muted print:text-gray-500">
                Class A Units
              </p>
            </div>
          </div>

          {/* Key metrics bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/60 print:border-gray-200">
            <div>
              <p className="text-xs text-muted print:text-gray-500">
                Ending Balance
              </p>
              <p className="text-lg font-bold text-foreground print:text-black">
                {formatCurrency(ca.endingBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted print:text-gray-500">
                MTD Return
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  perf.mtdReturn >= 0
                    ? "text-accent-green print:text-green-700"
                    : "text-accent-red print:text-red-700"
                )}
              >
                {formatPercent(perf.mtdReturn)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted print:text-gray-500">
                YTD Return
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  perf.ytdReturn >= 0
                    ? "text-accent-green print:text-green-700"
                    : "text-accent-red print:text-red-700"
                )}
              >
                {formatPercent(perf.ytdReturn)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted print:text-gray-500">
                Since Inception
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  perf.itdReturn >= 0
                    ? "text-accent-green print:text-green-700"
                    : "text-accent-red print:text-red-700"
                )}
              >
                {formatPercent(perf.itdReturn)}
              </p>
            </div>
          </div>
        </div>

        {/* ========== CAPITAL ACCOUNT SUMMARY ========== */}
        <div className="ios-card p-6 print:bg-white print:border-gray-200 print:rounded-none print:p-8">
          <h3 className="text-[17px] font-semibold text-foreground print:text-black mb-4">
            Capital Account Summary
          </h3>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/60 print:divide-gray-200">
              <tr>
                <td className="py-2.5 text-muted print:text-gray-600">
                  Beginning Balance ({data.period.startDate})
                </td>
                <td className="py-2.5 text-right font-medium text-foreground print:text-black">
                  {formatCurrencyExact(ca.beginningBalance)}
                </td>
              </tr>
              {ca.deposits !== 0 && (
                <tr>
                  <td className="py-2.5 text-muted print:text-gray-600 pl-4">
                    Contributions
                  </td>
                  <td className="py-2.5 text-right text-accent-green print:text-green-700">
                    +{formatCurrencyExact(ca.deposits)}
                  </td>
                </tr>
              )}
              {ca.withdrawals !== 0 && (
                <tr>
                  <td className="py-2.5 text-muted print:text-gray-600 pl-4">
                    Withdrawals / Distributions
                  </td>
                  <td className="py-2.5 text-right text-accent-red print:text-red-700">
                    {formatCurrencyExact(ca.withdrawals)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-2.5 text-muted print:text-gray-600 pl-4">
                  Net Investment Gain / (Loss)
                </td>
                <td
                  className={cn(
                    "py-2.5 text-right",
                    ca.investmentGainLoss >= 0
                      ? "text-accent-green print:text-green-700"
                      : "text-accent-red print:text-red-700"
                  )}
                >
                  {ca.investmentGainLoss >= 0 ? "+" : ""}
                  {formatCurrencyExact(ca.investmentGainLoss)}
                </td>
              </tr>
              {ca.dividendIncome !== 0 && (
                <tr>
                  <td className="py-2.5 text-muted print:text-gray-600 pl-4">
                    Dividend Income
                  </td>
                  <td className="py-2.5 text-right text-accent-green print:text-green-700">
                    +{formatCurrencyExact(ca.dividendIncome)}
                  </td>
                </tr>
              )}
              {ca.managementFees !== 0 && (
                <tr>
                  <td className="py-2.5 text-muted print:text-gray-600 pl-4">
                    Management Fees
                  </td>
                  <td className="py-2.5 text-right text-accent-red print:text-red-700">
                    {formatCurrencyExact(ca.managementFees)}
                  </td>
                </tr>
              )}
              <tr className="border-t-2 border-foreground/20 print:border-gray-400">
                <td className="py-3 font-semibold text-foreground print:text-black">
                  Ending Balance ({data.period.endDate})
                </td>
                <td className="py-3 text-right font-bold text-lg text-foreground print:text-black">
                  {formatCurrencyExact(ca.endingBalance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ========== PERFORMANCE SUMMARY ========== */}
        <div className="ios-card p-6 print:bg-white print:border-gray-200 print:rounded-none print:p-8">
          <h3 className="text-[17px] font-semibold text-foreground print:text-black mb-4">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted print:text-gray-500 border-b border-border/60 print:border-gray-200">
                    <th className="py-2 text-left font-medium">Period</th>
                    <th className="py-2 text-right font-medium">Fund</th>
                    <th className="py-2 text-right font-medium">Benchmark</th>
                    <th className="py-2 text-right font-medium">Excess</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-gray-200">
                  <tr>
                    <td className="py-2.5 text-muted print:text-gray-600">
                      Month-to-Date
                    </td>
                    <td
                      className={cn(
                        "py-2.5 text-right font-medium",
                        perf.mtdReturn >= 0
                          ? "text-accent-green print:text-green-700"
                          : "text-accent-red print:text-red-700"
                      )}
                    >
                      {formatPercent(perf.mtdReturn)}
                    </td>
                    <td className="py-2.5 text-right text-muted print:text-gray-500">
                      {formatPercent(perf.benchmarkMtd)}
                    </td>
                    <td
                      className={cn(
                        "py-2.5 text-right font-medium",
                        perf.mtdReturn - perf.benchmarkMtd >= 0
                          ? "text-accent-green print:text-green-700"
                          : "text-accent-red print:text-red-700"
                      )}
                    >
                      {formatPercent(perf.mtdReturn - perf.benchmarkMtd)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-muted print:text-gray-600">
                      Year-to-Date
                    </td>
                    <td
                      className={cn(
                        "py-2.5 text-right font-medium",
                        perf.ytdReturn >= 0
                          ? "text-accent-green print:text-green-700"
                          : "text-accent-red print:text-red-700"
                      )}
                    >
                      {formatPercent(perf.ytdReturn)}
                    </td>
                    <td className="py-2.5 text-right text-muted print:text-gray-500">
                      --
                    </td>
                    <td className="py-2.5 text-right text-muted">--</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-muted print:text-gray-600">
                      Since Inception
                    </td>
                    <td
                      className={cn(
                        "py-2.5 text-right font-medium",
                        perf.itdReturn >= 0
                          ? "text-accent-green print:text-green-700"
                          : "text-accent-red print:text-red-700"
                      )}
                    >
                      {formatPercent(perf.itdReturn)}
                    </td>
                    <td className="py-2.5 text-right text-muted print:text-gray-500">
                      --
                    </td>
                    <td className="py-2.5 text-right text-muted">--</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-4 border-t border-border/60 print:border-gray-200">
                <h4 className="text-xs font-medium text-muted print:text-gray-500 mb-2">
                  Risk Metrics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted print:text-gray-500">
                      Annualized Volatility
                    </span>
                  </div>
                  <div className="text-right font-medium text-foreground print:text-black">
                    {perf.annualizedVol.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Mini chart for the month */}
            <div className="print:hidden">
              <p className="text-xs text-muted mb-2">
                NAV Performance - {data.period.label}
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data.dailyNav}>
                  <defs>
                    <linearGradient
                      id="stmtGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          perf.mtdReturn >= 0 ? "#34c759" : "#ff3b30"
                        }
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          perf.mtdReturn >= 0 ? "#34c759" : "#ff3b30"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", { day: "numeric" })
                    }
                    minTickGap={20}
                  />
                  <YAxis hide domain={["dataMin", "dataMax"]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white rounded-xl shadow-lg shadow-black/10 border border-border/40 px-3 py-2 text-xs">
                          <p className="text-muted">{d.date}</p>
                          <p className="font-medium text-foreground">
                            {formatCurrency(d.nav)}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="nav"
                    stroke={perf.mtdReturn >= 0 ? "#34c759" : "#ff3b30"}
                    strokeWidth={2}
                    fill="url(#stmtGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ========== PORTFOLIO EXPOSURE ========== */}
        <div className="ios-card p-6 print:bg-white print:border-gray-200 print:rounded-none print:p-8">
          <h3 className="text-[17px] font-semibold text-foreground print:text-black mb-4">
            Portfolio Exposure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allocation pie */}
            <div className="print:hidden">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="pct"
                    nameKey="sector"
                    stroke="none"
                  >
                    {data.allocation.map((a, i) => (
                      <Cell
                        key={i}
                        fill={sectorColors[a.sector] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted print:text-gray-500 border-b border-border/60 print:border-gray-200">
                    <th className="py-2 text-left font-medium">Sector</th>
                    <th className="py-2 text-right font-medium">Value</th>
                    <th className="py-2 text-right font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 print:divide-gray-200">
                  {data.allocation.map((a) => (
                    <tr key={a.sector}>
                      <td className="py-2 text-foreground print:text-black flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              sectorColors[a.sector] || "#94a3b8",
                          }}
                        />
                        {a.sector}
                      </td>
                      <td className="py-2 text-right text-muted print:text-gray-600">
                        {formatCurrency(a.value)}
                      </td>
                      <td className="py-2 text-right font-medium text-foreground print:text-black">
                        {a.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========== HOLDINGS DETAIL ========== */}
        <div className="ios-card p-6 print:bg-white print:border-gray-200 print:rounded-none print:p-8">
          <h3 className="text-[17px] font-semibold text-foreground print:text-black mb-4">
            Holdings Detail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted print:text-gray-500 border-b border-border/60 print:border-gray-200">
                  <th className="py-2 text-left font-medium">Security</th>
                  <th className="py-2 text-right font-medium">Shares</th>
                  <th className="py-2 text-right font-medium">Price</th>
                  <th className="py-2 text-right font-medium">
                    Market Value
                  </th>
                  <th className="py-2 text-right font-medium">
                    Unrealized G/L
                  </th>
                  <th className="py-2 text-right font-medium">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 print:divide-gray-200">
                {data.holdings
                  .sort((a, b) => b.value - a.value)
                  .map((h) => {
                    const totalVal = data.holdings.reduce(
                      (s, x) => s + x.value,
                      0
                    );
                    return (
                      <tr key={h.ticker}>
                        <td className="py-2">
                          <span className="font-medium text-foreground print:text-black">
                            {h.ticker}
                          </span>
                          <span className="text-muted print:text-gray-500 ml-2 text-xs">
                            {h.name}
                          </span>
                        </td>
                        <td className="py-2 text-right text-foreground print:text-black">
                          {formatNumber(h.shares)}
                        </td>
                        <td className="py-2 text-right text-muted print:text-gray-600">
                          {formatCurrencyExact(h.price)}
                        </td>
                        <td className="py-2 text-right font-medium text-foreground print:text-black">
                          {formatCurrency(h.value)}
                        </td>
                        <td
                          className={cn(
                            "py-2 text-right",
                            h.gainLoss >= 0
                              ? "text-accent-green print:text-green-700"
                              : "text-accent-red print:text-red-700"
                          )}
                        >
                          {formatCurrency(Math.abs(h.gainLoss))} (
                          {formatPercent(h.gainLossPct)})
                        </td>
                        <td className="py-2 text-right text-muted print:text-gray-600">
                          {((h.value / totalVal) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== TRANSACTION LEDGER ========== */}
        {data.transactions.length > 0 && (
          <div className="ios-card p-6 print:bg-white print:border-gray-200 print:rounded-none print:p-8">
            <h3 className="text-[17px] font-semibold text-foreground print:text-black mb-4">
              Transaction Activity
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted print:text-gray-500 border-b border-border/60 print:border-gray-200">
                  <th className="py-2 text-left font-medium">Date</th>
                  <th className="py-2 text-left font-medium">Type</th>
                  <th className="py-2 text-left font-medium">Description</th>
                  <th className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 print:divide-gray-200">
                {data.transactions.map((t, i) => (
                  <tr key={i}>
                    <td className="py-2 text-muted print:text-gray-600">
                      {t.date}
                    </td>
                    <td className="py-2 capitalize text-foreground print:text-black">
                      {t.type}
                    </td>
                    <td className="py-2 text-foreground print:text-black">
                      {t.description}
                      {t.ticker && t.shares && (
                        <span className="text-muted print:text-gray-500 ml-1">
                          ({t.ticker} x{Math.abs(t.shares)} @{" "}
                          {formatCurrencyExact(t.price || 0)})
                        </span>
                      )}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right font-medium",
                        t.amount >= 0
                          ? "text-accent-green print:text-green-700"
                          : "text-accent-red print:text-red-700"
                      )}
                    >
                      {t.amount >= 0 ? "+" : ""}
                      {formatCurrencyExact(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========== DISCLOSURES ========== */}
        <div className="ios-card p-6 print:bg-white print:border-gray-200 print:rounded-none print:p-8">
          <h3 className="text-[17px] font-semibold text-foreground print:text-black mb-4">
            Fund Information & Disclosures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted print:text-gray-500">
                  Fund Name
                </span>
                <span className="font-medium text-foreground print:text-black">
                  {data.fundInfo.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted print:text-gray-500">
                  Investment Manager
                </span>
                <span className="font-medium text-foreground print:text-black">
                  {data.fundInfo.administrator}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted print:text-gray-500">
                  Inception Date
                </span>
                <span className="font-medium text-foreground print:text-black">
                  {data.fundInfo.inceptionDate}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted print:text-gray-500">
                  Prime Broker / Custodian
                </span>
                <span className="font-medium text-foreground print:text-black">
                  {data.fundInfo.custodian}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted print:text-gray-500">Auditor</span>
                <span className="font-medium text-foreground print:text-black">
                  {data.fundInfo.auditor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted print:text-gray-500">
                  Fee Structure
                </span>
                <span className="font-medium text-foreground print:text-black">
                  2% Mgmt / 20% Incentive
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 print:border-gray-200 pt-4 space-y-2 text-xs text-muted print:text-gray-500">
            <p>
              This statement is unaudited and provided for informational
              purposes only. All figures are estimated and subject to change
              upon completion of the fund&apos;s annual audit.
            </p>
            <p>
              Past performance is not indicative of future results. Returns are
              presented net of management fees and expenses unless otherwise
              noted. Benchmark shown is S&P 500 Total Return Index.
            </p>
            <p>
              NAV is calculated by {data.fundInfo.administrator} using
              fair value methodologies consistent with ASC 820. Positions are
              custodied at {data.fundInfo.custodian}.
            </p>
            <p className="font-medium">
              CONFIDENTIAL - This document is intended solely for the named
              investor and may not be reproduced or distributed without prior
              written consent of {data.fundInfo.administrator}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
