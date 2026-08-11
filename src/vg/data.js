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
    id: 'cedar', name: 'Alderpoint Financial', industry: 'Financial Services',
    employees: 9800, eligible: 9400, participants: 8600, benchmark: 0.88,
    valueOpp: 12, renewalRisk: 'Low', priority: 5,
    get participation() { return this.participants / this.eligible },
    get gap() { return this.benchmark - this.participation },
    get nonParticipants() { return this.eligible - this.participants },
  },
]

// Signals landing — Today's Focus (live monitoring strip).
export const TODAYS_FOCUS = [
  { tag: 'Priority', tone: 'urgent', text: 'Meridian Logistics — participation 14 pts below benchmark (10,700 eligible non-participants)', sponsor: 'meridian' },
  { tag: 'Regulatory', tone: 'amber', text: 'SECURE 2.0 mandatory auto-enrollment now applies to new plans across the book' },
  { tag: 'Renewal', tone: 'amber', text: 'Summit Retail Group renewal window opens in 45 days', sponsor: 'summit' },
]

// Signals landing — KPI tab (book-level behavior radar).
export const SIGNAL_KPIS = [
  { label: 'Aggregate participation', val: '78%', sub: '−8 pts vs benchmark', chip: 'Participation', up: false, spark: [7, 7, 6, 7, 7, 7, 8] },
  { label: 'Hardship leakage', val: '2.4%', sub: '+0.3 pts YoY', chip: 'Leakage', up: false, spark: [4, 4, 5, 5, 6, 6, 6] },
  { label: 'Roth adoption', val: '31%', sub: '+2 pts YoY', chip: 'Roth', up: true, spark: [3, 4, 4, 5, 5, 6, 6] },
  { label: 'Avg deferral rate', val: '6.8%', sub: '+0.2 pts QoQ', chip: 'Deferral', up: true, spark: [5, 5, 6, 6, 6, 7, 7] },
  { label: 'Digital engagement', val: '54%', sub: '−3 pts vs median', chip: 'Digital', up: false, spark: [6, 6, 5, 5, 5, 5, 5] },
  { label: 'Sponsor retention', val: '93%', sub: '+0.5 pts QoQ', chip: 'Retention', up: true, spark: [6, 6, 7, 7, 7, 7, 7] },
]

// Signals landing — Market Intelligence tab (reaction-based taxonomy).
export const MARKET_SIGNALS = [
  { id: 'm1', type: 'Regulatory', impact: 'high', title: 'SECURE 2.0 mandatory auto-enrollment', detail: 'New 401(k)/403(b) plans must auto-enroll at 3–10% with escalation. Affects plan-design defaults across the book.', when: '2h ago' },
  { id: 'm2', type: 'Market', impact: 'medium', title: 'Equity volatility spike (VIX regime break)', detail: 'Elevated volatility historically drives reactive reallocation; watch panic-trading cohorts.', when: '5h ago' },
  { id: 'm3', type: 'Rates', impact: 'medium', title: '10Y yield +28 bps this week', detail: 'Rate move affects target-date glidepaths and stable-value flows.', when: '1d ago' },
  { id: 'm4', type: 'Plan Event', impact: 'high', title: 'Meridian Logistics — participation gap', detail: '42,000 employees; 10,700 eligible non-participants. Below-benchmark participation flagged.', when: '1d ago', sponsor: 'meridian' },
  { id: 'm5', type: 'Regulatory', impact: 'low', title: 'IRS 2026 contribution limits released', detail: 'Elective deferral limit updated; notice variables need a refresh.', when: '2d ago' },
  { id: 'm6', type: 'Plan Event', impact: 'medium', title: 'Summit Retail Group — renewal window', detail: 'Renewal in 45 days; participation 9 pts below benchmark presents an enablement opportunity.', when: '2d ago', sponsor: 'summit' },
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
  { id: 'ae', cohort: 'Eligible non-participants', population: 10700, strategy: 'Auto Enrollment', why: 'Participation gap / default friction', kpi: 'Incremental enrollment', content: 'Email, portal, notices', channels: ['Participant email', 'Portal banner', 'Notices'], holdout: true },
  { id: 'ms', cohort: 'Below-match participants', population: 6200, strategy: 'Match Stretch + education', why: 'Match leakage', kpi: 'Deferral / match utilization', content: 'Match explainer, portal', channels: ['Match explainer', 'Participant email', 'Portal banner'], holdout: true },
  { id: 'esc', cohort: 'Stuck-at-default participants', population: 9400, strategy: 'Auto Escalation', why: 'Deferral inertia', kpi: 'Deferral lift', content: 'Escalation email, portal', channels: ['Escalation email', 'Portal banner', 'Notices'], holdout: true },
  { id: 're', cohort: 'Legacy-election holders', population: 4100, strategy: 'Re-enrollment', why: 'Outdated elections', kpi: 'Re-election / reset', content: 'Notices, portal confirm', channels: ['Notices', 'Portal confirm'], holdout: true },
  { id: 'edu', cohort: 'Low-readiness cohort', population: 3300, strategy: 'Education-only', why: 'Lower operational risk', kpi: 'Engagement', content: 'FAQ, email', channels: ['FAQ', 'Participant email'], holdout: false },
  { id: 'hold', cohort: 'Control cells', population: 2000, strategy: 'Holdout', why: 'Causal proof', kpi: 'Incrementality', content: 'Suppression list', channels: ['Suppression list'], holdout: true },
]

