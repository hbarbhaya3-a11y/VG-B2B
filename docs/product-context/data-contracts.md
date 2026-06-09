# TwinX for Vanguard — Data Contracts
**Living document. Update after every session that adds/modifies data structures, fields, or exports.**
**Last updated: Session 1 (v0.1.0-vanguard) — 2026-04-15**

---

## Critical Field Name Gotcha Register

| Object | Wrong field | Correct field | Context |
|---|---|---|---|
| Toast | `toast.show({...})` | `toast(msg, color, title)` | ToastContext API |
| Background wash | `var(--mantine-color-X-0)` | `var(--mantine-color-X-light)` | Dark-mode safe wash |
| Return display | `` `+${return * 100}%` `` | `` `${return >= 0 ? "+" : ""}${(return * 100).toFixed(2)}%` `` | Negative returns must show minus sign |
| Rollover signal | `type: 'intent'` or inferred signal | `triggerType: 'plan_event'` — reaction-based only | Rollover Moment Validator rule |
| Content class | `contentClass: 'advice'` without eligibility | Only education-classified unless PAS eligibility confirmed + disclosures[] populated | Guardrail Guardian rule |
| Participant payload | Any individual PII field | `cohortId`, `cohortSize`, `planId` only — never individual identifiers | ERISA fiduciary anti-pattern |

---

## Vanguard Entity Shapes

### Participant Twin (cohort-level — NOT individual records)

```js
{
  id: 'cohort-001',                         // Cohort ID — never individual participant ID
  label: 'Near-Retirement High-Saver (Age 58–65, Deferral >10%)',
  planId: 'plan-001',                       // Vanguard-administered plan
  cohortSize: 4200,                         // Number of participants in cohort
  ageRange: { min: 58, max: 65 },
  incomeRange: { min: 85000, max: 180000 }, // Aggregate range — not individual
  avgDeferralRate: 0.142,                   // Cohort average
  avgBalance: 412000,                       // Cohort average
  rothAdoptionPct: 0.22,
  targetDateFundPct: 0.61,
  retirementReadinessStage: 'On Track',     // Off Track / At Risk / On Track / Unknown
  retirementReadinessScore: 0.84,           // 0.0–1.0
  needStateVector: {
    awareness: 0.08,    // Discovery/education need
    exploration: 0.12,  // Evaluation/comparison need
    decision: 0.28,     // Commitment/action need
    action: 0.38,       // Implementation need
    optimization: 0.14, // Ongoing improvement need
    // NOTE: sums to exactly 1.0 — enforced
  },
  behaviorSignals: ['low_vol_reactivity', 'high_deferral', 'catch_up_eligible'],
  leakageRisk: 'Low',                        // Low / Medium / High
  engagementScore: 0.78,                     // 0.0–1.0
  engagementHistory: [
    { month: 'Oct-25', score: 0.72 },        // 6-month trailing
    // ...
  ],
  recommendedContentClass: 'education',      // Always 'education' unless advice-eligible
  recommendedChannel: 'digitalJourney',      // digitalJourney / email / inApp / advisorBrief
  adviceEligible: true,                      // Only true if plan enables PAS/Digital Advisor
  adviceRoute: 'PAS',                        // 'PAS' / 'Digital Advisor' / null
  rolloverMomentActive: false,               // true only for reaction-based plan events
  rolloverMomentType: null,                  // 'plan_termination' / 'age_threshold_59_5' / 'force_out' / null
  rolloverSignalId: null,                    // Links to signals.js entry
}
```

**Key fiduciary rules:**
- No individual participant identifiers in any payload — `cohortId` + `cohortSize` only
- `adviceEligible` must be confirmed before any PAS/advice route is activated
- `rolloverMomentActive: true` requires `rolloverSignalId` pointing to a reaction-based signal (`triggerType: 'plan_event'`)
- `needStateVector` values must sum to exactly 1.0 — validate on write

---

### Sponsor Twin (plan-sponsor-level)

```js
{
  id: 'sponsor-001',
  planName: 'Midwest Manufacturing Co. 401(k) Plan',
  planId: 'plan-001',
  sponsorTier: 'Large',                    // Small / Mid-Market / Large
  industry: 'Manufacturing',
  totalParticipants: 4200,
  eligibleParticipants: 3850,
  activeDeferringPct: 0.78,
  avgDeferralRate: 0.072,
  autoEnrollActive: true,
  autoEscalateActive: true,
  aumMillions: 412.0,
  contractRenewalDate: '2026-09-30',       // ISO date string
  relationshipHealthScore: 0.82,           // 0.0–1.0
  churnRisk: 'Low',                        // Low / Medium / High
  planFeatures: ['Auto-Enroll', 'Auto-Escalate', 'Roth 401(k)', 'After-Tax', 'BrokerageLink'],
  vanguardFundsAdoptionPct: 0.91,          // % of AUM in Vanguard funds
  targetDateFundPct: 0.61,                 // % of AUM in target date funds
  primaryContact: 'Benefits Director',     // Role title — no individual names
  lastSponsorReview: '2026-02-15',
  recommendedAction: 'Annual review proactive outreach',
  engagementScore: 0.78,
}
```

