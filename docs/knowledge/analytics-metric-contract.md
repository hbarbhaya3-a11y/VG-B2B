# Analytics Metric Contract

## Purpose
Canonical definitions for wealth management metrics, formulas, signs, units, bounds, and display semantics.

Owner roles: `simulation-engineer`, `data-scientist`

## Core entities
- Portfolio: current allocation configuration selected by advisor/client.
- Benchmark: comparable index or model portfolio for performance comparison.
- Analysis period: time window for metric computation (MTD, QTD, YTD, 1Y, 3Y, 5Y, SI).

## Metric formulas
### Returns
- Total Return = (End Value - Start Value + Income) / Start Value
- Time-Weighted Return (TWR) = geometric linking of sub-period returns across cash flow dates
- Money-Weighted Return (MWR/IRR) = internal rate of return considering cash flow timing
- Annualized Return = (1 + Total Return)^(365/days) - 1

### Risk metrics
- Volatility = annualized standard deviation of periodic returns
- Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Portfolio Volatility
- Max Drawdown = max((Peak - Trough) / Peak) over rolling windows
- Value at Risk (VaR 95%) = 5th percentile of return distribution
- Conditional VaR (CVaR 95%) = mean of returns below VaR threshold

### Relative performance
- Alpha = Portfolio Return - (Risk-Free Rate + Beta * (Benchmark Return - Risk-Free Rate))
- Beta = Covariance(Portfolio, Benchmark) / Variance(Benchmark)
- Tracking Error = StdDev(Portfolio Return - Benchmark Return)
- Information Ratio = (Portfolio Return - Benchmark Return) / Tracking Error

### Portfolio analytics
- AUM = sum of all holding market values
- Net Flows = Inflows - Outflows over period
- Revenue Yield = Advisory Revenue / Average AUM
- Client Lifetime Value = projected revenue over expected relationship duration

### Guardrails
- If benchmark data unavailable, show relative metrics as `N/A`.
- If holding period < 1 year, do not annualize returns (show absolute).
- If portfolio has < 2 data points, show `Insufficient Data`.

## Units and formatting
- Currency: contextual (GBP, USD, EUR), short format in millions for large values (`GBP 25.4M`).
- Percent: two decimals for returns and ratios (`+4.23%`).
- Ratio: two decimals for Sharpe, Beta, Information Ratio (`1.42`).
- Basis points: for small differences (`+12 bps`).
- Dates: `DD-MMM-YYYY` for reports, `MMM-YY` for chart axes.

## Sign and sentiment contract
### Numeric sign
- Positive deltas must show `+`.
- Negative deltas must show `-`.
- Zero must show `0` with no plus prefix.

### Color and trend mapping
- Positive delta: green + upward trend icon.
- Negative delta: red + downward trend icon.
- Neutral delta: muted/neutral + flat indicator.

### Copy contract
- Never prepend hardcoded `+` in templates.
- Never set fixed positive trend for any computed delta.
- Text, icon, color, and numeric sign must always match the same value.
- Past performance disclaimers required on all historical return displays.

## Comparable-baseline rule
A delta is valid only if both values are computed from comparable context:
- same time period
- same currency basis
- same fee treatment (gross/net)
- same benchmark
- only allocation/strategy differs

## Worked examples
### Positive case
- Portfolio Return: +8.45%
- Benchmark Return: +6.20%
- Alpha: `+2.25%`
- Sharpe: `1.42`
- Color/trend: green/up

### Negative case
- Portfolio Return: -3.15%
- Benchmark Return: +1.20%
- Alpha: `-4.35%`
- Max Drawdown: `-8.72%`
- Color/trend: red/down

### Neutral case
- Portfolio Return: +0.02%
- Benchmark Return: +0.01%
- Alpha: `+0.01%`
- Color/trend: neutral/flat
