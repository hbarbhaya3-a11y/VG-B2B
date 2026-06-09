# Traceability Matrix: Wealth Banking Analytics Trust and Explainability

## Purpose
Map requirements to screens, metrics, behavior contracts, and tests.

## Matrix
| ID | Requirement | Surface | Contract Source | Verification |
|---|---|---|---|---|
| TR-01 | Portfolio returns use time-weighted methodology, not simple average | Analytics engine and performance cards | `analytics-metric-contract.md` | Deterministic scenario suite P0 |
| TR-02 | Return sign must match numeric value across all views | Overview + Performance + Notification result | `analytics-metric-contract.md` | Cross-view sign checks P0 |
| TR-03 | Return color/trend must match sign (green=positive, red=negative) | All KPI cards with return deltas | `analytics-metric-contract.md` | UI assertions P0 |
| TR-04 | No hardcoded plus prefix on computed deltas | All delta copy templates | `analytics-metric-contract.md` | Template inspection + UI tests P0 |
| TR-05 | KPI meaning visible in business language | Analytics results explainability panel | `explainability-spec.md` | Content presence checks P1 |
| TR-06 | Recommendation must include rationale and confidence qualifier | Portfolio recommendation area | `explainability-spec.md` | Narrative contract checks P1 |
| TR-07 | Optimization objective is user selectable each run | Portfolio optimizer controls | `optimization-objectives-spec.md` | Objective-switch ranking tests P1 |
| TR-08 | Portfolio ranking follows objective + tie-break rules | Optimizer result list | `optimization-objectives-spec.md` | Candidate ordering tests P1 |
| TR-09 | No informational dead ends for advisory workflows | Portfolio detail + results + notifications | `ux-dead-end-prevention.md` | CTA audit P0 |
| TR-10 | Empty and error states expose next action | All analytics-related tabs | `ux-dead-end-prevention.md` | State audit P1 |
| TR-11 | Notification result view has semantic parity with full results | Notification detail view | `trust-regression-checklist.md` | Cross-view parity checks P1 |
| TR-12 | Release blocked unless trust gates pass | Release process | `trust-regression-checklist.md` | Exit criteria enforcement |
| TR-13 | Compliance checks completed before client-facing recommendations | Advisory workflow | `compliance-auditor.md` | Compliance gate P0 |
| TR-14 | Risk metrics validated against regulatory standards | Risk reporting surfaces | `analytics-metric-contract.md` | Regulatory metric validation P0 |

## Ownership mapping
- Product framing and sequencing: `product-context-twinx-wealth.md`
- Metric semantics: `analytics-metric-contract.md`
- Explainability UX/copy: `explainability-spec.md`
- Optimization objective behavior: `optimization-objectives-spec.md`
- Dead-end prevention: `ux-dead-end-prevention.md`
- Test gates: `trust-regression-checklist.md`
- Regulatory compliance: `compliance-auditor.md`

## Evidence policy
Every matrix row must link to at least one test artifact before merge approval.
