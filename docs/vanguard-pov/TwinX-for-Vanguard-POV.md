# TwinX for Vanguard
## A Decision & Orchestration Intelligence Platform for US Workplace Retirement and Wealth Advisory

**Document type:** Unified Point of View (POV), Build Plan, and Feature User-Story Catalog
**Audience:** Vanguard executive buyers, Workplace Solutions leadership, Advisory leadership, Fiduciary & Compliance leadership, engineering and data-science leads
**Version:** v2.0 — Unified
**Date:** April 2026
**Base platform lineage:** Built on the TwinX Wealth Banking platform architecture (Sense → Plan → Measure → Govern; WorkflowRunner; Guided vs Autopilot modes; 8-agent system; Advisor Twin registry; Episode Simulator; Five-Rail Compliance; Shapley attribution; Content Asset Ecosystem; Ontology 3.0) — re-contextualized for Vanguard's US 401(k) and IRA/wealth advisory landscape.

---

## Table of Contents

1. Executive Summary
2. Why This Matters for Vanguard
3. Positioning & Scope
4. Guiding Principles
5. Platform Constructs Inherited from the TwinX Base
6. Capability Catalog — The What
7. The Two Anchor Journeys
8. How We Build It — Production-Grade Build Plan
9. Detailed Feature-Level User Stories
10. KPIs
11. Risks & Mitigations
12. Why Vanguard, Why Now
13. The Ask

---

## 1. Executive Summary

Vanguard's growth engine is not a marketing engine and it is not a product-push engine. It is a **decision engine**. AUM retention, participant outcomes, and sponsor loyalty are won or lost at a small number of high-consequence moments — a volatility spike, a rollover window, a hardship withdrawal consideration, a sponsor renewal cycle. Today these moments are reacted to, not orchestrated.

TwinX for Vanguard is a decision and orchestration intelligence platform that lets Vanguard **sense the moment, decide the right response, simulate outcomes before acting, enforce fiduciary guardrails, deploy with control, and prove impact** — across every participant, sponsor, and advisor journey.

It is built by reusing the TwinX Wealth Banking platform core — its agents, its WorkflowRunner, its Guided/Autopilot modes, its Twin Registry, its Episode Simulator, its Five-Rail Compliance pipeline, its Shapley attribution, its Content Asset Ecosystem, its UX patterns — and extending them with three Vanguard-specific capabilities: (1) a **Behavior Radar** that tracks the five participant behaviors that move outcomes most, (2) a **Rollover Moment Detector** that surfaces ERISA-safe, reaction-based decision windows, and (3) a **Fiduciary Guardian** that enforces education-vs-advice separation, disclosure rules, and contact policies before any recommendation reaches a cohort.

The promise in one line: *TwinX lets Vanguard move from reacting late to acting deliberately — sensing the right moment, choosing the right response, and proving impact — across every investor journey, without ever compromising trust.*

This unified POV details **what** the application is, **why** it matters for Vanguard specifically, **how** to build it — module by module, data contract by data contract, phase by phase — to production grade, and includes a **feature-level user-story catalog** to drive build planning.

---

## 2. Why This Matters for Vanguard

### 2.1 The real problem is not content — it is decision quality at scale

Vanguard already produces high-quality participant education, advisor materials, and sponsor communications. The gap is not at the creation layer. It is at the **decision layer**:

- Which of the twelve market signals today actually warrants a response?
- Which cohorts are receptive vs. which are already well-served?
- Is the right move education, a tool surface, optional advice access, or no action at all?
- Will the proposed action meet fiduciary tests and contact policy before it goes live?
- Did it actually move confidence, retention, or leakage — or are we measuring vanity engagement?

TwinX is the orchestration layer that answers these questions consistently, compliantly, and with institutional memory across every team.

### 2.2 Where AUM is won or lost (the rollover reality)

US workplace retirement is a B2B2C market where the **buyer is the plan sponsor** and the outcomes are decided by individual participants at a small number of rollover moments. Vanguard competes on trust, governance, simplicity at rollover moments, and retention — not on promotion.

The five rollover moments (job change, retirement, employer plan change, age thresholds, small-balance force-outs) concentrate the entire AUM battle into perhaps 3–5% of the participant lifetime. TwinX is designed to make Vanguard's response at these moments measurably better than the default (cash-out, roll to a competitor IRA, or inertia).

### 2.3 The fiduciary discipline is the moat

Most decision platforms optimize for conversion. Vanguard cannot, and does not want to. TwinX is the first decision platform designed with **"no action is a valid recommendation"** as a first-class outcome, and with **ERISA/QDIA/advice-vs-education separation** baked into the data model, not layered on as compliance afterthought. The Guardrail Guardian is the product.

### 2.4 The five behaviors that move outcomes (Behavior Radar)

Vanguard's own 2024–2026 *How America Saves* signal set identifies five participant behaviors that determine workplace outcomes: deferral changes, leakage (hardship withdrawals), Roth adoption, volatility/reactive trading, and digital engagement. TwinX tracks all five at cohort level, connects them to historical regime analogs (institutional memory), and surfaces where intervention timing materially changes the downstream outcome.

---

## 3. Positioning & Scope

### 3.1 What TwinX for Vanguard is

A single enterprise decision intelligence platform that orchestrates the full loop — **Sense → Experiment → Recommend → Simulate → Regulatory Check → Go-Live → Measure → Learn** — across two anchor journeys:

- **Journey A — Alert-Driven Content & Simulation.** Market or regulatory event → cohort-appropriate response → simulated impact → compliance-cleared deployment → measured outcome.
- **Journey B — Complexity-Driven Help Matching (401(k) × Wealth Advisory).** Participant complexity rises → optional help surfaces appear (education → tools → advice eligibility), never solicitation. Outcomes measured on confidence and long-term retention.

### 3.2 What TwinX for Vanguard is not

- Not a marketing automation platform.
- Not a lead scoring or prospecting engine.
- Not a recommendation engine that picks funds or predicts resignations.
- Not a replacement for Vanguard's recordkeeping or advisor systems — it is the decision layer that sits above them and orchestrates them.

### 3.3 Primary users

| User code | User | Role in the platform |
|---|---|---|
| WS | Workplace Solutions strategist | Owns signal definitions, hypotheses, cohort policies for participants |
| AL | Advisor / Advice leader (PAS, Digital Advisor, Advisor Alpha) | Owns Journey B hypotheses, advice eligibility and hand-off logic |
| CO | Fiduciary & Compliance officer | Owns guardrail rules, disclosures, contact policies, audit trail |
| DS | Data Science / Analytics lead | Owns signal models, cohort definitions, causal measurement |
| MO | Marketing & Content operations | Consumes approved scenarios, operates channel execution |
| EX | Executive sponsor (CMO / Head of Workplace / Head of Advice) | Owns portfolio of hypotheses, prioritization, outcome review |
| AD | External advisor (Route 1 sales model) | Consumes sponsor-level context & talking points; never individual leads |
| PO | Platform operator (SRE / admin) | Agent autonomy, model versions, connector health |

