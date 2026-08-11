// Seed data for TwinX for Vanguard — Plan Sponsor (demo, no backend).
// Vanguard perspective: a book of plan sponsors; Home = book overview,
// Signals = a company's participation gap + insights, Decision Lab = portfolio.

export const BOOK = {
  totalSponsors: 24,
  totalEligible: 486000,
  totalParticipants: 379080,
  aggParticipation: 0.78,
  benchmark: 0.86,
  valueAtStake: 412, // $M AUM exposure across at-risk sponsors
  participationTrend: [
    { m: 'Feb', rate: 76 }, { m: 'Mar', rate: 76 }, { m: 'Apr', rate: 77 },
    { m: 'May', rate: 77 }, { m: 'Jun', rate: 78 }, { m: 'Jul', rate: 78 },
  ],
}

// Priority worklist — at-risk sponsors, ranked. First one is the demo sponsor.
export const SPONSORS = [
  {
    id: 'meridian', name: 'Meridian Logistics', industry: 'Transportation & Warehousing',
    employees: 42000, eligible: 38200, participants: 27500, benchmark: 0.86,
    valueOpp: 88, renewalRisk: 'High', priority: 1,
    get participation() { return this.participants / this.eligible },
    get gap() { return this.benchmark - this.participation },
    get nonParticipants() { return this.eligible - this.participants },
  },
  {
    id: 'atlas', name: 'Atlas Manufacturing', industry: 'Manufacturing',
    employees: 18500, eligible: 16900, participants: 12850, benchmark: 0.84,
    valueOpp: 41, renewalRisk: 'Medium', priority: 2,
    get participation() { return this.participants / this.eligible },
    get gap() { return this.benchmark - this.participation },
    get nonParticipants() { return this.eligible - this.participants },
  },
  {
    id: 'northwind', name: 'Northwind Health Systems', industry: 'Healthcare',
    employees: 31000, eligible: 28400, participants: 23100, benchmark: 0.85,
    valueOpp: 33, renewalRisk: 'Medium', priority: 3,
    get participation() { return this.participants / this.eligible },
    get gap() { return this.benchmark - this.participation },
    get nonParticipants() { return this.eligible - this.participants },
  },
  {
    id: 'summit', name: 'Summit Retail Group', industry: 'Retail',
    employees: 54000, eligible: 44000, participants: 32100, benchmark: 0.82,
    valueOpp: 62, renewalRisk: 'High', priority: 4,
    get participation() { return this.participants / this.eligible },
    get gap() { return this.benchmark - this.participation },
    get nonParticipants() { return this.eligible - this.participants },
  },
  {
    id: 'cedar', name: 'Cedar Financial', industry: 'Financial Services',
    employees: 9800, eligible: 9400, participants: 8600, benchmark: 0.88,
    valueOpp: 12, renewalRisk: 'Low', priority: 5,
    get participation() { return this.participants / this.eligible },
    get gap() { return this.benchmark - this.participation },
    get nonParticipants() { return this.eligible - this.participants },
  },
]

// Participation "why" insights for a sponsor (Signals drill-down).
export const INSIGHTS = [
  { key: 'newhire', label: 'New-hire enrollment lag', detail: '38% of hires in last 12 mo not enrolled after 90 days', weight: 'High' },
  { key: 'belowmatch', label: 'Below-match participants', detail: '6,200 contributing under the full employer match', weight: 'High' },
  { key: 'default', label: 'Stuck at default deferral', detail: '9,400 never changed from the 3% default', weight: 'Medium' },
  { key: 'legacy', label: 'Legacy elections', detail: '4,100 on pre-2019 elections / non-QDIA funds', weight: 'Medium' },
  { key: 'digital', label: 'Low digital engagement', detail: 'Portal login rate 22% below book median', weight: 'Low' },
]

// Candidate strategy cells — the portfolio allocator model.
export const STRATEGY_CELLS = [
  { id: 'ae', cohort: 'Eligible non-participants', population: 10700, strategy: 'Auto Enrollment', why: 'Participation gap / default friction', kpi: 'Incremental enrollment', content: 'Email, portal, notices', holdout: true },
  { id: 'ms', cohort: 'Below-match participants', population: 6200, strategy: 'Match Stretch + education', why: 'Match leakage', kpi: 'Deferral / match utilization', content: 'Match explainer, portal', holdout: true },
  { id: 'esc', cohort: 'Stuck-at-default participants', population: 9400, strategy: 'Auto Escalation', why: 'Deferral inertia', kpi: 'Deferral lift', content: 'Escalation email', holdout: true },
  { id: 're', cohort: 'Legacy elections', population: 4100, strategy: 'Re-enrollment', why: 'Outdated elections', kpi: 'Re-election / reset', content: 'Notices, portal confirm', holdout: true },
  { id: 'edu', cohort: 'Low-readiness cohort', population: 3300, strategy: 'Education-only', why: 'Lower operational risk', kpi: 'Engagement', content: 'FAQ, email', holdout: false },
  { id: 'hold', cohort: 'Control cells', population: 2000, strategy: 'Holdout', why: 'Causal proof', kpi: 'Incrementality', content: 'Suppression list', holdout: true },
]

