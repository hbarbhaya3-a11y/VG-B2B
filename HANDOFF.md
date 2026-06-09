# TwinX for Vanguard — Session Handoff to Claude Code

**Handoff from:** Cowork session (started April 2026)
**Target:** Claude Code running locally on this folder
**Status:** Scaffold milestone ~25% complete; data/theme/nav work still pending
**Primary reference:** `docs/vanguard-pov/TwinX-for-Vanguard-POV.md` (unified POV with full build plan and 60+ feature user stories)

---

## 1. Project context (read this first)

This project is a **Vanguard-specific instantiation of the TwinX Wealth Banking platform**. The source app was cloned from `/Users/sreekarsaripalli/Desktop/AI Projects/twinx-wealth-banking-content/` (or its mounted equivalent) into this folder. **Nothing in that source folder was modified.**

Architecture and constructs inherited from the base (kept verbatim, re-skinned for Vanguard):

- WorkflowRunner, Use Case catalog, **Guided vs Autopilot modes** (ModeChoiceModal)
- 8 base agents (Market Sentinel, Context Decoder, Orchestration Agent, Quant Bridge, Content Architect, Guardrail Guardian, Journey Executor, Learning System) + 2 new Vanguard agents (Fiduciary Guardian, Rollover Moment Validator)
- Advisor Twin → extended to **Participant Twin, Sponsor Twin, Advisor Twin**
- Episode Simulator + Quant Bridge (Monte Carlo 1,000 iter, P5/P50/P95 CIs)
- Five-Rail Compliance pipeline (re-mapped to ERISA/DOL, SEC 482, contact frequency, brand voice, disclosure)
- Shapley attribution, Content Asset Ecosystem (8 types + content-class gating), Ontology 3.0
- All UX patterns (Agent Chat drawer, Narrator Strip, Handoff Banner, Visited Agent Chain)

**Full detail:** `docs/vanguard-pov/TwinX-for-Vanguard-POV.md` §5 (inheritance contract) and §9 (60+ user stories with acceptance criteria).

**Fiduciary anti-patterns:** See `CLAUDE.md` → "Critical Anti-Patterns" section. These are MUST-NOT-VIOLATE rules specific to Vanguard's fiduciary identity.

---

## 2. What has been done in this session

### Completed

1. **Scaffold copied** — `src/`, `public/`, `docs/`, `agents/` (20 files), `scripts/`, `package-lock.json`, all config files. Excluded `node_modules/`, `dist/`, `.git/`, `.firebase/`.
2. **Rebranded core files**:
   - `package.json` — name: `twinx-for-vanguard`, version: `0.1.0`, description added
   - `index.html` — title: `TwinX for Vanguard`, meta description added
   - `CLAUDE.md` — completely rewritten for Vanguard project (base 20 agents + 3 new Vanguard agents; Vanguard-specific anti-patterns including advice-vs-education, rollover reaction-only, do-nothing baseline, holdout-required-for-deploy, disclosure-attachment, PII-tokenization, LLM-compliance-scoping, Autopilot-fiduciary-sensitive-disable, Journey-B-no-solicitation)
3. **POV imported in-tree** — `docs/vanguard-pov/TwinX-for-Vanguard-POV.{md,docx}` so Claude Code has it locally

### Pending (Scaffold milestone remainder)

