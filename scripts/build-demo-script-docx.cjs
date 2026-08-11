/* Builds the 15-minute Vanguard pitch demo script as a .docx
   Storyline is grounded in the deployed Plan Sponsor OS (src/vg/VGApp.jsx):
   Home → Signals → Decision Lab (7 steps) → Memory. */
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageBreak, TabStopType, TabStopPosition,
} = require('docx');
const fs = require('fs');

// ── palette ──
const RED = '96151D';      // Vanguard red
const INK = '1A1A1A';
const MUT = '6B6B6B';
const GOLD = '8A6D3B';
const GREEN = '2E7D48';
const LINE = 'D9D4CC';
const BG = 'F4F1EA';

const LETTER = { width: 12240, height: 15840 };

// ── helpers ──
const T = (text, o = {}) => new TextRun({ text, font: 'Calibri', ...o });
const P = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [children], ...o });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 140 },
    children: [T(text, { bold: true, size: 30, color: RED })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 90 },
    children: [T(text, { bold: true, size: 24, color: INK })],
  });
}
function body(runs, o = {}) {
  return new Paragraph({ spacing: { after: 120, line: 276 }, children: Array.isArray(runs) ? runs : [runs], ...o });
}
function bullet(runs, level = 0) {
  return new Paragraph({
    numbering: { reference: 'bul', level },
    spacing: { after: 60, line: 264 },
    children: Array.isArray(runs) ? runs : [runs],
  });
}
function say(text) {
  // Presenter narration — quoted, indented, italic
  return new Paragraph({
    spacing: { after: 120, line: 288 }, indent: { left: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: GOLD, space: 12 } },
    children: [T('“' + text + '”', { italics: true, size: 22, color: '333333' })],
  });
}
function doLine(label, text) {
  return new Paragraph({
    spacing: { after: 70, line: 264 },
    children: [T(label + '  ', { bold: true, size: 20, color: RED }), T(text, { size: 21, color: INK })],
  });
}
function cxo(text) {
  // Executive takeaway callout
  return new Paragraph({
    spacing: { before: 60, after: 160, line: 276 },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: BG },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: { style: BorderStyle.SINGLE, size: 20, color: RED },
      right: { style: BorderStyle.SINGLE, size: 4, color: LINE },
    },
    indent: { left: 120, right: 120 },
    children: [
      T('BOTTOM LINE FOR THE C-SUITE  ', { bold: true, size: 16, color: RED, allCaps: true }),
      T(text, { size: 20, color: INK }),
    ],
  });
}
function rule() {
  return new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 6 } }, children: [T('')] });
}

// ── tables ──
function cell(text, { w, bold, color, fill, align, header } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({
      alignment: align || AlignmentType.LEFT,
      children: [T(text, { bold: bold || header, size: header ? 18 : 19, color: color || (header ? 'FFFFFF' : INK) })],
    })],
  });
}
function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, { w: widths[i], header: true, fill: RED })),
  });
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => cell(c, { w: widths[i], fill: ri % 2 ? BG : 'FFFFFF', bold: i === 0 })),
  }));
  return new Table({
    columnWidths: widths, width: { size: total, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      right: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: LINE },
    },
    rows: [headerRow, ...bodyRows],
  });
}

// ── an "Act" block: heading + timing + on-screen + narration + why ──
function act(num, title, clock, screen, blocks) {
  const out = [];
  out.push(new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 340, after: 60 },
    children: [
      T(`Act ${num} · ${title}`, { bold: true, size: 28, color: RED }),
    ],
  }));
  out.push(new Paragraph({
    spacing: { after: 130 },
    children: [
      T(clock + '   ', { bold: true, size: 20, color: GOLD }),
      T('Screen: ', { size: 19, color: MUT }),
      T(screen, { size: 19, color: INK, bold: true }),
    ],
  }));
  return out.concat(blocks);
}

// ═══════════════════════════ CONTENT ═══════════════════════════
const children = [];

