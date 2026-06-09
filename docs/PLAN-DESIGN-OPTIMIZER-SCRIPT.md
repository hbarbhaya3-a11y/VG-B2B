# "Plan Design Optimizer" — Business Value Demo Script
## Marketing OS · Powered by TwinX™

**Scenario**: Plan-health signal → cost × participation Pareto search → board-ready Quote Package → committee adoption → 12-month closed-loop outcome
**Reference case**: TCS US 401(k) Plan · 50,000 employees · technology sector
**Duration**: ~7 minutes
**Audience**: Vanguard Workplace Solutions leadership; sponsor benefits committees; CFO / fiduciary stakeholders
**Tone**: Sponsor advisory. The optimizer doesn't sell — it diagnoses, simulates, packages, and hands off to a committee.

---

## Opening context (30 seconds — before launching the scenario)

> "Every large plan sponsor reaches a moment when their plan design has drifted out of alignment — participation has fallen behind the sector, the ADP test is at risk, the match no longer competes for talent. The benefits team knows something has to change, but a committee won't approve the change without quantified projections, peer benchmarks, and ERISA fiduciary clearance.
>
> This is what the Plan Design Optimizer does. Let me show you, using TCS US — 50,000 employees, technology sector, currently 22 percentage points below the tech-sector median in participation, and on track to fail the 2026 ADP test."

**Click**: Gallery → "Plan Design Optimizer" → Guided mode → Launch
**Note**: The Mode Choice modal renders Autopilot disabled with a red shield-lock — the launching signal `sig-ph-002` (ADP risk) is fiduciary-sensitive, so Guided is required.

---

## Step 1 · SENSE — Plan-health signal detection (45 seconds)

> "Within hours of the quarterly plan review, the platform has detected the problem — not just one symptom, but four converging plan-health signals.
>
> TCS US participation is 61% — 22 percentage points below the tech sector P50. The ADP test is at-risk for 2026; HCE-NHCE deferral spread is 5.1 points and approaching the IRS threshold. The effective employer match is 3.0%, trailing Cognizant at 5.0% and Accenture at 6.0% — a talent-retention gap. And the SECURE 2.0 student-loan match is unactivated, leaving the under-35 cohort under-served.
>
> All four signals are linked to this one workflow. The most consequential — the ADP risk — is fiduciary-sensitive, which is why Autopilot was disabled at launch."

**Click**: Show the Data Source Manifest at the top of the panel.

> "And here's where the signal is coming from. Internal data from TCS: Census, Payroll, HRIS, recordkeeper feed, plan document, ADP/ACP test workbook — synced two hours ago. External: peer Form 5500 filings for the four named competitors. Real plan analytics, not survey approximations."

**Click**: Expand the 2022 large-tech auto-enrollment precedent (ep-006) to show the configuration card.

> "Two historical analogs are pre-matched at over 80% similarity. The 2022 large-tech case is the dominant analog — auto-enrollment activation lifted participation from 58% to 91% in six months. That's the playbook the optimizer is going to score against."

→ Click **Continue to Simulation**

---

## Step 2 · SIMULATE — Plan Design Optimizer (2 minutes)

> "Step two is the analytical heart. This is the only place where simulation actually runs — every step that follows uses the configuration we apply here."

**Click**: Pause briefly on the diagnostics scorecard.

> "Plan diagnostics: 61% participation, 5.1% deferral, $14.2M annual cost, ADP at-risk, Q3 competitive tier, fiduciary risk 38 out of 100. Color-coded against the tech P50 — red on participation, amber on the rest.
>
> Benchmark comparison plots TCS US against Accenture, Cognizant, Infosys, Wipro, and the sector median. Sourced from public Form 5500 filings."

### What-If demo (45 seconds)

**Click**: Switch to **What-If** mode. Activate Auto-Enrollment on Plan B at 6%. Enable Auto-Escalation at 1%/yr to a 12% ceiling.

> "In What-If, the strategist defines up to two variants and compares to the current plan. Each parameter has a rich control — toggle, slider, segmented control — and live previews update underneath. Effective match recomputes from 2.0% to 3.0% as I move the cap. The vesting curve renders below the schedule chip. Average expense ratio recomputes as I change the menu tier."

**Click**: "View funds in this menu" on the Investment Menu card.

> "And the menu itself is real. The modal shows exactly which Vanguard funds back this configuration — grouped by asset class, with QDIA default highlighted. Internal selectors let me flip across menu sizes and ER tiers without closing the modal."

