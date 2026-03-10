"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Repeat,
  CreditCard,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import { getTransactions } from "@/lib/queries";
import { formatCurrency, cn } from "@/lib/utils";

const typeConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  buy: {
    label: "Buy",
    icon: ShoppingCart,
    color: "text-accent-green",
    bg: "bg-accent-green/10",
  },
  sell: {
    label: "Sell",
    icon: ArrowUpRight,
    color: "text-accent-red",
    bg: "bg-accent-red/10",
  },
  dividend: {
    label: "Dividend",
    icon: DollarSign,
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  deposit: {
    label: "Deposit",
    icon: TrendingUp,
    color: "text-accent-green",
    bg: "bg-accent-green/10",
  },
  withdrawal: {
    label: "Withdrawal",
    icon: ArrowDownLeft,
    color: "text-accent-red",
    bg: "bg-accent-red/10",
  },
  fee: {
    label: "Fee",
    icon: CreditCard,
    color: "text-muted",
    bg: "bg-muted/10",
  },
  rebalance: {
    label: "Rebalance",
    icon: Repeat,
    color: "text-accent-purple",
    bg: "bg-accent-purple/10",
  },
};

const filterOptions = [
  "all",
  "buy",
  "sell",
  "dividend",
  "deposit",
  "withdrawal",
  "fee",
];

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  ticker: string | null;
  shares: number | null;
  price: number | null;
}

export default function ActivityPage() {
  const [activity, setActivity] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTransactions(filter)
      .then((txns) =>
        setActivity(
          txns.map((t) => ({
            ...t,
            amount: Number(t.amount),
            shares: t.shares ? Number(t.shares) : null,
            price: t.price ? Number(t.price) : null,
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] md:text-[34px] tracking-tight font-bold text-foreground">
          Activity
        </h1>
        <p className="text-[15px] text-muted mt-1">
          Transaction history and account activity
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors capitalize",
              filter === f
                ? "bg-accent-blue text-white"
                : "text-muted hover:text-foreground bg-white border border-border/60 hover:bg-black/[0.02]"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Activity list */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted">
          Loading transactions...
        </div>
      ) : (
        <div className="ios-card divide-y divide-border/60">
          {activity.map((item) => {
            const config = typeConfig[item.type] || typeConfig.fee;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-black/[0.02] transition-colors"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    config.bg
                  )}
                >
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={cn(
                        "text-[13px] px-2 py-0.5 rounded-full",
                        config.bg,
                        config.color
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-[13px] text-muted">{item.date}</span>
                    {item.ticker && (
                      <span className="text-[13px] text-muted">
                        {item.ticker}
                        {item.shares
                          ? ` x${Math.abs(item.shares)}`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    "text-[15px] font-semibold",
                    item.amount >= 0 ? "text-accent-green" : "text-accent-red"
                  )}
                >
                  {item.amount >= 0 ? "+" : ""}
                  {formatCurrency(item.amount)}
                </p>
              </div>
            );
          })}
          {activity.length === 0 && (
            <div className="p-8 text-center text-muted">
              No activity found for this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