### 3.4 Scope boundaries

**In scope (v1–v2):** signal ingestion, Twin Registry (Participant/Sponsor/Advisor), hypothesis and scenario library, Episode Simulator + Monte Carlo, Five-Rail Compliance, Guided and Autopilot workflow modes, 8+2 agent orchestration, go-live across owned digital surfaces + advisor enablement, measurement with holdouts + Shapley attribution, institutional memory.

**Out of scope (initial phase):** external media buying, direct participant transactional actions, recordkeeping mutations, advisor CRM replacement, regulatory submission filing (display/export only), individual-level personalization (cohort-first), predictive-intent signals (reaction-based only).

---

## 4. Guiding Principles

The platform inherits the TwinX Wealth Banking operating principles and extends them with Vanguard-specific constraints.

1. **Business language first.** Technical detail by progressive disclosure. Every metric has one unambiguous definition across every surface.
2. **No action is a valid recommendation.** Simulation always includes a do-nothing baseline; "do nothing" can win.
3. **Reaction, not prediction, at the participant level.** TwinX never predicts resignations, scores individuals on non-consented signals, or uses social/external data. It reacts to first-party, event-driven signals.
4. **Education and advice are separate data objects.** They never mix in the same action payload without explicit advice eligibility and disclosure.
5. **Cohorts before individuals.** Every scenario begins at cohort level; individual personalization is a later, tightly-gated capability.
6. **Every non-terminal state has a next action.** No dead-end CTAs. No informational pages without a route forward.
7. **Past performance and forward-looking language are first-class content objects** with automatic disclosure attachment.
8. **Institutional memory is a product feature.** Every signal links to prior analog episodes; every scenario links to the outcomes of prior similar scenarios.
9. **The Guardrail Guardian is upstream of simulation.** A scenario that fails guardrails is never simulated, never previewed, never compared. Compliance is not a final gate; it is an upstream filter.
10. **Measurement uses causal attribution, not engagement vanity.** Holdouts, controls, confidence intervals, Shapley attribution, and long-horizon outcomes — not click-through.

---

## 5. Platform Constructs Inherited from the TwinX Base

Every major construct of the TwinX Wealth Banking platform is carried forward. The table below is the explicit inheritance contract — nothing invented here that already exists in the base; nothing lost in translation.

### 5.1 Workflow runtime constructs

| Base construct | Vanguard treatment |
|---|---|
| **Use Case catalog** — named, launchable multi-step pipelines | Kept as-is. Vanguard use cases include "Volatility response for advice-eligible cohort," "Roth adoption nudge for 40–50 age band," "Hardship leakage reduction," "Rollover-moment reaction (termination feed)," "Sponsor renewal enablement." |
| **WorkflowRunner** — step state machine with panelType, stage, actor, agent, advance/retreat, step locking | Kept. Stages map to Vanguard nav: SENSE / DECIDE / SIMULATE / GOVERN / DEPLOY / MEASURE / LEARN. |
| **ModeChoiceModal — Guided vs Autopilot** | Kept. Guided = every step approved. Autopilot = auto-advance between steps, mandatory pause at approval gates. Autopilot disabled by default for fiduciary-sensitive hypotheses. |
| **Approval gates** (Decision Owner, Deployment) | Kept, extended with a third mandatory **Fiduciary Guardian Gate** (ERISA / advice-vs-education attestation) before deployment. |
| **Step locking** after approval gates | Kept — prevents regression of already-approved scenarios. |
| **Agent scripts** — pre-authored per-panel messages with timings driving Autopilot pacing | Kept; rewritten in Vanguard voice. |
| **Conversation threading** (shared workflow state across panels) | Kept as-is. |

### 5.2 Agent system — 8 base agents + 2 Vanguard companions

| Agent | Model archetype | Vanguard role | Autonomy |
|---|---|---|---|
| **Market Sentinel** | LSTM autoencoder + BERT | Ingests market, macro, and regulatory signals (DOL/SEC/IRS, SECURE 2.0) | L5 |
| **Context Decoder** | Bayesian hierarchical + XGBoost 47-feature | Scores Participant, Sponsor, and Advisor Twins; matches signals → cohorts; surfaces analog episodes | L4 |
| **Orchestration Agent** | ReAct + LLM + Drools | Drives WorkflowRunner, resolves agent conflicts, manages transitions | L3 |
| **Quant Bridge** | Monte Carlo (1,000 iterations) + Bayesian updating | Simulates each scenario with P5/P50/P95 bands on engagement, confidence uplift, retention, AUM, cost | L4 |
| **Content Architect** | RAG + fine-tuned LLM + Thompson Sampling bandit | Generates participant education, advisor briefs, sponsor comms; A/B bandit per channel. Corpus: Vanguard approved library | L3 |
| **Guardrail Guardian** | Five-rail compliance engine | Runs the compliance pipeline (see 5.4); auto-corrects or escalates | L3 |
| **Journey Executor** | Deep Q-Network | Multi-channel deployment, per-cohort send-time, tier rollout, kill switch | L4 |
| **Learning System** | Causal inference + Shapley | Measures actual vs predicted vs holdouts; decomposes content contribution; retrains other agents | L4 |
| **Fiduciary Guardian** *(new for Vanguard)* | Rule engine + classifier | ERISA, advice-vs-education, plan-eligibility, rollover-moment reaction checks | L3 (always attested) |
| **Rollover Moment Validator** *(new for Vanguard)* | Rule engine | Ensures rollover actions are reaction-based (termination feeds, age thresholds), never predictive | L3 |

### 5.3 Twin Registry — advisors extended to participants and sponsors

The base platform's Advisor Twin construct — with **need-state 5-dim vector** (discover, evaluate, commit, implement, optimise), **Pathways archetype** (Optimizer / Collaborator / Protector / Builder / Balancer), **ETF adoption stage**, **twin confidence (0–1)**, and **data lineage per field** — is the most valuable asset and is expanded.

| Twin type | Source of fields | Vanguard use |
|---|---|---|
| **Participant Twin** *(new type)* | MDM, behavioral events, plan data | Need-state, retirement-readiness stage (Starter / Accumulator / Pre-Retiree / Retiree / Drawdown), archetype, plan eligibility, advice eligibility, account types |
| **Sponsor Twin** *(new type)* | Plan design, HR feeds, sponsor events | Plan design, QDIA choice, match formula, auto-features, renewal window, advisor-of-record, prior sponsor events |
| **Advisor Twin** | Base type retained | Scoped to Route 1 external advisors; sponsor-level only; never individual-lead generation |

