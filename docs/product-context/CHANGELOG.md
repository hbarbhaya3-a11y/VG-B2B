# TwinX for Vanguard — CHANGELOG

**Maintained by**: `qa-tester` agent. Updated at the end of every implementation session.
**Location**: `docs/product-context/CHANGELOG.md`

---

## Session 4 — Plan Design Optimizer (UC-E v0.2.0-vanguard) — 2026-04-30

### Build Status
- `npm run build` — **PASSED** — 7,601 modules, 0 errors, built in 4.56s
- Dev server starts cleanly. Pre-existing Mantine `"use client"` directive warnings are library-level (unchanged from prior sessions)

### Added

**Plan Design Pareto — UC-E rebuilt around TCS US (50,000 employees)**
The PRD specified five new panels (`PlanDiagnosticsPanel`, `BenchmarkPanel`, `LeverConfigPanel`, `PlanSimResultPanel`, `PlanRecommendationPanel`). Per user direction, these are folded into the existing UC-E 8-step chain rather than added as net-new panels. The audience flips from participant-marketing to sponsor-strategist + benefits committee.

- **Data layer**
  - `src/data/sponsors.js` — added `sponsor-009` (TCS USA 401(k) Plan, 50,000 employees, technology, ADP at-risk) with new optional `planDesignId` field
  - `src/data/planDesign.js` — **NEW**. TCS US baseline parameters + current KPIs (61% participation, 5.1% deferral, $14.2M annual cost, ADP at-risk, Q3 competitive, 38/100 fiduciary risk). Exports `planDesigns`, `getPlanDesign()`, `EXPENSE_TIER_AVG_ER`, label maps
  - `src/data/benchmarks.js` — **NEW**. Tech-sector medians + 4 illustrative peers (Accenture, Cognizant, Infosys, Wipro)
  - `src/data/signals.js` — added 4 `plan_health` signals scoped to TCS US: `sig-ph-001` (participation gap), `sig-ph-002` (ADP risk · `fiduciarySensitive: true`), `sig-ph-003` (competitive match gap), `sig-ph-004` (SECURE 2.0 student-loan match opportunity). All carry `scenarioIds: ['uc-e']`
  - `src/data/episodes.js` — added `ep-006` (auto-enrollment uplift) and `ep-007` (match formula stretch)
  - `src/data/agents.js` — extended Market Sentinel and Quant Bridge `recentDecisions[]` with TCS US plan-health detection and Pareto-search entries

- **Simulation logic**
  - `src/simulation/planDesign.js` — **NEW**. Deterministic parameter-effect model (PRD §11). Exports `computeOutcomes()`, `gridCardinality()`, `findParetoFrontier()`. 500-config cap with `capped` flag; empty-frontier returns `{ frontier: [], top3: [] }`
  - `src/utils/planNarrative.js` — **NEW**. Static template generator. `buildPlanRecommendation()` returns summary + parameter from→to diff + Rail-6 next-steps + 14-week timeline. **No LLM**, per `app/CLAUDE.md` anti-pattern
  - `src/utils/dataSourceManifest.js` — **NEW**. Static manifest definitions for the data-source pills
  - `src/utils/tooltips.js` — **NEW**. Glossary map for parameter tooltips + vesting-curve preview data

- **UI components**
  - `src/components/ui/DataSourceStrip.jsx` — **NEW** shared component. File pills with type-coded icons (xlsx/csv/pdf/json) + Internal/External grouping
  - `src/components/workflow/panels/PlanDesignParetoPanel.jsx` — **major rewrite** (~1,000 lines). Four-section panel: (0) Data Source Manifest, (1) Plan Diagnostics scorecard with lever-link badges, (2) Benchmark Comparison vs 4 peers + sector P50, (3) Configure & Simulate with What-If / If-What modes. Rich Mantine controls per parameter (Switch · Slider · SegmentedControl · Radio.Group · Select · NumberInput · Chip.Group), live computed previews (effective match, avg ER, fee savings), vesting-curve mini-chart, Plan A/B/C variant tabs, "Apply this configuration" buttons on variants and Top-3 Pareto cards, 500-config grid guardrail, empty-frontier alert
  - `src/components/workflow/panels/SignalDetectionPanel.jsx` — added optional `DataSourceStrip` rendering (backward-compatible)
  - `src/components/workflow/panels/OutcomeCohortPanel.jsx` — added `PlanRecommendationBlock` sub-component. Renders when `workflowState.selectedConfig` (live) or `panelData.recommendation` (canonical) is present. Shows parameter from→to diff, projected vs observed KPI table, static narrative, Rail-6 next-steps, timeline
  - `src/components/workflow/ModeChoiceModal.jsx` — fiduciary-sensitive autopilot disable. When launching signal carries `fiduciarySensitive: true`, Autopilot card renders disabled with shield-lock icon, red badge, and tooltip; an Alert at top of modal explains the constraint