// Exhaustive, education-framed content assets per strategy (Content & Compliance).
// Each piece mirrors the demo structure: format, subject, headline, body, CTA, compliance note.
export const STRATEGY_CONTENT = {
  ae: [
    {
      asset: 'Committee deck', format: 'Sponsor committee deck — plan-design recommendation', subject: null,
      headline: 'Auto Enrollment for eligible non-participants',
      subhead: 'A plan-design change to close the participation gap.',
      body: [
        'Recommendation: adopt automatic enrollment for the 10,700 eligible employees who have not enrolled, at a 4% default deferral with 1%/yr auto-escalation to a 10% cap, invested in the plan\'s QDIA.',
        'Rationale: 38% of hires in the last 12 months remain unenrolled after 90 days. Default friction — not affordability — is the dominant driver, based on cohort analysis and the Beacon Freight analog (+8.4% participation vs holdout).',
        'Governance: a randomized holdout is preserved for causal measurement; required participant notices, opt-out windows, and QDIA disclosures attach automatically. Fiduciary review is required before launch.',
      ],
      cta: 'Approve for participant rollout',
      complianceNote: 'Education-classified plan-design recommendation. Holdout preserved for incrementality. QDIA review status must clear before deploy.',
      sections: [
        { heading: 'The opportunity', body: '10,700 eligible employees are not enrolled — a 14-point participation gap vs the 86% benchmark, representing $88M in net-new AUM opportunity.' },
        { heading: 'Recommendation', body: 'Activate automatic enrollment at a 4% default deferral with 1%/yr auto-escalation to a 10% cap, invested in the plan\'s QDIA.' },
        { heading: 'Who is affected', body: 'Eligible employees not currently contributing. Employees already contributing are unaffected. A randomized holdout is carved for causal measurement.' },
        { heading: 'Projected impact', body: '+9.3 pts participation (to ~81%), ~2,400 incremental enrollments, +$101M AUM at ~$2.2M incremental match cost (≈46.7× AUM-to-cost).' },
        { heading: 'Governance & timeline', body: 'Required notices, opt-out windows, and QDIA disclosures auto-attach. Fiduciary review required. Staged rollout over the configured window.' },
      ],
    },
    {
      asset: 'Participant email', format: 'Participant email — pre-enrollment notice',
      subject: 'An easier way to start saving for retirement',
      headline: 'Your plan is adding automatic enrollment', subhead: null,
      body: [
        'Hi [First Name],',
        'To make saving simpler, your employer\'s retirement plan will soon enroll eligible employees automatically at a 4% contribution rate, increasing 1% each year up to 10%. Your contributions go into the plan\'s default investment.',
        'This is an educational notice, not advice. You are always in control: you can change your contribution rate, choose different investments, or opt out entirely at any time in your account before the effective date.',
      ],
      cta: 'Review my options',
      complianceNote: 'Personalization token [First Name] must resolve; fallback "Hi there". Opt-out path and effective date required. "Not advice" footer auto-attaches.',
      variants: [
        { letter: 'A', label: 'Simplicity framing', subject: 'An easier way to start saving for retirement',
          headline: 'Saving just got automatic',
          body: ['Your plan will enroll you at 4%, rising 1% a year to 10%, invested in the plan default.', 'Nothing to do to start — and you can change or opt out anytime before the effective date.'],
          cta: 'Review my options' },
        { letter: 'B', label: 'Future-value framing', subject: 'A small step now, a bigger balance later',
          headline: 'What 4% could grow into',
          body: ['Starting at a 4% contribution — automatically escalated over time — can compound meaningfully by retirement.', 'This is educational, not advice. You stay in full control of your rate, investments, and the choice to opt out.'],
          cta: 'See what I could save' },
      ],
    },
    {
      asset: 'Portal banner', format: 'Secure-site portal banner + guided flow', subject: null,
      headline: 'Your plan just got easier',
      subhead: 'Automatic enrollment is coming for eligible participants.',
      body: [
        'A short guided flow walks you through what automatic enrollment means for you: your default contribution rate, how auto-escalation works, where your money is invested, and every choice available to you.',
        'Nothing here is a recommendation. It shows you what will happen by default and how to change it if you\'d prefer something else.',
      ],
      cta: 'Review my plan',
      complianceNote: 'Education content class · no advice language. Change-election and opt-out links must be present on the banner.',
    },
    {
      asset: 'Required notice', format: 'Required participant notice (ERISA)', subject: null,
      headline: 'Automatic enrollment notice', subhead: null,
      body: [
        'This notice describes an automatic contribution arrangement that will affect your account unless you elect otherwise.',
        'It includes: your default contribution rate (4%), the annual auto-escalation schedule (1%/yr to a 10% cap), the default investment (the plan\'s QDIA), your right to opt out or change your election, and the effective date. Please review before the effective date.',
      ],
      cta: 'Read the full notice',
      complianceNote: 'Statutory notice. Notice variables must be complete before distribution. Timing must satisfy the pre-effective-date window.',
    },
  ],
  ms: [
    {
      asset: 'Committee deck', format: 'Sponsor committee deck — plan-design recommendation', subject: null,
      headline: 'Match Stretch for below-match participants',
      subhead: 'Help 6,200 participants capture the full employer match.',
      body: [
        'Recommendation: restructure the match formula toward a stretch design (target 6%) so participants must defer more to receive the full match, paired with an education campaign. Modeled cost-neutral against current match spend.',
        'Rationale: 6,200 participants contribute below the level needed to capture the full match — leaving employer dollars on the table. The Fernhollow Foods analog delivered +1.9% deferral and +2.1% match uptake, cost-neutral.',
        'Governance: fairness and non-discrimination (ADP/ACP) impact is modeled; a holdout is preserved. Education content is classified as participant education, not advice.',
      ],
      cta: 'Approve cost-neutral stretch',
      complianceNote: 'Cost-neutral toggle must be verified. Fairness impact (HCE/NHCE) reviewed. Education-classified.',
      sections: [
        { heading: 'The opportunity', body: '6,200 participants contribute below the full-match threshold, leaving employer match dollars uncaptured.' },
        { heading: 'Recommendation', body: 'Restructure toward a stretch match (target 6%) so full match requires a higher deferral, paired with an education campaign. Modeled cost-neutral.' },
        { heading: 'Fairness check', body: 'ADP/ACP and HCE–NHCE impact modeled; a holdout is preserved to measure incremental deferral and match uptake.' },
        { heading: 'Projected impact', body: '+1.9 pts deferral and +2.1 pts match utilization at effectively zero incremental match spend (Fernhollow Foods analog).' },
      ],
    },
    {
      asset: 'Match explainer', format: 'Participant education — match explainer', subject: null,
      headline: 'You may be leaving free money on the table',
      subhead: 'How your employer match works — and the deferral needed to capture all of it.',
      body: [
        'Your employer matches part of what you contribute. If you contribute less than the match threshold, you receive less than the full match available to you.',
        'This educational summary shows how the match formula works and the contribution level needed to receive the full match. It does not tell you what to do — the decision is yours.',
      ],
      cta: 'See how my match works',
      complianceNote: 'Educational only — not advice. No projected-return claims. Match formula figures must match the plan document.',
    },
    {
      asset: 'Participant email', format: 'Participant email — match awareness',
      subject: 'A quick look at your employer match',
      headline: 'Are you getting your full match?', subhead: null,
      body: [
        'Hi [First Name],',
        'Your plan\'s employer match may be worth more than you\'re currently capturing. Many participants contribute just under the level needed to receive the full match.',
        'This is an educational note, not advice. Take a look at how your match works and decide whether adjusting your contribution makes sense for you. You can change your election anytime.',
      ],
      cta: 'Check my match',
      complianceNote: '[First Name] fallback required. "Not advice" footer. No individualized recommendation.',
    },
    {
      asset: 'Portal banner', format: 'Secure-site portal banner', subject: null,
      headline: 'Make the most of your match',
      subhead: 'See the deferral level that captures your full employer match.',
      body: [
        'A short interactive view shows your current contribution, the match you\'re receiving today, and the match available at the full-capture deferral level.',
        'It\'s a factual view of your own plan — not a recommendation to change anything.',
      ],
      cta: 'View my match detail',
      complianceNote: 'Contribution-based, factual. No advice language. Disclosures apply.',
    },
  ],
  esc: [
    {
      asset: 'Committee deck', format: 'Sponsor committee deck — plan-design recommendation', subject: null,
      headline: 'Auto Escalation for stuck-at-default participants',
      subhead: 'Move 9,400 participants off the 3% default over time.',
      body: [
        'Recommendation: apply automatic annual escalation of 1%/yr to a 12% cap for the 9,400 participants who have never changed from the 3% default, with a clear opt-out at each step.',
        'Rationale: deferral inertia — not intent — keeps these participants at the default. The Vantage Media analog delivered +1.2% deferral vs holdout with escalation alone.',
        'Governance: opt-out path is presented at each increase; holdout preserved for measurement; notices attach automatically.',
      ],
      cta: 'Approve escalation schedule',
      complianceNote: 'Opt-out path required at each step. Payroll schedule alignment verified. Holdout preserved.',
      sections: [
        { heading: 'The opportunity', body: '9,400 participants have never moved off the 3% default — deferral inertia, not affordability, is the barrier.' },
        { heading: 'Recommendation', body: 'Apply automatic annual escalation of 1%/yr to a 12% cap, with a clear opt-out presented at each step.' },
        { heading: 'Participant protection', body: 'Every increase is preceded by notice and an easy opt-out/pause path; a holdout is preserved for measurement.' },
        { heading: 'Projected impact', body: '+1.2 pts deferral vs holdout (Vantage Media analog), compounding over subsequent escalation cycles.' },
      ],
    },
    {
      asset: 'Escalation email', format: 'Participant email — escalation notice',
      subject: 'A small step up in your retirement savings',
      headline: 'Your contribution will increase by 1% next year', subhead: null,
      body: [
        'Hi [First Name],',
        'To help you keep pace toward your retirement goals, your contribution rate is scheduled to increase by 1% next year, up to a 12% cap. Small, gradual increases can add up meaningfully over time.',
        'This is an educational notice. No action is required — but you can pause the increase, change your rate, or opt out anytime before it takes effect.',
      ],
      cta: 'Manage my increase',
      complianceNote: '[First Name] fallback. Opt-out/pause link required. Effective date and cap disclosed. "Not advice" footer.',
    },
    {
      asset: 'Portal banner', format: 'Secure-site portal banner', subject: null,
      headline: 'Your savings are set to grow',
      subhead: 'See your upcoming automatic contribution increase.',
      body: [
        'A short view shows your current rate, next year\'s scheduled rate, the cap, and every option available to you — including pausing or opting out.',
        'It explains what happens by default. What you do with it is up to you.',
      ],
      cta: 'Review my schedule',
      complianceNote: 'Education class. Opt-out and change-election controls must be present. Disclosures apply.',
    },
    {
      asset: 'Required notice', format: 'Required participant notice (ERISA)', subject: null,
      headline: 'Automatic escalation notice', subhead: null,
      body: [
        'This notice describes an automatic contribution-increase arrangement that will affect your account unless you elect otherwise.',
        'It includes the annual increase (1%/yr), the cap (12%), your right to opt out or change your election at any time, and the effective date of each increase. Please review before the effective date.',
      ],
      cta: 'Read the full notice',
      complianceNote: 'Statutory notice. Variables complete before distribution. Pre-effective-date timing enforced.',
    },
  ],
  re: [
    {
      asset: 'Committee deck', format: 'Sponsor committee deck — plan-design recommendation', subject: null,
      headline: 'Re-enrollment for legacy-election holders',
      subhead: 'Reset 4,100 participants on pre-2019 / non-QDIA elections.',
      body: [
        'Recommendation: a one-time re-enrollment sweep mapping legacy and non-QDIA elections into the plan\'s current default investment, with advance notice and a full opt-out window.',
        'Rationale: 4,100 participants hold outdated elections that no longer reflect the plan\'s default lineup, creating fiduciary and suitability drift.',
        'Governance: mapping is default-to-QDIA only; participants may retain existing elections by acting within the notice window; holdout preserved.',
      ],
      cta: 'Approve re-enrollment sweep',
      complianceNote: 'QDIA mapping only. Advance-notice window and opt-out required. Fiduciary review required.',
    },
    {
      asset: 'Required notice', format: 'Required participant notice (ERISA)', subject: null,
      headline: 'Re-enrollment notice', subhead: null,
      body: [
        'This notice describes a re-enrollment of plan accounts into the plan\'s default investment unless you elect otherwise.',
        'It includes the default investment (QDIA), the date your account will be mapped, your right to keep your current elections by acting before that date, and how to make changes. Please review before the effective date.',
      ],
      cta: 'Read the full notice',
      complianceNote: 'Statutory notice. QDIA disclosure required. Opt-out window must precede mapping date.',
    },
    {
      asset: 'Portal confirm', format: 'Secure-site portal confirmation flow', subject: null,
      headline: 'Confirm or update your investment elections',
      subhead: 'Your elections are being refreshed — review before the effective date.',
      body: [
        'A short confirmation flow shows your current elections, the default your account will map to, and the choice to keep, change, or confirm your investments.',
        'It explains what will happen by default. Keeping your current elections takes just one step.',
      ],
      cta: 'Review my elections',
      complianceNote: 'Education class. Keep/change/confirm paths must all be present. Disclosures apply.',
    },
  ],
  edu: [
    {
      asset: 'FAQ', format: 'Participant education — FAQ', subject: null,
      headline: 'Your retirement plan: common questions', subhead: null,
      body: [
        'This FAQ answers common questions about your plan: how contributions work, what the employer match is, how the default investment is chosen, and where to make changes.',
        'It is informational only. Nothing here is a recommendation — it helps you understand the choices already available to you.',
      ],
      cta: 'Read the FAQ',
      complianceNote: 'Education-classified. No advice or projected-return language. Disclosures apply.',
    },
    {
      asset: 'Participant email', format: 'Participant email — education nudge',
      subject: 'A few things worth knowing about your plan',
      headline: 'Getting the most from your retirement plan', subhead: null,
      body: [
        'Hi [First Name],',
        'Your retirement plan has several features designed to help you save — the employer match, automatic increases, and a default investment chosen for long-term savers.',
        'This is an educational note, not advice. When you have a few minutes, it\'s worth understanding what\'s available so you can decide what fits your situation.',
      ],
      cta: 'Explore my plan',
      complianceNote: '[First Name] fallback. Education-classified. No individualized recommendation.',
    },
  ],
}