All three twin types carry twin confidence, data lineage, intervention history, and are PII-tokenized in every scenario preview.

### 5.4 Five-Rail Compliance — re-mapped for Vanguard

The base platform's five rails are retained, rails re-mapped:

1. **ERISA & DOL fiduciary** — advice-vs-education classification; investment advice definition; prohibited transactions
2. **SEC Rule 482 / marketing rule** — performance claims, hypothetical performance
3. **Contact & frequency policy** — per-cohort caps, suppression lists, quiet periods, opt-out respect
4. **Brand voice** — cosine similarity against Vanguard approved library (base platform uses 97.3% threshold; retained as baseline)
5. **Disclosure completeness** — past-performance, forward-looking, QDIA, fee, plan-specific disclosures auto-attached

Outputs: pass / auto-correct / escalate, first-pass clearance rate, item-level findings. UX pattern unchanged from base.

### 5.5 Episode Simulator & Quant Bridge — kept verbatim

1,000-iteration Monte Carlo with Box-Muller sampling, L-BFGS-B optimization, per-channel saturation curves (14-point), P5/P50/P95 AUM confidence intervals, three output scenarios (A recommended, B aggressive, C lean). Retained exactly.

### 5.6 Content Asset Ecosystem — kept, content-class gated

Base asset types (article, email A/B, advisor/wholesaler brief, portal hub, PDF, social post, podcast, conversation guide, 30-second video) all retained. LoRA + RLHF fine-tuning, Thompson Sampling bandit retained. Every asset carries a **content class** (education / advice / marketing / regulatory) that gates cohort-channel eligibility and drives disclosure attachment.

### 5.7 Ontology 3.0 — kept, extended

Advisor, Client, Fund entities retained with twin confidence and data lineage. Vanguard adds **Plan**, **Rollover-Moment**, and **Hypothesis** as first-class entities under the same discipline.

### 5.8 Shapley outcome attribution — kept, outcome set remapped

Shapley decomposition of asset contribution to outcomes is retained. Outcome set for Vanguard: panic-reallocation reduction, deferral uplift, help uptake, rollover retention, long-horizon retention.

### 5.9 UX patterns — retained one-to-one

Mode Choice Modal, Agent Chat Panel (drawer), Agent Narrator Strip, Handoff Banner, Visited Agent Chain, Step Transition Animation, Scenario Comparison cards, Five-Rail Compliance visualization, Shapley horizontal bars, Need-State radar — **all retained** with Vanguard theming.

### 5.10 Pages — mapping base to Vanguard

| Base page | Vanguard equivalent |
|---|---|
| SenseDashboard | SenseDashboard (adds regulatory + sponsor-event sub-tabs) |
| MarketSignals | MarketSignals (+ regulatory / sponsor-event tabs) |
| AdvisorTwinRegistry | **TwinRegistry** (Advisor / Participant / Sponsor tabs) |
| EpisodeSimulator | EpisodeSimulator |
| QuantBridge | QuantBridge |
| ContentEngine | ContentEngine (content-class gated) |
| CampaignOrchestration | DeployOrchestration |
| GovernDashboard | GovernDashboard (adds Fiduciary Guardian queue) |
| OutcomeAttribution | OutcomeAttribution (Vanguard outcome set) |
| TwinEnrichment | TwinEnrichment (all three twin types) |
| DeployLearnDashboard | DeployLearnDashboard |
| AgentConsole | AgentConsole (10 agents) |
| TrustCompliance | TrustCompliance (ERISA + SEC + DOL + IRS) |
| Operations | Operations |

### 5.11 Workflow panels — retained one-to-one

SignalDetectionPanel, CohortTargetingPanel (renamed from AdvisorTargetingPanel), ContentChannelConfigPanel, ContentGenerationPanel, SimulationPanel, DecisionApprovalPanel, CompliancePanel, DeploymentPanel, AttributionPanel.

---

## 6. Capability Catalog — The What

### 6.1 Sense Layer

| Capability | Description | Examples |
|---|---|---|
| Market signal ingestion | Volatility, rates, asset-class stress, macro | VIX regime break, 10Y move > 25bps/week |
| Regulatory signal ingestion | SECURE 2.0, DOL, IRS, SEC, QDIA changes | Catch-up limit changes, fiduciary rule |
| Behavioral signal ingestion | First-party, event-driven only | Login spikes, tool abandonment, allocation checks |
| Eligibility signal ingestion | Plan- and participant-level milestones | Age 50/59½/73, vesting, balance thresholds |
| Sponsor event ingestion | Employer-level events | Plan conversion, M&A, layoff, plan amendment |
| Signal classification | Severity, urgency, audience, confidence | Machine-readable tags |
| Analog matching | Historical analog episodes with outcomes | "Feb 2018 vol spike, panic reallocation 2.3× baseline" |

### 6.2 Behavior Radar

Always-on dashboard tracking five behaviors with cohort slicer, plan-design slicer, historical analog inlay, and "Start experiment" CTA into the hypothesis registry: **deferral changes**, **leakage**, **Roth adoption**, **volatility/reactive trading**, **digital engagement**.

### 6.3 Hypothesis Library

Every experiment is a named hypothesis with outcome, allowed actions, disallowed actions, owners, cohort scope, fiduciary-sensitivity tag. Versioned, retirable, linked to every scenario run and outcome.

### 6.4 Recommendation Engine (action options, not actions)

Given a signal + hypothesis, Context Decoder + Orchestration generate candidate scenarios (cohort × action type × channel mix × timing). Always includes "no action" as first-class option.

### 6.5 Episode Simulator + Quant Bridge (Monte Carlo)

1,000-iteration simulation per scenario, three output variants (A recommended / B aggressive / C lean), per-channel saturation curves, P5/P50/P95 CIs, drivers explainability, do-nothing baseline always shown.

### 6.6 Guardrail Guardian + Fiduciary Guardian (Five-Rail Compliance)

Upstream filter before simulation, final gate before deployment. Rules as code. Auto-corrects simple violations, escalates complex ones, first-pass clearance reported.

### 6.7 Decision Approval Gate + Fiduciary Guardian Gate + Deployment Gate

Three mandatory human gates. Autopilot pauses at all three. Each gate attaches an immutable evidence packet.

### 6.8 Content Architect (Asset Ecosystem)

Generates 8 asset types, archetype-aware copy, content-class tagged, bandit-optimized A/B, cosine brand-voice scored, disclosure auto-attached.

### 6.9 Journey Executor (Deploy)