| # | Task | Files/areas |
|---|---|---|
| A | **Theme re-skin to Vanguard** | `src/theme.js` — set Vanguard primary color (suggest `#96151D` deep red per Vanguard brand), secondary tones; verify Mantine token layer applies; check any hardcoded brand colors in components |
| B | **Logo swap** | Replace `CG_Logo.png` with a Vanguard-appropriate placeholder (keep `TwinX_Black.svg` / `TwinX_White.svg` as product marks). Any component importing `CG_Logo.png` must be updated. |
| C | **Navigation rename** | `src/App.jsx` and any nav components (`src/components/nav/WorkflowNav.jsx`, etc.) — rename tabs to the Vanguard spine: `SENSE / DECIDE / SIMULATE / GOVERN / DEPLOY / MEASURE / LEARN / OPERATE`. Map existing tabs: `plan → decide`, `measure` splits into `measure + learn`; add `operate` for Agent Console + Operations. |
| D | **Add 3 Vanguard-specific agent `.md` files** | `agents/erisa-fiduciary-auditor.md`, `agents/rollover-moment-validator.md`, `agents/advice-education-boundary-auditor.md`. Use the existing agent docs as the template. |
| E | **Swap `src/data/*.js` to Vanguard mock data** | (1) Split `advisors.js` into `participants.js` (Participant Twins), `sponsors.js` (Sponsor Twins), and a reduced `advisors.js` (Route 1 external advisors, sponsor-level only); (2) rewrite `signals.js` with Vanguard signal taxonomy — market vol, rates, SECURE 2.0 provisions, DOL rulings, IRS updates, plan-conversion events, age thresholds (reaction-based only); (3) rewrite `episodes.js` with Vanguard analogs (Feb 2018 vol, Mar 2020 COVID, 2022 rate regime, SECURE 2.0 rollout, etc.); (4) rewrite `usecases.js` with the 5 seed Vanguard use cases from the POV: "Volatility response for advice-eligible cohort", "Roth adoption nudge for 40–50 age band", "Hardship leakage reduction", "Rollover-moment reaction (termination feed)", "Sponsor renewal enablement"; (5) rewrite `interventions.js` with Vanguard channel mix (digital journey, email, in-app, advisor brief); (6) rewrite `funds.js` with actual Vanguard funds (VTSAX, VOO, VTI, VBTLX, VXUS, VTIAX, VFIAX, Target Retirement 2055/2050/2045/2040/2035, Total Bond Market, etc.). **Respect fiduciary anti-patterns throughout** — no predictive intent signals, no individual-level scoring hints, cohort-only audience framing. |
| F | **Data contract additions** | Update `docs/product-context/data-contracts.md` — add Participant Twin, Sponsor Twin, Plan, Rollover-Moment, Hypothesis entity shapes per POV §8.3 |
| G | **Update product-context docs** | Rewrite `docs/product-context/platform-overview.md` and `docs/product-context/module-capabilities.md` for the Vanguard platform identity and the renamed nav |
| H | **CHANGELOG Session 1 entry** | Add `Added / Fixed / Regressed / Watch List` entry for this scaffold session to `docs/product-context/CHANGELOG.md` |
| I | **Build verification** | `npm install`, `npm run build` or `npm run dev`; fix any import breakages from data split (e.g., if components import `from 'data/advisors'` and we split the file, provide compat shim or update imports) |
| J | **Runtime verification** | Start dev server, click through every tab, verify no blank screens, no console errors, no dead CTAs. Use the inherited `docs/knowledge/ux-dead-end-prevention.md` checklist. |

---

## 3. After scaffold: next milestones (from POV)

Per the POV phased sequencing (§8.6):

- **Phase 0 (weeks 1–6)** — Foundation: infra, SSO, MDM connector, event bus, base re-skin complete, WorkflowRunner shell, ModeChoiceModal wired, Agent Console with 10 agents stubbed, Twin Registry shell (Participant + Sponsor tabs), Sense skeleton with one live signal class (market vol), Behavior Radar shell with two behaviors (leakage, vol reactivity), audit trail backbone, one Guardrail rail (disclosure) active.
- **Phase 1 (weeks 7–16)** — MVP Journey A: Use Case catalog with 3 seeds, Guided mode end-to-end, agent scripts for 6 agents, Twin Enrichment v1, all 5 rails active, Fiduciary Guardian Gate live, Simulator v1, Content Engine v1, one end-to-end Journey A scenario in production with holdouts + Shapley v1.
- **Phase 2 (weeks 17–28)** — Autopilot enabled for non-fiduciary-sensitive hypotheses; remaining agents live; Journey B live; Institutional Memory + Playbook Registry.
- **Phase 3 (weeks 29–44)** — Learning loop, analog calibration, uplift modeling, post-mortems.
- **Phase 4 (weeks 45+)** — Enterprise: multi-sponsor, cross-team portfolio management, exec cockpit.