- **Standalone PlanOptimizer page**
  - `src/pages/PlanOptimizer.jsx` — **NEW**. Power-user sandbox under SIMULATE rail. Reuses `PlanDesignParetoPanel` directly. Three exits prevent dead-ends: Reset · Export simulation (JSON download) · Open in UC-E (calls `launch(uc, { seedState, jumpToStep: 2 })`)
  - `src/pages/SimulateDashboard.jsx` — third tab "Plan Optimizer" added; SimulateDashboard now wired as the simulate-bucket landing
  - `src/contexts/UseCaseContext.jsx` — `launch()` accepts `{ seedState, jumpToStep }`; new `consumeSeedState()` returns and clears the pending seed exactly once on workflow mount
  - `src/components/workflow/WorkflowRunner.jsx` — initial `workflowState` extended with `selectedConfig`, `rail6Output`, `package` keys; `useEffect` consumes any pending seed on activeUseCase change

- **TrustCompliance · Rail 6**
  - `src/pages/TrustCompliance.jsx` — appended Rail 6 "Plan Design Fiduciary Review" with the 5 PRD-specified ERISA sub-checks. Page now lists 6 rails

- **UC-E re-skinned in `src/data/usecases.js`** (full block rewrite, lines 1183–1477):
  - Step 1 (signal_detection): TCS US framing (61% vs 83% tech P50, ADP at-risk), `dataSources` array passed to panel, precedents linked to `ep-006`/`ep-007`
  - Step 2 (plan_design_pareto): `panelData.planDesignId: 'sp-tcs-us'`; framed as "the only place a simulation runs"
  - Step 3 (workforce_stress): re-framed as "Sponsor ROI / Business Case — derived from selected config"
  - Step 4 (content_generation): **re-framed as Quote Package / Board Deck**. Drops 4,800 participant variants. Asset list: 1 board deck + 1 CFO ROI sheet + 1 mandatory 30-day notice + 1 sponsor portal card
  - Step 5 (compliance): added Rail 6 with 5 sub-checks
  - Step 6 (cohort_decision): TCS US plan-design KPI deltas (61%→84%, ADP at-risk→PASS, Q3→Q2)
  - Step 7 (deployment): **re-framed as Activation / Implementation Handoff** — amendment filing, Workday HRIS sync, single mandatory 30-day notice. No 50K-employee blast
  - Step 8 (cohort_outcome): TCS US plan-level KPIs ($2.84B AUM retained); new `panelData.recommendation` block feeding `PlanRecommendationBlock`
  - Top of `usecases.js`: imports `UC_E_PLAN_DESIGN_SOURCES`

### Routing wiring

- `src/App.jsx` — registered `'plan-optimizer': PlanOptimizer` and `'simulate-dashboard': SimulateDashboard` in `PAGE_COMPONENTS`. Changed `BUCKET_DEFAULT_PAGE.simulate` from `'episode-simulator'` to `'simulate-dashboard'`. Workflow steps that reference `episode-simulator` directly via `step.page` continue to work
- `src/theme.js` — added `'plan-optimizer'` and `'simulate-dashboard'` to `PAGE_TO_BUCKET → 'simulate'`

### Watch List

- `bundle size`: build emits a 1.6MB JS chunk (445KB gzipped) — pre-existing; the new module set adds ~80KB pre-min. Code-splitting `PlanDesignParetoPanel` is a follow-up if it matters
- `vite duplicate-import warnings`: SimulateDashboard lazy-loads PlanOptimizer/QuantBridge while App.jsx imports them statically; harmless but worth resolving in a future refactor
- `Northstar Retail` references remain in older docs (`docs/vanguard-pov/`); this session only modifies the v0.2.0 codebase. POV doc refresh is OQ
- Static narrative templates have NO LLM wiring; Claude API + compliance-scoped prompt library deferred per user direction
- `bundle splitting`: SimulateDashboard's lazy imports collide with App.jsx's static imports — harmless but the lazy directive is being ignored. Future cleanup: pick one strategy

### Anti-Pattern Registry — entries reinforced this session

| Anti-pattern | Where it would have appeared | Mitigation applied |
|---|---|---|
| LLM free-form for advice-adjacent copy | Plan recommendation narrative | Static deterministic templates in `utils/planNarrative.js`; no LLM call |
| Predictive intent signals at participant level | Plan-health signals could imply individual targeting | All `plan_health` signals carry plan-level `affectedPlanIds` only; cohort counts are aggregate |
| Autopilot on fiduciary-sensitive hypotheses | ADP-risk-launched UC-E flows | `sig-ph-002` carries `fiduciarySensitive: true`; ModeChoiceModal renders Autopilot disabled with red lock icon |
| Missing do-nothing baseline | Step 6 cohort_decision | `decision.doNothingBaseline` retained; Pareto panel always plots the current-plan dot |
| Solicitation language in sponsor-facing copy | Quote Package narrative | Sponsor-facing fiduciary content; describes the redesign factually, no "upgrade your plan" framing |