// ── Cover ──
children.push(new Paragraph({ spacing: { before: 1400, after: 0 }, alignment: AlignmentType.CENTER, children: [T('TwinX™ for Vanguard', { size: 30, color: GOLD, bold: true, allCaps: true })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 0 }, children: [T('Plan Sponsor OS', { size: 64, bold: true, color: RED })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 0 }, children: [T('15-Minute Pitch Demo Script', { size: 34, color: INK })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 400 }, children: [T('End-to-end walkthrough · one storyline · one plan sponsor', { size: 22, italics: true, color: MUT })] }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 120 },
  children: [T('From static plan communications to adaptive plan-design intelligence.', { size: 22, color: INK })],
}));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [T('Audience: Vanguard Retirement — growth, relationship & fiduciary stakeholders', { size: 20, color: MUT })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [T('Mode: Guided (presenter-controlled) · Runtime: 15 minutes', { size: 20, color: MUT })] }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ── Executive thesis ──
children.push(h1('Executive Thesis'));
children.push(body([T('Vanguard leads the industry on participant outcomes. The constraint on the next leg of growth is not advice quality — it is the ', {}), T('decision velocity and defensibility of plan design', { bold: true }), T('. Today those decisions move on quarterly cycles, in spreadsheets, with no way to test them before they reach participants and no causal proof of what they returned.', {})]));
children.push(body([T('TwinX converts plan-design into a ', {}), T('simulation-native, holdout-measured, compliance-gated operating system', { bold: true }), T('. The economic case is three-part:', {})]));
children.push(bullet([T('Growth: ', { bold: true, color: GOLD }), T('a $3.0B net-new AUM opportunity across the book, with $2.2B already realized — every dollar measured against a control group.', {})]));
children.push(bullet([T('Retention & risk: ', { bold: true, color: RED }), T('at-risk-sponsor AUM exposure is surfaced and worked before renewal, and fiduciary risk is modeled as a first-class output, not discovered in audit.', {})]));
children.push(bullet([T('Operating leverage: ', { bold: true, color: GREEN }), T('every decision is captured as reusable institutional memory, so cost-to-decide falls and quality rises with each cycle.', {})]));
children.push(cxo('This is not a marketing tool. It is a growth-and-governance engine that makes Vanguard’s fiduciary advantage compound instead of decay.'));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ── Proof points + setup ──
children.push(h1('Before You Present'));
children.push(body([T('The whole demo follows ', {}), T('one person, one book, one sponsor', { bold: true }), T('. You are ', {}), T('Alex', { bold: true }), T(' — a Vanguard Retirement lead who owns a book of plan sponsors. The story is a single arc: notice a problem across the book, drill into one sponsor, design a plan-design response, prove it out, ship it compliantly, and let the platform remember what worked.', {})]));

children.push(h2('The three numbers to land'));
children.push(bullet([T('$3.0B net-new AUM opportunity', { bold: true, color: GOLD }), T(' identified across the book — with $2.2B already realized from prior campaigns.', {})]));
children.push(bullet([T('Every launch carries a preserved holdout', { bold: true, color: GREEN }), T(' — impact is measured causally, not claimed.', {})]));
children.push(bullet([T('Five-Rail Compliance runs before anything ships', { bold: true, color: RED }), T(' — advice-vs-education boundary, eligibility, disclosures, consent, and fiduciary tone.', {})]));

children.push(h2('Pre-demo checklist'));
children.push(bullet('Open the deployed URL in Chrome/Edge, full-screen (F11). Confirm the Home screen loads with the “Good morning, Alex” brief.'));
children.push(bullet('Confirm the four sidebar items are visible: Home · Signals · Decision Lab · Memory.'));
children.push(bullet('Do a dry run of the Decision Lab: the 7 steps must advance Objective → Deployment without a dead end.'));
children.push(bullet('Reset before presenting: refresh the browser so no campaign is pre-deployed in Memory.'));