**User stories with acceptance criteria** for every feature are in POV §9 (US-GAM-01 through US-AX-02, ~60 stories).

---

## 4. Important build rules (from CLAUDE.md)

**Must-preserve constructs from base** (do not simplify away):
- Guided vs Autopilot mode choice at every use-case launch
- Three mandatory approval gates: Decision Approval, **Fiduciary Guardian Gate** (new), Deployment
- Step locking after approval gates
- Agent scripts drive Autopilot pacing (min 2s/step)
- Live Agent Chat drawer, Narrator Strip, Handoff Banner, Visited Agent Chain
- 1,000-iteration Monte Carlo with P5/P50/P95 CIs and do-nothing baseline always shown
- Shapley attribution with treatment vs holdout
- Immutable audit trail for every option / simulation / guardrail result / approval / deploy / kill / agent message

**Fiduciary discipline (MUST-NOT violate):**
- No predictive-intent signals at participant level (reaction-based only)
- No individual-level scoring for outreach (cohort-only in v1)
- Advice and education are separate data objects; never mixed in same payload
- Disclosures auto-attach based on content class; authors cannot skip
- PII never flows through scenario previews — cohort IDs only
- Autopilot hard-disabled for `fiduciarySensitive=true` hypotheses
- No solicitation language in Journey B — "If things feel more complex, here are ways Vanguard can help"

**UI anti-patterns** (from base, still apply):
- Background washes: `var(--mantine-color-X-light)` — never `-0` / `-1`
- Toast: `toast(msg, color, title)` — never `toast.show({...})`
- Return sign: always `${return >= 0 ? "+" : ""}${(return * 100).toFixed(2)}%`
- Paper radius: `md`; back button: `variant="light"`

---

## 5. How to resume in Claude Code

```bash
# 1. cd into the Vanguard project folder on your Mac
cd "/Users/sreekarsaripalli/Desktop/AI Projects/vanguard-twinx-pov/app"

# 2. Install deps (first time)
npm install

# 3. Start Claude Code in this folder
claude

# 4. In Claude Code, a good opening prompt is:
```

```
Read HANDOFF.md, CLAUDE.md, and docs/vanguard-pov/TwinX-for-Vanguard-POV.md. Then pick up the scaffold milestone at Task A (theme re-skin) and work through Tasks A–J in HANDOFF.md §2 "Pending". Respect the fiduciary anti-patterns. After each task update docs/product-context/CHANGELOG.md with the Session 1 entry. Verify the build passes with `npm run build` before presenting.
```

---

## 6. Reference map

| Topic | File |
|---|---|
| Unified POV (what, why, how + user stories) | `docs/vanguard-pov/TwinX-for-Vanguard-POV.md` |
| Project rules, agents, anti-patterns | `CLAUDE.md` |
| Base platform overview (needs Vanguard rewrite) | `docs/product-context/platform-overview.md` |
| Base module capabilities (needs Vanguard rewrite) | `docs/product-context/module-capabilities.md` |
| Base data contracts (needs Vanguard entity additions) | `docs/product-context/data-contracts.md` |
| UX dead-end prevention | `docs/knowledge/ux-dead-end-prevention.md` |
| UX/UI standards | `docs/UX_UI_STANDARDS.md` |
| Mantine v8 component reference | `docs/mantine-v8-components.md` |
| Editing safety workflow | `docs/editing-safety-workflow.md` |
| Agent specs | `agents/*.md` |
| App entry | `src/main.jsx` → `src/App.jsx` |
| Theme | `src/theme.js` |
| Data (to be re-authored for Vanguard) | `src/data/*.js` |
| Pages (to be renamed per §5.10 of POV) | `src/pages/*.jsx` |
| Workflow runner + panels | `src/components/workflow/` |
| Contexts (Use Case, Conversation, Toast, Auth) | `src/contexts/` |
| Simulation / needState | `src/simulation/` |

---

*This handoff was produced mid-session. The primary POV is the source of truth for decisions. When in doubt, the POV + CLAUDE.md take precedence.*
