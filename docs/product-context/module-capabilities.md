# TwinX for Vanguard — Module Capabilities
**Living document. Update after every session that adds, modifies, or removes a module, component, or capability.**
**Last updated: Session 1 (v0.1.0-vanguard) — 2026-04-15**

---

## Module Registry

### SENSE — Market Intelligence

#### Market Signals
**Nav ID:** `market-signals` | **Status:** Built | **Component:** `src/pages/MarketSignals.jsx`
- Signal feed: 15 signals across 5 types (volatility, regulatory/SECURE 2.0, IRS/tax, plan events, behavior radar)
- Signal taxonomy: severity (Critical/High/Medium), lifecycle stage (SENSE/SIMULATE/RESPOND), maturity level 1–5
- Episode matching: each signal links to historical analog episodes (ep-001 through ep-005)
- Filters: by signal type, severity, lifecycle stage
- Signal detail: affected cohort/plan counts, fiduciarySensitive flag, contentClass, triggerAgent
- Rollover signal integrity: reaction-based only — `triggerType: 'plan_event'` required for rollover signals

#### Advisor Twin Registry (Route 1)
**Nav ID:** `advisor-twin-registry` | **Status:** Built | **Component:** `src/pages/AdvisorTwinRegistry.jsx`
- 5 external advisor twins (sponsor-level only — no individual participant data)
- Fields: needStateVector (sums to 1.0), engagementHistory, churnRisk, interventionHistory, recommendedChannel
- Advisor types: Advisor Alpha, Institutional
- Filters: relationship type, churn risk, specialisation, recommended channel
- Intervention history shows plan/sponsor-level impact only (no participant PII)

#### Use Case Catalog
**Nav ID:** `use-case-catalog` | **Status:** Built | **Component:** `src/pages/SenseDashboard.jsx` (and DECIDE route)
- 5 seed use cases: Volatility Response, Roth Adoption Nudge, Hardship Leakage Reduction, Rollover Moment Response, Sponsor Renewal Enablement
- Each use case shows: outcome, duration, agent chain, variant count, step-by-step workflow
- UC-A (Volatility Response) has full WorkflowRunner panelData — activates WorkflowRunner experience
- UC-B through UC-E show placeholder panel steps

---

### DECIDE — Strategy & Use Case Activation

#### Use Case Catalog (DECIDE context)
**Nav ID:** `decide` → routes to `SenseDashboard` with `activeSubPage='use-case-catalog'`
- Same catalog as SENSE — use case selection triggers WorkflowRunner in Guided or Autopilot mode
- Mode selection: ModeChoiceModal (Guided = step-by-step human review; Autopilot = autonomous with authorization)
- fiduciarySensitive=true automatically disables Autopilot for signals/use cases requiring ERISA review

---

### SIMULATE — Episode Simulation & Scenario Modeling

#### Episode Simulator
**Nav ID:** `episode-simulator` | **Status:** Built | **Component:** `src/pages/EpisodeSimulator.jsx`
- 5 historical analog episodes: COVID volatility, SECURE 2.0 catch-up, contribution limit campaign, plan termination rollover, hardship leakage
- Monte Carlo simulation: 1,000 iterations, Bayesian hierarchical response curves
- Channels: digitalJourney, email, inApp, advisorBrief
- Output: P5/P50/P95 confidence intervals, scenario comparison (A/B/C + do-nothing baseline)
- Outcome metrics: leakageReduction, deferralIncrease, rolloverRetention, engagementRate
- do-nothing baseline is required and shown as first-class option in every simulation

#### Quant Bridge
**Nav ID:** `quant-bridge` | **Status:** Placeholder | **Component:** `src/pages/QuantBridge.jsx`
- Bayesian hierarchical response curve parameters per channel
- Prior borrowing history from episode library
- Sensitivity analysis: dominant driver identification
- Shapley value attribution setup

---

### GOVERN — Fiduciary Gate & Compliance

#### Trust & Compliance
**Nav ID:** `trust-compliance` | **Status:** Built | **Component:** `src/pages/TrustCompliance.jsx`
- Five-Rail ERISA compliance pipeline:
  1. ERISA Education Classification — content-class verification
  2. Advice / Education Boundary — no advice language in education-classified assets
  3. Rollover Signal Integrity — reaction-based signal verification
  4. ERISA Disclosure Auto-Attach — disclosures[] populated per content class
  5. PII Exclusion — cohort IDs and counts only; no individual participant data
- Guardrail Guardian: auto-correction log, escalation queue
- Content credentials: ERISA-classified, disclosure-attached, PII-excluded, human-reviewed
- Fiduciary Guardian gate: fiduciarySensitive=true cases escalated to ERISA Fiduciary Auditor before approval

---

### DEPLOY — Journey Execution

#### Active Journeys
**Nav ID:** `active-journeys` | **Status:** Built (via DeployLearnDashboard) | **Component:** `src/pages/DeployLearnDashboard.jsx`
- Live digital journeys, email campaigns, in-app push sequences, advisor brief deployments
- Channel mix: digitalJourney · email · inApp · advisorBrief
- Deployment records: cohortId, planId, channel, contentVariant, sendTime, complianceStatus, isHoldout
- Frequency cap enforcement: 3 touches per 30-day window (Vanguard default)
- Holdout protection: holdout participants excluded from all active deployments

#### Content Engine
**Nav ID:** `content-engine` | **Status:** Built | **Component:** `src/pages/ContentEngine.jsx`
- Content generation via compliance-scoped prompt library (no raw LLM for participant copy)
- Content types: digital journey module, email (A/B variants), in-app push, sponsor advisor brief, portal volatility hub
- Content class enforcement: all generated content is education-classified by default
- PAS referral module: separate eligibility-gated component (advice route requires disclosure auto-attach)
- Content generation panel driven by `ContentGenerationPanel.jsx` workflow component