children.push(h2('Runtime map'));
children.push(table(
  ['Act', 'Screen', 'Time', 'What it proves'],
  [
    ['0 · Framing', '—', '0:45', 'The premise in two sentences'],
    ['1 · Book Overview', 'Home', '2:00', 'Portfolio-level growth lens'],
    ['2 · Signals', 'Signals', '2:30', 'Reaction-based detection + root cause'],
    ['3 · Design', 'Decision Lab (1–2)', '2:00', 'Objective + plan-design levers'],
    ['4 · Simulate', 'Decision Lab (3)', '2:15', 'Impact vs do-nothing, with holdout'],
    ['5 · Content', 'Decision Lab (4)', '1:30', 'Education-classified generation'],
    ['6 · Compliance', 'Decision Lab (5)', '2:00', 'Five-Rail guardrails catch violations'],
    ['7 · Ship', 'Decision Lab (6–7)', '1:30', 'Approvals + staged deploy w/ holdout'],
    ['8 · Learn & close', 'Memory', '0:30', 'Institutional memory compounds'],
  ],
  [1500, 2600, 1100, 3900],
));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ═══ ACT 0 ═══
act(0, 'Framing — the premise', '0:00 – 0:45', 'Home (do not click yet)', [
  say("Vanguard already drives the best participant behavior in the industry. The problem isn't the advice — it's that the plan-design decisions behind it are still made on quarterly cycles, in spreadsheets, without a way to test them before they hit real participants."),
  say("TwinX turns that into a simulation-native decision platform. Same Vanguard experience, same fiduciary discipline — but every plan-design move is sensed, simulated against a do-nothing baseline, compliance-checked, and measured against a holdout. Let me show you a single decision, end to end."),
  doLine('Do', 'Stay on the Home screen. Don’t click yet — let the brief sit for a beat.'),
].map(x => x)).forEach(x => children.push(x));

// ═══ ACT 1 ═══
act(1, 'Book Overview — how is the book doing?', '0:45 – 2:45', 'Home', [
  body([T('The Home screen is a ', {}), T('morning brief for a book of plan sponsors', { bold: true }), T(' — not a dashboard of vanity metrics, a prioritized worklist.', {})]),
  doLine('Point to', 'The four book stats — 21,261 plan sponsors, ~1.02M participant accounts, 73% aggregate participation, and $412M of AUM exposure at at-risk sponsors.'),
  say("This is your whole book. Participation looks healthy at 73% plan-weighted — but underneath it there's $412 million of AUM exposure sitting in sponsors that are drifting below benchmark."),
  doLine('Point to', 'The Growth scorecard — $3.0B net-new AUM opportunity, $2.2B realized to date, average participation lift delivered vs holdout, and campaigns currently live.'),
  say("Here's the growth lens a CXO cares about: three billion in net-new AUM opportunity across the book, and we've already converted 2.2 billion of it. Every one of those numbers is measured against a holdout, so it's defensible."),
  doLine('Point to', 'The “Today’s Focus” strip and the “Priority items” table — sponsors ranked by risk × value.'),
  say("And the platform has already done the triage. Top of the list: Meridian Logistics — 42,000 employees, participation 14 points below benchmark, high renewal risk. That's the one costing us the most. Let's go look."),
  doLine('Click', 'The Meridian Logistics row in Priority items (or the Meridian item in Today’s Focus).'),
  cxo('The book is already triaged by risk × value. Leadership sees where the next dollar of AUM is — and what it costs to leave it on the table — without commissioning an analysis.'),
]).forEach(x => children.push(x));

