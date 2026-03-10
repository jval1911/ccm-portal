import { createClient } from "./supabase";

const PORTFOLIO_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function getPortfolioDailyData(days?: number) {
  const supabase = createClient();

  let query = supabase
    .from("portfolio_daily")
    .select("date, nav, daily_return, cumulative_return, benchmark_value")
    .eq("portfolio_id", PORTFOLIO_ID)
    .order("date", { ascending: true });

  if (days && days < 9999) {
    const since = new Date();
    since.setDate(since.getDate() - Math.ceil(days * 1.5)); // account for weekends
    query = query.gte("date", since.toISOString().split("T")[0]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPortfolioSummary() {
  const supabase = createClient();

  // Get the latest two days + first day + first of year
  const [latestRes, firstRes, yearStartRes, portfolioRes] = await Promise.all([
    supabase
      .from("portfolio_daily")
      .select("date, nav, cumulative_return, benchmark_value")
      .eq("portfolio_id", PORTFOLIO_ID)
      .order("date", { ascending: false })
      .limit(2),
    supabase
      .from("portfolio_daily")
      .select("date, nav")
      .eq("portfolio_id", PORTFOLIO_ID)
      .order("date", { ascending: true })
      .limit(1),
    supabase
      .from("portfolio_daily")
      .select("date, nav")
      .eq("portfolio_id", PORTFOLIO_ID)
      .gte("date", `${new Date().getFullYear()}-01-01`)
      .order("date", { ascending: true })
      .limit(1),
    supabase
      .from("portfolios")
      .select("inception_date, initial_value")
      .eq("id", PORTFOLIO_ID)
      .single(),
  ]);

  const latest = latestRes.data?.[0];
  const previous = latestRes.data?.[1];
  const first = firstRes.data?.[0];
  const yearStart = yearStartRes.data?.[0];
  const portfolio = portfolioRes.data;

  if (!latest || !previous || !first || !portfolio) {
    return null;
  }

  const totalValue = Number(latest.nav);
  const prevValue = Number(previous.nav);
  const inceptionValue = Number(first.nav);
  const ytdStart = yearStart ? Number(yearStart.nav) : inceptionValue;

  return {
    totalValue,
    totalReturn: totalValue - inceptionValue,
    totalReturnPct: ((totalValue - inceptionValue) / inceptionValue) * 100,
    dayChange: totalValue - prevValue,
    dayChangePct: ((totalValue - prevValue) / prevValue) * 100,
    ytdReturn: totalValue - ytdStart,
    ytdReturnPct: ((totalValue - ytdStart) / ytdStart) * 100,
    inceptionDate: portfolio.inception_date,
  };
}

export async function getHoldings() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("portfolio_id", PORTFOLIO_ID)
    .order("current_price", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((h) => {
    const shares = Number(h.shares);
    const avgCost = Number(h.avg_cost);
    const currentPrice = Number(h.current_price);
    const value = shares * currentPrice;
    const costBasis = shares * avgCost;
    const totalReturn = value - costBasis;
    const totalReturnPct = (totalReturn / costBasis) * 100;
    // Simulate day change as small random % (in production this comes from market data)
    const seed = h.ticker.charCodeAt(0) + h.ticker.charCodeAt(h.ticker.length - 1);
    const dayChangePct = ((seed % 200) - 80) / 100;
    const dayChange = value * (dayChangePct / 100);

    return {
      id: h.id,
      name: h.name,
      ticker: h.ticker,
      shares,
      avgCost,
      currentPrice,
      value,
      dayChange,
      dayChangePct,
      totalReturn,
      totalReturnPct,
      allocation: 0, // calculated below
      sector: h.sector,
    };
  });
}

export async function getMonthlyStatementData(year: number, month: number) {
  const supabase = createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  // Previous month end for beginning balance
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;

  const yearStart = `${year}-01-01`;

  const [dailyRes, prevDailyRes, txnRes, ytdStartRes, inceptionRes, holdingsRes] =
    await Promise.all([
      // Daily NAV for this month
      supabase
        .from("portfolio_daily")
        .select("date, nav, daily_return, cumulative_return, benchmark_value")
        .eq("portfolio_id", PORTFOLIO_ID)
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: true }),
      // Previous month daily (to get ending balance = beginning balance)
      supabase
        .from("portfolio_daily")
        .select("date, nav, benchmark_value")
        .eq("portfolio_id", PORTFOLIO_ID)
        .gte("date", prevStart)
        .lt("date", startDate)
        .order("date", { ascending: false })
        .limit(1),
      // Transactions this month
      supabase
        .from("transactions")
        .select("*")
        .eq("portfolio_id", PORTFOLIO_ID)
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: true }),
      // YTD start (first trading day of year)
      supabase
        .from("portfolio_daily")
        .select("date, nav")
        .eq("portfolio_id", PORTFOLIO_ID)
        .gte("date", yearStart)
        .order("date", { ascending: true })
        .limit(1),
      // Inception value
      supabase
        .from("portfolio_daily")
        .select("date, nav")
        .eq("portfolio_id", PORTFOLIO_ID)
        .order("date", { ascending: true })
        .limit(1),
      // Holdings snapshot
      supabase
        .from("holdings")
        .select("*")
        .eq("portfolio_id", PORTFOLIO_ID),
    ]);

  const daily = dailyRes.data ?? [];
  const prevEnd = prevDailyRes.data?.[0];
  const transactions = txnRes.data ?? [];
  const ytdStart = ytdStartRes.data?.[0];
  const inception = inceptionRes.data?.[0];
  const holdings = holdingsRes.data ?? [];

  if (!daily.length) return null;

  const monthEnd = daily[daily.length - 1];
  const monthStart = daily[0];
  const beginningBalance = prevEnd ? Number(prevEnd.nav) : Number(monthStart.nav);
  const endingBalance = Number(monthEnd.nav);

  // Aggregate transactions by type
  const deposits = transactions
    .filter((t) => t.type === "deposit")
    .reduce((s, t) => s + Number(t.amount), 0);
  const withdrawals = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((s, t) => s + Number(t.amount), 0);
  const fees = transactions
    .filter((t) => t.type === "fee")
    .reduce((s, t) => s + Number(t.amount), 0);
  const dividends = transactions
    .filter((t) => t.type === "dividend")
    .reduce((s, t) => s + Number(t.amount), 0);

  const netCashFlow = deposits + withdrawals;
  const investmentGainLoss = endingBalance - beginningBalance - netCashFlow - fees;

  // Performance calculations
  const mtdReturn =
    beginningBalance > 0
      ? ((endingBalance - beginningBalance - netCashFlow) / beginningBalance) * 100
      : 0;

  const ytdStartNav = ytdStart ? Number(ytdStart.nav) : beginningBalance;
  const ytdReturn =
    ytdStartNav > 0
      ? ((endingBalance - ytdStartNav) / ytdStartNav) * 100
      : 0;

  const inceptionNav = inception ? Number(inception.nav) : beginningBalance;
  const itdReturn =
    inceptionNav > 0
      ? ((endingBalance - inceptionNav) / inceptionNav) * 100
      : 0;

  // Benchmark performance for same period
  const benchmarkStart = prevEnd
    ? Number(prevEnd.benchmark_value)
    : Number(monthStart.benchmark_value);
  const benchmarkEnd = Number(monthEnd.benchmark_value);
  const benchmarkMtd =
    benchmarkStart > 0
      ? ((benchmarkEnd - benchmarkStart) / benchmarkStart) * 100
      : 0;

  // Risk metrics (annualized from daily returns this month)
  const dailyReturns = daily.map((d) => Number(d.daily_return) / 100);
  const avgDailyReturn =
    dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
  const variance =
    dailyReturns.reduce((s, r) => s + (r - avgDailyReturn) ** 2, 0) /
    dailyReturns.length;
  const dailyVol = Math.sqrt(variance);
  const annualizedVol = dailyVol * Math.sqrt(252) * 100;

  // Holdings with values
  const holdingsData = holdings.map((h) => {
    const shares = Number(h.shares);
    const price = Number(h.current_price);
    const cost = Number(h.avg_cost);
    const value = shares * price;
    return {
      ticker: h.ticker,
      name: h.name,
      shares,
      price,
      avgCost: cost,
      value,
      gainLoss: value - shares * cost,
      gainLossPct: ((price - cost) / cost) * 100,
      sector: h.sector,
    };
  });
  const totalHoldingsValue = holdingsData.reduce((s, h) => s + h.value, 0);

  // Sector allocation
  const sectorMap: Record<string, number> = {};
  for (const h of holdingsData) {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.value;
  }
  const allocation = Object.entries(sectorMap)
    .map(([sector, val]) => ({
      sector,
      value: val,
      pct: (val / totalHoldingsValue) * 100,
    }))
    .sort((a, b) => b.pct - a.pct);

  return {
    period: {
      year,
      month,
      startDate: monthStart.date,
      endDate: monthEnd.date,
      label: new Date(year, month - 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    },
    capitalAccount: {
      beginningBalance,
      deposits,
      withdrawals,
      netCashFlow,
      investmentGainLoss,
      managementFees: fees,
      dividendIncome: dividends,
      endingBalance,
    },
    performance: {
      mtdReturn,
      ytdReturn,
      itdReturn,
      benchmarkMtd,
      annualizedVol,
    },
    dailyNav: daily.map((d) => ({
      date: d.date,
      nav: Number(d.nav),
      benchmark: Number(d.benchmark_value),
    })),
    transactions: transactions.map((t) => ({
      date: t.date,
      type: t.type,
      description: t.description,
      ticker: t.ticker,
      shares: t.shares ? Number(t.shares) : null,
      price: t.price ? Number(t.price) : null,
      amount: Number(t.amount),
    })),
    holdings: holdingsData,
    allocation,
    fundInfo: {
      name: "CCM Capital Fund I, LP",
      administrator: "CCM Capital Management, LLC",
      custodian: "Interactive Brokers LLC",
      auditor: "Pending Engagement",
      inceptionDate: inception?.date || "2022-03-10",
    },
  };
}

export async function getAvailableStatementMonths() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("portfolio_daily")
    .select("date")
    .eq("portfolio_id", PORTFOLIO_ID)
    .order("date", { ascending: false });

  if (error) throw error;

  // Extract unique year-month combos
  const months = new Set<string>();
  for (const row of data ?? []) {
    const d = new Date(row.date);
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return Array.from(months)
    .sort()
    .reverse()
    .map((m) => {
      const [y, mo] = m.split("-").map(Number);
      return {
        year: y,
        month: mo,
        key: m,
        label: new Date(y, mo - 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };
    });
}

export async function getTransactions(type?: string) {
  const supabase = createClient();

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("portfolio_id", PORTFOLIO_ID)
    .order("date", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
