# Explainability Specification

## Purpose
Define how wealth analytics results are explained to clients and advisors so every core decision is understandable.

Owner roles: `ux-designer`, `frontend-developer`, `wealth-domain-expert`, with metric validity from `data-scientist`.

## Explainability goals
- Make "what happened" explicit (portfolio performance, market impact).
- Make "why it happened" explicit (attribution, drivers, market context).
- Make "what to do next" explicit (rebalance, hold, adjust allocation).

## Required explainability blocks
### 1) KPI meaning
Each core KPI must include a short plain-language explanation:
- AUM: total assets under management across the portfolio.
- Total Return: overall gain/loss including income and capital appreciation.
- Risk-Adjusted Return: return relative to the risk taken (Sharpe ratio context).
- Max Drawdown: largest peak-to-trough decline in portfolio value.
- Alpha: excess return relative to benchmark performance.
- CLV Uplift: expected lifetime value impact of advisory action.

### 2) Scenario rationale
Explain why scenario label was assigned:
- threshold used (e.g., return target, risk tolerance breach)
- which KPIs crossed the threshold
- whether downside risk supports or weakens the label

### 3) Driver narrative
Top 3 positive drivers and top 2 risk drivers:
- derived from attribution analysis + risk decomposition + market context
- includes effect direction and confidence qualifier
- examples: "Equity allocation contributed +2.3% (high confidence)" or "Duration exposure added -0.8% risk (medium confidence)"

### 4) Recommendation rationale
For each recommendation, include:
- objective alignment (risk-adjusted return, capital preservation, etc.)
- expected impact summary
- downside caveat and risk warning
- next action CTA
- suitability confirmation status

## Confidence language policy
- High confidence: tight interval and high probability of outperformance.
- Medium confidence: mixed signals or wider interval.
- Low confidence: unstable or downside-heavy outcomes.

Rules:
- Do not claim certainty from Monte Carlo means or historical projections.
- Always pair recommendation with confidence qualifier.
- Past performance disclaimers required on all return projections.

## Progressive disclosure model
- Default: business summary cards and brief rationale.
- Expandable: statistical detail (confidence interval, attribution breakdown, factor exposure).
- Advanced content never blocks primary decision flow.

## Copy style rules
- Business language only in top-level surfaces.
- No unresolved jargon in default view.
- Numerical statement should always include context anchor (benchmark, period, risk level).

## CTA behavior requirements
Every explanation panel should end with one explicit path:
- Rebalance portfolio
- Adjust allocation
- Schedule advisor review
- View detailed attribution
- Export client report

No panel should end with informational text only.