// ═══ ACT 2 ═══
act(2, 'Signals — what is TwinX seeing?', '2:45 – 5:15', 'Signals → Company Analysis', [
  body([T('You land on the ', {}), T('Signals', { bold: true }), T(' intelligence view first. Briefly show the two tabs, then go into the company deep-dive.', {})]),
  doLine('Point to', 'Market Intelligence cards — SECURE 2.0 mandatory auto-enrollment, volatility regime break, rate moves. Then the KPIs tab — book-level behavior radar.'),
  say("Every signal here is reaction-based — a regulation that actually changed, a rate move that actually happened, a plan event we actually observed. We don't profile individuals or predict who's about to quit. That distinction matters for fiduciary posture, and it's baked into the platform, not bolted on."),
  doLine('Do', 'Open the Meridian company signal to enter its Company Analysis (or you’re already here from Act 1).'),
  doLine('Point to', 'The snapshot row — eligible, enrolled, non-participants — and the $88M net-new AUM opportunity headline.'),
  say("Now the analysis. 10,700 eligible employees at Meridian have never enrolled. Close that gap to benchmark and it's $88 million in net-new assets — for this one sponsor."),
  doLine('Point to', 'Cohort composition (“where the gap lives”) and Root-cause insights (“why”).'),
  say("But TwinX doesn't just size the gap — it decomposes it. The non-participation isn't one problem, it's four: new-hire enrollment lag, people stuck below the match, people frozen at the 3% default, and legacy elections. Each of those wants a different plan-design lever."),
  doLine('Click', 'The “Send to Decision Lab” button (top-right).'),
  cxo('One under-performing sponsor is worth $88M in net-new AUM. The gap is decomposed into its causes automatically — the analyst-hours that used to precede a plan-design conversation are now instant.'),
]).forEach(x => children.push(x));

// ═══ ACT 3 ═══
act(3, 'Decision Lab — design the response', '5:15 – 7:15', 'Decision Lab · Steps 1–2 (Objective, Lever Selection)', [
  body([T('The Decision Lab is a ', {}), T('portfolio workbench', { bold: true }), T('. Seven steps across the top: Objective → Lever Selection → Simulated Policy Impact → Content → Compliance → Approval → Deployment. Walk it like a workflow, not a settings page.', {})]),
  doLine('Step 1 · Objective', 'Point to the four objectives. “Increase participation” is recommended for Meridian. Note the channels and the industry-aware KPIs being tracked.'),
  say("First we set what we're optimizing. For Meridian it's participation — close the gap. Notice the KPIs it's tracking are industry-aware: this is Transportation & Warehousing, so workforce-specific measures come along for free."),
  doLine('Click', 'Next → advance to Step 2 · Lever Selection.'),
  doLine('Step 2 · Lever Selection', 'Show the plan-design levers mapped to the cohorts: Auto Enrollment (initial default rate), Match Stretch, Auto Escalation (annual increase → cap), Re-enrollment. Each cohort gets its own lever, with a holdout preserved.'),
  say("Now the design. Each cohort from the analysis gets its own lever — auto-enrollment for the non-participants, a match stretch for the under-match group, auto-escalation for the stuck-at-default population. This is a portfolio of plan-design moves, not one blunt campaign — and a control group is carved out of every one."),
  doLine('Click', 'Simulate strategies → advance to Step 3.'),
  cxo('Plan design becomes a portfolio decision, not a single bet — diversified across cohorts, each with a control group. That is how you scale interventions across 21,000 sponsors without scaling risk.'),
]).forEach(x => children.push(x));

// ═══ ACT 4 ═══
act(4, 'Simulate — prove it before it ships', '7:15 – 9:30', 'Decision Lab · Step 3 (Simulated Policy Impact)', [
  body([T('Let the ', {}), T('live simulation loader', { bold: true }), T(' run for its couple of seconds — it sells that this is computed, not canned. Then read the three cards.', {})]),
  doLine('Point to', 'Projected impact of the new policy — participation lift vs holdout, incremental enrollments, incremental AUM, AUM-to-cost ratio, plus fiduciary-risk and ADP-test movement.'),
  say("Here's the projected impact of the combined policy — participation lift measured against holdout, the net-new AUM, and the return on the employer's cost. And look: fiduciary risk score drops and the ADP nondiscrimination test moves to resolved. We're modeling the compliance consequences, not just the growth."),
  doLine('Point to', 'The “Impact contribution” bar — how the total splits across the levers (attribution).'),
  say("And we can attribute it — this much of the lift comes from auto-enrollment, this much from the match stretch. That's Shapley-style contribution, so when you report results you can defend where they came from."),
  doLine('Point to', 'The “Do nothing vs New Policy” table — current plan parameters beside the proposed ones.'),
  say("The most important column on this screen is ‘do nothing.’ Every option is measured against the cost of inaction — that's the discipline that keeps this honest."),
  doLine('Click', 'Next → advance to Step 4.'),
  cxo('The board sees return on the employer’s cost and the reduction in fiduciary and nondiscrimination-test risk — in the same view. Growth and governance are underwritten together, before a dollar is spent.'),
]).forEach(x => children.push(x));

