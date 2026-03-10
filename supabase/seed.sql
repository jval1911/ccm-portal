-- =============================================================================
-- CCM Capital Fund I - Supabase Seed Script
-- Run this in the Supabase SQL Editor to populate development data.
-- Script is re-runnable: tables are dropped/recreated and data is truncated.
-- =============================================================================


-- =============================================================================
-- SECTION 1: DROP & RECREATE TABLES
-- =============================================================================

drop table if exists transactions cascade;
drop table if exists holdings cascade;
drop table if exists portfolio_daily cascade;
drop table if exists portfolios cascade;

-- portfolios
create table if not exists portfolios (
    id             uuid        primary key default gen_random_uuid(),
    name           text,
    inception_date date,
    initial_value  numeric,
    created_at     timestamptz default now()
);

-- portfolio_daily: one row per trading day per portfolio
create table if not exists portfolio_daily (
    id               uuid    primary key default gen_random_uuid(),
    portfolio_id     uuid    references portfolios(id),
    date             date,
    nav              numeric,   -- net asset value / total portfolio value
    daily_return     numeric,   -- percentage (e.g. 0.45 = 0.45%)
    cumulative_return numeric,  -- percentage from inception
    benchmark_value  numeric    -- benchmark portfolio value (starts at same initial value)
);

-- transactions
create table if not exists transactions (
    id           uuid        primary key default gen_random_uuid(),
    portfolio_id uuid        references portfolios(id),
    date         date,
    type         text,        -- buy, sell, dividend, deposit, withdrawal, fee, rebalance
    description  text,
    ticker       text,        -- nullable
    shares       numeric,     -- nullable
    price        numeric,     -- nullable
    amount       numeric,     -- positive = inflow, negative = outflow
    created_at   timestamptz default now()
);

-- holdings: current positions as of seed date
create table if not exists holdings (
    id            uuid        primary key default gen_random_uuid(),
    portfolio_id  uuid        references portfolios(id),
    ticker        text,
    name          text,
    shares        numeric,
    avg_cost      numeric,
    current_price numeric,
    sector        text,
    updated_at    timestamptz default now()
);


-- =============================================================================
-- SECTION 1b: INDEXES (speeds up all queries significantly)
-- =============================================================================

create index if not exists idx_portfolio_daily_pid_date
  on portfolio_daily (portfolio_id, date);

create index if not exists idx_transactions_pid_date
  on transactions (portfolio_id, date);

create index if not exists idx_holdings_pid
  on holdings (portfolio_id);

-- RPC: get distinct statement months in one fast query
create or replace function get_available_statement_months(p_portfolio_id uuid)
returns table (year int, month int) language sql stable as $$
  select distinct
    extract(year from date)::int as year,
    extract(month from date)::int as month
  from portfolio_daily
  where portfolio_id = p_portfolio_id
  order by year desc, month desc;
$$;


-- =============================================================================
-- SECTION 2: ROW LEVEL SECURITY
-- =============================================================================

-- portfolios
alter table portfolios enable row level security;
create policy "Allow authenticated read access" on portfolios
    for select to authenticated using (true);
create policy "Allow anon read access" on portfolios
    for select to anon using (true);

-- portfolio_daily
alter table portfolio_daily enable row level security;
create policy "Allow authenticated read access" on portfolio_daily
    for select to authenticated using (true);
create policy "Allow anon read access" on portfolio_daily
    for select to anon using (true);

-- transactions
alter table transactions enable row level security;
create policy "Allow authenticated read access" on transactions
    for select to authenticated using (true);
create policy "Allow anon read access" on transactions
    for select to anon using (true);

-- holdings
alter table holdings enable row level security;
create policy "Allow authenticated read access" on holdings
    for select to authenticated using (true);
create policy "Allow anon read access" on holdings
    for select to anon using (true);


-- =============================================================================
-- SECTION 3: TRUNCATE (make script re-runnable without dropping tables)
-- =============================================================================

truncate transactions  restart identity cascade;
truncate holdings      restart identity cascade;
truncate portfolio_daily restart identity cascade;
truncate portfolios    restart identity cascade;


-- =============================================================================
-- SECTION 4: SEED PORTFOLIO RECORD
-- =============================================================================

insert into portfolios (id, name, inception_date, initial_value)
values (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'CCM Capital Fund I',
    '2022-03-10',
    500000
);


-- =============================================================================
-- SECTION 5: GENERATE portfolio_daily (weekdays 2022-03-10 → 2026-03-10)
-- Uses a deterministic pseudo-random daily return averaging ~14%/252 per day.
-- Deposits/withdrawals are factored into NAV on the day they occur.
-- Benchmark grows at ~10% annually from the same starting value.
-- =============================================================================