---

## Session 3 — UC-B Full Implementation & Panel Data-Driving (v0.1.2-vanguard) — 2026-04-15

### Build Status
- `npm run build` — **PASSED** — 7,581 modules, 0 errors, built in 2.37s
- All 8 UC-B steps visually verified end-to-end — no crashes, no UC-A content leaking

### Added

**UseCaseCatalog page (Decide rail)**
- `src/pages/UseCaseCatalog.jsx` — new page rendered when Decide rail is selected; displays all 5 Vanguard use cases grouped by Route with journey steps, fiduciary discipline banner, outcome KPIs, and "Launch Demo" CTA; Coming Soon badge for UC-C/D/E
- `src/App.jsx` — Decide nav bucket now routes to `<UseCaseCatalog>` instead of placeholder; `onLaunchUseCase` prop wires catalog launch buttons into the WorkflowRunner

**UC-B full step data (Roth Adoption Nudge)**
- `src/data/usecases.js` — UC-B expanded from 8 placeholder steps to 8 fully-populated panelData steps:
  - Step 0 (signal_detection): `seeds: { signalId: 'sig-013' }` added; new fields `primaryMetric`, `primaryMetricLabel`, `sourceLabel: 'Behavior Radar'`, `episodeNote` (SECURE 2.0 Roth catch-up context)
  - Step 1 (advisor_targeting): `cohortDescription: 'participants identified — Roth adoption gap cohort (280 plans)'` added to panelData
  - Step 7 (attribution): `episodeTitle: 'Workflow Complete — Roth Adoption Nudge Episode #6'` added; `modelUpdate.priorLabel` and `modelUpdate.episodeContext` added with Roth-specific text

### Fixed

**Panel hardcoded UC-A strings — all panels now data-driven**

- `src/components/workflow/panels/SignalDetectionPanel.jsx`
  - Was: hardcoded "VIX +36% Intraday — Broad Equity Volatility", "Bloomberg MCP" badge, VIX stat blocks (VIX spike / 2σ deviation / urgency window), hardcoded episode note
  - Now: headline reads `step.headline`; source badge reads `pd.sourceLabel`; stat block section is conditional on `pd.vixChange !== null` — VIX path for UC-A, behavioral path for UC-B (`primaryMetricLabel`, `primaryMetric`, `sigmaDeviation`, `detectionLag`, `urgencyWindow`, `episodeClass`); episode note reads `pd.episodeNote`
  - Fix: `urgencyWindow.split(' ')[0]` (was `.split('-')[0]`, gave "60" instead of "60-day")

- `src/components/workflow/panels/AdvisorTargetingPanel.jsx`
  - Was: hardcoded "advisors identified — elevated large-cap exposure"
  - Now: reads `pd.cohortDescription || 'advisors identified — elevated large-cap exposure'`

- `src/components/workflow/panels/AttributionPanel.jsx`
  - Was: hardcoded "Workflow Complete — VIX Spike Response Episode #19" title; `ca.briefsOpened + ca.articlesRead + ...` summing undefined fields → crash; `engagement.redistributionEndClients.toLocaleString()` → crash; `action.portfolioToolOpens` (undefined) in badge and funnel
  - Now: title reads `pd.episodeTitle || '...'`; all `ca.*` fields use `?? 0` fallback (`briefsOpened`, `articlesRead`, `toolInteractions`, `wholesalerCalls`, `pdfsRedistributed`); `engagement.redistributionEndClients ?? 0` and `engagement.redistributionAdvisors ?? 0`; `action.portfolioToolOpens ?? 0`, `action.wholesalerFollowUps ?? 0`, `action.rebalancingTransactions ?? 0`; same `?? 0` in `actionFunnelData` array and action outcomes grid
  - Prior-label and episode context now read `modelUpdate.priorLabel` / `modelUpdate.episodeContext`

- `src/components/workflow/panels/DeploymentPanel.jsx`
  - `PreviewModalContent` rewritten to be fully data-driven: renders `advisor.content[]` as ordered list; `advisor.talkingPoints[]` if present; no hardcoded content strings

### Regressed
- [none detected — full UC-B end-to-end visual pass confirmed all 8 steps clean]

### Watch List
- AttributionPanel action accordion still shows UC-A field labels ("Portfolio tool opens", "Wholesaler follow-ups", "Rebalancing transactions") for UC-B where those fields are 0 — cosmetically correct but could show UC-B-specific labels in a future pass
- `modelUpdate.episodeContext` text for UC-B references Roth adoption but panel layout is shared with UC-A; if a third use case is added, consider extracting this section to data