// ═══ ACT 5 ═══
act(5, 'Content — generated, and classified', '9:30 – 11:00', 'Decision Lab · Step 4 (Content)', [
  body([T('Let the content generation loader run. It drafts a ', {}), T('board committee deck', { bold: true }), T(' and ', {}), T('participant communications', { bold: true }), T(' for the selected strategy, with disclosures attached.', {})]),
  doLine('Point to', 'The two content groups: “For the board · committee deck” and participant-facing education content (emails, portal banners, required notices).'),
  doLine('Do', 'Open one participant asset in the preview to show real, on-brand copy.'),
  say("The platform generates both audiences at once — the committee deck the sponsor's fiduciary committee needs to approve the change, and the participant-facing content. Every participant asset is classified as education, carries an opt-out path, and has its disclosures attached automatically. Nothing here is investment advice."),
  doLine('Click', 'Run compliance check → advance to Step 5.'),
  cxo('Committee-ready and participant content are produced in one pass, pre-classified as education. The bottleneck between deciding and communicating — usually weeks of legal and creative review — collapses to minutes.'),
]).forEach(x => children.push(x));

// ═══ ACT 6 ═══
act(6, 'Compliance — the guardrails earn their keep', '11:00 – 13:00', 'Decision Lab · Step 5 (Five-Rail Compliance)', [
  body([T('This is the ', {}), T('trust moment', { bold: true }), T(' of the demo. Walk the five rails and dwell on the two that catch something.', {})]),
  doLine('Rail 1', 'Advice vs Education Boundary — all assets classified as education; no advice content in the payload.'),
  doLine('Rail 2', 'Eligibility & Suitability — actions checked against plan eligibility, QDIA, and default rules.'),
  doLine('Rail 3 (flag)', 'Disclosure & Risk Language — one participant email used implied performance-outcome language (“a bigger balance later”). Auto-corrected before output.'),
  doLine('Rail 4', 'Contact Policy / Consent / Frequency — 1,240 participants suppressed for the frequency cap.'),
  doLine('Rail 5 (removed)', 'Fiduciary & Brand Tone — a portal line used solicitation phrasing (“sign up for advice… talk to an advisor now”) and was removed before output.'),
  say("Watch what the rails caught. Rail 3 flagged a participant email that implied a performance outcome and rewrote it into education language. Rail 5 stripped a line that crossed from education into solicitation. This is the failure mode every retirement provider fears — advice-adjacent language reaching a participant — and here it's caught by the platform before a human ever approves it."),
  doLine('Say', 'Nothing advances to approval until every rail is green. This is the audit trail your compliance team has been asking for.'),
  doLine('Click', 'Next → advance to Step 6.'),
  cxo('The single largest reputational and regulatory risk in this business — advice-adjacent language reaching a participant — is intercepted by the platform, with a logged audit trail, before any human signs off. That is insurance the board can see.'),
]).forEach(x => children.push(x));

// ═══ ACT 7 ═══
act(7, 'Ship — approvals and a measured rollout', '13:00 – 14:30', 'Decision Lab · Steps 6–7 (Approval, Deployment)', [
  doLine('Step 6 · Approval', 'Show the approval gates — portfolio, strategy-cell, compliance, fiduciary review, and payroll/recordkeeping readiness. Click “Approve all”.'),
  say("Approvals mirror how a plan change actually clears — compliance, fiduciary review, and payroll readiness all sign off. The fiduciary gate is explicit; nothing auto-advances on a fiduciary-sensitive change."),
  doLine('Step 7 · Deployment', 'Show the deployment lanes — one per strategy, each with its treated population and preserved holdout. Click “Run full strategy”.'),
  say("And we ship it as a staged rollout — one lane per strategy, each with suppression and rollback, each holding out a control group so we can prove causal impact. The projected lift and net-new AUM are right there on the lane."),
  doLine('Point to', 'The confirmation that the deployment is recorded to Memory for future reuse.'),
  cxo('Governance is enforced by the system, not by hope — fiduciary sign-off is a hard gate and every launch is causally measurable. You ship faster and de-risk at the same time.'),
]).forEach(x => children.push(x));