Tier rollout (10% → 40% → 100%) with automated stop rules. Per-cohort send-time via DQN. Advisor briefs distributed 24h before participant deploy. Universal kill switch.

### 6.10 Learning System

Outcome measurement vs holdouts, Shapley attribution, analog weight recalibration with human gate, signal-severity recalibration, post-mortem templates, Playbook Registry for winning patterns.

### 6.11 Twin Registry + Twin Enrichment

Participant, Sponsor, and Advisor Twins. Need-state radars, archetypes, stages, confidence, lineage. Batch enrichment from MDM, behavioral events, sponsor feeds.

### 6.12 Agent Chat & Orchestration UX

Live agent chat drawer per panel. Agent Narrator Strip summarizes what the active agent is doing. Handoff Banner on agent transitions. Visited Agent Chain breadcrumb. Every chat message audited.

### 6.13 Agent Console

All 10 agents with autonomy level, MCP connector status, recent decisions, scope, rollback. Autonomy-level changes are role-restricted and audited.

### 6.14 Govern Dashboard + Immutable Audit Trail

Fiduciary Guardian queue, Compliance escalate queue, Approvals queue with SLA timers. Every option, simulation, guardrail result, approval, deployment, kill, and agent message is cryptographically signed and appended to an immutable store.

### 6.15 Institutional Memory + Playbook Registry

Natural-language query across all historical signals, hypotheses, scenarios, outcomes. Winning patterns promotable to Playbooks that become launchable use cases.

### 6.16 Operations

System health, connector health, batch-job queue, SLO dashboards, data-lineage + twin-confidence operational metrics.

---

## 7. The Two Anchor Journeys

### 7.1 Journey A — Alert-driven content and simulation

**Trigger:** market volatility spike + observed behavior spike.

1. **Sense.** Market Sentinel detects vol + login surge + tool-usage jump. Context Decoder surfaces two analogs (Feb 2018, Mar 2020).
2. **Launch.** Strategist opens Use Case catalog, picks "Volatility response," ModeChoiceModal offers Guided (default) or Autopilot.
3. **Experiment.** Hypothesis selected from registry: *"Timely explanation + confidence framing reduces reactive reallocation vs. education alone."*
4. **Recommend.** Context Decoder proposes cohorts (self-directed readers, retirement-focused on-track, advice-eligible unengaged). "No action" included for already-well-served cohorts.
5. **Simulate.** Quant Bridge runs 1,000 iterations on three scenarios + do-nothing baseline. Education + confidence tools projected to reduce panic reallocation by 22% ± 7% over 14 days in the advice-eligible unengaged cohort.
6. **Guardrail Guardian.** Five rails run; disclosures attached; advisor brief flagged for advisor review; frequency cap respected. Auto-correct on one rail.
7. **Decision Approval Gate.** Strategist approves scenario A with an override note.
8. **Fiduciary Guardian Gate.** Compliance attests advice-vs-education classification and disclosure packet.
9. **Deploy.** Journey Executor rolls out Tier-1 10% → stop-rule monitoring; holdout locked; advisor briefs distributed 24h earlier.
10. **Measure.** Learning System computes realized panic reallocation delta vs holdout; Shapley decomposes content contribution.
11. **Learn.** Winning pattern promoted to Playbook Registry; analog weights recalibrated.

### 7.2 Journey B — Complexity-driven help matching (401(k) × Wealth Advisory)

**Framing:** complexity-detection and help-matching, never upsell. **Trigger:** rising plan complexity indicators — balance growth, repeated "what should I do?" interactions, age-threshold proximity, volatility context.

1. **Sense.** Complexity indicators cross cohort threshold. Advice-eligibility verified from sponsor plan data.
2. **Experiment.** *"When complexity rises, optional guidance surfaces improve confidence and long-horizon retention without lifting solicitation metrics (which are disallowed)."*
3. **Recommend.** Eligible participants only. Action types: tools, education, optional advice availability. No solicitation language.
4. **Simulate.** A: tools only. B: tools + optional advisor access surface. C: digital only. Measured on confidence, task completion, 1-year retention.
5. **Guardrail + Fiduciary Gates.** Advice-vs-education enforced; plan eligibility verified; "optional" language compliance-reviewed; disclosures attached.
6. **Deploy.** Message pattern: *"If things feel more complex, here are ways Vanguard can help."* Advisor sees context, never a lead.
7. **Measure.** Help uptake, satisfaction, long-term retention. Conversion tracked only where explicitly permitted.
8. **Learn.** Complexity thresholds and eligibility logic refined.

---

## 8. How We Build It — Production-Grade Build Plan

### 8.1 Architecture inherited from TwinX Wealth Banking

TwinX for Vanguard **reuses the base platform's architecture** and re-skins/extends it. This is not a fork — it is a Vanguard-specific instantiation.

| Element | Inherited | Vanguard extension |
|---|---|---|
| Navigation: Sense → Plan → Measure → Govern | Yes | Renamed: Sense → Decide → Simulate → Govern → Deploy → Measure → Learn → Operate |
| React 18, Mantine 8, Recharts, Day.js, Tiptap, Vite, Firebase, Claude LLM | Yes | Swap Firebase for enterprise backend; add Snowflake/BigQuery; MDM connector; Kafka; Vertex/SageMaker |
| 20 base platform specialist review agents | Yes | Add 3 Vanguard-specific: `erisa-fiduciary-auditor`, `rollover-moment-validator`, `advice-education-boundary-auditor` |
| Metric contract discipline | Yes | Vanguard KPI dictionary with ERISA-aware definitions |
| Design system (Mantine tokens, background wash rules, toast pattern) | Yes | Vanguard theme via Mantine token layer; component contracts unchanged |
| Explainability, optimization objectives, dead-end prevention, traceability matrix, trust regression checklist | Yes | Extended with guardrail-specific regression items |

**Vanguard top navigation:**

- **SENSE** — Market / regulatory / behavioral / sponsor signals; Behavior Radar; analog library
- **DECIDE** — Hypothesis library; recommendation engine; scenario authoring; Use Case catalog
- **SIMULATE** — Scenario comparison; do-nothing baseline; explainability; guardrail pre-check
- **GOVERN** — Guardrail Guardian + Fiduciary Guardian queues; approvals; audit trail; disclosures
- **DEPLOY** — Tier rollout; channel orchestration; advisor enablement; kill switch
- **MEASURE** — Holdouts, causal attribution, Shapley, short/long horizon outcomes
- **LEARN** — Institutional memory; Playbook Registry; analog calibration; post-mortems
- **OPERATE** — Agent Console; model management; policy editor; system health

### 8.2 Module breakdown