DO $$
DECLARE
    v_portfolio_id   uuid    := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    v_date           date;
    v_nav            numeric := 500000;
    v_benchmark      numeric := 500000;
    v_initial_nav    numeric := 500000;
    v_daily_target   numeric := 0.14 / 252;   -- ~14% annualised
    v_bench_daily    numeric := 0.10 / 252;    -- ~10% annualised
    v_daily_ret      numeric;
    v_bench_ret      numeric;
    v_cum_ret        numeric;
    v_seed           int;
    v_cash_flow      numeric;

    -- Cash flows keyed to specific dates (positive = deposit, negative = withdrawal)
    type_flows       record;
BEGIN
    v_date := '2022-03-10'::date;

    WHILE v_date <= '2026-03-10'::date LOOP

        -- Skip weekends
        IF extract(dow from v_date) IN (0, 6) THEN
            v_date := v_date + 1;
            CONTINUE;
        END IF;

        -- ------------------------------------------------------------------
        -- Apply any cash flow on this date BEFORE calculating the day return
        -- (deposit/withdrawal changes the NAV base but not the day's return %)
        -- ------------------------------------------------------------------
        v_cash_flow := 0;

        IF    v_date = '2022-06-15' THEN v_cash_flow :=  50000;
        ELSIF v_date = '2022-09-30' THEN v_cash_flow := -25000;
        ELSIF v_date = '2022-12-20' THEN v_cash_flow :=  75000;
        ELSIF v_date = '2023-04-10' THEN v_cash_flow := 100000;
        ELSIF v_date = '2023-06-30' THEN v_cash_flow := -35000;
        ELSIF v_date = '2023-09-01' THEN v_cash_flow :=  25000;
        ELSIF v_date = '2023-12-15' THEN v_cash_flow := -50000;
        ELSIF v_date = '2024-01-15' THEN v_cash_flow :=  50000;
        ELSIF v_date = '2024-04-15' THEN v_cash_flow := -15000;
        ELSIF v_date = '2024-07-01' THEN v_cash_flow :=  30000;
        ELSIF v_date = '2024-10-01' THEN v_cash_flow := -40000;
        ELSIF v_date = '2025-03-15' THEN v_cash_flow :=  60000;
        ELSIF v_date = '2025-06-30' THEN v_cash_flow := -30000;
        ELSIF v_date = '2025-10-01' THEN v_cash_flow :=  40000;
        ELSIF v_date = '2025-12-15' THEN v_cash_flow := -45000;
        END IF;

        v_nav := v_nav + v_cash_flow;

        -- ------------------------------------------------------------------
        -- Pseudo-random daily return
        -- We use a simple LCG seeded from the date integer to keep it
        -- deterministic on repeated runs.
        -- Return oscillates between roughly -1.5% and +2.3% averaging ~0.056%
        -- ------------------------------------------------------------------
        v_seed := (extract(epoch from v_date)::bigint % 1000007)::int;
        -- map seed to a value in [-0.015, 0.023]
        v_daily_ret := v_daily_target
                       + 0.009 * sin(v_seed * 0.001337)
                       + 0.005 * cos(v_seed * 0.002711)
                       + 0.003 * sin(v_seed * 0.005123);

        v_bench_ret := v_bench_daily
                       + 0.006 * sin(v_seed * 0.001337)
                       + 0.003 * cos(v_seed * 0.002711);

        -- Apply return to NAV and benchmark
        v_nav       := v_nav       * (1 + v_daily_ret);
        v_benchmark := v_benchmark * (1 + v_bench_ret);

        -- Cumulative return is based on growth from inception NAV
        -- We use total portfolio value vs initial $500k (ignoring cash flows
        -- for simplicity of the percentage display)
        v_cum_ret := ((v_nav - v_initial_nav) / v_initial_nav) * 100;

        INSERT INTO portfolio_daily (portfolio_id, date, nav, daily_return, cumulative_return, benchmark_value)
        VALUES (
            v_portfolio_id,
            v_date,
            round(v_nav, 2),
            round(v_daily_ret * 100, 4),   -- store as percent
            round(v_cum_ret, 4),
            round(v_benchmark, 2)
        );

        v_date := v_date + 1;
    END LOOP;
END $$;


-- =============================================================================
-- SECTION 6: TRANSACTIONS
-- =============================================================================

DO $$
DECLARE
    v_pid uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN

    -- -----------------------------------------------------------------------
    -- DEPOSITS
    -- -----------------------------------------------------------------------
    INSERT INTO transactions (portfolio_id, date, type, description, ticker, shares, price, amount) VALUES
        (v_pid, '2022-06-15', 'deposit', 'Capital Contribution - Q2',     null, null, null,  50000),
        (v_pid, '2022-12-20', 'deposit', 'Capital Contribution - Year End', null, null, null, 75000),
        (v_pid, '2023-04-10', 'deposit', 'Capital Contribution - Q2',     null, null, null, 100000),
        (v_pid, '2023-09-01', 'deposit', 'Additional Investment',         null, null, null,  25000),
        (v_pid, '2024-01-15', 'deposit', 'Capital Contribution - Q1',     null, null, null,  50000),
        (v_pid, '2024-07-01', 'deposit', 'Capital Contribution - Q3',     null, null, null,  30000),
        (v_pid, '2025-03-15', 'deposit', 'Capital Contribution - Q1',     null, null, null,  60000),
        (v_pid, '2025-10-01', 'deposit', 'Capital Contribution - Q4',     null, null, null,  40000);

    -- -----------------------------------------------------------------------
    -- WITHDRAWALS
    -- -----------------------------------------------------------------------
    INSERT INTO transactions (portfolio_id, date, type, description, ticker, shares, price, amount) VALUES
        (v_pid, '2022-09-30', 'withdrawal', 'Q3 Distribution',         null, null, null, -25000),
        (v_pid, '2023-06-30', 'withdrawal', 'Q2 Distribution',         null, null, null, -35000),
        (v_pid, '2023-12-15', 'withdrawal', 'Year-End Distribution',   null, null, null, -50000),
        (v_pid, '2024-04-15', 'withdrawal', 'Tax Distribution',        null, null, null, -15000),
        (v_pid, '2024-10-01', 'withdrawal', 'Q3 Distribution',         null, null, null, -40000),
        (v_pid, '2025-06-30', 'withdrawal', 'Q2 Distribution',         null, null, null, -30000),
        (v_pid, '2025-12-15', 'withdrawal', 'Year-End Distribution',   null, null, null, -45000);

    -- -----------------------------------------------------------------------
    -- QUARTERLY MANAGEMENT FEES (~0.5% of AUM, charged quarterly)
    -- AUM estimated at approximate NAV for each quarter end.
    -- -----------------------------------------------------------------------
    INSERT INTO transactions (portfolio_id, date, type, description, ticker, shares, price, amount) VALUES
        -- 2022
        (v_pid, '2022-06-30', 'fee', 'Q2 2022 Management Fee (0.5% AUM)',  null, null, null, -2812),
        (v_pid, '2022-09-30', 'fee', 'Q3 2022 Management Fee (0.5% AUM)',  null, null, null, -3050),
        (v_pid, '2022-12-31', 'fee', 'Q4 2022 Management Fee (0.5% AUM)',  null, null, null, -3400),
        -- 2023
        (v_pid, '2023-03-31', 'fee', 'Q1 2023 Management Fee (0.5% AUM)',  null, null, null, -3620),
        (v_pid, '2023-06-30', 'fee', 'Q2 2023 Management Fee (0.5% AUM)',  null, null, null, -3850),
        (v_pid, '2023-09-30', 'fee', 'Q3 2023 Management Fee (0.5% AUM)',  null, null, null, -3975),
        (v_pid, '2023-12-31', 'fee', 'Q4 2023 Management Fee (0.5% AUM)',  null, null, null, -4100),
        -- 2024
        (v_pid, '2024-03-31', 'fee', 'Q1 2024 Management Fee (0.5% AUM)',  null, null, null, -4400),
        (v_pid, '2024-06-30', 'fee', 'Q2 2024 Management Fee (0.5% AUM)',  null, null, null, -4650),
        (v_pid, '2024-09-30', 'fee', 'Q3 2024 Management Fee (0.5% AUM)',  null, null, null, -4800),
        (v_pid, '2024-12-31', 'fee', 'Q4 2024 Management Fee (0.5% AUM)',  null, null, null, -5050),
        -- 2025
        (v_pid, '2025-03-31', 'fee', 'Q1 2025 Management Fee (0.5% AUM)',  null, null, null, -5300),
        (v_pid, '2025-06-30', 'fee', 'Q2 2025 Management Fee (0.5% AUM)',  null, null, null, -5100),
        (v_pid, '2025-09-30', 'fee', 'Q3 2025 Management Fee (0.5% AUM)',  null, null, null, -5450),
        (v_pid, '2025-12-31', 'fee', 'Q4 2025 Management Fee (0.5% AUM)',  null, null, null, -5700);

    -- -----------------------------------------------------------------------
    -- BUY TRADES
    -- -----------------------------------------------------------------------
    INSERT INTO transactions (portfolio_id, date, type, description, ticker, shares, price, amount) VALUES
        -- 2022 initial build-out
        (v_pid, '2022-03-11', 'buy', 'Initial position - SPY',   'SPY',   200, 435.20,  -87040),
        (v_pid, '2022-03-14', 'buy', 'Initial position - AAPL',  'AAPL',  300, 158.50,  -47550),
        (v_pid, '2022-03-14', 'buy', 'Initial position - MSFT',  'MSFT',  100, 298.40,  -29840),
        (v_pid, '2022-03-16', 'buy', 'Initial position - GLD',   'GLD',   200, 182.30,  -36460),
        (v_pid, '2022-05-12', 'buy', 'Add to NVDA - dip buy',    'NVDA',  500,  42.10,  -21050),
        (v_pid, '2022-07-01', 'buy', 'Add to SPY post-correction','SPY',  100, 384.50,  -38450),
        (v_pid, '2022-08-15', 'buy', 'New position - AMZN',      'AMZN',  200, 138.20,  -27640),
        (v_pid, '2022-10-28', 'buy', 'Add NVDA on weakness',     'NVDA',  200,  63.00,  -12600),
        (v_pid, '2022-11-10', 'buy', 'New position - JPM',       'JPM',   200, 131.80,  -26360),

        -- 2023
        (v_pid, '2023-01-20', 'buy', 'Add to AAPL',              'AAPL',  150, 141.90,  -21285),
        (v_pid, '2023-02-10', 'buy', 'New position - TLT',       'TLT',   600,  98.40,  -59040),
        (v_pid, '2023-04-12', 'buy', 'New position - GOOGL',     'GOOGL', 300, 107.80,  -32340),
        (v_pid, '2023-05-25', 'buy', 'Add to NVDA - AI rally',   'NVDA',  120, 189.50,  -22740),
        (v_pid, '2023-07-18', 'buy', 'Add to AMZN',              'AMZN',  150, 133.20,  -19980),
        (v_pid, '2023-09-05', 'buy', 'New position - BRK.B',     'BRK.B', 100, 355.00,  -35500),
        (v_pid, '2023-11-08', 'buy', 'Add to GOOGL',             'GOOGL', 160, 130.50,  -20880),

        -- 2024
        (v_pid, '2024-01-22', 'buy', 'Add to MSFT',              'MSFT',   80, 398.20,  -31856),
        (v_pid, '2024-03-05', 'buy', 'Add to SPY',               'SPY',   120, 512.80,  -61536),
        (v_pid, '2024-04-22', 'buy', 'Add to BRK.B',             'BRK.B',  80, 398.40,  -31872),
        (v_pid, '2024-06-14', 'buy', 'Add to TLT',               'TLT',   400,  91.20,  -36480),
        (v_pid, '2024-08-12', 'buy', 'Add to GLD - rate hedge',  'GLD',   120, 216.50,  -25980),
        (v_pid, '2024-10-03', 'buy', 'Add to AAPL',              'AAPL',  100, 226.40,  -22640),

        -- 2025
        (v_pid, '2025-01-10', 'buy', 'Add to JPM',               'JPM',   180, 248.60,  -44748),
        (v_pid, '2025-02-21', 'buy', 'Add to NVDA',              'NVDA',  200, 134.20,  -26840),
        (v_pid, '2025-03-17', 'buy', 'Add to GLD',               'GLD',   200, 187.60,  -37520),
        (v_pid, '2025-06-06', 'buy', 'Add to AMZN',              'AMZN',  100, 201.10,  -20110),
        (v_pid, '2025-09-22', 'buy', 'Add to GOOGL',             'GOOGL', 100, 172.40,  -17240);

    -- -----------------------------------------------------------------------
    -- SELL TRADES
    -- -----------------------------------------------------------------------
    INSERT INTO transactions (portfolio_id, date, type, description, ticker, shares, price, amount) VALUES
        (v_pid, '2022-09-29', 'sell', 'Trim SPY - rebalance',         'SPY',   -80, 372.50,   29800),
        (v_pid, '2023-08-10', 'sell', 'Trim NVDA - profit taking',    'NVDA',  -50, 432.90,   21645),
        (v_pid, '2023-10-20', 'sell', 'Trim TLT - duration reduce',   'TLT',  -200,  88.10,   17620),
        (v_pid, '2024-02-08', 'sell', 'Sell META position (rotation)','META', -100, 474.20,   47420),
        (v_pid, '2024-07-25', 'sell', 'Trim AAPL - rebalance',        'AAPL',  -80, 217.60,   17408),
        (v_pid, '2024-11-15', 'sell', 'Trim AMZN - profit taking',    'AMZN', -100, 214.30,   21430),
        (v_pid, '2025-04-08', 'sell', 'Trim SPY - volatility hedge',  'SPY',   -60, 538.20,   32292),
        (v_pid, '2025-07-14', 'sell', 'Trim NVDA - profit taking',    'NVDA', -100, 158.50,   15850),
        (v_pid, '2025-11-03', 'sell', 'Trim GLD - rebalance',         'GLD',   -80, 225.80,   18064);

    -- -----------------------------------------------------------------------
    -- DIVIDENDS
    -- -----------------------------------------------------------------------
    INSERT INTO transactions (portfolio_id, date, type, description, ticker, shares, price, amount) VALUES
        (v_pid, '2022-09-16', 'dividend', 'SPY Q3 2022 Dividend',    'SPY',  null, null,  1420),
        (v_pid, '2022-12-16', 'dividend', 'SPY Q4 2022 Dividend',    'SPY',  null, null,  1580),
        (v_pid, '2023-03-17', 'dividend', 'SPY Q1 2023 Dividend',    'SPY',  null, null,  1640),
        (v_pid, '2023-09-15', 'dividend', 'SPY Q3 2023 Dividend',    'SPY',  null, null,  1720),
        (v_pid, '2023-12-15', 'dividend', 'AAPL Annual Dividend',    'AAPL', null, null,   506),
        (v_pid, '2024-03-15', 'dividend', 'SPY Q1 2024 Dividend',    'SPY',  null, null,  1870),
        (v_pid, '2024-06-14', 'dividend', 'TLT Monthly Dividend',    'TLT',  null, null,  2760),
        (v_pid, '2024-09-20', 'dividend', 'JPM Q3 2024 Dividend',    'JPM',  null, null,   855),
        (v_pid, '2025-03-14', 'dividend', 'SPY Q1 2025 Dividend',    'SPY',  null, null,  2050),
        (v_pid, '2025-06-13', 'dividend', 'BRK.B Special Dividend',  'BRK.B',null, null,  1260);

END $$;


-- =============================================================================
-- SECTION 7: HOLDINGS (current positions as of 2026-03-10)
-- =============================================================================

DO $$
DECLARE
    v_pid uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
BEGIN
    INSERT INTO holdings (portfolio_id, ticker, name, shares, avg_cost, current_price, sector) VALUES
        (v_pid, 'SPY',   'SPDR S&P 500 ETF Trust',           420,  428.50, 512.35, 'Index'),
        (v_pid, 'AAPL',  'Apple Inc.',                        550,  165.20, 198.45, 'Technology'),
        (v_pid, 'NVDA',  'NVIDIA Corporation',                820,   85.30, 142.80, 'Technology'),
        (v_pid, 'MSFT',  'Microsoft Corporation',             280,  325.00, 412.60, 'Technology'),
        (v_pid, 'TLT',   'iShares 20+ Year Treasury Bond ETF',1200,  92.50,  88.75, 'Fixed Income'),
        (v_pid, 'AMZN',  'Amazon.com Inc.',                   450,  155.00, 205.30, 'Consumer'),
        (v_pid, 'JPM',   'JPMorgan Chase & Co.',              380,  168.00, 225.40, 'Financials'),
        (v_pid, 'BRK.B', 'Berkshire Hathaway Inc. Class B',  180,  365.00, 468.20, 'Financials'),
        (v_pid, 'GOOGL', 'Alphabet Inc. Class A',             460,  132.00, 175.85, 'Technology'),
        (v_pid, 'GLD',   'SPDR Gold Shares',                  320,  185.00, 218.40, 'Commodities');
END $$;


-- =============================================================================
-- SECTION 8: VERIFICATION QUERIES (optional — comment out before running if
-- you only want the inserts)
-- =============================================================================

-- Row counts per table
select 'portfolios'    as tbl, count(*) from portfolios
union all
select 'portfolio_daily',       count(*) from portfolio_daily
union all
select 'transactions',          count(*) from transactions
union all
select 'holdings',              count(*) from holdings;

-- Latest NAV
select date, nav, daily_return, cumulative_return, benchmark_value
from portfolio_daily
order by date desc
limit 5;

-- Transaction type breakdown
select type, count(*), sum(amount) as net_amount
from transactions
group by type
order by type;