// Recommended Strategy postures — three portfolio stances. Balanced is the default/recommended.
// Each segment references a STRATEGY_CELLS id and the audience size that receives that lever.
export const STRATEGY_PLAYBOOKS = [
  {
    id: 'aggressive', name: 'Aggressive',
    tagline: 'Maximize participation and net-new AUM fast — every lever, broad reach, smaller holdout.',
    value: { lift: 12.6, enroll: 11800, aum: 121, cost: 3.4, roi: 35.6 },
    segments: [
      { cell: 'ae', audience: 10700 },
      { cell: 'ms', audience: 6200 },
      { cell: 'esc', audience: 9400 },
      { cell: 're', audience: 4100 },
    ],
  },
  {
    id: 'balanced', name: 'Balanced', rec: true,
    tagline: 'The recommended mix — strong lift with contained cost and a preserved holdout for causal proof.',
    value: { lift: 9.2, enroll: 8600, aum: 79, cost: 1.7, roi: 46.5 },
    segments: [
      { cell: 'ae', audience: 10700 },
      { cell: 'ms', audience: 6200 },
      { cell: 'esc', audience: 9400 },
    ],
  },
  {
    id: 'conservative', name: 'Conservative',
    tagline: 'Lowest cost and operational risk — selective, notice-heavy automation plus a cost-neutral match stretch.',
    value: { lift: 4.4, enroll: 4100, aum: 38, cost: 0.6, roi: 63.3 },
    segments: [
      { cell: 'ae', audience: 6000 },
      { cell: 'ms', audience: 3000 },
    ],
  },
]

