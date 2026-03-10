"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileCheck,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import PerformanceChart from "@/components/PerformanceChart";
import AllocationChart from "@/components/AllocationChart";
import { getPortfolioSummary, getTransactions } from "@/lib/queries";
import { getOperationTasks } from "@/lib/fake-data";
import {
  formatCurrency,
  formatPercent,
  formatCurrencyExact,
  cn,
} from "@/lib/utils";
import Link from "next/link";

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

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  ticker: string | null;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const tasks = getOperationTasks().filter(
    (t) => t.status === "requires_approval" || t.status === "in_progress"
  );

  useEffect(() => {
    Promise.all([getPortfolioSummary(), getTransactions()])
      .then(([s, txns]) => {
        setSummary(s);
        setActivity(txns.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-96 text-muted">
        Loading portfolio data...
      </div>
    );
  }

  const isPositiveDay = summary.dayChange >= 0;
  const isPositiveTotal = summary.totalReturn >= 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[28px] md:text-[34px] font-bold text-foreground tracking-tight">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
          , Joe
        </h1>
        <p className="text-[15px] text-muted mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Portfolio value hero */}
      <div className="ios-card p-5">
        <p className="text-[13px] text-muted font-medium uppercase tracking-wide">
          Total Portfolio Value
        </p>
        <p className="text-[32px] md:text-[38px] font-bold text-foreground tracking-tight mt-0.5">
          {formatCurrency(summary.totalValue)}
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            {isPositiveDay ? (
              <ArrowUpRight className="w-4 h-4 text-accent-green" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-accent-red" />
            )}
            <span
              className={cn(
                "text-[15px] font-semibold",
                isPositiveDay ? "text-accent-green" : "text-accent-red"
              )}
            >
              {formatCurrencyExact(Math.abs(summary.dayChange))} (
              {formatPercent(summary.dayChangePct)})
            </span>
            <span className="text-[13px] text-muted ml-0.5">Today</span>
          </div>
          <div className="flex items-center gap-1">
            {isPositiveTotal ? (
              <TrendingUp className="w-4 h-4 text-accent-green" />
            ) : (
              <TrendingDown className="w-4 h-4 text-accent-red" />
            )}
            <span
              className={cn(
                "text-[13px] font-medium",
                isPositiveTotal ? "text-accent-green" : "text-accent-red"
              )}
            >
              {formatCurrency(Math.abs(summary.totalReturn))} (
              {formatPercent(summary.totalReturnPct)})
            </span>
            <span className="text-[13px] text-muted ml-0.5">
              Since inception
            </span>
          </div>
        </div>

        <div className="mt-5">
          <PerformanceChart />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Allocation */}
        <div className="ios-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-foreground">
              Asset Allocation
            </h2>
            <Link
              href="/portfolio"
              className="text-[15px] text-accent-blue font-medium"
            >
              See All
            </Link>
          </div>
          <AllocationChart />
        </div>

        {/* Operations requiring attention */}
        <div className="ios-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-semibold text-foreground">
              Action Required
            </h2>
            <Link
              href="/operations"
              className="text-[15px] text-accent-blue font-medium"
            >
              See All
            </Link>
          </div>
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-background/80"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5",
                    task.status === "requires_approval"
                      ? "bg-accent-orange/10 text-accent-orange"
                      : "bg-accent-blue/10 text-accent-blue"
                  )}
                >
                  {task.status === "requires_approval" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground">
                    {task.title}
                  </p>
                  <p className="text-[12px] text-muted mt-0.5 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        task.status === "requires_approval"
                          ? "bg-accent-orange/10 text-accent-orange"
                          : "bg-accent-blue/10 text-accent-blue"
                      )}
                    >
                      {task.status === "requires_approval"
                        ? "Needs Approval"
                        : "In Progress"}
                    </span>
                    <span className="text-[11px] text-muted">
                      Due {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="ios-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-semibold text-foreground">
            Recent Activity
          </h2>
          <Link
            href="/activity"
            className="text-[15px] text-accent-blue font-medium flex items-center gap-0.5"
          >
            See All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border/60">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center gap-3.5 py-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                  Number(item.amount) >= 0
                    ? "bg-accent-green/10"
                    : "bg-accent-red/10"
                )}
              >
                <FileCheck
                  className={cn(
                    "w-[18px] h-[18px]",
                    Number(item.amount) >= 0
                      ? "text-accent-green"
                      : "text-accent-red"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-foreground">
                  {item.description}
                </p>
                <p className="text-[13px] text-muted">
                  {item.date}
                  {item.ticker ? ` · ${item.ticker}` : ""}
                </p>
              </div>
              <p
                className={cn(
                  "text-[15px] font-semibold",
                  Number(item.amount) >= 0
                    ? "text-accent-green"
                    : "text-accent-red"
                )}
              >
                {Number(item.amount) >= 0 ? "+" : ""}
                {formatCurrency(Number(item.amount))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