// ═══ ACT 8 ═══
act(8, 'Learn — memory that compounds', '14:30 – 15:00', 'Memory', [
  doLine('Click', 'Memory in the sidebar. The Meridian campaign you just deployed is now at the top, marked Live.'),
  say("The moment we deployed, it landed in Memory — live, updating against its holdout, and stored as a reusable decision policy. The next sponsor with this pattern doesn't start from a blank page; they start from what worked. That's the compounding advantage: every decision makes the next one faster and better."),
  say("Same Vanguard experience, same fiduciary discipline — now simulation-native, measured against a holdout, and getting smarter with every plan-design decision you make. That's TwinX."),
  cxo('Every decision compounds into an asset. Cost-to-decide falls, decision quality rises, and the moat widens with use — the defining economics of a durable platform, not a campaign tool.'),
]).forEach(x => children.push(x));

// ═══ APPENDIX: Q&A ═══
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1('Appendix A · Likely Questions & Answers'));
children.push(table(
  ['If they ask…', 'Answer with…'],
  [
    ['“Is this giving participants advice?”', 'No. Rail 1 classifies every participant asset as education, and Rail 5 strips solicitation language. Advice-classified content requires separate eligibility + a disclosure packet and never mixes into an education payload.'],
    ['“Are you profiling individuals?”', 'No. Signals are reaction-based (regulation, rate move, plan event) and targeting is cohort-level in v1. No predictive “likely to quit” inferences; individual personalization is a later, tightly-gated phase.'],
    ['“How do you know the lift is real?”', 'Every strategy carries a preserved holdout defined at creation — deploy is blocked without one. Impact in Memory is treatment vs holdout, not a modeled claim.'],
    ['“What about the do-nothing case?”', 'The simulator always includes do-nothing as a first-class baseline — it’s the column every option is measured against in Step 3.'],
    ['“Where do the disclosures come from?”', 'They auto-attach based on content class; the Guardrail rail blocks any asset with an empty disclosure set from shipping.'],
    ['“Does anything ship automatically?”', 'Not on fiduciary-sensitive changes. The fiduciary gate is explicit and Autopilot is disabled unless separately authorized.'],
    ['“Is the data real?”', 'This is a POV environment with representative Vanguard-shaped data. The workflow, guardrails, and measurement are the product; the numbers are illustrative.'],
  ],
  [3400, 6100],
));

children.push(h1('Appendix B · Presenter Notes'));
children.push(bullet('Pace: the two live loaders (Steps 3 and 4) are intentional — let them run; they signal real computation. Don’t talk over the whole thing.'));
children.push(bullet('If you’re short on time, compress Act 1 and Act 7; never cut Act 6 (Compliance) — it’s the differentiator.'));
children.push(bullet('If a stat is questioned, retreat to the method, not the number: “the number is illustrative; the holdout-measured method is the point.”'));
children.push(bullet('Keep returning to the one arc: sense → simulate → comply → ship → learn. If you get pulled into a feature, tie it back to the arc.'));
children.push(rule());
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [T('TwinX™ for Vanguard · Plan Sponsor OS · Education-classified · not investment advice', { size: 16, italics: true, color: MUT })] }));

// ── document ──
const doc = new Document({
  creator: 'TwinX for Vanguard',
  title: 'TwinX for Vanguard — 15-Minute Pitch Demo Script',
  description: 'End-to-end 15-minute demo script for the Plan Sponsor OS.',
  numbering: {
    config: [{
      reference: 'bul',
      levels: [
        { level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 200 } } } },
        { level: 1, format: 'bullet', text: '◦', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 200 } } } },
      ],
    }],
  },
  sections: [{
    properties: { page: { size: LETTER, margin: { top: 1100, bottom: 1100, left: 1200, right: 1200 } } },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || 'out.docx';
  fs.writeFileSync(out, buf);
  console.log('Wrote', out, buf.length, 'bytes');
});