| Module | Stage | Summary |
|---|---|---|
| `use-cases` | DECIDE | Named launchable pipelines; ModeChoiceModal entry |
| `workflow-runner` | cross | Step state machine; advance/retreat; step locking; agent scripts driving Autopilot pacing |
| `signals` | SENSE | Ingestion connectors; taxonomy editor; classifier; analog matcher |
| `behavior-radar` | SENSE | One dashboard per behavior; slicer; analog inlay; experiment CTA |
| `twin-registry` | SENSE | Participant / Sponsor / Advisor tabs; need-state radar; lineage |
| `twin-enrichment` | OPERATE | Batch refresh; scheduled + on-demand; rollback |
| `hypotheses` | DECIDE | Registry, editor, tagging, versioning, retirement |
| `recommender` | DECIDE | Option generator including "no action"; analog enrichment |
| `scenarios` | DECIDE | Authoring surface; contract-enforced required fields |
| `simulator` | SIMULATE | Monte Carlo; 3 scenarios + baseline; drivers; snapshot |
| `quant-bridge` | SIMULATE | Response curves; saturation; cost model |
| `guardrails` | GOVERN | Five-rail pipeline; rule editor; pre-sim + pre-deploy runners |
| `fiduciary-guardian` | GOVERN | ERISA + advice-vs-education + rollover-moment checks; attestation gate |
| `approvals` | GOVERN | Queues, evidence packets, immutable ledger |
| `content-engine` | DEPLOY | LoRA + RLHF + bandit; content class; brand-voice scoring |
| `deploy` | DEPLOY | Tier rollout; Journey Executor DQN send-time; advisor lead-time |
| `kill-switch` | DEPLOY | One-click pause; reason capture; audited |
| `measure` | MEASURE | Holdouts; causal attribution; Shapley; windows |
| `learn` | LEARN | Institutional memory browser; Playbook Registry; calibration |
| `agent-console` | OPERATE | 10-agent management; autonomy; rollback |
| `audit-trail` | cross | Immutable, signed, queryable |
| `operate` | OPERATE | Health, connectors, SLOs, runbooks |

### 8.3 Data contracts

Seven core entities, each with stable IDs and cross-links enabling end-to-end lineage:

| Entity | Key fields |
|---|---|
| **Signal** | id, sourceClass, firedAt, severity, urgencyWindowHours, impactedAudiences[], confidence, analogIds[], features |
| **Cohort** | id, name, definition (versioned DSL/SQL), size, eligibilityFlags[], lastRefreshedAt |
| **Twin** (Participant/Sponsor/Advisor) | id, type, need-state 5-dim, archetype, stage, twinConfidence, dataLineage[] per field, interventionHistory[] |
| **Hypothesis** | id, title, outcome, allowedActions[], disallowedActions[], journeys[], owners{business, compliance}, fiduciarySensitive, status, version, linkedScenarios[] |
| **Scenario** | id, hypothesisId, signalId, cohortId, actionType, channelMix[], timingWindow, disclosures[], contentClassSet[], state |
| **SimulationRun** | id, scenarioId, baselineId, outputs{engagementDelta, confidenceUplift, retention90d, estCost, regretWorstCase} each with CIs, drivers[], createdAt |
| **GuardrailResult** | scenarioId, pass, checks[] per rule with pass/detail/auto-correct/escalate |
| **Outcome** | scenarioId, holdoutId, horizonDays, measured metrics with lift CIs, shapleyByAsset[], verdict |

### 8.4 Tech stack

| Layer | Choice | Rationale |
|---|---|---|
| UI | React 18 + Mantine 8 + Recharts/Mantine Charts | Inherited |
| State | TanStack Query / RTK Query | Enterprise data volumes require server cache |
| Backend | Node/TypeScript + Python (model services) on Kubernetes | Vanguard infra alignment |
| Warehouse | Snowflake or BigQuery | Signal aggregation, cohort SQL, holdout analytics |
| Event bus | Kafka / Pub-Sub | First-party behavioral events |
| MDM | Vanguard participant/plan master | Single source of eligibility |
| ML serving | Vertex AI or SageMaker + internal registry | Uplift, analog matching, classifier lifecycle |
| LLM | Claude via compliance-scoped prompt library | Explainability, driver generation, hypothesis drafting — never free-form advice |
| Auth | Enterprise SSO (SAML/OIDC) + RBAC | Role-scoped access |
| Audit trail | Immutable append-only (QLDB or event-sourced Postgres) | Regulatory defensibility |
| Observability | Datadog / cloud equivalent | SLOs, alerting |
| Security | PII tokenization, field-level encryption, KMS | Participant data protection |

### 8.5 Compliance integration strategy

1. **Rule-as-code.** Every fiduciary and plan-policy rule is machine-readable; legal-approved text attached as evidence.
2. **Content classification at creation.** Education / advice / marketing / regulatory — classification drives downstream rule execution.
3. **Disclosure auto-attachment.** Authors cannot forget.
4. **Advisor-vs-participant payload separation.** Architectural, not procedural.
5. **Immutable audit trail** for every option, simulation, guardrail, approval, deploy, kill.
6. **Compliance has a named seat** in the platform, authors rules, real-time queues.

### 8.6 Phased sequencing

| Phase | Window | Scope |
|---|---|---|
| **Phase 0 — Foundation** | Weeks 1–6 | Infra, SSO, MDM connector, event bus, base platform re-skin to Vanguard; WorkflowRunner shell; ModeChoiceModal; Agent Console with 10 agents stubbed; Twin Registry shell (Participant + Sponsor tabs); Sense skeleton with one live signal class (market vol); Behavior Radar shell with two behaviors (leakage, vol reactivity); audit trail backbone; one Guardrail rail (disclosure) active |
| **Phase 1 — MVP Journey A** | Weeks 7–16 | Use Case catalog (3 seeds); Guided mode end-to-end; agent scripts for 6 agents; Twin Enrichment v1; all 5 rails active; Fiduciary Guardian Gate live; Simulator v1; Content Engine v1; one end-to-end Journey A scenario in production with holdouts + Shapley v1 |
| **Phase 2 — Autopilot + Journey B** | Weeks 17–28 | Autopilot enabled for non-fiduciary-sensitive hypotheses; remaining agents live; eligibility + sponsor-event signal classes; advice-eligibility logic and advisor enablement; all Behavior Radar behaviors; second journey live; Institutional Memory v1; Playbook Registry; long-horizon outcome tracking |
| **Phase 3 — Learning loop & scale** | Weeks 29–44 | Analog calibration from realized outcomes; uplift modeling promoted; regulatory signal class full coverage; multi-journey orchestration; advanced simulator (regret, long-horizon AUM); post-mortem templates; portfolio-level scorecards |
| **Phase 4 — Enterprise** | Weeks 45+ | Multi-sponsor segmentation; cross-team hypothesis portfolio mgmt; exec decision cockpit; continuous compliance rule evolution with versioned history |