// Lever packages + controls (Decision Lab · Lever Selection).
export const LEVERS = [
  { id: 'ae', name: 'Auto Enrollment', controls: ['Eligible population', 'Initial default rate', 'QDIA / default investment', 'Opt-out window', 'Effective date', 'Notice timing'] },
  { id: 'ms', name: 'Match Stretch', controls: ['Current formula', 'Proposed formula', 'Match cap', 'Cost-neutral toggle', 'Employer cost ceiling', 'Fairness impact'] },
  { id: 'esc', name: 'Auto Escalation', controls: ['Annual increase %', 'Cap', 'Start month / rule', 'Eligible participants', 'Opt-out path', 'Payroll schedule'] },
  { id: 're', name: 'Re-enrollment', controls: ['Sweep population', 'Sweep frequency', 'Default investment / QDIA', 'Notice window', 'Action deadline'] },
  { id: 'edu', name: 'Education-only', controls: ['Message theme', 'Channel mix', 'Cadence', 'Suppression', 'Content variants'] },
  { id: 'hold', name: 'Holdout / control', controls: ['Holdout %', 'Randomization', 'Stratification', 'Measurement window', 'Suppression rules'] },
]

// Stage-2 content assets + compliance checks.
export const ASSETS = [
  'Committee deck', 'Participant email', 'Portal banner + guided flow', 'Required notices',
  'Relationship executive brief', 'Payroll / recordkeeping kit', 'Measurement readout template',
]
export const COMPLIANCE = [
  { label: 'Claims approved', state: 'ok' },
  { label: 'Notice variables complete', state: 'ok' },
  { label: 'QDIA review status', state: 'review' },
  { label: 'Opt-out / change-election path present', state: 'ok' },
  { label: 'Sponsor committee version ready', state: 'review' },
  { label: 'Content approval state', state: 'blocked' },
]

// Simulation — projected portfolio scenarios vs do-nothing.
export const SCENARIOS = [
  { name: 'Do-nothing', lift: 0, deferral: 0, cost: 0, confidence: '—' },
  { name: 'Recommended', lift: 9.2, deferral: 1.4, cost: 2.1, confidence: 'High' },
  { name: 'Cost-aware', lift: 6.1, deferral: 0.9, cost: 1.2, confidence: 'High' },
  { name: 'Readiness-first', lift: 4.4, deferral: 0.7, cost: 0.8, confidence: 'Med' },
  { name: 'Max-lift', lift: 12.6, deferral: 2.0, cost: 3.6, confidence: 'Med' },
]

// Approval checklist + deployment lanes.
export const APPROVALS = [
  'Portfolio approval', 'Strategy-cell approval', 'Compliance approval',
  'Fiduciary review', 'Payroll / recordkeeping readiness', 'Sponsor-ready status',
]
export const LANES = [
  { lane: 'Auto Enrollment', treatment: 8700, holdout: 2000, channel: 'Email + portal + notices', status: 'Ready' },
  { lane: 'Match Stretch', treatment: 5100, holdout: 1100, channel: 'Match explainer + portal', status: 'Ready' },
  { lane: 'Auto Escalation', treatment: 7600, holdout: 1800, channel: 'Escalation email', status: 'Pending compliance' },
  { lane: 'Re-enrollment', treatment: 3400, holdout: 700, channel: 'Notices + portal confirm', status: 'Pending approval' },
  { lane: 'Education-only', treatment: 3300, holdout: 0, channel: 'FAQ + email', status: 'Ready' },
]

// Memory — prior sponsor decisions, holdout outcomes, reusable policies.
export const MEMORY_DECISIONS = [
  { sponsor: 'Beacon Freight', signal: 'Participation gap', portfolio: 'Auto Enrollment + Escalation', levers: 'AE 4% +1%, cap 10%', approval: 'Deployed', outcome: '+8.4% participation vs holdout' },
  { sponsor: 'Pioneer Foods', signal: 'Match leakage', portfolio: 'Match Stretch + education', levers: 'Stretch to 6%, cost-neutral', approval: 'Deployed', outcome: '+1.9% deferral, +2.1% match uptake' },
  { sponsor: 'Vantage Media', signal: 'Deferral inertia', portfolio: 'Auto Escalation', levers: '+1%/yr, cap 12%', approval: 'Deployed', outcome: '+1.2% deferral vs holdout' },
]
export const HOLDOUT_OUTCOMES = [
  { metric: 'Participation lift', predicted: '9.0%', treatment: '35.2%', holdout: '26.4%', incremental: '+8.8%' },
  { metric: 'Deferral lift', predicted: '1.3%', treatment: '7.1%', holdout: '5.8%', incremental: '+1.3%' },
  { metric: 'Opt-out rate', predicted: '11%', treatment: '9.4%', holdout: '—', incremental: 'Below plan' },
]
export const POLICIES = [
  'If eligible non-participants are high and notice readiness is complete → recommend Auto Enrollment with default rate + QDIA.',
  'If below-match participants are high and cost ceiling is tight → test Match Stretch with education.',
  'If plan-rule readiness is low → use Education-only fallback.',
]
export const CONTENT_LIBRARY = [
  'Committee deck template', 'Participant email template', 'Portal copy template',
  'Required-notice draft template', 'Compliance-approved claims set',
]

export const DECISION_TABS = [
  'Portfolio Recommendation', 'Lever Selection', 'Content & Compliance',
  'Simulation', 'Approval', 'Deployment',
]