**Key fiduciary rules:**
- No individual employee/participant names or SSNs in sponsor payloads
- `primaryContact` field stores role title only, not individual name
- Sponsor-level metrics are aggregate (plan-level), never individual

---

### Plan Entity

```js
{
  id: 'plan-001',
  sponsorId: 'sponsor-001',
  planType: '401(k)',                      // '401(k)' / '403(b)' / 'SIMPLE IRA' / '457(b)'
  planStatus: 'Active',                    // Active / Terminating / Terminated
  recordkeeper: 'Vanguard',
  qdiaFundId: 'VTIVX',                     // QDIA fund ticker — links to funds.js
  autoEnrollPct: 0.03,                     // Default auto-enroll deferral rate
  autoEscalatePct: 0.01,                   // Annual auto-escalate rate
  autoEscalateCap: 0.10,                   // Cap on auto-escalation
  matchFormula: '50% of first 6%',         // Employer match formula string
  catchUpEnabled: true,
  rothEnabled: true,
  loanProvision: true,
  hardshipWithdrawalEnabled: true,
  qdiaAdoptionPct: 0.61,
  vanguardFundsAdoptionPct: 0.91,
  complianceStatus: 'Current',             // Current / At Risk / Non-Compliant
  lastFidelityAuditDate: '2026-02-15',
  secureActCompliance: {
    autoEnrollMandateCompliant: true,       // SECURE 2.0 §101
    catchUp6063Enabled: true,              // SECURE 2.0 catch-up for age 60–63
    rothCatchUpCompliant: true,            // SECURE 2.0 §603
  }
}
```

---

### Signal Entity

```js
{
  id: 'sig-001',
  type: 'volatility',             // 'volatility' / 'regulatory' / 'rollover' / 'behavior'
  title: 'VIX Spike +36%: Broad Equity Volatility Event',
  description: '...',
  severity: 'Critical',           // 'Critical' / 'High' / 'Medium' / 'Low'
  confidence: 0.94,
  detectedAt: '2026-04-04T07:23:00Z',
  lifecycleStage: 'RESPOND',      // 'SENSE' / 'SIMULATE' / 'RESPOND'
  maturityLevel: 3,               // 1 (cold start) → 5 (fully learned)
  historicalPrecedentCount: 4,
  episodeId: 'ep-001',            // null if no matched episode
  affectedCohortCount: 284000,
  affectedPlanCount: 1840,
  triggerAgent: 'market-sentinel',
  source: 'Bloomberg MCP / Vanguard Behavior Radar',
  behaviorSignal: 'vol_reactivity', // null for non-behavior signals
  fiduciarySensitive: false,
  contentClass: 'education',
  // Rollover signals only:
  triggerType: 'plan_event',       // REQUIRED for type:'rollover' — never 'intent' or 'predicted'
}
```

**Key fiduciary rule for rollover signals:** `triggerType` must be `'plan_event'` — never derived from behavioral prediction, demographic inference, or employment intent signals. Rollover Moment Validator blocks any signal without this explicit field.

---

### Episode Entity

```js
{
  id: 'ep-001',
  name: 'COVID Market Crash — March 2020',
  type: 'volatility',             // 'volatility' / 'regulatory' / 'rollover' / 'behavior'
  triggerSignalId: 'sig-001',
  status: 'Learned',              // 'Active' / 'Learned'
  description: '...',
  maturityLevel: 5,               // 1–5
  historicalPrecedentCount: 7,
  participantsTargeted: 1200000,
  participantsEngaged: 374400,
  channelMix: {
    digitalJourney: 0.45,        // Must sum to 1.0
    email: 0.35,
    inApp: 0.15,
    advisorBrief: 0.05,
  },
  attributedOutcome: 'leakage_reduction',  // 'leakage_reduction' / 'deferral_increase' / 'rollover_retention' / 'sponsor_renewal'
  attributedValue: 2800000000,
  engagementRate: 0.312,
  coldStart: false,
  doNothingBaseline: {             // REQUIRED — first-class do-nothing option in every SimulationRun
    leakageRate: 0.038,
    deferralChangePct: -0.062,
    // ...outcome-specific fields
  },
  responseCurveData: [             // S-curve: cohortSize → channel engagement rates
    { cohortSize: 0, digitalEng: 0.000, emailEng: 0.000, inAppEng: 0.000, advisorEng: 0.000 },
    // ...increasing cohort sizes
  ],
  simulationRuns: 1000,
  p5Value: 1800000000,             // 5th percentile outcome
  p50Value: 2800000000,            // Median outcome
  p95Value: 4200000000,            // 95th percentile outcome
  complianceStatus: 'Cleared',
  contentUsed: ['...'],            // List of education content assets used
  keyLearnings: ['...'],           // Learnings for future simulation prior borrowing
}
```