### 8.7 Team shape

| Function | Shape |
|---|---|
| Product | 1 lead + 2 PMs (Sense/Decide, Simulate/Govern) |
| Engineering | 1 eng lead, 6 full-stack (React/TS/Node), 3 data/backend (Python/SQL), 2 ML, 1 SRE/DevOps |
| Design | 1 lead + 2 product designers + 1 content/UX copy |
| Data Science | 1 lead + 3 ICs (causal, uplift, analog) |
| Compliance & fiduciary | 1 embedded fiduciary SME + 1 compliance PM |
| Domain (Vanguard) | 1 Workplace Solutions SME, 1 Advice SME |

### 8.8 Review gates

Every phase passes through the inherited 20-agent specialist review loop plus the 3 Vanguard-specific auditors. Findings tracked to closure in the CHANGELOG pattern from the base.

---

## 9. Detailed Feature-Level User Stories

Stories are organized by feature. Each has role, goal, rationale, and acceptance criteria.

### 9.1 Guided vs Autopilot Mode

**US-GAM-01** — *As WS*, I want to choose Guided or Autopilot mode at use-case launch so I can match oversight to hypothesis risk.
- ModeChoiceModal appears at every use-case launch; default is Guided; Autopilot disabled by default for fiduciary-sensitive hypotheses; selection logged with user ID.

**US-GAM-02** — *As WS*, I want Autopilot to auto-advance between non-gate steps with visible agent messages so I can monitor without clicking.
- Pacing derived from agent script message timings, minimum 2s per step; progress bar visible; agent narrator strip on each step; last-advance-time shown.

**US-GAM-03** — *As CO*, I want Autopilot to hard-pause at all three gates (Decision Approval, Fiduciary Guardian, Deployment) regardless of mode.
- isGate=true steps never auto-advance in Autopilot; "Autopilot paused — action required" banner; resume requires explicit approval.

**US-GAM-04** — *As WS*, I want to switch from Autopilot to Guided mid-run without losing state.
- Mode toggle visible during run; switch instant; current step state preserved; switch logged to audit trail.

**US-GAM-05** — *As CO*, I want a list of hypotheses authorized for Autopilot, with approver and effective date, so the autonomy envelope is governable.
- Operations → Autopilot Authorizations page; requires compliance role to add/remove; versioned.

### 9.2 Use Case & WorkflowRunner

**US-WR-01** — *As WS*, I want to launch a use case from a catalog of named pipelines so I start from a compliant template.
- Use-case catalog page; cards show title, stages, typical cohort, compliance notes; "Launch" opens ModeChoiceModal.

**US-WR-02** — *As WS*, I want advance/retreat navigation with disabled states at boundaries.
- Advance disabled until required fields valid; retreat disabled before step 0; states visually clear.

**US-WR-03** — *As WS*, I want steps to lock after approval gates.
- Steps 0–N locked after Decision Approval; warning toast on attempted retreat; override requires a new run.

**US-WR-04** — *As WS*, I want workflow state persisted per session so I can resume later.
- Session-scoped state persisted server-side; "Resume" on use-case card; expires after 30 days.

### 9.3 Agent Chat, Narrator Strip, Handoff Banner, Visited Chain

**US-AGX-01** — *As WS*, I want a live agent chat drawer accessible from every panel.
- Right-side drawer; prior messages with collapse/expand; markdown rendering; agent identity/color/icon; persists within run.

**US-AGX-02** — *As WS*, I want an Agent Narrator Strip summarizing what the agent is doing and why.
- Strip shows agent icon (active pulse), narrative excerpt (<120 chars), stage badge; click opens chat drawer.

**US-AGX-03** — *As WS*, I want a visible Handoff Banner on agent transitions.
- Animates on transition; from-agent, one-line context, to-agent; gradient blends colors; dismissible.

**US-AGX-04** — *As WS*, I want a breadcrumb of visited agents across the run.
- Visited-agent chain at top of Runner; icons tooltipped; current agent is full badge.

**US-AGX-05** — *As CO*, I want every agent chat message archived to audit trail.
- Messages saved with timestamp, agent ID, user ID, use-case ID; exportable.

### 9.4 Signal Detection (Sense)

**US-SIG-01** — *As WS*, I want today's signals ranked by severity × urgency × confidence.
- Signals board sorts by composite; filter by sourceClass; row shows composite + components.

**US-SIG-02** — *As WS*, I want every signal linked to analog episodes and their outcomes.
- Signal detail shows analogIds + "What happened last time"; click to open Episode Simulator preloaded.

**US-SIG-03** — *As DS*, I want to register a new signal class with schema + classifier + severity rules without code changes.
- Operations → Signal Taxonomy editor; versioned; DS + compliance role; dry-run before enable.

**US-SIG-04** — *As CO*, I want rollover-moment signals to be reaction-based, never predictive.
- sourceClass=rollover-moment enforces reaction-based source tags; predictive sources blocked at taxonomy level; versioned.

### 9.5 Behavior Radar

**US-BR-01** — *As WS*, I want a Radar page showing baseline, trend, and cohort slicer per behavior.
- Tabs for 5 behaviors; cohort + plan-design slicers; historical analog inlay.

**US-BR-02** — *As WS*, I want a "Start an experiment" CTA on each Radar tile that pre-fills the hypothesis.
- CTA opens use-case launcher with behavior + cohort pre-selected; hypothesis dropdown filtered.

### 9.6 Hypothesis Library

**US-HYP-01** — *As WS*, I want to author a hypothesis with outcome, allowed/disallowed actions, owners, cohort scope.
- Form with required fields + validation; save as draft or submit; links to use-case launch.

**US-HYP-02** — *As CO*, I want fiduciary-sensitive tagging so Autopilot is auto-disabled and approval includes compliance.
- Tag drives mode + approval routing; versioned.

**US-HYP-03** — *As EX*, I want a portfolio view of active hypotheses with status, runs, wins, losses.
- Table with sort/filter; wins = measured + at 95% CI; losses = negative or null; archived included.

### 9.7 Twin Registry & Enrichment

**US-TWIN-01** — *As WS*, I want a Participant Twin view with need-state vector, retirement-readiness stage, archetype, plan eligibility, twin confidence.
- Twin card with all fields; need-state radar; last-updated timestamp; lineage per field.

**US-TWIN-02** — *As DS*, I want a Twin Enrichment batch runner.
- Operations → Twin Enrichment; scheduled + on-demand; run logs; confidence changes visible per twin; 24h rollback.