### Newly Found Anti-Patterns
- **Hardcoded use-case strings in panel components** — panels had UC-A strings (VIX, Bloomberg MCP, Episode #19) baked in. Pattern: all display strings in WorkflowRunner panels must come from `step.panelData` or `step.headline`. Never hardcode event-specific copy in a panel component.
- **Unsafe `.toLocaleString()` on possibly-undefined field** — `engagement.redistributionEndClients.toLocaleString()` crashes if the field is absent. Pattern: always use `(field ?? 0).toLocaleString()` for numeric fields from `panelData` that may vary by use case.
- **Button index instability in multi-button panels** — AdvisorTargetingPanel renders an "Edit configuration" toggle that shifts button DOM indices; selecting action buttons by index breaks. Pattern: always find action buttons by `textContent` match, never by DOM index.

### Anti-Pattern Scan
- Background color washes (`-0` / `-1`): **CLEAN**
- Hardcoded hex colors: **CLEAN**
- `toast.show()` / `notifications.show()`: **CLEAN**
- UC-A hardcoded strings in panels: **CLEAN** — all four panels now data-driven
- `undefined.toLocaleString()` crash paths: **CLEAN** — all `?? 0` guards in place
- Individual participant PII: **CLEAN** — all deployment/attribution data uses cohort IDs only

---

## Session 2 — Vanguard Brand Polish & Visual Inspection (v0.1.1-vanguard) — 2026-04-15

### Build Status
- `npm run build` — **PASSED** — 7,580 modules, 0 errors, built in 2.60s
- Bundle: 1,239 kB main chunk (gzip 350 kB) + 7 lazy-loaded page chunks (acceptable for demo SPA)

### Added
- Nothing new — polish/bug-fix session only

### Fixed

**Capital Group / KKR fund code purge**
- `src/pages/ContentEngine.jsx` — SYSTEM_PROMPT fund codes (CGDV/CGGR/CGCP/KKR) → Vanguard fund references (VTSAX/VTI/VTIVX/VBTLX/VWENX); "THE CAPITAL GROUP ANGLE" → "THE VANGUARD ANGLE"; CONTENT_ARTICLES entry 'KKR Alternatives: Portfolio Diversification Strategies' → 'Staying the Course: Target-Date Funds in Volatile Markets'; KKR channel reach / AUM attribution → Vanguard equivalents; model reference `gpt-4o` → `claude-sonnet-4-6`; dead code block `_FALLBACK_LEGACY` (21,298 chars / ~141 lines) deleted
- `src/pages/TrustCompliance.jsx` — CONTENT_CREDENTIALS: 'KKR Alternatives Brief' → 'SECURE 2.0 Roth Adoption — Advisor Brief'
- `src/pages/OutcomeAttribution.jsx` — TREATMENT_HOLDOUT episode 'KKR Launch' → 'Roth Adoption'; SHAPLEY_DATA 'Wholesaler Call' → 'Advisor Brief'; SectionHeader updated to leakage-reduction/rollover-retention framing
- `src/pages/QuantBridge.jsx` — PRIOR_HISTORY 'ep-003 (KKR Launch)' → 'ep-003 (Annual Contribution Limit)'; episodeNames updated; response curve chart fixed (field names were wrong: `advisorCount`/`portalEng`/`wholesalerEng` → `cohortSize`/`digitalEng`/`inAppEng`/`advisorEng` per Vanguard episodes.js schema)
- `src/pages/TwinEnrichment.jsx` — DECISION_LOG: 'Tag Michael Davidson as KKR prospect' → cohort-level Roth recommendation; 'Route Robert Chen to wholesaler channel' → 'Upgrade Marcus Ellison to Advisor Brief channel for SECURE 2.0 outreach'
- `src/pages/Operations.jsx` — APPROVAL_QUEUE: 'KKR Alternatives — Optimizer segment (212 advisors)' → 'Roth Adoption Nudge — Mid-Career Cohort (47,200 participants)'; 'Wholesaler' → 'Advisor Brief'; predicted outcomes → leakage-prevented framing
- `src/data/agents.js` — KKR references in recentDecisions replaced with Vanguard episode context; '847 advisors' → '284,000 participant cohort'; wholesaler → advisor-brief channel references
- `src/data/ontologyEntities.js` — `capitalGroupHoldings: ['CGDV','CGGR']` → `vanguardFunds: ['VTSAX','VBTLX']`; fund entity ticker/name/ER updated to VTSAX; episode entity fields updated to participantsTargeted/participantsEngaged/assetsRetained
- `src/components/workflow/AgentChatPanel.jsx` — all 8 agent system prompts: "Capital Group's Marketing OS" → "Vanguard's Fiduciary Intelligence Platform"
- `src/components/ui/PovCallout.jsx` — "Capital Group Today:" → "Vanguard Today:"
- `src/components/ui/UseCaseLauncher.jsx` — "Capital Group POV" badge → "Vanguard POV" with color "vanguardRed"
- `src/components/workflow/panels/DeploymentPanel.jsx` — CGDV reference → VTSAX/Vanguard Total Market; email from-address → vanguard.com domain

**Channel taxonomy migration (Capital Group wholesaler → Vanguard Advisor Brief)**
- `src/pages/EpisodeSimulator.jsx` — CHANNEL_DISPLAY_NAMES added (`{ email: 'Email', portal: 'Digital Journey', push: 'In-App', wholesaler: 'Advisor Brief' }`); responseCurveData mapping updated; SEGMENTS → Vanguard cohort names; OBJECTIVES → Vanguard outcomes (Maximise Leakage Reduction / Deferral Increase / Engagement Rate); sensitivityData 'Advisor Count' → 'Cohort Size', 'Avg AUM' → 'Avg Balance'; `avgAdvisorAUM: 45000000` → `avgAdvisorAUM: 9500`; `participantsTargeted` field used
- `src/pages/CampaignOrchestration.jsx` — Campaign 2 'KKR Alternatives Awareness' → 'Roth Adoption Nudge — Mid-Career Cohort'; CHANNEL_ICONS 'Wholesaler' → 'Advisor Brief'; DEPLOYMENT_SAMPLE 'Wholesaler' → 'Advisor Brief'; SectionHeader updated to ERISA channel framing
- `src/pages/AdvisorTwinRegistry.jsx` — `selectedAdvisor.aum` → `selectedAdvisor.totalPlanAUM`; label "AUM" → "Plan AUM"

**Runtime bug fixes (discovered during visual inspection)**
- `src/components/ui/SignalCard.jsx` — `signal.affectedAdvisorCount` → `signal.affectedCohortCount ?? signal.affectedAdvisorCount ?? 0`; "advisors" label → "participants" (was showing "undefined advisors" on all signal cards)
- `src/pages/EpisodeSimulator.jsx` — stale `useState('All Active RIAs')` → `useState(SEGMENTS[0])`; stale `useState('Maximise AUM Lift')` → `useState(OBJECTIVES[0])` (Select was showing empty value)

### Regressed
- [none detected]

### Watch List
- `interventions.js` exporting `leakageReduction`/`sponsorImpact` — verify all consuming display components handle both fields
- `funds.js` new field shape (qdiaEligible, targetDateSeries, useIn401k) — fund display components may need updates if funds are ever displayed outside of data files

### Newly Found Anti-Patterns
- **Wrong field name after data file swap** — after `signals.js` was re-skinned to use `affectedCohortCount`, `SignalCard.jsx` was still reading `affectedAdvisorCount` (undefined). Pattern: after any data file field rename, grep all consuming UI components for old field names before QA.
- **Stale `useState` initializer** — after constants (SEGMENTS, OBJECTIVES) are renamed, `useState('old-value')` becomes invalid and Select shows empty. Always use `useState(CONSTANT[0])` pattern for array-backed selects.

### Anti-Pattern Scan
- Background color washes (`-0` / `-1`): **CLEAN**
- Hardcoded hex colors: **CLEAN** (Vanguard brand red `#96151D` accepted)
- `toast.show()` / `notifications.show()`: **CLEAN**
- Capital Group / KKR fund codes: **CLEAN** — all purged
- Wholesaler channel label: **CLEAN** — all UI-facing labels read "Advisor Brief"
- Individual participant PII: **CLEAN** — all participant references are cohort-level
- `affectedAdvisorCount` (wrong field): **CLEAN** — fixed in SignalCard

---

## Session 1 — Vanguard Scaffold (v0.1.0-vanguard) — 2026-04-15

### Build Status
- `npm run build` — **PASSED** in Session 2 — 7,580 modules, 0 errors

### Added

**Theme & Brand (Task A + B)**
- `src/theme.js` — Vanguard red primary color `#96151D`, 10-shade `vanguardRed` Mantine color array, Vanguard gradient (`linear-gradient(90deg, #96151D, #D92B36, #bc2028)`), updated SECTION_COLORS for 8-rail nav spine
- `src/App.jsx` — Header: `TwinX_Black.svg` + "TwinX for Vanguard" (#96151D) + "Fiduciary Intelligence Platform" subtitle; Avatar: vanguardRed/V; navbar collapse bar Vanguard gradient

**Navigation (Task C)**
- `src/components/nav/WorkflowNav.jsx` — 8-rail Vanguard spine: SENSE / DECIDE / SIMULATE / GOVERN / DEPLOY / MEASURE / LEARN / OPERATE (replaces Capital Group 6-rail)
- `src/hooks/useWorkflowNav.js` — fallback bucket changed from `'deploy-learn'` to `'deploy'`
- `src/theme.js` — STAGE_TO_BUCKET now maps all 8 rails; WORKFLOW_BUCKET_ORDER updated to 7-bucket ordered list (OPERATE excluded — always-on separate)
- `src/App.jsx` — new routing cases for `decide`, `deploy`, `deploy-learn`, `measure`, `learn`, `operate`/`agents`

**Vanguard-Specific Agent Definitions (Task D)**
- `agents/erisa-fiduciary-auditor.md` — ERISA §404(a) prudent investor standard, QDIA, prohibited transaction gating; 12-item review checklist
- `agents/rollover-moment-validator.md` — validates rollover signals as reaction-based (plan events only), blocks predictive intent inference; 12-item checklist
- `agents/advice-education-boundary-auditor.md` — ensures no advice/education boundary leakage; compliance-scoped prompt library enforcement; 12-item checklist

**Vanguard Data Files (Task E)**
- `src/data/signals.js` — 15 Vanguard signals: VIX spike (sig-001), IG credit spreads (sig-002), yield curve inversion (sig-003), SECURE 2.0 catch-up age 60–63 (sig-004), auto-enrollment mandate (sig-005), DOL fiduciary rule (sig-006), IRS 2026 contribution limits (sig-007), Roth catch-up requirement (sig-008), plan termination batch (sig-009, `triggerType:'plan_event'`), age-59½ window (sig-010), force-out eligible (sig-011), leakage spike (sig-012), Roth adoption gap (sig-013), sponsor renewal risk (sig-014), digital engagement drop (sig-015)
- `src/data/episodes.js` — 5 Vanguard analog episodes: COVID Market Crash Mar-2020 (ep-001, $2.8B leakage prevented), SECURE 2.0 Catch-Up 2024 (ep-002, $280M deferral increase), Annual Contribution Limit Campaign Nov-2025 (ep-003, $620M), Plan Termination Rollover Q1-2026 (ep-004, $380M), Hardship Leakage Reduction COVID Analog (ep-005, $420M). Each episode includes doNothingBaseline (required), response curves per channel (digitalJourney/email/inApp/advisorBrief), P5/P50/P95, keyLearnings
- `src/data/participants.js` — 8 Participant Twin cohort objects (NOT individual records): Near-Retirement High-Saver, Mid-Career Reactive Trader, Early Career Low-Saver, Roth Adoption Gap, Hardship-Risk Mid-Income, Plan Termination Rollover-Eligible, Age-59½ In-Service Window, Auto-Enrolled Passive Participant. Each has needStateVector (summing to 1.0), behaviorSignals, leakageRisk, adviceEligible, rolloverMomentActive
- `src/data/sponsors.js` — 8 Sponsor Twin objects: Midwest Manufacturing (Large, plan-001), SciTech Solutions (Large, plan-002), Community Health (Large/healthcare, plan-003), Clearwater Financial (Mid-Market, plan-004), Regional Retail Holdings (Mid-Market, plan-005, High churnRisk), Pacific Logistics (Small, plan-006), University Medical (Large/education-healthcare, plan-007), First National Properties (Small/SIMPLE IRA, plan-008)
- `src/data/advisors.js` — 5 Route 1 external advisor twins (sponsor-level only, no individual participant data): Jennifer Marchetti CFP CIMA (Advisor Alpha, 14 sponsors, $142M AUM), Marcus Ellison ERPA QPA (Advisor Alpha, 28 sponsors, ERISA specialist), Sarah Chen CFP CFA (Advisor Alpha, 19 sponsors, large plans), Robert Hendricks CFP AIF (Advisor Alpha, 31 sponsors, healthcare), Angela Torres CPFA QKA (Institutional, 42 sponsors, small business). Each has needStateVector, interventionHistory at plan/sponsor level
- `src/data/usecases.js` — 5 Vanguard seed use cases: UC-A (Volatility Response, full WorkflowRunner panelData — signal_detection → advisor_targeting → content_channel_config → content_generation → compliance → simulation → human_approval → deployment → attribution), UC-B (Roth Adoption Nudge, placeholder steps), UC-C (Hardship Leakage Reduction, placeholder steps), UC-D (Rollover Moment Response, placeholder steps with ERISA Fiduciary Auditor gate), UC-E (Sponsor Renewal Enablement, placeholder steps)
- `src/data/interventions.js` — 30 cohort-level intervention records across all 5 episodes. Channels: digitalJourney/email/inApp/advisorBrief. ~5% holdout rate. Outcome metrics: actualLeakageReduction, sponsorImpact. No individual participant data
- `src/data/funds.js` — 17 Vanguard funds: Target Retirement 2045/2030/2060/Income (QDIA-eligible, 0.08% ER), VTSAX/VFIAX/VOO/VTI (US equity index), VTIAX/VXUS (international), VBTLX/VBILX/VFIJX (fixed income), VASIX (stable value proxy), VWENX/VHCAX/VPMCX (active). Each has expenseRatio, performance, qdiaEligible, planAdoptionPct, useIn401k, managerType
- `src/components/workflow/panels/ContentGenerationPanel.jsx` — complete Capital Group → Vanguard re-skin: VanguardHeader replaces CapitalGroupHeader, all #018AC0 → #96151D, Capital Group/Capital Ideas → Vanguard/Vanguard Insights, PM attributions → Fran Kinniry CFA / Vanguard ISG, fund reference → VTSAX/VTI, email domains capitalgroup.com → vanguard.com

**Product Context Docs (Tasks F + G)**
- `docs/product-context/data-contracts.md` — Vanguard entity shapes: Participant Twin (cohort-level, ERISA constraints), Sponsor Twin, Plan, Signal, Episode (doNothingBaseline required), Rollover Moment Signal (triggerType:'plan_event' required), Hypothesis/Use Case, Intervention Record; fiduciary field-level constraints documented per entity
- `docs/product-context/platform-overview.md` — Rewritten for Vanguard identity: three Routes, 8-rail nav, 8-agent system, fiduciary discipline constraints table, key file locations
- `docs/product-context/module-capabilities.md` — Updated to Vanguard 8-rail module registry: SENSE/DECIDE/SIMULATE/GOVERN/DEPLOY/MEASURE/LEARN/OPERATE, WorkflowRunner panel types table, data files registry

### Fixed
- Capital Group identity removed from all re-skinned files
- `useWorkflowNav.js` fallback bucket corrected from `'deploy-learn'` to `'deploy'`
- Advisor twin `interventionHistory` updated to sponsor/plan-level impact (removed Capital Group-era individual advisor records)

### Regressed
- [none detected — build verification pending Task I]

### Watch List
- Import compatibility: `usecases.js` changed export shape significantly — components referencing Capital Group-specific fields (advisorId in panelData, AUM metrics) may need adapter updates during Task J visual inspection
- `interventions.js` now exports `leakageReduction`/`sponsorImpact` instead of `actualAUMImpact` — verify all consuming components handle both field names or are updated
- `funds.js` field shape changed from Capital Group ETF structure to Vanguard fund shape — verify fund display components handle `qdiaEligible`, `targetDateSeries`, `useIn401k` fields

### Newly Found Anti-Patterns
- **Fiduciary anti-pattern: advice-adjacent language in education content** — two email variants in UC-A content_generation auto-corrected for near-advice phrasing ("consider increasing your deferral rate to capture the full employer match before markets recover" → education-classified equivalent). CLAUDE.md updated.
- **Rollover signal without `triggerType`** — all three rollover signals (sig-009, sig-010, sig-011) explicitly include `triggerType: 'plan_event'`. Any signal of `type: 'rollover'` without this field must be blocked.

### Anti-Pattern Scan
- Background color washes (`-0` / `-1`): **CLEAN** (data files only, no UI changes this session)
- Hardcoded hex colors: **CLEAN** (VanguardHeader uses `#96151D` — accepted for brand enforcement)
- `toast.show()` / `notifications.show()`: **N/A** (no UI changes this session)
- Placeholder copy: **CLEAN** (all data files contain realistic Vanguard content)
- Capital Group references: **CLEAN** in all modified files
- Individual participant PII: **CLEAN** — all participant data uses cohortId/cohortSize only

---

## Session 2 — TwinX Capital Group POV Demo Build (v0.2.0) — 2026-04-05

### Build Status
- `npm run build` — PASSED — 7556 modules, 0 errors, 0 warnings (except benign Mantine `use client` directives and expected bundle-size advisory for demo SPA)
- Bundle delta: +966.87 kB main chunk (gzip: 275.24 kB) + 7 lazy-loaded page chunks

### Added
- `docs/UX_UI_STANDARDS.md` — canonical prescriptive Mantine 8 + React UI/UX reference (572 lines)
- `src/utils/format.js` — fmtPct, fmtM, fmtB, fmtK, fmtConf, fmtRelTime, fmtDate formatting utilities
- `src/data/` — 7 mock data files: advisors (20), funds (35), signals (15), episodes (5), agents (8), interventions (30), ontologyEntities
- `src/simulation/` — monteCarlo.js (Box-Muller, 1000-iteration), responseCurves.js (S-curve per channel), needState.js (5-job scoring)
- `src/theme.js` — expanded with SECTION_COLORS, TWINX_GRADIENT, MOD_COLORS
- `src/components/ui/` — 9 shared UI components: KpiCard, SectionHeader, PovCallout, SignalCard, AdvisorTwinCard, AgentStatusCard, InterventionCard, TrustRailBadge, SimResultPanel
- `src/App.jsx` — complete redesign: AppShell + collapsible Navbar (70px/240px) + 11-item nav (6 sections: SENSE, SIMULATE, RESPOND, LEARN, GOVERN, AGENTS) + page routing via useState + cross-module selectedEpisode/selectedAdvisor state
- `src/pages/MarketSignals.jsx` — signal feed with type filter/search, episode detail stepper + response curve preview, intervention queue panel, PovCallout
- `src/pages/AdvisorTwinRegistry.jsx` — 4-filter panel, SimpleGrid card layout, 480px right Drawer with need-state vectors, engagement sparkline, intervention history, recommended action card, ontology accordion
- `src/pages/EpisodeSimulator.jsx` — config panel with channel mix sliders (sum validation), Monte Carlo runner, Transition-faded results with distribution AreaChart, ranked scenarios Table, sensitivity BarChart, PovCallout
- `src/pages/AgentConsole.jsx` — 8-agent grid, click-to-filter activity feed, MCP connectors Table, five-rail trust pipeline, agent identity management
- `src/pages/QuantBridge.jsx` — realistic placeholder with Bayesian params table, response curve tabs, prior borrowing history
- `src/pages/ContentEngine.jsx` — realistic placeholder with 5-stage stepper, 6 Capital Ideas articles with compliance scores, AI generation log
- `src/pages/CampaignOrchestration.jsx` — realistic placeholder with 2 active campaigns, multi-touch timelines, RL badge, deployment table
- `src/pages/OutcomeAttribution.jsx` — realistic placeholder with Shapley BarChart, treatment vs holdout chart, always-on holdout Alert
- `src/pages/TwinEnrichment.jsx` — realistic placeholder with model accuracy LineChart, twin dimension completeness, decision capture log
- `src/pages/TrustCompliance.jsx` — realistic placeholder with 5 trust rail Cards, content credentials table, SEC/FINRA export button
- `src/pages/Operations.jsx` — realistic placeholder with 5 LangGraph pattern cards, approval queue, system health KPIs

### Fixed
- All placeholder panels replaced with content-rich implementations
- App.jsx redesigned from Tabs layout to AppShell + collapsible Navbar

### Regressed
- [none]

### Watch List
- Main JS bundle (966 kB / 275 kB gzip) — acceptable for demo SPA, no lazy split needed within timeline
- Five-rail trust pipeline Rail 4 shows `warn` status (intentional — demonstrates real monitoring)

### Newly Found
- [none]

### Anti-Pattern Scan
- Background color washes (`-0` / `-1`): **CLEAN**
- Hardcoded hex colors: **CLEAN**
- `toast.show()` / `notifications.show()`: **CLEAN** (ToastContext internal use only — not a violation)
- Placeholder copy ("This module will be built"): **CLEAN**
- `sx` prop: **CLEAN**
- `module.css` files: **CLEAN**

---

## Session 1 — Project Scaffolding (v0.1.0) — 2026-04-06

### Build Status
- Initial scaffolding — build verification pending `npm install`

### Added
- Project scaffolding with React 18 + Mantine 8 + Vite tech stack
- 20 specialist agent definitions in `agents/`
- Knowledge docs: traceability matrix, trust regression checklist, explainability spec, analytics metric contract, UX dead-end prevention, optimization objectives spec, product context
- Product context docs: CHANGELOG, platform overview, data contracts, module capabilities
- Root config files: package.json, vite.config.js, Dockerfile, nginx.conf, firebase.json
- Minimal src/ scaffold: App.jsx, main.jsx, theme.js, ToastContext, AuthContext
- CLAUDE.md with full agent invocation trigger table and anti-pattern registry

### Fixed
- [none — initial scaffolding]

### Regressed
- [none — initial scaffolding]

### Watch List
- [none — initial scaffolding]

### Newly Found
- [none — initial scaffolding]

### Anti-Pattern Scan
- Background color washes (`-0` / `-1`): **CLEAN**
- `toast.show()`: **CLEAN** — toast helper pattern used
- Hardcoded currency symbols: **CLEAN**

---

## Anti-Pattern Registry

| Pattern | Wrong | Correct | First found |
|---|---|---|---|
| Background color washes | `var(--mantine-color-X-0)` or `-1` | `var(--mantine-color-X-light)` | S1 (inherited) |
| Neutral hover bg | `transparent` / hardcoded hex | `var(--mantine-color-default-hover)` | S1 (inherited) |
| Toast notifications | `toast.show({...})` | `toast(msg, color, title)` | S1 (inherited) |
<!-- Add new anti-patterns as discovered -->
