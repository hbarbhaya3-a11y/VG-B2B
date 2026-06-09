# UX Dead-End Prevention Contract

## Purpose
Ensure every wealth management surface has actionable continuation paths and explicit state behavior.

Owner roles: `ux-designer`, `frontend-developer`, `wealth-domain-expert`.

## State model requirements
Each major view must define behavior for:
- loading
- empty
- success
- error
- partially available data

Each non-terminal state must provide at least one actionable next step.

## Dead-end prevention rules
- No CTA without either a working route/action or explicit disabled planned state.
- No "coming soon" toast as terminal behavior for primary workflows.
- Empty cards must offer a next action, not only status text.
- If data is missing, provide fallback explanation and recovery action.

## Wealth management flow contracts
### Portfolio Overview -> Performance Analysis
- Before analysis: show required inputs and `Run Analysis` action.
- After analysis: show KPI summary + explainability + recommended next actions.

### Advisory actions
Required actions:
- Rebalance portfolio
- Adjust allocation / risk profile
- Schedule advisor review
- Export client report

If action unavailable:
- disable button
- show reason (e.g., "Pending compliance approval", "Market closed")
- show nearest valid alternative action

### Notification result view parity
- Must display same sign/color semantics as full results panel.
- Must expose direct navigation to portfolio and full details.

## Copy and labeling rules
- CTA labels must be explicit and task-oriented.
- Avoid ambiguous actions like `Accept` without scope description.
- Use business wording for outcomes (return, risk, allocation, yield).

## Required UX audits
- Button/CTA audit for no-op handlers.
- Tab audit for content presence and meaningful empty states.
- Cross-view metric wording parity audit.
- Compliance warning presence audit on advisory surfaces.