**Click**: Close the modal, click **Run Simulation**.

> "Run Simulation. The loader walks through the actual stages — baseline load, parameter application, outcome computation, ADP margin checks, fiduciary scoring, parameter-impact attribution. Not a fake spinner — the steps reflect what's actually happening."

**Click**: Once results render, point to the winner callout.

> "Plan B beats Plan C — 84% projected participation, ADP test resolved, $2.1M incremental sponsor cost. The platform explains why in plain English. Auto-enrollment at 6% is the dominant driver of the lift; auto-escalation compounds it."

### If-What demo (45 seconds)

**Click**: Switch to **If-What** mode.

> "If-What flips the question. The strategist sets a goal — maximize participation rate — defines a hard sponsor-cost ceiling, decides which parameters the optimizer may search across, and picks candidate values for each. Every parameter card has the same numbered, benchmark-anchored treatment as What-If, plus a Searching/Frozen toggle so the strategist controls which parameters are in scope."

**Click**: **Find Pareto-Optimal Plans**.

> "The optimizer evaluates 320 candidate configurations. The loader walks through grid generation, cost-ceiling filtering, frontier extraction, ranking by the chosen objective.
>
> The Pareto frontier scatter shows it all. Every dot is a candidate. The teal curve is the Pareto frontier — configurations where you can't lift participation without raising cost, or cut cost without losing participation. The three red dots are the Top 3 ranked by the chosen objective. The grey dot is the current plan; the red dotted line is the cost ceiling.
>
> The recommended #1 callout explains, in plain English, why this configuration is the strongest fit for the chosen objective — with concrete deltas, fiduciary status, and a 'why not #2 or #3' contrast."

**Click**: **Apply this configuration** on the #1 card.

> "I'll Apply #1. That selection now flows into every subsequent step — the ROI page, the Quote Package, the Committee Gate. The strategist's choice is the input; the rest of the workflow is the output."

→ Click **Continue**

---

## Step 3 · SIMULATE — Sponsor ROI / Business Case (40 seconds)

> "Step three is the CFO view. No new simulation — this page derives from the configuration applied in step 2.
>
> TCS US workforce-stress cost is $96M per year. That's the dollar drag financial anxiety places on the workforce — productivity loss, turnover, healthcare-claims exposure, absenteeism. The redesign reduces that by $14.2M in year one. Breakeven is 11 months. Payback ROI is 6.7x against the $2.1M incremental match cost."

**Click**: Point to the intervention ROI table.

> "These three rows are what the CFO sees. They feed the CFO ROI one-pager directly into the Quote Package next step. Same numbers, different framing — analytical strategist to executive talking points."

→ Click **Continue**

---

## Step 4 · SIMULATE — Quote Package (50 seconds)

> "Step four packages the four artifacts the sponsor benefits committee needs to decide. Audience is the committee — about ten people — not 50,000 participants. This is sponsor-fiduciary content class, not participant marketing."

**Click**: Walk through the four asset cards.

> "Board deck — eight slides, exec summary through implementation timeline. Click Preview to see the deck cover, executive summary, Pareto recommendation, implementation timeline, next steps.
>
> CFO ROI one-pager — preview shows the executive summary, three KPI cards, and the cost-benefit detail table sourced from step 3.
>
> 30-day employee notice — the single ERISA-required notice template, effective date 2026-08-15. Preview renders the formal notice with sectional headings: what's changing, who's affected, what employees need to do, where to get help. One mandatory communication. No personalized variants. No A/B test."

**Click**: Click **Preview** on the ERISA notice and pause for 3 seconds.

> "This is the real notice the committee will see — formatted, ERISA-disclaimed, ready to send. The fiduciary checklist slide in the board deck is a placeholder right now; Rail 6 in the next step finalizes it and stamps the resolved checks back into the package."

→ Click **Continue**

---

## Step 5 · GOVERN — Six-Rail Compliance Scan (45 seconds)

> "Step five — fiduciary clearance. Plan-design changes carry ERISA obligations. The compliance pipeline runs six rails. Rails 1 through 5 are the platform's standard content and audit pipeline. Rail 6 is the new Plan Design Fiduciary Review."

**Wait for animation**: rails populate sequentially — pass · pass · pass · pass · pass · pass.