---

### Rollover Moment Signal (extended Signal shape)

```js
{
  // All standard Signal fields, plus:
  type: 'rollover',               // Must be 'rollover'
  triggerType: 'plan_event',      // REQUIRED — never 'intent' / 'predicted'
  // Legal basis for rollover education:
  // - plan_termination → ERISA §203(e) 12-month distribution requirement
  // - age_threshold_59_5 → Plan rules: penalty-free in-service distributions at 59½
  // - force_out → ERISA §203(e) mandatory rollover for <$5K balances
  fiduciarySensitive: true,       // Always true for rollover signals
  contentClass: 'education',      // Always education — no solicitation language
  source: 'Recordkeeper termination feed / HRIS', // Must be a verified plan event source
}
```

**Anti-patterns blocked for rollover signals:**
- `triggerType: 'intent'` — predictive intent signals are BLOCKED
- Signals derived from LinkedIn activity, demographic prediction, or employment surveys
- Any language recommending a specific rollover destination over others
- "Likely to leave employer" as a trigger — BLOCKED

---

### Hypothesis / Use Case Entity

```js
{
  id: 'uc-a',
  title: 'Volatility Response',
  subtitle: 'VIX Spike → Stay-the-Course Education → Leakage Reduction',
  color: 'teal',
  duration: '72 hours to deployment',
  outcome: '$2.8B Leakage Prevented (P50)',
  outcomeDetail: '18% reduction in reactive fund transfers vs. holdout cohort over 90 days',
  agentChain: ['Market Sentinel', 'Context Decoder', ...],
  variants: '47 education-classified outputs across 5 content types',
  steps: [
    {
      actor: 'agent',              // 'agent' | 'human'
      panelType: 'signal_detection', // See WorkflowRunner panel types
      agent: 'Market Sentinel',
      stage: 'SENSE',              // SENSE / SIMULATE / GOVERN / DEPLOY / MEASURE / LEARN
      timing: 'Hours 0–1',
      label: 'Signal classified',
      headline: '...',
      description: '...',
      metric: { label: '...', value: '...' },
      panelData: { /* panel-type-specific data */ },
      // For placeholder steps only:
      seeds: { signalId: null, episodeId: null, initialFilter: null, archetype: null, productAngle: null }
    },
    // ...more steps
  ]
}
```

---

### Intervention Record Entity

```js
{
  id: 'int-001',
  episodeId: 'ep-001',            // Links to episodes.js
  cohortId: 'cohort-001',         // Links to participants.js (null for advisor-level interventions)
  planId: 'plan-001',             // Links to sponsors.js planId
  advisorId: null,                // Links to advisors.js (null for cohort-level interventions)
  channel: 'digitalJourney',      // 'digitalJourney' / 'email' / 'inApp' / 'advisorBrief'
  contentVariant: '...',
  sendTime: '2026-04-07T08:00:00Z',
  complianceStatus: 'Cleared',
  contentClass: 'education',      // Always 'education' unless advice-eligible + disclosure attached
  isHoldout: false,               // true = no intervention — holdout control
  predictedEngagement: 0.68,
  predictedLeakageReduction: 0.18, // Outcome-specific metric
  actualEngagement: 0.74,
  actualLeakageReduction: 0.21,
  outcome: 'Completed',
  sponsorImpact: 'Plan-level outcome summary',
}
```

---

## Format Utilities (`src/utils/format.js`)

| Function | Input | Output | Example |
|---|---|---|---|
| `fmtPct(v)` | `0.142` | `"14.2%"` | Deferral rate |
| `fmtM(v)` | `412000000` | `"$412M"` | AUM millions |
| `fmtB(v)` | `2800000000` | `"$2.8B"` | Leakage prevented |
| `fmtK(v)` | `412000` | `"$412K"` | Avg balance |
| `fmtConf(v)` | `0.94` | `"94%"` | Confidence score |
| `fmtRelTime(d)` | `'2026-04-04'` | `"11 days ago"` | Signal detection date |
| `fmtDate(d)` | `'2026-04-04'` | `"Apr 4, 2026"` | Formatted date |
