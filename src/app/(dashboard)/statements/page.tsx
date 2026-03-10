"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Calendar, ChevronRight } from "lucide-react";
import { getAvailableStatementMonths } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface MonthEntry {
  year: number;
  month: number;
  key: string;
  label: string;
}

export default function StatementsPage() {
  const [months, setMonths] = useState<MonthEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAvailableStatementMonths()
      .then(setMonths)
      .finally(() => setLoading(false));
  }, []);

  // Group by year
  const byYear: Record<number, MonthEntry[]> = {};
  for (const m of months) {
    if (!byYear[m.year]) byYear[m.year] = [];
    byYear[m.year].push(m);
  }
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-muted">
        Loading statements...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-foreground">
          Monthly Statements
        </h1>
        <p className="text-muted mt-1">
          Account statements for CCM Capital Fund I, LP
        </p>
      </div>

      {years.map((year) => (
        <div key={year} className="space-y-2">
          <h2 className="text-[17px] font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-blue" />
            {year}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {byYear[year].map((m) => (
              <Link
                key={m.key}
                href={`/statements/${m.year}/${m.month}`}
                className={cn(
                  "ios-card-inset p-4",
                  "hover:bg-black/[0.02] hover:border-accent-blue/30 transition-all",
                  "flex items-center gap-4 group"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-accent-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {m.label}
                  </p>
                  <p className="text-xs text-muted">Account Statement</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent-blue transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