> "Rail 6 runs five plan-design-specific ERISA sub-checks. Plan amendment trigger — auto-enrollment activation requires a formal amendment, prepared. Participant 30-day notice — scheduled, template generated. IRS minimum vesting — 3-yr cliff unchanged, within ERISA §203(a)(2). ERISA 404(c) menu diversification — three asset classes present, glide-path TDF default reaffirmed. Fiduciary liability for expense ratios — blended-tier 0.18% within tolerance.
>
> Six of six pass. Items flagged Action Required would block Activation. Here, all clear."

→ Click **Continue to Committee Decision**

---

## Step 6 · SELECT — Committee Decision Gate (50 seconds)

> "Step six is the human gate. This is what the strategist walks into the committee meeting with — and what the committee chair actually sees on screen during the vote."

**Click**: Point to the Selected scenario card on the left.

> "Selected scenario card on the left — the actual configuration the strategist applied in step 2. Label, rationale, projected participation, confidence."

**Click**: Point to the Do-nothing baseline on the right.

> "Right side: do-nothing baseline. Keep the current plan. Anchors the counterfactual the committee has to weigh against."

**Click**: Point to the Applied configuration block.

> "Applied configuration changes — exactly two parameters move: Auto-Enrollment Off to On at 6%, Auto-Escalation Off to 1%/yr at 12% ceiling. Nothing else changes. Committees often fixate on what's NOT changing — vesting, match, investment menu — and that clarity is what gets adoption in a single meeting."

**Click**: Point to the Projected outcomes vs current plan grid.

> "Projected outcomes vs current plan — six live KPIs, computed from the configuration the strategist applied. Participation +23pp. Average deferral +1.8pp. Annual sponsor cost +$2.1M. ADP test resolved. Competitive tier Q3 to Q2. Fiduciary risk minus six points.
>
> These numbers are not canned demo content — they're computed live from what was selected in step 2. If the strategist had applied a different configuration in step 2, these numbers would be different here."

> "Fiduciary pre-check confirms QDIA reaffirmation, SECURE 2.0 alignment, Rail 6 clearance, 30-day notice scheduled, plan amendment ready. Rationale textarea pre-fills with the live narrative — the strategist edits if needed."

→ Click **Approve & continue**

---

## Step 7 · EXECUTE — Activation / Implementation Handoff (35 seconds)

**Wait for the animation**: Filing plan amendment with recordkeeper… Pushing rate spec to Workday HRIS… Scheduling mandatory 30-day employee notice… Posting Quote Package to sponsor portal… Briefing payroll ops… Implementation timeline active.

> "Step seven is implementation. For plan-design changes, this is back-office work — not a participant-marketing campaign.
>
> File the plan amendment with the recordkeeper, required under ERISA whenever auto-enrollment changes. Push the new auto-enroll and escalation rate spec to Workday HRIS — live by week 10. Schedule the single mandatory 30-day employee notice for 30 days before the effective date. Brief payroll and benefits operations. Open the implementation tracker in the sponsor portal."

**Click**: Show the three segments — recordkeeper + HRIS, internal ops, eligible employees.

> "Three segments. Two are API filings to back-office systems. One is a single mandatory ERISA notice to eligible employees. No personalized variants. No A/B test. 14 weeks from committee approval to effective date."

→ Click **Continue**

---

## Step 8 · LEARN — M12 Outcome + Recommendation (50 seconds)

**Wait for measuring animation to complete.** Then:

> "Step eight — twelve months in. Did the redesign deliver?"

**Click**: Point to the hero KPI.

> "$2.84B in plan AUM retained. The 2026-09-30 contract renewal closed on the strength of the redesign. That's the headline result."

**Click**: Point to the Recommendation block.

> "Recommendation block at the top is the 12-month rollup. Parameter from-to summary — the two parameters that moved. Projected vs observed KPI table — the simulator projected 84% participation; observed at month 12 was 84%. Tight match. Average deferral projected at 6.9%; observed 6.9%. ADP test projected to pass; passed. The model calibrated well.
>
> Treatment vs holdout: TCS US plotted against a peer-sponsor that didn't change its plan design. The delta is the attributable lift — 21 percentage points of participation, 1.7 points of deferral. Not correlation. Attribution.
>
> Rail 6 next-steps checklist now shows closed-out — every item from step 5 implemented and verified."

**Click**: Switch to the **Output Tracking** tab.

> "And the operational record. Quote Package downloaded to the committee 10 times. ERISA notice email opened by 41,800 of 47,500 eligible employees — 88% open rate. 17,600 employees auto-enrolled at the new default. 920 opted out — under 2%. Plan amendment filed and effective."

**Click**: Point to the Episode contribution at the bottom.