// Decision Lab · Objective — what the run optimizes.
export const OBJECTIVES = [
  { id: 'participation', label: 'Increase participation', desc: 'Close the gap to benchmark for eligible non-participants.', rec: true },
  { id: 'leakage', label: 'Reduce hardship leakage', desc: 'Lower early withdrawals that erode balances.' },
  { id: 'deferral', label: 'Lift deferral rates', desc: 'Move stuck-at-default participants toward the full match.' },
  { id: 'aum', label: 'Retain & grow AUM', desc: 'Protect assets at risk and improve long-term retention.' },
]

// Decision Lab · Objective — delivery channels for the run.
export const CHANNELS = ['Email', 'Portal', 'Notices', 'Advisor brief', 'In-app nudge']

// Illustrative average participant balance, used to translate lift → AUM.
export const AVG_BALANCE = 42000

// Industry-context primary KPI surfaced in Objective + Simulation.
export const INDUSTRY_KPI = {
  'Transportation & Warehousing': { label: 'New-hire capture', factor: 1.9, unit: 'pts' },
  'Manufacturing': { label: 'Deferral capture', factor: 1.3, unit: 'pts' },
  'Healthcare': { label: 'Roth adoption', factor: 1.0, unit: 'pts' },
  'Retail': { label: 'New-hire capture', factor: 2.1, unit: 'pts' },
  'Financial Services': { label: 'HCE participation', factor: 0.7, unit: 'pts' },
}

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
  'Committee deck', 'Participant email', 'Portal banner + guided flow', 'Notices',
  'Relationship executive brief', 'Payroll / recordkeeping kit', 'Measurement readout template',
]
export const COMPLIANCE = [
  { label: 'Claims approved', state: 'ok' },
  { label: 'Notice variables complete', state: 'ok' },
  { label: 'QDIA review status', state: 'review' },
  { label: 'Opt-out / change-election path present', state: 'ok' },
  { label: 'Sponsor committee version ready', state: 'review' },
  { label: 'Check for content compliance', state: 'blocked' },
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
  {
    id: 'beacon', sponsor: 'Beacon Freight', signal: 'Participation gap', portfolio: 'Auto Enrollment + Escalation',
    levers: 'AE 4% +1%, cap 10%', approval: 'Deployed', status: 'Completed', outcome: '+8.4% participation vs holdout',
    completedOn: 'Mar 2025', window: '12-week measurement window · closed',
    impact: {
      participationLift: 8.4, treatmentPart: 0.822, holdoutPart: 0.738, baseline: 0.72,
      enrollments: 3210, aum: 134, cost: 2.9, roi: 46.2, deferralLift: 1.1, optOut: 9.4, predictedLift: 9.0,
      lanes: [
        { strategy: 'Auto Enrollment', treated: 8700, holdout: 2000, realized: '+7.9 pts enrollment' },
        { strategy: 'Auto Escalation', treated: 7600, holdout: 1800, realized: '+1.1 pts deferral' },
      ],
      summary: 'Automatic enrollment closed most of the participation gap within a single quarter; escalation compounded deferral gains. Incremental AUM of $134M was captured against $2.9M of employer match cost — a 46× return — with opt-out staying below the 11% plan assumption.',
    },
  },
  {
    id: 'fernhollow', sponsor: 'Fernhollow Foods', signal: 'Match leakage', portfolio: 'Match Stretch + education',
    levers: 'Stretch to 6%, cost-neutral', approval: 'Deployed', status: 'Completed', outcome: '+1.9% deferral, +2.1% match uptake',
    completedOn: 'Jan 2025', window: '16-week measurement window · closed',
    impact: {
      participationLift: 2.3, treatmentPart: 0.851, holdoutPart: 0.828, baseline: 0.83,
      enrollments: 640, aum: 58, cost: 0.0, roi: 999, deferralLift: 1.9, optOut: 4.1, predictedLift: 2.0,
      lanes: [
        { strategy: 'Match Stretch', treated: 5100, holdout: 1100, realized: '+2.1 pts match uptake' },
        { strategy: 'Education-only', treated: 3300, holdout: 0, realized: '+0.6 pts engagement' },
      ],
      summary: 'The cost-neutral match stretch moved below-match participants toward full-match deferral without adding employer cost. Deferral rose +1.9 pts and match utilization +2.1 pts, adding $58M in AUM at effectively zero incremental match spend.',
    },
  },
  {
    id: 'vantage', sponsor: 'Vantage Media', signal: 'Deferral inertia', portfolio: 'Auto Escalation',
    levers: '+1%/yr, cap 12%', approval: 'Deployed', status: 'Completed', outcome: '+1.2% deferral vs holdout',
    completedOn: 'Nov 2024', window: '12-week measurement window · closed',
    impact: {
      participationLift: 0.8, treatmentPart: 0.796, holdoutPart: 0.788, baseline: 0.79,
      enrollments: 210, aum: 41, cost: 1.4, roi: 29.3, deferralLift: 1.2, optOut: 7.8, predictedLift: 1.3,
      lanes: [
        { strategy: 'Auto Escalation', treated: 9400, holdout: 2100, realized: '+1.2 pts deferral' },
      ],
      summary: 'Auto escalation alone lifted deferral +1.2 pts against holdout for stuck-at-default participants, adding $41M in AUM. Opt-out stayed contained at 7.8%, confirming inertia — not intent — was the barrier.',
    },
  },
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
  'Objective', 'Lever Selection', 'Recommended Strategy',
  'Content & Compliance', 'Simulation', 'Approval', 'Deployment',
]
