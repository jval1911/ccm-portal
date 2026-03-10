// Fake portfolio performance data generator for CCM Capital Portal

export interface PortfolioSummary {
  totalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  dayChange: number;
  dayChangePct: number;
  ytdReturn: number;
  ytdReturnPct: number;
  inceptionDate: string;
}

export interface PerformancePoint {
  date: string;
  value: number;
  benchmark: number;
}

export interface Holding {
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

export interface AllocationSlice {
  name: string;
  value: number;
  color: string;
}

export interface Activity {
  id: string;
  type: "buy" | "sell" | "dividend" | "deposit" | "withdrawal" | "fee";
  description: string;
  amount: number;
  date: string;
  ticker?: string;
}

export interface OperationTask {
  id: string;
  type: "nav" | "filing" | "report" | "onboarding" | "tax";
  title: string;
  status: "completed" | "pending" | "in_progress" | "requires_approval";
  dueDate: string;
  completedDate?: string;
  description: string;
}

// Seed-based pseudo-random for consistency
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generatePerformanceHistory(
  months: number = 24,
  startValue: number = 10000000
): PerformancePoint[] {
  const rand = seededRandom(42);
  const points: PerformancePoint[] = [];
  let value = startValue;
  let benchmark = startValue;
  const now = new Date();

  for (let i = months * 22; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyReturn = (rand() - 0.48) * 0.015;
    const benchmarkReturn = (rand() - 0.485) * 0.012;
    value *= 1 + dailyReturn;
    benchmark *= 1 + benchmarkReturn;

    points.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(value),
      benchmark: Math.round(benchmark),
    });
  }

  return points;
}

export function getPortfolioSummary(): PortfolioSummary {
  const history = generatePerformanceHistory();
  const current = history[history.length - 1];
  const previous = history[history.length - 2];
  const yearStart = history.find(
    (p) => p.date >= new Date().getFullYear() + "-01-01"
  );
  const inception = history[0];

  return {
    totalValue: current.value,
    totalReturn: current.value - inception.value,
    totalReturnPct:
      ((current.value - inception.value) / inception.value) * 100,
    dayChange: current.value - previous.value,
    dayChangePct: ((current.value - previous.value) / previous.value) * 100,
    ytdReturn: current.value - (yearStart?.value || inception.value),
    ytdReturnPct:
      ((current.value - (yearStart?.value || inception.value)) /
        (yearStart?.value || inception.value)) *
      100,
    inceptionDate: inception.date,
  };
}

export function getHoldings(): Holding[] {
  const holdings: Holding[] = [
    {
      id: "1",
      name: "S&P 500 ETF",
      ticker: "SPY",
      shares: 4200,
      avgCost: 428.5,
      currentPrice: 512.35,
      value: 2151870,
      dayChange: 12540,
      dayChangePct: 0.59,
      totalReturn: 352170,
      totalReturnPct: 19.57,
      allocation: 17.8,
      sector: "Index",
    },
    {
      id: "2",
      name: "Apple Inc.",
      ticker: "AAPL",
      shares: 5500,
      avgCost: 165.2,
      currentPrice: 198.45,
      value: 1091475,
      dayChange: -5225,
      dayChangePct: -0.48,
      totalReturn: 182875,
      totalReturnPct: 20.13,
      allocation: 9.0,
      sector: "Technology",
    },
    {
      id: "3",
      name: "NVIDIA Corporation",
      ticker: "NVDA",
      shares: 8200,
      avgCost: 85.3,
      currentPrice: 142.8,
      value: 1170960,
      dayChange: 32800,
      dayChangePct: 2.88,
      totalReturn: 471500,
      totalReturnPct: 67.41,
      allocation: 9.7,
      sector: "Technology",
    },
    {
      id: "4",
      name: "Microsoft Corporation",
      ticker: "MSFT",
      shares: 2800,
      avgCost: 325.0,
      currentPrice: 412.6,
      value: 1155280,
      dayChange: 8400,
      dayChangePct: 0.73,
      totalReturn: 245280,
      totalReturnPct: 26.95,
      allocation: 9.6,
      sector: "Technology",
    },
    {
      id: "5",
      name: "iShares 20+ Year Treasury",
      ticker: "TLT",
      shares: 12000,
      avgCost: 92.5,
      currentPrice: 88.75,
      value: 1065000,
      dayChange: 3600,
      dayChangePct: 0.34,
      totalReturn: -45000,
      totalReturnPct: -4.05,
      allocation: 8.8,
      sector: "Fixed Income",
    },
    {
      id: "6",
      name: "Amazon.com Inc.",
      ticker: "AMZN",
      shares: 4500,
      avgCost: 155.0,
      currentPrice: 205.3,
      value: 923850,
      dayChange: -4050,
      dayChangePct: -0.44,
      totalReturn: 226350,
      totalReturnPct: 32.43,
      allocation: 7.6,
      sector: "Consumer",
    },
    {
      id: "7",
      name: "JPMorgan Chase & Co.",
      ticker: "JPM",
      shares: 3800,
      avgCost: 168.0,
      currentPrice: 225.4,
      value: 856520,
      dayChange: 7600,
      dayChangePct: 0.9,
      totalReturn: 218120,
      totalReturnPct: 34.17,
      allocation: 7.1,
      sector: "Financials",
    },
    {
      id: "8",
      name: "Berkshire Hathaway B",
      ticker: "BRK.B",
      shares: 1800,
      avgCost: 365.0,
      currentPrice: 468.2,
      value: 842760,
      dayChange: 5400,
      dayChangePct: 0.64,
      totalReturn: 185760,
      totalReturnPct: 28.27,
      allocation: 7.0,
      sector: "Financials",
    },
    {
      id: "9",
      name: "Alphabet Inc.",
      ticker: "GOOGL",
      shares: 4600,
      avgCost: 132.0,
      currentPrice: 175.85,
      value: 808910,
      dayChange: 9200,
      dayChangePct: 1.15,
      totalReturn: 201710,
      totalReturnPct: 33.22,
      allocation: 6.7,
      sector: "Technology",
    },
    {
      id: "10",
      name: "Gold ETF",
      ticker: "GLD",
      shares: 3200,
      avgCost: 185.0,
      currentPrice: 218.4,
      value: 698880,
      dayChange: 1920,
      dayChangePct: 0.28,
      totalReturn: 106880,
      totalReturnPct: 18.05,
      allocation: 5.8,
      sector: "Commodities",
    },
    {
      id: "11",
      name: "Cash & Equivalents",
      ticker: "CASH",
      shares: 1,
      avgCost: 1325000,
      currentPrice: 1325000,
      value: 1325000,
      dayChange: 0,
      dayChangePct: 0,
      totalReturn: 18250,
      totalReturnPct: 1.4,
      allocation: 10.9,
      sector: "Cash",
    },
  ];

  return holdings;
}