> "And here's the closed loop. This run was registered as ep-006 in the reference library. Subsequent large-tech sponsors with non-active auto-enrollment now receive priors calibrated against this outcome. The next sponsor's recommendations are faster and better calibrated.
>
> This isn't a one-time deliverable. It's a learning system."

→ Click **Exit to gallery**

---

## Closing summary (25 seconds)

> "That's the full Plan Design Optimizer flow. From a plan-health signal through a Pareto-optimal recommendation, a board-ready Quote Package, ERISA fiduciary clearance, committee adoption in a single meeting, back-office activation, and a 12-month closed-loop outcome that calibrates the model for the next sponsor.
>
> Three things worth highlighting. One: the configuration applied in step 2 actually flows through every panel that follows — the Committee Gate shows the deltas the strategist selected, not canned numbers. Two: audience-appropriate content throughout — committee fiduciary, single mandatory notice, no participant marketing variants. Three: the closed loop in step 8 means every sponsor through this workflow improves the recommendations for the next one."

---

## Key business messages embedded in the script

| Moment in the script | Business message landing |
|---|---|
| "Four converging plan-health signals" | One workflow consolidates four otherwise-disconnected sponsor concerns |
| "ADP test at-risk · fiduciary-sensitive · Autopilot disabled" | Fiduciary discipline is built into the platform, not policy text on a slide |
| "Plan-data sources synced two hours ago · external Form 5500 peers" | Real plan analytics, not survey approximations or LLM generation |
| "Pareto frontier · 320 configurations · top three ranked by your objective" | Decision intelligence — not pre-canned recommendations |
| "Apply this configuration · flows into every subsequent step" | Reactive workflow — strategist's selection is the input, not a label change |
| "Quote Package = committee deck + CFO sheet + ERISA notice + portal card" | Audience-appropriate — sponsor fiduciary, not participant marketing |
| "Rail 6 — five plan-design-specific ERISA sub-checks" | ERISA clearance is a step, not a footnote |
| "Committee Gate · projected outcomes computed live from applied config" | The committee sees what was actually selected — no canned demo numbers |
| "Implementation handoff = amendment + HRIS sync + single 30-day notice" | Realistic activation — not a 50,000-email blast |
| "Projected vs observed · 84% to 84% · attributable lift" | Outcome attribution rigor with treatment vs peer-sponsor holdout |
| "Episode contribution · ep-006 calibrates the next large-tech sponsor" | Closed-loop learning — the platform improves with every adoption |

---

## Demo gotchas to avoid

- **Apply something in step 2 before advancing** — the Committee Gate only renders live deltas if the user clicked Apply on a Top-3 card or What-If variant. Otherwise the panel falls back to canonical numbers and the demo loses its punch.
- **The cardinality badge in If-What** (top-right of "Find Pareto-Optimal Plans") shows search size — keep it under 500. Demo the guardrail by selecting all parameters with all candidates → a Notification fires explaining the cap.
- **The fund modal is interactive** — flip menu sizes and ER tiers inside the modal; many demo viewers miss that the entire fund table recomputes.
- **Pareto frontier callouts adapt to small frontiers** — if the cost ceiling is tight, the frontier may have only 1-2 configurations; the prose says "Top 1" or "Top 2" honestly. Demonstrate the guardrail by setting ceiling deliberately low.
- **Rail 6 Action-Required items would block Activation** — for the canonical demo run all six pass, but the panel guide explains the blocking semantic. Mention it.

---

## Talking points by audience

| Presenting to… | Lead with… |
|---|---|
| **Vanguard Workplace Solutions strategist** | Configuration propagation — step 2's Apply flows everywhere; no rework |
| **Sponsor benefits committee (live)** | Step 4 Quote Package and step 6 Committee Gate's projected outcomes table |
| **CFO / finance audience** | Step 3 Sponsor ROI and the cost-ceiling guardrail in step 2 If-What |
| **Compliance / legal audience** | Rail 6 sub-checks (step 5) and the fiduciary-sensitive Autopilot disable (step 1 launch) |
| **Vanguard internal champions / leadership** | Closed-loop learning (step 8 episode contribution) — every sponsor calibrates the next one |

---

## Transition to next scenario (10 seconds, optional)

> "That was Plan Design Optimizer — sponsor advisory and decision intelligence. The same platform also handles participant-facing moments: market volatility response, rollover decisions, contribution catch-up windows. Different audiences, same closed-loop architecture. Want to see one of those?"

→ Launch "Calm the nerves" or "Pick your rollover path"
