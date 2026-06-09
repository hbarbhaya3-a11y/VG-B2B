// Agent conversation scripts for each workflow step
// Each step defines the messages an agent will surface during the conversation.
// v1: pre-authored scripts. v2: integrate with LLM via src/ai/llm.js

export const AGENT_VOICES = {
  'market-sentinel': { tone: 'Urgent, data-driven', color: 'teal', icon: 'IconRadar' },
  'context-decoder': { tone: 'Analytical, segmentation-focused', color: 'cyan', icon: 'IconBrain' },
  'content-architect': { tone: 'Creative, variant-focused', color: 'orange', icon: 'IconPencil' },
  'quant-bridge': { tone: 'Quantitative, probability-framed', color: 'violet', icon: 'IconChartBar' },
  'decision-owner': { tone: 'Gate-keeper, approval-focused', color: 'yellow', icon: 'IconUserCheck' },
  'guardrail-guardian': { tone: 'Cautious, compliance-first', color: 'red', icon: 'IconShield' },
  'journey-executor': { tone: 'Operational, deployment-focused', color: 'green', icon: 'IconRoute' },
  'learning-system': { tone: 'Reflective, outcome-focused', color: 'gray', icon: 'IconActivity' },
}

// Scripts keyed by panelType
export const agentScripts = {
  signal_detection: {
    agentId: 'market-sentinel',
    agentName: 'Market Sentinel',
    color: 'teal',
    messages: [
      { type: 'narrative', text: 'Ingesting behavioral signals from Vanguard secure site, Adobe Analytics, and CRM engagement feed…' },
      { type: 'progress', label: 'Classifying investor behavioral signal type...', duration: 1500 },
      {
        type: 'narrative',
        text: 'Behavior Radar has detected a rising Advisory Readiness Gap — 42,000 self-directed investors showing planning intent (retirement calculator usage, portfolio review visits, repeated advice-content engagement) with no advisory relationship started. Model confidence: 91%.',
        embed: 'signal_dashboard',
      },
      {
        type: 'narrative',
        text: 'I matched 3 historical precedents. Best match: Market Volatility Advisory Outreach (Mar 2024, 88% similarity) — education-first reassurance + optional portfolio review drove +22% advice consultation starts vs holdout.',
        embed: 'precedent_table',
      },
      {
        type: 'narrative',
        text: 'Based on these precedents, a 30-day intervention window is optimal. Planning tool usage is 3.4× baseline — the readiness signal is strong but time-sensitive.',
      },
    ],
    guidedQuestion: {
      text: 'Advisory Readiness Gap confirmed — 42,000 investors in scope, 91% confidence. Proceed to behavioral segmentation?',
      quickReplies: [
        { label: 'Proceed to segmentation', action: 'advance' },
        { label: 'Show Mar 2024 precedent config', action: 'expand_precedent' },
        { label: 'Adjust parameters', action: 'show_params' },
      ],
    },
    handoff: {
      toAgent: 'Context Decoder',
      toColor: 'cyan',
      context: 'Advisory Readiness Gap — 42,000 investors, 91% confidence, 3 precedents matched, 30-day window',
    },
  },

  advisor_targeting: {
    agentId: 'context-decoder',
    agentName: 'Context Decoder',
    color: 'cyan',
    messages: [
      { type: 'narrative', text: 'Received Advisory Readiness Gap signal from Market Sentinel. Now scoring 42,000 investor behavioral twins across 6 need-state dimensions…' },
      { type: 'progress', label: 'Scoring investor twins via XGBoost behavioral model (47 features)...', duration: 2000 },
      {
        type: 'narrative',
        text: '42,000 investors segmented into 6 behavioral need-states: Planning-Active Advice-Undecided, High-Cash Low-Conviction, Portfolio Complexity Builders, Volatility-Sensitive Watchers, Rollover/Transition Explorers, and Digitally Engaged Service-Frustrated. 4,200 holdout preserved for causal measurement.',
        embed: 'tier_breakdown',
      },
      {
        type: 'narrative',
        text: 'Segment 1 (8,400): Secure site card + email — portfolio review invitation. Segment 2 (7,200): App push + secure site module — cash education. Segments 3–6: matched to appropriate channel and content. All classified as education — no advice payload.',
      },
    ],
    guidedQuestion: {
      text: '42,000 investors across 6 behavioral segments. Proceed to content & channel configuration?',
      quickReplies: [
        { label: 'Proceed to content config', action: 'advance' },
        { label: 'Adjust segment assignments', action: 'show_params' },
      ],
    },
    handoff: {
      toAgent: 'Content Architect',
      toColor: 'orange',
      context: '7,900 advisors: 150 T1, 1,200 T2, 6,550 T3, 400 holdout',
    },
  },

  content_channel_config: {
    agentId: 'content-architect',
    agentName: 'Content Architect',
    color: 'orange',
    messages: [
      { type: 'narrative', text: 'Advisor targeting received from Context Decoder. Now configuring content types and channel assignments for 7,900 advisors...' },
      {
        type: 'narrative',
        text: '11 content types available across 3 channels (Wholesaler, Email, Portal). Historical performance data loaded for each type.',
        embed: 'content_channel_table',
      },
    ],
    guidedQuestion: {
      text: 'Review the content types and channels. Adjust selections, then proceed to generate creative variants.',
      quickReplies: [
        { label: 'Generate variants with these selections', action: 'advance' },
        { label: 'Edit content selections', action: 'show_params' },
      ],
    },
    handoff: {
      toAgent: 'Content Architect',
      toColor: 'orange',
      context: 'Content types and channels configured, ready for variant generation',
    },
  },

  content_generation: {
    agentId: 'content-architect',
    agentName: 'Content Architect',
    color: 'orange',
    messages: [
      { type: 'narrative', text: 'Received advisor targeting from Context Decoder. Configuring content generation for 7,900 advisors across 3 tiers...' },
      { type: 'progress', label: 'Applying Capital Ideas corpus voice (LoRA + RLHF)...', duration: 800 },
      { type: 'progress', label: 'Generating article with 5 charts...', duration: 1200 },
      { type: 'progress', label: 'Creating 2 email A/B variants (Thompson sampling)...', duration: 800 },
      { type: 'progress', label: 'Personalising 150 wholesaler intelligence briefs...', duration: 1500 },
      { type: 'progress', label: 'Assembling portal, PDF, social, podcast, conversation guide...', duration: 1000 },
      {
        type: 'narrative',
        text: '212 personalized outputs generated across 8 asset types. Each variant personalised to advisor tier and archetype.',
        embed: 'asset_gallery',
      },
    ],
    guidedQuestion: {
      text: '212 outputs ready. Review the previews and confirm, or ask me to regenerate specific variants.',
      quickReplies: [
        { label: 'Proceed to simulation', action: 'advance' },
        { label: 'Preview article', action: 'expand_article' },
        { label: 'Preview wholesaler brief', action: 'expand_brief' },
      ],
    },
    handoff: {
      toAgent: 'Guardrail Guardian',
      toColor: 'red',
      context: '212 outputs generated, ready for clearance before simulation',
    },
  },

  simulation: {
    agentId: 'twinx-simulation',
    agentName: 'TwinX Simulation',
    color: 'violet',
    messages: [
      { type: 'narrative', text: 'Received content variants from Content Architect. Preparing simulation with all inputs: 7,900 advisors, 3 tiers, 212 personalized outputs, 8 channels.' },
      {
        type: 'narrative',
        text: 'Here are the pre-loaded parameters from the Mar 2026 precedent. You can adjust before I run.',
        embed: 'simulation_config',
      },
    ],
    guidedQuestion: {
      text: 'Should I run the simulation with these parameters, or would you like to adjust?',
      quickReplies: [
        { label: 'Run with these parameters', action: 'run_simulation' },
        { label: 'Let me adjust', action: 'show_params' },
      ],
    },
    postRunMessages: [
      { type: 'progress', label: 'Loading 18 episode priors from TwinX...', duration: 800 },
      { type: 'progress', label: 'Fitting Bayesian hierarchical response curves...', duration: 1200 },
      { type: 'progress', label: 'Running 1,000 TwinX simulation iterations...', duration: 2500 },
      { type: 'progress', label: 'Ranking scenarios by cost-efficiency...', duration: 600 },
      {
        type: 'narrative',
        text: '3 scenarios generated. Scenario A is recommended: 20% engagement at $210K cost, $185M estimated AUM (82% confidence).',
        embed: 'scenario_comparison',
      },
      {
        type: 'narrative',
        text: 'Scenario B offers higher engagement (28%) but at 1.8× cost ($380K). Scenario C is email-only — no Tier 1 phone touchpoint, $120K cost.',
      },
    ],
    scenarioQuestion: {
      text: 'Which scenario would you like to proceed with?',
      quickReplies: [
        { label: 'Scenario A (recommended)', action: 'select_A' },
        { label: 'Scenario B (aggressive)', action: 'select_B' },
        { label: 'Scenario C (lean)', action: 'select_C' },
      ],
    },
    handoff: {
      toAgent: 'Decision Owner',
      toColor: 'yellow',
      context: 'Scenario selected, ready for approval',
    },
  },

  human_approval: {
    agentId: 'decision-owner',
    agentName: 'Decision Owner',
    color: 'yellow',
    isGate: true,
    messages: [
      {
        type: 'narrative',
        text: 'This is a mandatory approval gate. Review the selected scenario before proceeding to compliance and deployment.',
        embed: 'approval_comparison',
      },
      {
        type: 'narrative',
        text: 'You can add field overrides (e.g., analyst call-in sessions) that will be logged as human-preference signals for model retraining.',
      },
    ],
    gateActions: [
      { label: 'Approve & Continue', action: 'approve', color: 'green' },
      { label: 'Request Changes', action: 'request_changes', color: 'yellow' },
      { label: 'Reject', action: 'reject', color: 'red' },
    ],
    handoff: {
      toAgent: 'Journey Executor',
      toColor: 'green',
      context: 'Governance approved with overrides, ready for deployment',
    },
  },

  compliance: {
    agentId: 'guardrail-guardian',
    agentName: 'Guardrail Guardian',
    color: 'red',
    messages: [
      { type: 'narrative', text: 'Beginning five-rail compliance scan of 212 outputs...' },
      { type: 'progress', label: 'Rail 1 — FINRA Content Classification...', duration: 800 },
      { type: 'narrative', text: 'Rail 1 — FINRA Content Classification: **PASS**' },
      { type: 'progress', label: 'Rail 2 — Performance Claim Validation...', duration: 800 },
      { type: 'narrative', text: 'Rail 2 — Performance Claim Validation: **AUTO-CORRECTED** (1 instance)', embed: 'compliance_diff' },
      { type: 'progress', label: 'Rail 3 — Contact Frequency Compliance...', duration: 600 },
      { type: 'narrative', text: 'Rail 3 — Contact Frequency Compliance: **PASS**' },
      { type: 'progress', label: 'Rail 4 — Brand Voice Consistency...', duration: 600 },
      { type: 'narrative', text: 'Rail 4 — Brand Voice Consistency: **PASS** (97.3% cosine similarity)' },
      { type: 'progress', label: 'Rail 5 — Disclosure Requirements...', duration: 600 },
      { type: 'narrative', text: 'Rail 5 — Disclosure Requirements: **PASS**' },
      {
        type: 'narrative',
        text: 'Scan complete. 97% first-pass clearance. 4 items corrected, 2 escalated. All 212 outputs cleared.',
        embed: 'compliance_summary',
      },
    ],
    guidedQuestion: {
      text: '1 auto-correction was applied. Review the correction and confirm to proceed with deployment.',
      quickReplies: [
        { label: 'Proceed to deployment', action: 'advance' },
        { label: 'Review correction detail', action: 'expand_correction' },
      ],
    },
    handoff: {
      toAgent: 'Quant Bridge',
      toColor: 'violet',
      context: '212 outputs compliance-cleared, 97% first-pass rate, ready for simulation',
    },
  },

  deployment: {
    agentId: 'journey-executor',
    agentName: 'Journey Executor',
    color: 'green',
    isGate: true, // deployment is a mandatory gate
    messages: [
      { type: 'narrative', text: 'Compliance cleared. Preparing deployment to 7,900 advisors across optimised channels and timing.' },
      { type: 'progress', label: 'Optimising send times via DQN...', duration: 1000 },
      { type: 'progress', label: 'Configuring channel sequencing per tier...', duration: 800 },
      {
        type: 'narrative',
        text: 'Deployment ready. 150 Tier 1 (wholesaler call + analyst brief), 1,200 Tier 2 (email + portal), 6,550 Tier 3 (portal notification).',
        embed: 'deployment_preview',
      },
    ],
    gateActions: [
      { label: 'Deploy to 7,900 advisors', action: 'approve', color: 'green' },
      { label: 'Review advisor list', action: 'expand_advisors', color: 'blue' },
      { label: 'Cancel deployment', action: 'reject', color: 'red' },
    ],
    postDeployMessages: [
      { type: 'progress', label: 'Pushing to Salesforce CRM...', duration: 1200 },
      { type: 'progress', label: 'Triggering email waves via Eloqua...', duration: 1000 },
      { type: 'progress', label: 'Activating portal notifications...', duration: 600 },
      {
        type: 'narrative',
        text: 'Deployment complete. 7,900 profiles pushed. Tier 1 wholesaler calls scheduled. Email waves triggered. Portal notifications live.',
        embed: 'deployment_status',
      },
    ],
    handoff: {
      toAgent: 'Learning System',
      toColor: 'gray',
      context: '7,900 advisors deployed across 3 tiers, all channels active',
    },
  },

  attribution: {
    agentId: 'learning-system',
    agentName: 'Learning System',
    color: 'gray',
    messages: [
      { type: 'narrative', text: 'Deployment complete. Beginning outcome measurement across 3 time windows: Days 1–7 (engagement), Days 7–30 (action), Days 30–90 (AUM).' },
      { type: 'progress', label: 'Measuring engagement outcomes (Days 1–7)...', duration: 1000 },
      {
        type: 'narrative',
        text: 'Engagement outcomes: 24% blended engagement rate vs. 6% holdout baseline. 89% wholesaler brief acceptance rate.',
        embed: 'engagement_outcomes',
      },
      { type: 'progress', label: 'Measuring action outcomes (Days 7–30)...', duration: 1000 },
      {
        type: 'narrative',
        text: 'Action outcomes: 12% portfolio review rate, 8% rebalance rate, 4.2% new allocation rate.',
        embed: 'action_outcomes',
      },
      { type: 'progress', label: 'Measuring AUM outcomes (Days 30–90)...', duration: 1500 },
      {
        type: 'narrative',
        text: '$49M incremental AUM attributed over 90 days. +90 bps vs. holdout group. ROI: ~880× on $210K campaign cost.',
        embed: 'aum_outcomes',
      },
      {
        type: 'narrative',
        text: 'Episode #19 archived to TwinX baseline. Prior shift: VIX-spike response model updated with new episode data. 7,900 advisor twins enriched with engagement signals.',
      },
    ],
    guidedQuestion: {
      text: 'Workflow complete. Archive this episode and update TwinX?',
      quickReplies: [
        { label: 'Archive & close', action: 'exit' },
        { label: 'Review detailed breakdown', action: 'expand_breakdown' },
      ],
    },
  },
}
