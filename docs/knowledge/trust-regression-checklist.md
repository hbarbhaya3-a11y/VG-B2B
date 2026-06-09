# Trust Regression Checklist

## Purpose
Risk-based validation checklist for wealth analytics trust changes.

Owner role: `qa-tester` with input from simulation/data/frontend/compliance owners.

## Release gate
All P0 and P1 checks must pass before shipping trust-related changes.

## P0 checks (must pass)
- Portfolio return sign consistency across all views.
- Risk metric sign consistency across all views (positive = gain, negative = loss).
- Color/trend consistency for positive/negative/zero deltas.
- Time-weighted return calculation used for portfolio performance.
- No primary CTA dead ends in advisory result flows.
- Compliance gates enforced before client-facing recommendations.

## P1 checks
- Optimization objective selection changes portfolio ranking output as expected.
- Recommended allocations include rationale and risk indicators.
- Explainability panel present for all core KPIs (AUM, returns, Sharpe, drawdown).
- Notification result view matches full result semantics.
- Risk warnings displayed where required by regulation.

## Deterministic scenario suite
Use fixed random seed scenarios for reproducible expectations:
1. Positive return scenario (bull market)
2. Negative return scenario (bear market / drawdown)
3. Near-zero return scenario (flat market)
4. High return but high risk scenario
5. Low return but capital preservation scenario

For each scenario assert:
- numeric values
- sign prefix
- trend icon
- color class
- narrative sentence polarity
- risk warning presence/absence

## Cross-view parity checks
Views:
- Portfolio performance overview
- Risk analytics tab
- Notification detail view
- Client report view

Assertions:
- Same underlying metric values within rounding tolerance.
- Same sign and sentiment mapping.
- Same benchmark reference statement.

## Dead-end checks
- Every visible CTA has a route/action.
- Disabled CTAs include reason text.
- Empty states provide at least one next action.

## Exit criteria
- 100% pass on P0 checks
- >=95% pass on P1 checks
- No unresolved high-severity UI trust issues
- Traceability matrix rows all linked to test evidence
- Compliance sign-off obtained for regulatory surfaces
