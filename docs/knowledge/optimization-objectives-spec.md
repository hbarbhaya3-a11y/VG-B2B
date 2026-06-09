# Portfolio Optimization Objectives Specification

## Purpose
Define user-selectable portfolio optimization objectives, scoring methods, constraints, ranking, and tie-break behavior.

Owner roles: `simulation-engineer`, `data-scientist`, `product-manager`.

## User-selectable objectives
1. Risk-adjusted return (Sharpe maximization)
2. Maximum return
3. Minimum drawdown (capital preservation)

## Inputs
- Asset class weights and bounds from current portfolio configuration.
- Historical return series and covariance matrix.
- Client risk profile and suitability constraints.
- Optional penalties (concentration, liquidity, ESG exclusions).

## Objective definitions
### 1) Risk-adjusted return (Sharpe maximization)
Primary score:
- `score = (expected_return - risk_free_rate) / portfolio_volatility`

Where:
- `expected_return = weighted mean of asset class expected returns`
- `portfolio_volatility = sqrt(w' * Cov * w)` (portfolio standard deviation)
- `risk_free_rate` from current yield curve

### 2) Maximum return
Primary score:
- `score = expected_return`
Secondary checks:
- flag candidates with risk exceeding client risk tolerance
- expose drawdown and VaR metrics prominently

### 3) Minimum drawdown (capital preservation)
Primary score:
- `score = -expected_max_drawdown` (negative so lower drawdown = higher score)
Secondary checks:
- expose return metrics to show trade-off
- flag if expected return is below inflation target

## Constraints and guardrails
- Asset class weights must stay within configured min/max.
- Respect client suitability constraints (risk profile, investment horizon).
- Respect regulatory concentration limits.
- Flag illiquid allocations that exceed portfolio liquidity requirements.
- ESG exclusion lists enforced when configured.

## Ranking and tie-breaks
Primary sort: selected objective score descending.
Tie-break order:
1. higher Sharpe ratio
2. lower maximum drawdown
3. higher diversification score
4. lower tracking error vs benchmark

## Output contract per candidate allocation
- Objective name and score
- Asset class weights
- Expected Return, Volatility, Sharpe Ratio, Max Drawdown
- VaR (95%) and CVaR (95%)
- Diversification score
- Suitability flag (pass/caution/fail)
- One-line rationale

## Default behavior
- Default objective on first open: Risk-adjusted return.
- User can change objective before each optimization run.
- Objective selection must be persisted for current session context.
- Suitability check must run before results are displayed to client.