---

### MEASURE — Outcome Attribution

#### Outcome Attribution
**Nav ID:** `outcome-attribution` | **Status:** Built | **Component:** `src/pages/DeployLearnDashboard.jsx` (subPage)
- Shapley value multi-touch attribution — channel contribution decomposition
- Holdout comparison: treatment vs. holdout engagement and outcome rates
- Outcome metrics: leakageReductionPct, assetsRetained, deferralIncrease, rolloverRetention, planRenewalRate
- AUM trend chart (weeks 1–12 treatment vs holdout)
- P&L summary: program cost, attributedValue, ROI

#### Signal Performance
**Nav ID:** `signal-performance` | **Status:** Planned
- Signal accuracy tracking: predicted vs. actual engagement rates
- Episode maturity progression (levels 1–5)
- Signal confidence calibration over time

---

### LEARN — Twin Enrichment

#### Twin Enrichment
**Nav ID:** `twin-enrichment` | **Status:** Built | **Component:** `src/pages/DeployLearnDashboard.jsx` (subPage)
- Participant twin posterior updates: needStateVector, behaviorSignals, leakageRisk refreshed per episode
- Sponsor twin enrichment: churnRisk, relationshipHealthScore updates
- Advisor twin enrichment: engagementHistory, churnRisk updates
- Episode library update: maturityLevel advancement, historicalPrecedentCount increment
- Prior borrowing: model priors updated from episode outcomes for future simulations

---

### OPERATE — Agent Console

#### Agent Console
**Nav ID:** `operate` (also: `agents`) | **Status:** Built | **Component:** `src/pages/AgentConsole.jsx`
- 8-agent grid: Market Sentinel, Context Decoder, Content Architect, Quant Bridge, Decision Owner, Guardrail Guardian, Journey Executor, Learning System
- Agent activity feed (real-time log simulation)
- MCP connectors: Bloomberg, IRS/DOL regulatory feeds, HRIS termination feed, Behavior Radar
- Five-rail trust pipeline status
- Guided vs. Autopilot mode controls
- Autopilot Authorizations list: fiduciarySensitive overrides require explicit authorization entry

---

## Shared UI Components

| Component | Path | Purpose |
|---|---|---|
| KpiCard | `src/components/ui/KpiCard.jsx` | Metric display card with trend indicator |
| SectionHeader | `src/components/ui/SectionHeader.jsx` | Page section header with description |
| PovCallout | `src/components/ui/PovCallout.jsx` | POV highlight callout (teal background) |
| SignalCard | `src/components/ui/SignalCard.jsx` | Signal feed card with severity badge |
| AdvisorTwinCard | `src/components/ui/AdvisorTwinCard.jsx` | Route 1 advisor twin summary card |
| AgentStatusCard | `src/components/ui/AgentStatusCard.jsx` | Agent console card with status |
| InterventionCard | `src/components/ui/InterventionCard.jsx` | Intervention history record card |
| TrustRailBadge | `src/components/ui/TrustRailBadge.jsx` | Five-rail compliance status badge |
| SimResultPanel | `src/components/ui/SimResultPanel.jsx` | Monte Carlo simulation result display |

---

## WorkflowRunner Panel Types

| panelType | Component | Description |
|---|---|---|
| `signal_detection` | `SignalDetectionPanel.jsx` | VIX/signal data, confidence, analog precedents |
| `advisor_targeting` | `AdvisorTargetingPanel.jsx` | Cohort segmentation, tier breakdown, holdout definition |
| `content_channel_config` | `ContentChannelConfigPanel.jsx` | Content type and channel selection |
| `content_generation` | `ContentGenerationPanel.jsx` | Generated asset previews (article, email A/B, advisor brief) |
| `compliance` | `CompliancePanel.jsx` | Five-rail ERISA pipeline scan results |
| `simulation` | `SimulationPanel.jsx` | Monte Carlo scenarios A/B/C + do-nothing |
| `human_approval` | `HumanApprovalPanel.jsx` | Decision Owner gate — scenario selection, overrides |
| `deployment` | `DeploymentPanel.jsx` | Cohort segments, deployment records, frequency cap |
| `attribution` | `AttributionPanel.jsx` | Shapley attribution, holdout comparison, twin enrichment |
| `placeholder` | `PlaceholderPanel.jsx` | Used for UC-B through UC-E sub-steps |

---

## Data Files

| File | Records | Description |
|---|---|---|
| `src/data/signals.js` | 15 signals | Market volatility, regulatory, plan events, behavior radar |
| `src/data/episodes.js` | 5 episodes | Historical analog episodes with response curves |
| `src/data/participants.js` | 8 cohorts | Participant twin cohort objects (not individual records) |
| `src/data/sponsors.js` | 8 sponsors | Sponsor twin objects — Small/Mid-Market/Large tiers |
| `src/data/advisors.js` | 5 advisors | Route 1 external advisor twins (sponsor-level) |
| `src/data/usecases.js` | 5 use cases | Seed use cases with full WorkflowRunner panelData (UC-A) |
| `src/data/interventions.js` | 30 records | Cohort-level intervention records across 5 episodes |
| `src/data/funds.js` | 17 funds | Vanguard fund catalog (Target Date series, index, active) |
| `src/data/agents.js` | 8 agents | 8-agent system definitions |
| `src/data/ontologyEntities.js` | — | Ontology 3.0 entity types |
