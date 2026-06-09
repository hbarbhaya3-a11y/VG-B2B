# TwinX Wealth Banking Product Context

## Purpose
This document is the local source of truth for the TwinX Wealth Banking platform. It defines the product vision, target users, and operating principles for wealth management features.

## Product Decision Brief
Owner roles: `product-manager`, `solution-architect`

### Problem
Wealth management advisors and clients lack a unified platform that provides transparent portfolio analytics, explainable recommendations, and compliant advisory workflows — leading to fragmented tooling, delayed decisions, and trust gaps.

### Target users
- Primary: Wealth Advisor / Relationship Manager
- Secondary: Client (HNW / UHNW / Mass Affluent)
- Secondary: Compliance Officer
- Secondary: Investment Committee / CIO

### Primary jobs to be done
- Understand portfolio performance relative to goals and benchmarks.
- Understand why performance deviated from expectations (attribution).
- Decide next action (rebalance, adjust allocation, schedule review) without hitting dead ends.
- Generate compliant client reports with transparent methodology.
- Assess risk exposure and suitability alignment.

### Success criteria
- No contradictory signs or colors for return/risk deltas.
- Every major analytics metric is explainable in plain business language.
- Every non-terminal state has a valid next action.
- Optimization objective is user-selectable and clearly defined.
- Compliance gates enforced before client-facing recommendations.
- Past performance disclaimers present on all historical displays.

## Scope Boundaries
### In scope
- Portfolio analytics and performance measurement.
- Risk metrics and stress testing.
- Explainability layer for analytics outputs.
- Portfolio optimization objective framework.
- Advisory workflow with compliance gates.
- Client reporting and communication.
- UX state handling to remove informational dead ends.
- Regression checklist and traceability for trust-critical paths.

### Out of scope (initial phase)
- Trade execution and order management.
- Custodian integration (read-only data feeds only).
- Full CRM replacement.
- Regulatory reporting submission (display/export only).

## Operating Principles
- Business language first, technical detail by progressive disclosure.
- One metric = one unambiguous definition everywhere.
- Rendering must follow value sign, never hardcoded sentiment.
- Recommendations require rationale, confidence, and suitability context.
- No user-facing action without a concrete route or explicit planned state.
- Past performance is not indicative of future results — disclaim appropriately.
- Client data is PII — handle with encryption and access controls.

## KPI Tree
North star:
- Trusted Advisory Decision Rate: percent of advisory sessions that end in a confident next action without ambiguity.

Diagnostics:
- Return Sign Consistency Rate across all result surfaces.
- Explainability Coverage: percent of core KPIs with visible "what this means" guidance.
- Dead-End Rate: percent of CTA paths with no actionable destination.
- Objective Clarity Rate: percent of optimization runs where selected objective and ranking rationale are explicit.
- Compliance Gate Pass Rate: percent of recommendations that pass suitability checks before display.

## Sequencing
1. Lock metric contract and sign semantics.
2. Align UI rendering and copy with contract.
3. Add explainability and optimization objective contract.
4. Build advisory workflow with compliance gates.
5. Remove dead ends and define fallback actions.
6. Validate via trust regression checklist and traceability matrix.

## Risks and mitigations
- Risk: hidden formula drift across views.
- Mitigation: central metric contract and parity checks in regression list.

- Risk: optimization complexity reduces advisor clarity.
- Mitigation: explicit objective definitions, tie-break rules, and concise rationale output.

- Risk: placeholder CTAs erode trust.
- Mitigation: dead-end prevention spec with required route/disabled behavior.

- Risk: regulatory non-compliance in recommendations.
- Mitigation: compliance auditor agent + suitability gates before client display.

- Risk: PII exposure through logging or error messages.
- Mitigation: security engineer review + PII handling policy enforcement.
