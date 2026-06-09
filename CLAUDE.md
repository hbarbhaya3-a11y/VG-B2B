# TwinX for Vanguard — Project Rules

This file extends the global pod configuration (`~/.claude/CLAUDE.md`) with project-specific rules.

This project is a Vanguard-specific instantiation of the TwinX Wealth Banking platform. Architecture, tech stack, WorkflowRunner, Guided/Autopilot modes, 8-agent system, Twin Registry, Episode Simulator, Five-Rail Compliance, Shapley attribution, Content Asset Ecosystem, Ontology 3.0, and UX patterns are inherited from the base. Vanguard-specific extensions are catalogued in the POV at `docs/vanguard-pov/`.

## Project Files

**Platform**: TwinX for Vanguard
**Domain**: US 401(k) workplace retirement + IRA/wealth advisory, ERISA-regulated, fiduciary-first
**CHANGELOG**: `docs/product-context/CHANGELOG.md` — read before starting, update after every session
**POV & Build Plan**: `docs/vanguard-pov/TwinX-for-Vanguard-POV.md`

## Agent Definitions

All specialist agents are defined in `agents/`. Each file specifies the agent's role, responsibilities, ownership areas, invocation triggers, handoff protocols, and review checklists.

### Base platform agents (inherited from TwinX Wealth Banking)

| # | Agent | File |
|---|---|---|
| 1 | Frontend Developer | `agents/frontend-developer.md` |
| 2 | Backend Developer | `agents/backend-developer.md` |
| 3 | UX Designer | `agents/ux-designer.md` |
| 4 | UI Designer | `agents/ui-designer.md` |
| 5 | Product Manager | `agents/product-manager.md` |
| 6 | Simulation/Analytics Engineer | `agents/simulation-engineer.md` |
| 7 | Data Scientist | `agents/data-scientist.md` |
| 8 | Data Engineer | `agents/data-engineer.md` |
| 9 | QA Tester | `agents/qa-tester.md` |
| 10 | Marketing Strategist | `agents/marketing-strategist.md` |
| 11 | GitHub Guardian | `agents/github-guardian.md` |
| 12 | DevOps Engineer | `agents/devops-engineer.md` |
| 13 | Code Optimizer | `agents/code-optimizer.md` |
| 14 | Runtime Validator | `agents/runtime-validator.md` |
| 15 | Risk Model Validator | `agents/risk-model-validator.md` |
| 16 | Compliance Auditor | `agents/compliance-auditor.md` |
| 17 | Solution Architect | `agents/solution-architect.md` |
| 18 | Security Engineer | `agents/security-engineer.md` |
| 19 | Accessibility Specialist | `agents/accessibility-specialist.md` |
| 20 | Wealth Domain Expert | `agents/wealth-domain-expert.md` |

### Vanguard-specific agents (new)

| # | Agent | File | When to invoke |
|---|---|---|---|
| 21 | ERISA Fiduciary Auditor | `agents/erisa-fiduciary-auditor.md` | Any change that touches advice-vs-education boundary, plan eligibility, QDIA, prohibited transactions, or fiduciary-sensitive hypotheses |
| 22 | Rollover Moment Validator | `agents/rollover-moment-validator.md` | Any signal, scenario, or use case touching rollover moments (termination, age thresholds, plan conversion, force-outs) |
| 23 | Advice/Education Boundary Auditor | `agents/advice-education-boundary-auditor.md` | Any content, scenario, or copy change that could classify as investment advice vs. participant education |

## Specialist Review Handoff — Project Scope

When specialists run their Post-Fix Review Protocol, they review the **main platform files** in this project, not a single monolithic file.

## Contextual Agents (Vanguard only)

| Agent | When to invoke |
|---|---|
| `runtime-validator` | After any data file replacement, re-skin, or new module addition — BEFORE `qa-tester` |
| `risk-model-validator` | When quant bridge outputs, episode simulator results, or retirement-readiness calculations look unrealistic |
| `compliance-auditor` | Full end-to-end regulatory compliance audit when new fiduciary features, advisory workflows, or participant-facing content are added |
| `erisa-fiduciary-auditor` | **Always before any scenario reaches the Decision Approval gate** — verifies ERISA posture |
| `rollover-moment-validator` | **Always when a rollover-related signal or scenario is introduced** — verifies reaction-based vs predictive posture |
| `advice-education-boundary-auditor` | **Always when content is generated or scenario copy is drafted** — verifies content-class vs payload-language alignment |

## Agent Invocation Triggers