export function getAllocation(): AllocationSlice[] {
  return [
    { name: "Technology", value: 35.0, color: "#00C805" },
    { name: "Index", value: 17.8, color: "#5AC53A" },
    { name: "Fixed Income", value: 8.8, color: "#1E88E5" },
    { name: "Financials", value: 14.1, color: "#7C4DFF" },
    { name: "Consumer", value: 7.6, color: "#FF6D00" },
    { name: "Commodities", value: 5.8, color: "#FFD600" },
    { name: "Cash", value: 10.9, color: "#78909C" },
  ];
}

export function getRecentActivity(): Activity[] {
  return [
    {
      id: "1",
      type: "buy",
      description: "Bought NVDA",
      amount: -85300,
      date: "2026-03-10",
      ticker: "NVDA",
    },
    {
      id: "2",
      type: "dividend",
      description: "JPM Dividend",
      amount: 4560,
      date: "2026-03-07",
      ticker: "JPM",
    },
    {
      id: "3",
      type: "sell",
      description: "Sold TSLA",
      amount: 142500,
      date: "2026-03-05",
      ticker: "TSLA",
    },
    {
      id: "4",
      type: "deposit",
      description: "Wire Transfer In",
      amount: 500000,
      date: "2026-03-03",
    },
    {
      id: "5",
      type: "fee",
      description: "Management Fee - Q1 2026",
      amount: -24375,
      date: "2026-03-01",
    },
    {
      id: "6",
      type: "buy",
      description: "Bought MSFT",
      amount: -162400,
      date: "2026-02-28",
      ticker: "MSFT",
    },
    {
      id: "7",
      type: "dividend",
      description: "SPY Distribution",
      amount: 8820,
      date: "2026-02-25",
      ticker: "SPY",
    },
    {
      id: "8",
      type: "buy",
      description: "Bought GLD",
      amount: -109200,
      date: "2026-02-20",
      ticker: "GLD",
    },
    {
      id: "9",
      type: "sell",
      description: "Sold META",
      amount: 198750,
      date: "2026-02-18",
      ticker: "META",
    },
    {
      id: "10",
      type: "withdrawal",
      description: "Distribution to LP",
      amount: -250000,
      date: "2026-02-15",
    },
  ];
}

export function getOperationTasks(): OperationTask[] {
  return [
    {
      id: "1",
      type: "nav",
      title: "Daily NAV Reconciliation",
      status: "completed",
      dueDate: "2026-03-10",
      completedDate: "2026-03-10",
      description:
        "All positions reconciled against Interactive Brokers. No discrepancies found.",
    },
    {
      id: "2",
      type: "filing",
      title: "CPO-PQR Q4 2025 Filing",
      status: "requires_approval",
      dueDate: "2026-03-14",
      description:
        "Form CPO-PQR generated and validated. Awaiting principal signature before NFA submission.",
    },
    {
      id: "3",
      type: "report",
      title: "February 2026 Investor Letter",
      status: "requires_approval",
      dueDate: "2026-03-15",
      description:
        "Monthly performance letter drafted. +2.3% net return. Attribution analysis complete.",
    },
    {
      id: "4",
      type: "onboarding",
      title: "LP Onboarding - Westfield Family Office",
      status: "in_progress",
      dueDate: "2026-03-20",
      description:
        "Subscription docs sent. KYC/AML verification in progress. Awaiting accredited investor confirmation.",
    },
    {
      id: "5",
      type: "tax",
      title: "2025 K-1 Preparation",
      status: "in_progress",
      dueDate: "2026-04-15",
      description:
        "Partner capital accounts calculated. Section 1256 aggregation complete. CPA review package 65% prepared.",
    },
    {
      id: "6",
      type: "filing",
      title: "Form ADV Annual Amendment",
      status: "pending",
      dueDate: "2026-03-31",
      description:
        "Annual update to Form ADV Part 2A. Gathering updated AUM and business description changes.",
    },
    {
      id: "7",
      type: "nav",
      title: "Month-End NAV Final",
      status: "pending",
      dueDate: "2026-03-31",
      description:
        "Monthly closing NAV with all accruals, fee calculations, and investor allocations.",
    },
    {
      id: "8",
      type: "report",
      title: "Q1 2026 Quarterly Report",
      status: "pending",
      dueDate: "2026-04-15",
      description:
        "Comprehensive quarterly report with performance attribution, risk metrics, and market commentary.",
    },
  ];
}
