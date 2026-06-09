# TwinX for Vanguard — Platform Overview
**Living document. Update after every session that changes version, navigation, tech stack, or adds/removes top-level modules.**
**Last updated: Session 1 (v0.1.0-vanguard) — 2026-04-15**

---

## Platform Identity

| Field | Value |
|---|---|
| **Product name** | TwinX for Vanguard |
| **Parent platform** | TwinX Wealth Banking (base platform) |
| **Primary domain** | US 401(k) workplace retirement · IRA/wealth advisory · ERISA-regulated · fiduciary-first |
| **Secondary domains** | Plan sponsor relationship management · External advisor enablement (Route 1) · Participant behavior intervention · Regulatory compliance (SECURE 2.0, DOL, IRS) |
| **Current version** | 0.1.0-vanguard |
| **Build tool** | Vite 7.1.7 |
| **Entry point** | `src/App.jsx` |
| **POV document** | `docs/vanguard-pov/TwinX-for-Vanguard-POV.md` |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI framework | React | 18.3.1 |
| Component library | Mantine (core + charts + dates + hooks + modals + notifications + spotlight + tiptap) | 8.3.18 |
| Icons | Tabler Icons React | 3.40.0 |
| Charts | Recharts | 2.15.4 (Mantine Charts preferred for new work) |
| Date handling | Day.js | 1.11.20 |
| Rich text | Tiptap | 3.20.4 |
| Build tool | Vite | 7.1.7 |
| Module type | ES Module (`"type": "module"`) | — |
| Backend | Firebase (configured via `.firebaserc`) | — |
| AI/LLM | Claude API via `src/ai/llm.js` (compliance-scoped prompt library only) | — |

---

## Brand & Theme

| | Value |
|---|---|
| Primary color | `vanguardRed` — `#96151D` (deep Vanguard red) |
| Gradient | `linear-gradient(90deg, #96151D, #D92B36, #bc2028)` |
| Logo | `TwinX_Black.svg` (header) |
| Tagline | "Fiduciary Intelligence Platform" |
| Mantine theme | Custom `vanguardRed` 10-shade array; `primaryColor: "vanguardRed"` |

---

## Locale & Currency

| | Value |
|---|---|
| Default currency | USD |
| Currency formatting | Via format utilities in `src/utils/format.js` |
| Locale | en-US |
| Regulatory jurisdiction | United States — ERISA, DOL, IRS, SEC/FINRA |

---

## Navigation Structure — 8-Rail Vanguard Spine

The app uses **SPA navigation** (no client-side router). `activePage` / `activeSubPage` state in `App.jsx` controls which view renders. The Operate rail is always accessible and sits separately at the bottom of the nav.

```
SENSE — market intelligence & signals
  ├─ market-signals         Signal feed: volatility, regulatory (SECURE 2.0), plan events, behavior radar
  ├─ advisor-twin-registry  Route 1 advisor twins: need-state, engagement, intervention history
  └─ use-case-catalog       5 seed use cases: volatility, Roth adoption, leakage, rollover, sponsor renewal

DECIDE — strategy & use case activation
  └─ use-case-catalog       (same component, subPage='use-case-catalog' in DECIDE context)

SIMULATE — episode simulation & scenario modeling
  ├─ episode-simulator      Monte Carlo 1,000 iterations, response curves, do-nothing baseline
  └─ quant-bridge           Bayesian hierarchical model params, prior borrowing, sensitivity analysis

GOVERN — fiduciary gate & compliance
  ├─ trust-compliance       Five-Rail ERISA pipeline, guardrail guardian, disclosure registry
  └─ fiduciary-gate         Decision approval gate — fiduciarySensitive gating, Autopilot controls

DEPLOY — journey execution & active campaigns
  ├─ active-journeys        Live digital journeys, in-app, email, advisor brief deployments
  └─ content-engine         Content generation: digital journey modules, emails, advisor briefs

MEASURE — outcome attribution & performance
  ├─ outcome-attribution    Shapley value multi-touch attribution, holdout comparison
  └─ signal-performance     Signal accuracy, episode maturity, engagement rate tracking

LEARN — twin enrichment & model improvement
  ├─ twin-enrichment        Participant/sponsor/advisor twin posterior updates
  └─ model-accuracy         Prior borrowing history, episode library maturity tracking

OPERATE — agent console & system health
  └─ agents                 8-agent console, MCP connectors, trust pipeline status, system health
```

---

## Three Routes (Vanguard-Specific)

| Route | Audience | Description |
|---|---|---|
| **Route 1** | External advisors (Advisor Alpha) | Plan sponsor-level advisor twins. No individual participant data flows through advisor payloads. Advisor briefs are education-classified. |
| **Route 2** | Plan sponsors (employers) | Sponsor Twin registry. Relationship health, churn risk, plan features, renewal tracking. |
| **Route 3** | Plan participants (cohorts) | Participant Twin cohorts (NOT individual records). Cohort-level need-state vectors, behavior signals, leakage risk. PII excluded from all payloads. |

---

## 8-Agent System

| # | Agent | Responsibility |
|---|---|---|
| 1 | Market Sentinel | Signal detection — volatility, regulatory, behavior radar, rollover events |
| 2 | Context Decoder | Cohort scoring, twin segmentation, need-state posterior inference |
| 3 | Content Architect | Education content generation via compliance-scoped prompt library |
| 4 | Quant Bridge | Monte Carlo simulation, response curves, Shapley attribution |
| 5 | Decision Owner | Human-in-the-loop approval gate — Guided and Autopilot modes |
| 6 | Guardrail Guardian | Five-Rail ERISA compliance pipeline — auto-correction + escalation |
| 7 | Journey Executor | Multi-channel deployment: digitalJourney, email, inApp, advisorBrief |
| 8 | Learning System | Twin enrichment, episode maturity update, prior borrowing |

---

## Fiduciary Discipline — Non-Negotiable Constraints

| Rule | Consequence |
|---|---|
| Content class must be 'education' unless advice eligibility confirmed | Guardrail blocks deploy |
| No individual participant scoring (cohort-only in v1) | Anti-pattern — blocked at Context Decoder |
| No predictive rollover signals (reaction-based only) | Rollover Moment Validator blocks signal |
| do-nothing baseline required in every SimulationRun | Quant Bridge rejects run without baselineId |
| holdoutId required at scenario creation | Deploy blocked if no holdout defined |
| disclosures[] must be populated per content class | Guardrail rail 4 blocks deploy if empty |
| fiduciarySensitive=true auto-disables Autopilot | Autopilot Authorizations list governs exceptions |
| LLM content generation uses compliance-scoped prompt library only | Raw LLM prompts blocked for participant copy |

---

## Key File Locations

| Area | Path |
|---|---|
| Main entry | `src/App.jsx` |
| Theme | `src/theme.js` |
| Data files | `src/data/` (signals, episodes, participants, sponsors, advisors, usecases, interventions, funds) |
| Simulation engine | `src/simulation/` |
| Shared UI components | `src/components/ui/` |
| Nav component | `src/components/nav/WorkflowNav.jsx` |
| Workflow panels | `src/components/workflow/panels/` |
| Agent definitions | `agents/` |
| Vanguard POV | `docs/vanguard-pov/TwinX-for-Vanguard-POV.md` |
| Data contracts | `docs/product-context/data-contracts.md` |