| Change type | Invoke these agents |
|---|---|
| Chart rendering, colors, legends, axis labels | `ui-designer` + `frontend-developer` |
| Twin display (need-state, archetype, retirement-readiness stage, confidence) | `ui-designer` + `data-scientist` + `wealth-domain-expert` |
| New screens, IA, navigation changes | `ux-designer` + `product-manager` |
| New module, new analytics flow, new result display component | `code-optimizer` reviews for pattern compliance before QA |
| Signal taxonomy, analog matcher, severity rules | `data-scientist` + `simulation-engineer` |
| Episode Simulator / Quant Bridge outputs (Monte Carlo, CIs, response curves) | `simulation-engineer` + `risk-model-validator` |
| Cohort definitions, Participant/Sponsor/Advisor Twin structure | `data-engineer` + `data-scientist` + `backend-developer` |
| Content generation (Content Architect, A/B, disclosures) | `marketing-strategist` + `advice-education-boundary-auditor` + `compliance-auditor` |
| Five-Rail Compliance rule changes | `compliance-auditor` + `erisa-fiduciary-auditor` |
| Rollover-moment signals/scenarios | `rollover-moment-validator` + `compliance-auditor` |
| Advisor-facing payloads (Route 1 briefs) | `wealth-domain-expert` + `advice-education-boundary-auditor` |
| Fiduciary Guardian gate logic / attestation | `erisa-fiduciary-auditor` + `security-engineer` |
| Auth/authz, encryption, PII handling, tokenization | `security-engineer` + `backend-developer` |
| Accessibility, WCAG, ARIA, keyboard navigation | `accessibility-specialist` + `frontend-developer` |
| Any code change | `qa-tester` verifies build + updates CHANGELOG |
| Push, commit, backup, revert, recover, tag release | `github-guardian` owns all git/GitHub operations |
| Deployment, CI/CD, infrastructure changes | `devops-engineer` |
| After any data file replacement, re-skin, or new module addition | `runtime-validator` (before QA) |

## Changelog Rule

`qa-tester` MUST update `docs/product-context/CHANGELOG.md` after every implementation session with Added / Fixed / Regressed / Watch List sections. The Anti-Pattern Registry at the bottom must be kept current — new anti-patterns found during any session must be added.

## Critical Anti-Patterns (Vanguard UI + fiduciary discipline — violations cause bugs or regulatory exposure)

### UI anti-patterns (inherited from base)

| Rule | Wrong | Correct |
|---|---|---|
| Background color washes | `var(--mantine-color-X-0)` or `-1` | `var(--mantine-color-X-light)` |
| Neutral hover bg | `transparent` / hardcoded hex | `var(--mantine-color-default-hover)` |
| Toast notifications | `toast.show({...})` | `toast(msg, color, title)` |
| Return display | `` `+${return * 100}%` `` | `` `${return >= 0 ? "+" : ""}${(return * 100).toFixed(2)}%` `` |
| Paper radius | `radius="sm"` | `radius="md"` |
| Back button variant | `variant="subtle"` | `variant="light"` |

### Fiduciary anti-patterns (Vanguard-specific — MUST NOT appear in code or copy)

| Rule | Wrong | Correct |
|---|---|---|
| Advice vs education leakage | Mixing advice-classified and education-classified assets in the same payload | Separate payloads per content class; advice requires eligibility + disclosure packet |
| Rollover-moment signals | Predictive/inferred signals ("likely to change jobs") | Reaction-based signals only (termination feed, age threshold, plan conversion event) |
| Individual-level scoring in v1 | Scoring participants individually for outreach | Cohort-level only; individual personalization is later-phase, tightly gated |
| Missing do-nothing baseline | Simulator without `baselineId` / do-nothing option | Every SimulationRun MUST include do-nothing as first-class option |
| Missing holdout at deploy | Scenario deployed without `holdoutId` | Deploy blocks if no holdout defined at scenario creation |
| Missing disclosure attachment | Content deployed without `disclosures[]` populated per class | Disclosures auto-attach based on content class; Guardrail rail blocks empty |
| Raw PII in scenario preview | Participant IDs, names, SSN, etc. in any scenario or simulation payload | Cohort IDs and counts only; twin previews are PII-tokenized |
| LLM free-form for advice-adjacent copy | Unrestricted prompts generating advice language | Claude calls go through compliance-scoped prompt library only |
| Autopilot on fiduciary-sensitive hypotheses | Autopilot auto-advancing without explicit authorization | `fiduciarySensitive=true` auto-disables Autopilot; Autopilot Authorizations list governs exceptions |
| Solicitation language in Journey B | "Sign up for advice," "upgrade your plan" | "If things feel more complex, here are ways Vanguard can help"; optional, never solicitation |

<!-- Add Vanguard-specific anti-patterns below as they are discovered -->