**US-TWIN-03** — *As CO*, I want twins to never expose raw PII to scenario previews.
- Cohort IDs and counts only; pen-test verified; access control enforced.

**US-TWIN-04** — *As AL*, I want Advisor Twin scoped to Route 1 external advisors — sponsor-level only.
- Advisor twin fields restricted to firm + sponsor-book context; no participant-level fields.

**US-TWIN-05** — *As AL*, I want Sponsor Twins with plan-design, demographics, QDIA, renewal window, prior events.
- Sponsor twin page; fields + lineage; renewal-window countdown on home.

### 9.8 Cohort Targeting

**US-COH-01** — *As WS*, I want to define cohorts with a DSL/SQL expression, size preview, versioned history.
- Cohort editor with dry-run size; version history; reused cohorts flagged; audited.

**US-COH-02** — *As DS*, I want CohortTargetingPanel to score the cohort via Context Decoder with tier breakdown + holdout slider.
- Inline scoring; T1/T2/T3 split visible; holdout slider (default 10%); holdout locked on deployment.

**US-COH-03** — *As CO*, I want cohort definitions pre-checked against eligibility guardrails before targeting is finalized.
- Pre-check runs audience-eligibility, plan-constraints, frequency-cap; failures return actionable reasons.

### 9.9 Content Engine

**US-CE-01** — *As MO*, I want to generate asset variants (article, email A/B, advisor brief, portal hub, PDF, social, podcast, conversation guide, 30s video) with archetype-aware copy.
- Generation per angle + channel; 200+ variant gallery; filter by channel/angle/variant; every asset carries content class.

**US-CE-02** — *As CO*, I want every asset tagged education / advice / marketing / regulatory at generation.
- Content class required before save; class drives disclosure attachment, cohort-channel eligibility, advice-boundary gate.

**US-CE-03** — *As MO*, I want Thompson Sampling to select among email A/B variants during deploy.
- Bandit enabled per cohort-variant pair; exploration rate configurable; outcomes feed back to Learning System.

**US-CE-04** — *As CO*, I want generation corpus restricted to Vanguard-approved library with brand-voice scoring.
- Corpus whitelist; per-asset brand-voice cosine score; threshold blocks save; threshold versioned by Compliance.

### 9.10 Episode Simulator & Quant Bridge

**US-SIM-01** — *As WS*, I want 1,000-iteration Monte Carlo outputting 3 scenarios (A/B/C) with P5/P50/P95 CIs on engagement, confidence, retention, AUM, cost.
- SimulationPanel runs inline with progress bar; scenario cards; drivers panel; do-nothing baseline always included.

**US-SIM-02** — *As WS*, I want per-channel response curves visible.
- Saturation curves per channel with cohort-size markers; asymptote labeled; editable channel mix updates curves.

**US-SIM-03** — *As DS*, I want to snapshot a simulation run (inputs + outputs + drivers) into the approval packet.
- Snapshot action attaches to scenario; read-only once taken; downloadable PDF.

**US-SIM-04** — *As EX*, I want the simulator to rank by ROI with confidence and mark low-confidence wins as "insufficient evidence".
- Ranking rule documented; low-CI scenarios flagged; "insufficient evidence" treated as do-nothing equivalent.

### 9.11 Five-Rail Compliance (Guardrail Guardian)

**US-FR-01** — *As CO*, I want five-rail scan on every scenario: ERISA/DOL, SEC 482, contact frequency, brand voice, disclosure.
- CompliancePanel shows each rail with status, count, first-pass clearance rate; auto-correct diffs preview; escalations queued.

**US-FR-02** — *As CO*, I want to author/version rules in each rail as machine-readable artifacts with approved legal text attached.
- Rule editor per rail; version history; legal-text evidence required; dry-run activation.

**US-FR-03** — *As WS*, I want scenarios that fail any rail blocked before simulation.
- Failures halt pipeline; actionable remediation returned; no simulation compute spent; event logged.

**US-FR-04** — *As CO*, I want an advice-vs-education boundary rail that validates content-class tag vs payload language.
- NLP classifier scores language against declared class; threshold configurable; drift escalates to Compliance.

### 9.12 Decision Approval, Fiduciary Guardian, Deployment Gates

**US-DA-01** — *As WS*, I want a DecisionApprovalPanel presenting 3 scenarios + do-nothing with all outputs, compliance status, override text, recommend/override actions.
- Panel renders once required fields are present; override text required if overriding; approval signs evidence packet.

**US-DA-02** — *As CO*, I want a Fiduciary Guardian Gate after Decision Approval requiring attestation of advice-vs-education and disclosure completeness.
- Attestation checklist; immutable signature; no bypass even in Autopilot.

**US-DA-03** — *As EX*, I want my pending approvals in one queue with pre-assembled evidence packets.
- Approvals page; filter by role/cohort/hypothesis/compliance status; packet one click away; no bulk actions.

### 9.13 Deploy Orchestration & Kill Switch

**US-DEP-01** — *As MO*, I want tier rollout (10% → 40% → 100%) with automated stop rules on guard-metric breach.
- Rollout plan configurable per scenario; stop rules from hypothesis; pause auto-triggers kill switch with logged reason.

**US-DEP-02** — *As MO*, I want Journey Executor to apply per-cohort send-time across channels.
- DQN send-time runs; per-cohort timing shown; manual overrides allowed with logged reason.

**US-DEP-03** — *As CO*, I want a universal kill switch on every live scenario.
- Kill button in Deploy/Measure views; requires role, reason category, free-text; immediate action; audited.

**US-DEP-04** — *As AL*, I want advisor briefs distributed 24h before participant deploy.
- Lead-time rule; advisor channel offset configurable per scenario; validated at deploy.

### 9.14 Outcome Attribution & Shapley

**US-ATT-01** — *As DS*, I want holdouts defined at scenario creation and locked at deployment.
- Holdout size locked with scenario; modifications require a new scenario; holdout IDs immutable.

**US-ATT-02** — *As WS*, I want AttributionPanel with engagement/action/AUM outcomes at 7/30/90-day + 1-year, treatment vs holdout, CI bars.
- Windows configurable per hypothesis; default 30/90/365; CIs always shown; null results explicit.

**US-ATT-03** — *As EX*, I want Shapley decomposition of content contribution per outcome.
- Horizontal bar chart of Shapley values per asset; total adds to measured lift; exportable.

**US-ATT-04** — *As WS*, I want a post-mortem template auto-generated for every completed scenario.
- Template populated from run data; editable; required before archival.

### 9.15 Learning System & Institutional Memory

**US-LS-01** — *As DS*, I want realized outcomes to recalibrate analog weights and signal severity with a human-approval gate.
- Calibration batch produces diff; reviewer approves/rejects; approved updates deploy with rollback.

**US-LS-02** — *As WS*, I want an Institutional Memory browser with NL query across signals/hypotheses/scenarios/outcomes.
- LLM search over structured metadata + outcome summaries; linked to sources; exportable.

**US-LS-03** — *As WS*, I want winning patterns promoted to a Playbook Registry.
- "Promote to Playbook" button; playbook has owner, approved-mode flag, compliance notes; launchable as new use case.

### 9.16 Agent Console

**US-AC-01** — *As PO*, I want Agent Console listing all 10 agents with autonomy level, MCP connector status, recent decisions, last-run, scope.
- Per-agent card with status chip, decision log, scope list, rerun action.

**US-AC-02** — *As CO*, I want autonomy-level changes role-restricted with full audit.
- Autonomy editor restricted to admin + compliance; logs include before/after, reason, approver.

**US-AC-03** — *As PO*, I want one-click rollback to prior good model/agent version.
- Version history per agent; rollback audited; post-rollback health check.

### 9.17 Govern Dashboard & Audit Trail

**US-GOV-01** — *As CO*, I want Govern Dashboard with Fiduciary Guardian queue, Compliance escalate queue, Approvals queue + SLA timers.
- Three-column view; SLA timers; overdue items escalate; filters by hypothesis/cohort/use-case.

**US-GOV-02** — *As CO*, I want an immutable audit trail of every option, simulation, guardrail result, approval, deployment, kill, and agent message.
- Append-only store; cryptographic signatures; query UI; export to PDF/CSV.

**US-GOV-03** — *As EX*, I want a quarterly audit-defensibility score on the exec view.
- Score computed nightly; definition documented; drill-down to missing-lineage items.

### 9.18 Trust & Compliance Reference Center

**US-TC-01** — *As CO*, I want a reference center with ERISA/DOL/SEC/IRS framework summaries linked to guardrail rules.
- Rules reference live legal text versions; link-check on save; reviewer sign-off on updates.

### 9.19 Operations

**US-OPS-01** — *As PO*, I want Operations to show pipeline health, connector status, batch-job queue, SLOs.
- Real-time status; alerting thresholds; on-call rota; runbook links per alert.

**US-OPS-02** — *As PO*, I want data lineage and twin-confidence health metrics visible operationally.
- Per-entity confidence distributions; connectors with low freshness flagged; lineage-break alerts.

### 9.20 Accessibility & Theming

**US-AX-01** — *As any user*, I want WCAG 2.1 AA compliance across all panels.
- Axe audit green on primary flows; keyboard nav complete; color not the only channel of meaning.

**US-AX-02** — *As WS*, I want Vanguard-themed color tokens without disrupting Mantine component contracts.
- Vanguard theme via Mantine token layer; component APIs unchanged; regression tests pass.

---

## 10. KPIs — How We Measure TwinX Itself

| KPI | Definition | Phase 1 target |
|---|---|---|
| Decision turnaround time | Signal → approved scenario deployed | < 72h high-severity, < 10d routine |
| Do-nothing rate | % of scenarios where baseline wins | > 15% (honesty indicator) |
| Guardrail block rate at authoring | % blocked before simulation | Monitored (health metric) |
| Guardrail block rate at approval | % blocked at final gate | Declining over time |
| Hypothesis win rate with CI | % of hypotheses with measured + outcomes at 95% CI | Baseline in Phase 1 |
| Causal uplift delivered | Sum of causally-attributed outcome lift | Reported quarterly |
| Retention / AUM impact (long horizon) | 1-year retention and AUM deltas vs holdouts | Tracked from Phase 2 |
| Analog recall | % of new signals surfacing relevant analogs | > 80% at Phase 2 exit |
| Advisor brief adoption | % of relevant cohort scenarios using advisor brief | > 60% at Phase 2 exit |
| Autopilot safe-run rate | % of Autopilot runs completing without kill or rail breach | > 95% |
| Audit defensibility score | Internal audit pass rate on scenario lineage | 100% |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Optimization theater — system runs, decisions don't improve | North star is causal uplift with CIs; quarterly outcome review |
| Fiduciary line drift — education slides toward advice | Content classification at creation; advice-vs-education rail; compliance authors rules |
| Model drift in analog matcher | Human-gated recalibration with realized outcomes; analog weights versioned |
| Participant PII leakage | Cohort-only payloads; field-level encryption; tokenization; pen-test program |
| Signal overload → alarm fatigue | Severity + urgency + confidence classifier; radar caps; do-nothing legitimacy |
| Advisor-lead confusion | Advisor briefs are cohort context only; training; advisor-separation architecture |
| Autopilot acting on unsafe hypotheses | Autopilot Authorizations list; fiduciary-sensitive tag auto-disables; hard pauses at gates |
| Over-reliance on LLM for advice-adjacent copy | LLM restricted to compliance-scoped prompt library; all content passes classification + rails |
| Sponsor-level policy variance | Plan-policy reference data first-class; eligibility scoped per plan |
| Deployment without holdout | Holdouts required at scenario creation; deploy blocks without holdout ID |
| Organizational inertia | Compliance + Workplace leadership sit inside the platform day-one |

---

## 12. Why Vanguard, Why Now

Vanguard's brand equity is trust. The industry's pattern — reactive campaigns, optimistic GenAI content factories, opaque attribution — is not a match for that equity. TwinX for Vanguard is the rare decision platform whose design is **congruent with Vanguard's fiduciary identity**, not a wrapper over a marketing stack.

The macro backdrop — volatility regimes, SECURE 2.0 provisions rolling in, Roth adoption growth, the auto-escalation and default-investment era maturing — means more decision moments per year, not fewer. Doing those decisions well is the AUM story of the next five years.

---

## 13. The Ask

Greenlight **Phase 0 + Phase 1** — a 16-week, single-journey, production-deployed TwinX instance on the proven TwinX Wealth Banking platform base: ModeChoiceModal, WorkflowRunner, 10-agent system (8 base + 2 Vanguard), Twin Registry (Participant + Sponsor + Advisor), Episode Simulator, Five-Rail Guardrail Guardian + Fiduciary Guardian, Content Engine with class gating, Journey Executor with kill switch, Outcome Attribution with Shapley, all on Vanguard-skinned UX.

Expand from there on evidence, not on faith.

---

*Prepared from the TwinX Wealth Banking platform core (WorkflowRunner, Guided/Autopilot, 8-agent system, Advisor Twin registry, Episode Simulator, Five-Rail Compliance, Shapley attribution, Content Asset Ecosystem, Ontology 3.0, the full UX pattern library) and the Vanguard context brief (US 401(k) landscape, Behavior Radar 2024–2026, the two anchor journeys).*
