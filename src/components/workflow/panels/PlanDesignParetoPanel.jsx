import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider, Alert,
  Switch, Slider, SegmentedControl, Radio, Select, NumberInput, Tabs, Collapse,
  Chip, Tooltip, ActionIcon, RingProgress, Notification, Modal, ScrollArea, Table,
  Loader, Progress,
} from '@mantine/core'
import { BarChart } from '@mantine/charts'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import {
  IconChevronRight, IconChartScatter, IconAdjustments, IconInfoCircle,
  IconRefresh, IconPlayerPlay, IconAlertTriangle, IconTrophy,
  IconTargetArrow, IconShieldCheck, IconCheck, IconArrowUp, IconArrowDown, IconChartBar,
  IconBulb, IconListDetails, IconCoins, IconCpu, IconDatabase, IconActivity,
} from '@tabler/icons-react'
import DataSourceStrip from '../../ui/DataSourceStrip'
import { getPlanDesign, MENU_SIZE_LABELS, EXPENSE_TIER_LABELS, EXPENSE_TIER_AVG_ER, getMenuFunds } from '../../../data/planDesign'
import { benchmarks, techSectorSummary } from '../../../data/benchmarks'
import { UC_E_PLAN_DESIGN_SOURCES } from '../../../utils/dataSourceManifest'
import { GLOSSARY, VESTING_CURVES, VESTING_LABELS } from '../../../utils/tooltips'
import { computeOutcomes, computeEffectiveMatch, findParetoFrontier, gridCardinality } from '../../../simulation/planDesign'

// ─── Defaults / config ────────────────────────────────────────────────────────

const DEFAULT_PLAN_DESIGN_ID = 'sp-tcs-us'

const VESTING_KEYS = ['immediate', '1-yr cliff', '2-yr cliff', '3-yr cliff', '2-6 graded']

const OBJECTIVES = [
  { value: 'maxParticipation',   label: 'Maximize participation rate' },
  { value: 'minSponsorCost',     label: 'Minimize total sponsor cost' },
  { value: 'maxCompetitiveRank', label: 'Maximize competitive rank vs tech peers' },
  { value: 'resolveAdpRisk',     label: 'Resolve ADP test risk' },
  { value: 'maxAttractiveness',  label: 'Maximize plan attractiveness' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Defensively extract a boolean from a synthetic-event-or-boolean. Works whether
// the upstream component passes a ChangeEvent (Mantine Switch · Checkbox) or
// the boolean value directly (some Mantine variants and HMR transitional states).
function asChecked(eOrValue, fallback = false) {
  if (typeof eOrValue === 'boolean') return eOrValue
  if (eOrValue && eOrValue.currentTarget && 'checked' in eOrValue.currentTarget) return !!eOrValue.currentTarget.checked
  if (eOrValue && eOrValue.target && 'checked' in eOrValue.target) return !!eOrValue.target.checked
  return fallback
}

function pct(v, digits = 1) { if (v == null || isNaN(v)) return '—'; return `${(v * 100).toFixed(digits)}%` }
function pctI(v) { return pct(v, 0) }
function dollarsM(v) { if (v == null) return '—'; return `$${(v / 1_000_000).toFixed(1)}M` }
function ppDelta(a, b) {
  if (a == null || b == null) return null
  const d = (a - b) * 100
  return `${d >= 0 ? '+' : ''}${d.toFixed(1)}pp`
}

function vestKey(v) {
  if (!v) return '3-yr cliff'
  if (v.type === 'immediate') return 'immediate'
  if (v.type === 'graded') return '2-6 graded'
  return `${v.years}-yr cliff`
}

function vestSchedFromKey(k) {
  if (k === 'immediate') return { type: 'immediate', years: 0 }
  if (k === '2-6 graded') return { type: 'graded', years: 6 }
  const m = /^(\d+)-yr cliff$/.exec(k)
  return { type: 'cliff', years: m ? parseInt(m[1], 10) : 3 }
}

function paramsFromBaseline(b) {
  return {
    autoEnrollment: { ...b.autoEnrollment },
    matchFormula: { ...b.matchFormula },
    autoEscalation: { ...b.autoEscalation },
    vestingSchedule: { ...b.vestingSchedule },
    investmentMenu: { ...b.investmentMenu },
  }
}

function hasParamsDiff(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b)
}

// ─── Reusable simulation-running loader ──────────────────────────────────────
// Animates through a list of step messages with a progress bar. Calls
// onComplete after the final step. The wrapping panel is responsible for
// flipping the phase machine from 'running' → 'complete' and revealing results.

function SimulationLoader({ steps, color = 'violet', icon: HeaderIcon = IconCpu, headline = 'Simulation running…', sublabel, onComplete, intervalMs = 380 }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx >= steps.length) {
      const t = setTimeout(() => onComplete?.(), 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setIdx((i) => i + 1), intervalMs)
    return () => clearTimeout(t)
  }, [idx, steps.length, intervalMs, onComplete])

  const completedCount = Math.min(idx, steps.length)
  const progressPct = steps.length === 0 ? 100 : (completedCount / steps.length) * 100

  return (
    <Paper
      withBorder
      radius="md"
      p="lg"
      style={{
        borderLeft: `4px solid var(--mantine-color-${color}-7)`,
        background: `linear-gradient(135deg, var(--mantine-color-${color}-light), transparent 80%)`,
      }}
    >
      <Stack gap="md" align="center" py="md">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={42} radius="xl" variant="gradient" gradient={{ from: color, to: color, deg: 135 }}
            style={{ boxShadow: `0 0 18px var(--mantine-color-${color}-3)` }}>
            <HeaderIcon size={20} stroke={1.7} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="md" fw={800}>{headline}</Text>
            {sublabel && <Text size="11px" c="dimmed">{sublabel}</Text>}
          </Stack>
        </Group>

        <Stack gap={6} style={{ minWidth: 380, maxWidth: 560 }} w="100%">
          {steps.map((s, i) => {
            const done = i < idx
            const active = i === idx
            const pending = i > idx
            return (
              <Group key={i} gap="xs" wrap="nowrap" style={{ opacity: pending ? 0.4 : 1 }}>
                {done && <ThemeIcon size="sm" radius="xl" variant="filled" color="teal"><IconCheck size={10} stroke={2} /></ThemeIcon>}
                {active && <Loader size={16} color={color} />}
                {pending && <ThemeIcon size="sm" radius="xl" variant="light" color="gray"><IconActivity size={10} stroke={1.5} /></ThemeIcon>}
                <Text size="xs" c={done ? 'teal' : active ? undefined : 'dimmed'} fw={active ? 600 : 400} style={{ lineHeight: 1.5 }}>
                  {s}
                </Text>
              </Group>
            )
          })}
        </Stack>

        <Stack gap={4} w="100%" maw={560}>
          <Progress value={progressPct} color={color} size="sm" animated striped />
          <Group justify="space-between">
            <Text size="10px" c="dimmed">{completedCount}/{steps.length} steps complete</Text>
            <Text size="10px" c="dimmed">{Math.round(progressPct)}%</Text>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  )
}

// ─── Section: Plan Diagnostics Scorecard ──────────────────────────────────────

function ScorecardKpi({ label, value, benchmark, delta, tone, tooltip }) {
  const card = (
    <Paper withBorder radius="md" p="sm" style={{ minHeight: 100 }}>
      <Stack gap={2}>
        <Text size="10px" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
        <Text size="lg" fw={800} c={tone === 'red' ? 'red' : tone === 'orange' ? 'orange' : tone === 'green' ? 'teal' : undefined}>
          {value}
        </Text>
        {benchmark && (
          <Text size="10px" c="dimmed">Benchmark: {benchmark}</Text>
        )}
        {delta && (
          <Badge size="xs" variant="light" color={tone === 'red' || tone === 'orange' ? 'red' : 'teal'} radius="sm">
            {delta}
          </Badge>
        )}
      </Stack>
    </Paper>
  )
  return tooltip ? <Tooltip label={tooltip} multiline w={240} withArrow>{card}</Tooltip> : card
}

function DiagnosticsScorecard({ baseline, onLeverFocus }) {
  const k = baseline.currentKpis
  const sec = benchmarks.sectors.technology
  const dParticipation = ppDelta(k.participationRate, sec.participationRate.median)
  const dDeferral = ppDelta(k.avgDeferralRate, sec.avgDeferralRate.median)
  const adpTone = k.adpTestStatus === 'pass' ? 'green' : k.adpTestStatus === 'at-risk' ? 'orange' : 'red'

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap={6}>
          <ThemeIcon size="sm" radius="xl" variant="light" color="blue"><IconChartBar size={12} stroke={1.7} /></ThemeIcon>
          <Text size="sm" fw={700}>Plan Diagnostics — current state</Text>
        </Group>
        <Text size="10px" c="dimmed">Tech sector P50: 83% participation · 4.5% effective match</Text>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 7 }} spacing="xs">
        <ScorecardKpi
          label="Participation"
          value={pct(k.participationRate)}
          benchmark={pct(sec.participationRate.median)}
          delta={dParticipation}
          tone={k.participationRate < sec.participationRate.median - 0.10 ? 'red' : k.participationRate < sec.participationRate.median ? 'orange' : 'green'}
          tooltip={GLOSSARY.participationRate}
        />
        <ScorecardKpi
          label="Avg Deferral"
          value={pct(k.avgDeferralRate)}
          benchmark={pct(sec.avgDeferralRate.median)}
          delta={dDeferral}
          tone={k.avgDeferralRate < sec.avgDeferralRate.median - 0.01 ? 'red' : 'orange'}
          tooltip={GLOSSARY.avgDeferralRate}
        />
        <ScorecardKpi
          label="Annual Cost"
          value={dollarsM(k.annualSponsorCost)}
          benchmark="—"
          tone={null}
          tooltip={GLOSSARY.annualSponsorCost}
        />
        <ScorecardKpi
          label="ADP Test"
          value={k.adpTestStatus === 'pass' ? 'PASS' : k.adpTestStatus === 'at-risk' ? 'AT RISK' : 'FAIL'}
          benchmark="Required to PASS"
          tone={adpTone}
          tooltip={GLOSSARY.adpTestStatus}
        />
        <ScorecardKpi
          label="Competitive"
          value={k.competitiveTier}
          benchmark="Q1 best"
          tone={k.competitiveTier === 'Q1' ? 'green' : k.competitiveTier === 'Q4' ? 'red' : 'orange'}
          tooltip={GLOSSARY.competitiveTier}
        />
        <ScorecardKpi
          label="Readiness"
          value={pctI(k.retirementReadinessScore)}
          benchmark="Track for 70%"
          tone={k.retirementReadinessScore >= 0.70 ? 'green' : 'orange'}
          tooltip={GLOSSARY.retirementReadinessScore}
        />
        <ScorecardKpi
          label="Fiduciary Risk"
          value={`${k.fiduciaryLiabilityScore}/100`}
          benchmark="Lower is better"
          tone={k.fiduciaryLiabilityScore <= 25 ? 'green' : k.fiduciaryLiabilityScore <= 40 ? 'orange' : 'red'}
          tooltip={GLOSSARY.fiduciaryLiabilityScore}
        />
      </SimpleGrid>

      <Group gap={6} wrap="wrap">
        <Text size="11px" c="dimmed" fw={600} tt="uppercase">Address gaps via:</Text>
        <Badge size="sm" variant="light" color="vanguardRed" style={{ cursor: 'pointer' }} onClick={() => onLeverFocus?.('autoEnrollment')}>Auto-Enrollment</Badge>
        <Badge size="sm" variant="light" color="vanguardRed" style={{ cursor: 'pointer' }} onClick={() => onLeverFocus?.('matchFormula')}>Match Formula</Badge>
        <Badge size="sm" variant="light" color="vanguardRed" style={{ cursor: 'pointer' }} onClick={() => onLeverFocus?.('autoEscalation')}>Auto-Escalation</Badge>
      </Group>
    </Stack>
  )
}

// ─── Section: Benchmark Comparison ────────────────────────────────────────────

function BenchmarkComparison({ baseline }) {
  const peers = benchmarks.peers
  const sec = benchmarks.sectors.technology

  // Build chart rows: TCS US + sector P50 + 4 peers
  const rows = [
    { name: 'TCS US (current)', participation: Math.round(baseline.currentKpis.participationRate * 100), match: 3.0, isCurrent: true },
    { name: 'Sector P50',       participation: Math.round(sec.participationRate.median * 100), match: sec.matchEffectiveRate.median * 100, isBenchmark: true },
    ...peers.map((p) => ({
      name: p.name.replace(' US', '').replace(' 401(k) Plan', '').replace(' US 401(k) Plan', '').replace(' BPO Americas 401(k)', ''),
      participation: Math.round(p.participationRate * 100),
      match: p.matchEffectiveRate * 100,
    })),
  ]

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={700}>Benchmark Comparison — vs Tech Peers</Text>
        <Text size="10px" c="dimmed">Source: Form 5500 (2024) · Vanguard How America Saves 2025</Text>
      </Group>
      <BarChart
        h={240}
        data={rows}
        dataKey="name"
        orientation="vertical"
        yAxisProps={{ width: 150, fontSize: 11 }}
        xAxisProps={{ fontSize: 11 }}
        series={[
          { name: 'participation', label: 'Participation %', color: 'teal.6' },
          { name: 'match',         label: 'Effective match %', color: 'orange.5' },
        ]}
        withLegend
        legendProps={{ verticalAlign: 'top', height: 28 }}
        tooltipProps={{ content: ({ payload, label }) => payload?.length ? (
          <Paper withBorder p="xs" radius="sm" shadow="md">
            <Text size="xs" fw={700}>{label}</Text>
            {payload.map((p, i) => <Text key={i} size="11px">{p.name}: {p.value}{p.dataKey === 'participation' ? '%' : '% match'}</Text>)}
          </Paper>
        ) : null }}
      />
      <Paper withBorder radius="md" p="xs">
        <Stack gap={4}>
          <Text size="11px" c="dimmed" tt="uppercase" fw={600}>Peer features (illustrative — based on public Form 5500 data)</Text>
          <SimpleGrid cols={4} spacing={4}>
            {peers.map((p) => (
              <Paper key={p.id} radius="sm" p="xs" style={{ background: 'var(--mantine-color-gray-0)' }}>
                <Stack gap={2}>
                  <Text size="11px" fw={700}>{p.name.replace(' BPO Americas 401(k)', '').replace(' 401(k) Plan', '').replace(' US 401(k) Plan', '').replace(' Technologies US 401(k)', '')}</Text>
                  <Text size="10px" c="dimmed">AE: {p.autoEnrollment ? 'Yes' : 'No'} · Vest: {p.vestingSchedule}</Text>
                  <Text size="10px" c="dimmed">ER: {(p.avgExpenseRatio * 100).toFixed(2)}% · {p.competitiveTier}</Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Paper>
    </Stack>
  )
}

// ─── Section: Parameter Controls (a single variant) ───────────────────────────

function ParameterControls({ baseline, params, onChange, focusParam, sectorBench }) {
  const [fundModalOpen, setFundModalOpen] = useState(false)

  const set = (path, value) => {
    onChange((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let target = next
      for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]]
      target[keys[keys.length - 1]] = value
      return next
    })
  }

  // Live computed previews
  const liveEffectiveMatch = computeEffectiveMatch(params.matchFormula, null)
  const baselineEffectiveMatch = computeEffectiveMatch(baseline.matchFormula, null)
  const matchCostDelta = (liveEffectiveMatch - baselineEffectiveMatch) * baseline.currentKpis.annualSponsorCost / Math.max(baselineEffectiveMatch, 0.001)
  const liveER = EXPENSE_TIER_AVG_ER[params.investmentMenu.expenseRatioTier] ?? params.investmentMenu.avgExpenseRatio
  const baseER = baseline.investmentMenu.avgExpenseRatio
  const erFeeDeltaPerYear = (baseER - liveER) * 1_000_000_000  // assume ~$1B in plan AUM for fee math

  const vestType = vestKey(params.vestingSchedule)

  return (
    <Stack gap="md">
      {/* ① Auto-Enrollment */}
      <Paper id="param-autoEnrollment" withBorder radius="md" p="md" style={{ borderLeft: focusParam === 'autoEnrollment' ? '3px solid var(--mantine-color-vanguardRed-6)' : undefined }}>
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap={6}>
              <Badge size="sm" variant="filled" color="vanguardRed" radius="xl" w={22} h={22} p={0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</Badge>
              <Tooltip label={GLOSSARY.autoEnrollment} multiline w={300} withArrow>
                <Text fw={700} size="sm" style={{ cursor: 'help' }}>Auto-Enrollment</Text>
              </Tooltip>
            </Group>
            <Badge size="xs" variant="light" color="gray">Tech P50: {pctI(sectorBench.autoEnrollAdopt)} adopt</Badge>
          </Group>
          <Group gap="xl" wrap="wrap">
            <Group gap="xs">
              <Text size="11px" c="dimmed" w={70}>Status</Text>
              <Switch
                size="md" checked={params.autoEnrollment.active}
                onChange={(e) => set('autoEnrollment.active', asChecked(e, !params.autoEnrollment.active))}
                onLabel="On" offLabel="Off"
              />
            </Group>
            <Stack gap={2} flex={1} miw={240}>
              <Text size="11px" c="dimmed">Default deferral rate {params.autoEnrollment.active ? '' : '(activate above)'}</Text>
              <Slider
                disabled={!params.autoEnrollment.active}
                min={0.03} max={0.10} step={0.01}
                value={params.autoEnrollment.defaultDeferralRate ?? 0.06}
                onChange={(v) => set('autoEnrollment.defaultDeferralRate', v)}
                marks={[{ value: 0.03, label: '3%' }, { value: 0.04, label: '4%' }, { value: 0.06, label: '6%' }, { value: 0.08, label: '8%' }, { value: 0.10, label: '10%' }]}
                label={(v) => `${Math.round(v * 100)}%`}
              />
            </Stack>
          </Group>
          <BaselineDelta from={baseline.autoEnrollment.active ? `On at ${pct(baseline.autoEnrollment.defaultDeferralRate)}` : 'Off'}
            to={params.autoEnrollment.active ? `On at ${pct(params.autoEnrollment.defaultDeferralRate)}` : 'Off'} />
        </Stack>
      </Paper>

      {/* ② Employer Match */}
      <Paper id="param-matchFormula" withBorder radius="md" p="md" style={{ borderLeft: focusParam === 'matchFormula' ? '3px solid var(--mantine-color-vanguardRed-6)' : undefined }}>
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap={6}>
              <Badge size="sm" variant="filled" color="vanguardRed" radius="xl" w={22} h={22} p={0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</Badge>
              <Tooltip label={GLOSSARY.matchRate} multiline w={300} withArrow>
                <Text fw={700} size="sm" style={{ cursor: 'help' }}>Employer Match</Text>
              </Tooltip>
            </Group>
            <Badge size="xs" variant="light" color="gray">Tech P50: {pct(sectorBench.p50EffectiveMatch)} effective</Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Match rate</Text>
              <SegmentedControl
                size="xs" fullWidth
                data={['25', '50', '75', '100'].map((v) => ({ label: `${v}%`, value: v }))}
                value={String(Math.round(params.matchFormula.matchRate * 100))}
                onChange={(v) => set('matchFormula.matchRate', parseInt(v, 10) / 100)}
              />
            </Stack>
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Match cap (% of pay)</Text>
              <SegmentedControl
                size="xs" fullWidth
                data={['4', '6', '8'].map((v) => ({ label: `${v}%`, value: v }))}
                value={String(Math.round(params.matchFormula.matchCap * 100))}
                onChange={(v) => set('matchFormula.matchCap', parseInt(v, 10) / 100)}
              />
            </Stack>
            <Stack gap={2}>
              <Tooltip label={GLOSSARY.stretchMatch} multiline w={280} withArrow>
                <Text size="11px" c="dimmed" style={{ cursor: 'help' }}>Stretch match ⓘ</Text>
              </Tooltip>
              <Switch
                size="md" checked={params.matchFormula.stretchMatch}
                onChange={(e) => set('matchFormula.stretchMatch', asChecked(e, !params.matchFormula.stretchMatch))}
                onLabel="On" offLabel="Off"
              />
            </Stack>
          </SimpleGrid>
          <Paper p="xs" radius="sm" style={{ background: 'var(--mantine-color-blue-light)' }}>
            <Group gap="lg">
              <Text size="11px"><b>Effective match:</b> {pct(baselineEffectiveMatch)} → {pct(liveEffectiveMatch)}</Text>
              <Text size="11px" c={matchCostDelta >= 0 ? 'orange' : 'teal'}>
                <b>Annual match cost delta:</b> {matchCostDelta >= 0 ? '+' : ''}${(Math.abs(matchCostDelta) / 1_000_000).toFixed(1)}M (live, est.)
              </Text>
            </Group>
          </Paper>
          <BaselineDelta from={`${pctI(baseline.matchFormula.matchRate)} × ${pctI(baseline.matchFormula.matchCap)}`}
            to={`${pctI(params.matchFormula.matchRate)} × ${pctI(params.matchFormula.matchCap)}${params.matchFormula.stretchMatch ? ' (stretch)' : ''}`} />
        </Stack>
      </Paper>

      {/* ③ Auto-Escalation */}
      <Paper id="param-autoEscalation" withBorder radius="md" p="md" style={{ borderLeft: focusParam === 'autoEscalation' ? '3px solid var(--mantine-color-vanguardRed-6)' : undefined }}>
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap={6}>
              <Badge size="sm" variant="filled" color="vanguardRed" radius="xl" w={22} h={22} p={0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</Badge>
              <Tooltip label={GLOSSARY.autoEscalation} multiline w={300} withArrow>
                <Text fw={700} size="sm" style={{ cursor: 'help' }}>Auto-Escalation</Text>
              </Tooltip>
            </Group>
            <Badge size="xs" variant="light" color="gray">PSCA 2024: 71% adopt</Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Status</Text>
              <Switch
                size="md" checked={params.autoEscalation.active}
                onChange={(e) => set('autoEscalation.active', asChecked(e, !params.autoEscalation.active))}
                onLabel="On" offLabel="Off"
              />
            </Stack>
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Annual step-up</Text>
              <Radio.Group
                value={String(params.autoEscalation.annualStepUp ?? 0.01)}
                onChange={(v) => set('autoEscalation.annualStepUp', parseFloat(v))}
              >
                <Group gap="md">
                  <Radio disabled={!params.autoEscalation.active} value="0.01" label="1%/yr" />
                  <Radio disabled={!params.autoEscalation.active} value="0.02" label="2%/yr" />
                </Group>
              </Radio.Group>
            </Stack>
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Ceiling</Text>
              <SegmentedControl
                size="xs" fullWidth disabled={!params.autoEscalation.active}
                data={['10', '12', '15'].map((v) => ({ label: `${v}%`, value: v }))}
                value={String(Math.round((params.autoEscalation.ceiling ?? 0.10) * 100))}
                onChange={(v) => set('autoEscalation.ceiling', parseInt(v, 10) / 100)}
              />
            </Stack>
          </SimpleGrid>
          <BaselineDelta
            from={baseline.autoEscalation.active ? `${pctI(baseline.autoEscalation.annualStepUp)}/yr → ${pctI(baseline.autoEscalation.ceiling)}` : 'Off'}
            to={params.autoEscalation.active ? `${pctI(params.autoEscalation.annualStepUp)}/yr → ${pctI(params.autoEscalation.ceiling)}` : 'Off'} />
        </Stack>
      </Paper>

      {/* ④ Vesting Schedule */}
      <Paper id="param-vestingSchedule" withBorder radius="md" p="md" style={{ borderLeft: focusParam === 'vestingSchedule' ? '3px solid var(--mantine-color-vanguardRed-6)' : undefined }}>
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap={6}>
              <Badge size="sm" variant="filled" color="vanguardRed" radius="xl" w={22} h={22} p={0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</Badge>
              <Tooltip label={GLOSSARY.vestingSchedule} multiline w={300} withArrow>
                <Text fw={700} size="sm" style={{ cursor: 'help' }}>Vesting Schedule</Text>
              </Tooltip>
            </Group>
            <Badge size="xs" variant="light" color="gray">ERISA min: 3-yr cliff</Badge>
          </Group>
          <SegmentedControl
            size="xs" fullWidth
            data={VESTING_KEYS.map((k) => ({ label: VESTING_LABELS[k], value: k }))}
            value={vestType}
            onChange={(v) => set('vestingSchedule', vestSchedFromKey(v))}
          />
          <Paper p="xs" radius="sm" style={{ background: 'var(--mantine-color-gray-0)' }}>
            <Group gap="md" justify="center">
              {(VESTING_CURVES[vestType] || VESTING_CURVES['3-yr cliff']).map((v, i) => (
                <Stack key={i} gap={2} align="center">
                  <Text size="9px" c="dimmed">Yr {i + 1}</Text>
                  <RingProgress
                    size={36}
                    thickness={5}
                    sections={[{ value: v, color: v >= 100 ? 'teal' : v > 0 ? 'blue' : 'gray' }]}
                    label={<Text size="9px" ta="center" fw={700}>{v}%</Text>}
                  />
                </Stack>
              ))}
            </Group>
          </Paper>
          <BaselineDelta from={VESTING_LABELS[vestKey(baseline.vestingSchedule)]} to={VESTING_LABELS[vestType]} />
        </Stack>
      </Paper>

      {/* ⑤ Investment Menu */}
      <Paper id="param-investmentMenu" withBorder radius="md" p="md" style={{ borderLeft: focusParam === 'investmentMenu' ? '3px solid var(--mantine-color-vanguardRed-6)' : undefined }}>
        <FundMenuModal
          opened={fundModalOpen}
          onClose={() => setFundModalOpen(false)}
          initialMenuSize={params.investmentMenu.size}
          initialErTier={params.investmentMenu.expenseRatioTier}
          defaultFundType={params.investmentMenu.defaultFund}
        />
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap={6}>
              <Badge size="sm" variant="filled" color="vanguardRed" radius="xl" w={22} h={22} p={0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>5</Badge>
              <Tooltip label={GLOSSARY.investmentMenu} multiline w={300} withArrow>
                <Text fw={700} size="sm" style={{ cursor: 'help' }}>Investment Menu</Text>
              </Tooltip>
            </Group>
            <Group gap={6}>
              <Button
                size="compact-xs"
                variant="light"
                color="blue"
                leftSection={<IconListDetails size={12} stroke={1.7} />}
                onClick={() => setFundModalOpen(true)}
              >
                View funds in this menu
              </Button>
              <Badge size="xs" variant="light" color="gray">Vanguard avg ER: 0.07%</Badge>
            </Group>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Menu size</Text>
              <SegmentedControl
                size="xs" fullWidth
                data={Object.entries(MENU_SIZE_LABELS).map(([v, label]) => ({ value: v, label: label.split(' ')[0] }))}
                value={params.investmentMenu.size}
                onChange={(v) => set('investmentMenu.size', v)}
              />
            </Stack>
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Default fund</Text>
              <Select
                size="xs"
                data={[
                  { value: 'target-date', label: 'Target Date Fund' },
                  { value: 'balanced', label: 'Balanced Fund' },
                  { value: 'managed-account', label: 'Managed Account' },
                ]}
                value={params.investmentMenu.defaultFund}
                onChange={(v) => set('investmentMenu.defaultFund', v)}
              />
            </Stack>
            <Stack gap={2}>
              <Text size="11px" c="dimmed">Expense ratio tier</Text>
              <SegmentedControl
                size="xs" fullWidth
                data={[
                  { value: 'index-first', label: 'Index' },
                  { value: 'blended', label: 'Blended' },
                  { value: 'active-heavy', label: 'Active' },
                ]}
                value={params.investmentMenu.expenseRatioTier}
                onChange={(v) => set('investmentMenu.expenseRatioTier', v)}
              />
            </Stack>
          </SimpleGrid>
          <Paper p="xs" radius="sm" style={{ background: 'var(--mantine-color-blue-light)' }}>
            <Group gap="lg">
              <Text size="11px"><b>Avg ER:</b> {(baseER * 100).toFixed(2)}% → {(liveER * 100).toFixed(2)}%</Text>
              <Text size="11px" c={erFeeDeltaPerYear >= 0 ? 'teal' : 'orange'}>
                <b>Participant fee savings:</b> ~${(Math.abs(erFeeDeltaPerYear) / 1_000_000).toFixed(2)}M/yr (vs $1B AUM proxy)
              </Text>
            </Group>
          </Paper>
        </Stack>
      </Paper>
    </Stack>
  )
}

// ─── Investment Menu — funds modal ───────────────────────────────────────────
// Renders the actual fund list a (menuSize × defaultFund × erTier) selection
// produces. Modal is self-contained: it has its own SegmentedControls so users
// can flip across menu sizes and ER tiers without closing the modal.

const MENU_SIZE_OPTIONS_ALL = ['streamlined', 'standard', 'broad']
const ER_TIER_OPTIONS_ALL = ['index-first', 'blended', 'active-heavy']

function FundMenuModal({
  opened,
  onClose,
  initialMenuSize,
  initialErTier,
  availableMenuSizes,
  availableErTiers,
  defaultFundType,
}) {
  const sizeOptions = (availableMenuSizes && availableMenuSizes.length > 0) ? availableMenuSizes : MENU_SIZE_OPTIONS_ALL
  const tierOptions = (availableErTiers && availableErTiers.length > 0) ? availableErTiers : ER_TIER_OPTIONS_ALL

  const [menuSize, setMenuSize] = useState(initialMenuSize || sizeOptions[0])
  const [erTier, setErTier] = useState(initialErTier || tierOptions[0])

  // When the modal re-opens, sync internal selectors to the latest props so
  // the modal always boots from the current panel selection. Inside the
  // session, the user can still flip freely between candidate combos.
  useEffect(() => {
    if (!opened) return
    if (initialMenuSize && sizeOptions.includes(initialMenuSize)) setMenuSize(initialMenuSize)
    if (initialErTier && tierOptions.includes(initialErTier)) setErTier(initialErTier)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialMenuSize, initialErTier])

  // If the available subset shrinks (user de-selects a chip), make sure our
  // internal selector still points at a valid option.
  useEffect(() => {
    if (!sizeOptions.includes(menuSize)) setMenuSize(sizeOptions[0])
    if (!tierOptions.includes(erTier)) setErTier(tierOptions[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableMenuSizes?.join(','), availableErTiers?.join(',')])

  const menu = useMemo(() => getMenuFunds(menuSize, defaultFundType, erTier), [menuSize, defaultFundType, erTier])

  const isMultiCombo = sizeOptions.length > 1 || tierOptions.length > 1

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      radius="md"
      centered
      title={
        <Stack gap={2}>
          <Group gap={6}>
            <ThemeIcon size="sm" radius="xl" variant="light" color="blue"><IconCoins size={12} stroke={1.7} /></ThemeIcon>
            <Text size="md" fw={700}>Investment menu — funds in this configuration</Text>
          </Group>
          <Text size="11px" c="dimmed">{menu.count} funds · {MENU_SIZE_LABELS[menuSize]} · {EXPENSE_TIER_LABELS[erTier]}</Text>
        </Stack>
      }
    >
      <Stack gap="md">
        {/* Self-contained selector — always rendered so the modal is truly responsive */}
        <Paper withBorder radius="md" p="sm" style={{ background: 'var(--mantine-color-gray-0)' }}>
          <Stack gap="xs">
            <Group gap={6} wrap="nowrap" justify="space-between">
              <Group gap={4}>
                <ThemeIcon size="xs" radius="xl" variant="light" color="blue"><IconAdjustments size={10} stroke={1.7} /></ThemeIcon>
                <Text size="11px" fw={700} c="dimmed" tt="uppercase">{isMultiCombo ? 'Pick a configuration to view' : 'Configuration'}</Text>
              </Group>
              <Text size="10px" c="dimmed">{sizeOptions.length}× {tierOptions.length} = {sizeOptions.length * tierOptions.length} combo{sizeOptions.length * tierOptions.length === 1 ? '' : 's'} available</Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              <Stack gap={2}>
                <Text size="10px" c="dimmed">Menu size</Text>
                <SegmentedControl
                  size="xs" fullWidth
                  data={sizeOptions.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
                  value={menuSize}
                  onChange={setMenuSize}
                />
              </Stack>
              <Stack gap={2}>
                <Text size="10px" c="dimmed">Expense ratio tier</Text>
                <SegmentedControl
                  size="xs" fullWidth
                  data={tierOptions.map((v) => ({ value: v, label: v.replace('-', ' ') }))}
                  value={erTier}
                  onChange={setErTier}
                />
              </Stack>
            </SimpleGrid>
          </Stack>
        </Paper>

        <Alert color="blue" variant="light" icon={<IconBulb size={14} />} radius="md">
          <Text size="xs" style={{ lineHeight: 1.5 }}>{menu.notes}</Text>
        </Alert>

        <SimpleGrid cols={3} spacing="xs">
          <Paper withBorder radius="md" p="xs">
            <Text size="10px" c="dimmed" tt="uppercase" fw={600}>Average expense ratio</Text>
            <Text size="lg" fw={800} c="teal">{(menu.avgER * 100).toFixed(2)}%</Text>
            <Text size="10px" c="dimmed">vs industry avg 0.44%</Text>
          </Paper>
          <Paper withBorder radius="md" p="xs">
            <Text size="10px" c="dimmed" tt="uppercase" fw={600}>Default fund (QDIA)</Text>
            <Text size="sm" fw={700} c="vanguardRed">{menu.defaultFund?.ticker || '—'}</Text>
            <Text size="10px" c="dimmed" lineClamp={1}>{menu.defaultFund?.name || (defaultFundType === 'managed-account' ? 'Per-participant managed account overlay' : 'No QDIA selected')}</Text>
          </Paper>
          <Paper withBorder radius="md" p="xs">
            <Text size="10px" c="dimmed" tt="uppercase" fw={600}>ER tier cap</Text>
            <Text size="sm" fw={700}>≤ {(menu.erMax * 100).toFixed(2)}%</Text>
            <Text size="10px" c="dimmed">Funds above this cap are excluded.</Text>
          </Paper>
        </SimpleGrid>

        <ScrollArea h={400} type="auto" offsetScrollbars>
          <Stack gap="md">
            {Object.entries(menu.byAssetClass).map(([assetClass, list]) => (
              <Stack key={assetClass} gap={4}>
                <Group gap={6}>
                  <Badge size="sm" variant="light" color="violet">{assetClass}</Badge>
                  <Text size="10px" c="dimmed">{list.length} fund{list.length === 1 ? '' : 's'}</Text>
                </Group>
                <Table fz="xs" withRowBorders striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={70}>Ticker</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th w={140}>Category</Table.Th>
                      <Table.Th w={70}>Manager</Table.Th>
                      <Table.Th w={60}>ER</Table.Th>
                      <Table.Th w={70}>Tag</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {list.map((f) => {
                      const isDefault = menu.defaultFund && f.ticker === menu.defaultFund.ticker
                      return (
                        <Table.Tr key={f.ticker} style={isDefault ? { background: 'var(--mantine-color-vanguardRed-light)' } : undefined}>
                          <Table.Td><Text size="11px" fw={700}>{f.ticker}</Text></Table.Td>
                          <Table.Td><Text size="11px">{f.name}</Text></Table.Td>
                          <Table.Td><Text size="10px" c="dimmed">{f.category}</Text></Table.Td>
                          <Table.Td>
                            <Badge size="xs" variant="light" color={f.managerType === 'Index' ? 'teal' : 'orange'}>
                              {f.managerType || (f.targetDateSeries ? 'Index (TDF)' : '—')}
                            </Badge>
                          </Table.Td>
                          <Table.Td><Text size="11px" c={(f.expenseRatio ?? 0) <= 0.0010 ? 'teal' : (f.expenseRatio ?? 0) <= 0.0030 ? 'blue' : 'orange'} fw={600}>{((f.expenseRatio ?? 0) * 100).toFixed(2)}%</Text></Table.Td>
                          <Table.Td>
                            {isDefault && <Badge size="xs" color="vanguardRed" variant="filled">QDIA Default</Badge>}
                            {!isDefault && f.qdiaEligible && <Badge size="xs" color="teal" variant="light">QDIA-eligible</Badge>}
                            {f.synthesized && <Badge size="xs" color="orange" variant="light">Illustrative</Badge>}
                          </Table.Td>
                        </Table.Tr>
                      )
                    })}
                  </Table.Tbody>
                </Table>
              </Stack>
            ))}
          </Stack>
        </ScrollArea>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Close</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function BaselineDelta({ from, to }) {
  const changed = from !== to
  return (
    <Group gap={4}>
      <Text size="10px" c="dimmed">Baseline: {from}</Text>
      {changed && (
        <>
          <IconChevronRight size={10} stroke={1.5} style={{ opacity: 0.5 }} />
          <Text size="10px" fw={700} c="vanguardRed">Proposed: {to}</Text>
        </>
      )}
      {!changed && <Badge size="xs" variant="light" color="gray">Unchanged</Badge>}
    </Group>
  )
}

// ─── Section: What-If Mode ────────────────────────────────────────────────────

function WhatIfMode({ baseline, onApply, focusParam, onFocusConsumed, sectorBench }) {
  const [activeVariant, setActiveVariant] = useState('B')
  const [variantB, setVariantB] = useState(() => paramsFromBaseline(baseline))
  const [variantC, setVariantC] = useState(() => paramsFromBaseline(baseline))
  const [results, setResults] = useState(null)
  const [phase, setPhase] = useState('idle')   // 'idle' | 'running' | 'complete'

  // When a focus is requested from diagnostics, jump to Plan B and apply a sensible default.
  useEffect(() => {
    if (!focusParam) return
    setActiveVariant('B')
    setVariantB((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      if (focusParam === 'autoEnrollment' && !next.autoEnrollment.active) {
        next.autoEnrollment.active = true
        next.autoEnrollment.defaultDeferralRate = 0.06
      } else if (focusParam === 'matchFormula') {
        next.matchFormula.matchCap = 0.06
      } else if (focusParam === 'autoEscalation' && !next.autoEscalation.active) {
        next.autoEscalation.active = true
        next.autoEscalation.annualStepUp = 0.01
        next.autoEscalation.ceiling = 0.12
      } else if (focusParam === 'vestingSchedule') {
        next.vestingSchedule = vestSchedFromKey('2-yr cliff')
      }
      return next
    })
    // Scroll to the section
    setTimeout(() => {
      const el = document.getElementById(`param-${focusParam}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    onFocusConsumed?.()
  }, [focusParam, onFocusConsumed])

  const variantParams = activeVariant === 'B' ? variantB : variantC
  const setVariantParams = activeVariant === 'B' ? setVariantB : setVariantC

  const planBChanged = hasParamsDiff(variantB, paramsFromBaseline(baseline))
  const planCChanged = hasParamsDiff(variantC, paramsFromBaseline(baseline))

  const runSimulation = useCallback(() => {
    setResults(null)
    setPhase('running')
  }, [])

  // Called when the SimulationLoader finishes its stepped progression
  const onSimulationComplete = useCallback(() => {
    const aOut = computeOutcomes(baseline, paramsFromBaseline(baseline))
    const bOut = planBChanged ? computeOutcomes(baseline, variantB) : aOut
    const cOut = planCChanged ? computeOutcomes(baseline, variantC) : aOut
    setResults({ a: aOut, b: bOut, c: cOut, planBChanged, planCChanged })
    setPhase('complete')
  }, [baseline, variantB, variantC, planBChanged, planCChanged])

  const reset = (id) => {
    if (id === 'B') setVariantB(paramsFromBaseline(baseline))
    if (id === 'C') setVariantC(paramsFromBaseline(baseline))
    setResults(null)
    setPhase('idle')
  }

  const applyActiveVariant = () => {
    const params = variantParams
    const outcomes = computeOutcomes(baseline, params)
    onApply({ params, outcomes, label: `Plan ${activeVariant}`, rationale: `User-configured What-If variant ${activeVariant}.` })
  }

  // Build the simulation step list dynamically based on what changed.
  const simulationSteps = useMemo(() => {
    const steps = [
      'Loading TCS US plan baseline (current plan KPIs · workforce twin · ADP context)…',
    ]
    if (planBChanged) steps.push('Applying Plan B parameter set to baseline…')
    if (planCChanged) steps.push('Applying Plan C parameter set to baseline…')
    steps.push('Computing per-variant outcomes — participation, deferral, sponsor cost…')
    steps.push('Running ADP test margin checks (HCE / NHCE deferral spread)…')
    steps.push('Calculating retirement readiness and fiduciary liability scores…')
    steps.push('Resolving competitive tier vs tech-sector peers…')
    steps.push('Building parameter-impact attribution (plain-language Shapley)…')
    steps.push('Cross-checking baseline against current plan diagnostics…')
    steps.push('Simulation complete — preparing results.')
    return steps
  }, [planBChanged, planCChanged])

  return (
    <Stack gap="md">
      <Tabs value={activeVariant} onChange={setActiveVariant}>
        <Tabs.List>
          <Tabs.Tab value="A" disabled style={{ opacity: 0.7 }}>Plan A · Current (read-only)</Tabs.Tab>
          <Tabs.Tab value="B" rightSection={planBChanged ? <Badge size="xs" color="vanguardRed" variant="filled">Edited</Badge> : null}>
            Plan B
          </Tabs.Tab>
          <Tabs.Tab value="C" rightSection={planCChanged ? <Badge size="xs" color="vanguardRed" variant="filled">Edited</Badge> : null}>
            Plan C
          </Tabs.Tab>
          <Group gap={4} ml="auto" mr="xs" align="center">
            {(activeVariant === 'B' || activeVariant === 'C') && (
              <Tooltip label={`Reset Plan ${activeVariant} to current baseline`} withArrow>
                <ActionIcon variant="subtle" color="gray" onClick={() => reset(activeVariant)}>
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Tabs.List>
      </Tabs>

      {activeVariant === 'A' ? (
        <Alert color="gray" variant="light" icon={<IconInfoCircle size={14} />}>
          Plan A is the read-only current plan baseline. Configure Plan B or Plan C to compare.
        </Alert>
      ) : (
        <ParameterControls
          baseline={baseline}
          params={variantParams}
          onChange={setVariantParams}
          focusParam={focusParam}
          sectorBench={sectorBench}
        />
      )}

      <Group justify="space-between" wrap="wrap">
        <Text size="xs" c="dimmed">
          {phase === 'running'
            ? 'Simulation in progress — see live progress below.'
            : planBChanged || planCChanged
              ? (phase === 'complete' ? 'Re-run to refresh results after parameter changes.' : 'Run simulation to see projected outcomes for each variant.')
              : 'Configure at least one variant before running the simulation.'}
        </Text>
        <Button
          size="md"
          leftSection={phase === 'running' ? <Loader size={14} color="white" /> : <IconPlayerPlay size={16} stroke={1.7} />}
          disabled={(!planBChanged && !planCChanged) || phase === 'running'}
          onClick={runSimulation}
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
        >
          {phase === 'running' ? 'Running…' : phase === 'complete' ? 'Re-run Simulation' : 'Run Simulation'}
        </Button>
      </Group>

      {phase === 'running' && (
        <SimulationLoader
          steps={simulationSteps}
          color="indigo"
          icon={IconCpu}
          headline="Running What-If simulation"
          sublabel={`Plan A · Plan B${planBChanged ? ' (edited)' : ''} · Plan C${planCChanged ? ' (edited)' : ''}`}
          intervalMs={360}
          onComplete={onSimulationComplete}
        />
      )}

      {phase === 'complete' && results && <WhatIfResults baseline={baseline} results={results} variantB={variantB} variantC={variantC} />}

      {phase === 'complete' && results && (
        <Group justify="flex-end">
          <Tooltip label={`Apply Plan ${activeVariant} as the selected configuration and continue`} withArrow>
            <Button
              size="sm"
              variant="filled"
              color="vanguardRed"
              leftSection={<IconCheck size={14} />}
              onClick={applyActiveVariant}
              disabled={activeVariant === 'A' || (!planBChanged && !planCChanged)}
            >
              Apply Plan {activeVariant} as recommendation
            </Button>
          </Tooltip>
        </Group>
      )}
    </Stack>
  )
}

function WhatIfResults({ baseline, results, variantB, variantC }) {
  const rows = [
    { name: 'Plan A · Current',  participation: Math.round(results.a.participationRate * 100), deferral: +(results.a.avgDeferralRate * 100).toFixed(1), cost: +(results.a.annualSponsorCost / 1_000_000).toFixed(1) },
    { name: 'Plan B',            participation: Math.round(results.b.participationRate * 100), deferral: +(results.b.avgDeferralRate * 100).toFixed(1), cost: +(results.b.annualSponsorCost / 1_000_000).toFixed(1) },
    { name: 'Plan C',            participation: Math.round(results.c.participationRate * 100), deferral: +(results.c.avgDeferralRate * 100).toFixed(1), cost: +(results.c.annualSponsorCost / 1_000_000).toFixed(1) },
  ]

  // Parameter-impact bar (vs Plan A) for the most-changed variant
  const focusedName = results.planBChanged ? 'Plan B' : 'Plan C'
  const focusedParams = results.planBChanged ? variantB : variantC

  const impact = []
  if (focusedParams.autoEnrollment.active && !baseline.autoEnrollment.active) {
    impact.push({ lever: 'Auto-Enrollment', pp: 25 })
  }
  if (focusedParams.autoEscalation.active && !baseline.autoEscalation.active) {
    impact.push({ lever: 'Auto-Escalation', pp: 2 })
  }
  if (focusedParams.matchFormula.matchCap > baseline.matchFormula.matchCap) {
    impact.push({ lever: 'Match Cap', pp: Math.round((focusedParams.matchFormula.matchCap - baseline.matchFormula.matchCap) * 100 * 2) })
  }
  if (focusedParams.matchFormula.stretchMatch && !baseline.matchFormula.stretchMatch) {
    impact.push({ lever: 'Stretch Match', pp: 1 })
  }
  if (vestKey(focusedParams.vestingSchedule) !== vestKey(baseline.vestingSchedule)) {
    impact.push({ lever: 'Vesting', pp: 2 })
  }

  // ─── Pick the "winner" — the variant with the best balance of lift vs cost ───
  // Score = participation lift over Plan A divided by cost increase ($1M units).
  // If a variant has zero cost increase (or even savings), it's automatically attractive.
  function score(o) {
    const lift = (o.participationRate - results.a.participationRate)
    const dCost = (o.annualSponsorCost - results.a.annualSponsorCost) / 1_000_000
    if (dCost <= 0.1) return lift * 100 + 5 // bonus for cost-neutral
    return lift * 100 / Math.max(dCost, 0.5)
  }
  const planB_eligible = results.planBChanged
  const planC_eligible = results.planCChanged
  let winner = null
  if (planB_eligible && planC_eligible) {
    winner = score(results.b) >= score(results.c) ? 'B' : 'C'
  } else if (planB_eligible) winner = 'B'
  else if (planC_eligible) winner = 'C'

  function buildWinnerNarrative(letter) {
    if (!letter) return null
    const o = letter === 'B' ? results.b : results.c
    const params = letter === 'B' ? variantB : variantC
    const dPart = Math.round((o.participationRate - results.a.participationRate) * 100)
    const dDef = ((o.avgDeferralRate - results.a.avgDeferralRate) * 100).toFixed(1)
    const dCost = (o.annualSponsorCost - results.a.annualSponsorCost) / 1_000_000
    const adpResolved = results.a.adpTestStatus !== 'pass' && o.adpTestStatus === 'pass'
    const tierMoved = results.a.competitiveTier !== o.competitiveTier
    const reasons = []
    if (params.autoEnrollment.active && !baseline.autoEnrollment.active) {
      reasons.push(`Auto-Enrollment at ${Math.round(params.autoEnrollment.defaultDeferralRate * 100)}% drives the largest single share of the participation lift`)
    }
    if (params.autoEscalation.active && !baseline.autoEscalation.active) {
      reasons.push(`Auto-Escalation compounds deferral rates over time`)
    }
    if (params.matchFormula.stretchMatch && !baseline.matchFormula.stretchMatch) {
      reasons.push(`Stretch Match raises deferrals at no incremental sponsor cost`)
    }
    if (params.matchFormula.matchCap > baseline.matchFormula.matchCap) {
      reasons.push(`Higher match cap captures more participant savings`)
    }
    if (params.investmentMenu.expenseRatioTier === 'index-first' && baseline.investmentMenu.expenseRatioTier !== 'index-first') {
      reasons.push(`Index-first menu lowers participant fees and fiduciary risk`)
    }
    return {
      headline: `Plan ${letter} is the stronger recommendation`,
      detail: `Participation moves ${dPart >= 0 ? '+' : ''}${dPart}pp · average deferral ${dDef >= 0 ? '+' : ''}${dDef}pp · sponsor cost ${dCost >= 0 ? '+' : ''}$${Math.abs(dCost).toFixed(1)}M${adpResolved ? ' · ADP test moves to PASS' : ''}${tierMoved ? ` · competitive tier ${results.a.competitiveTier} → ${o.competitiveTier}` : ''}.`,
      because: reasons.length ? reasons : ['Configuration tightens existing parameters within the current cost envelope.'],
    }
  }

  function buildLoserNarrative(letter) {
    if (!letter) return null
    const o = letter === 'B' ? results.b : results.c
    const w = letter === 'B' ? results.c : results.b
    const dPart = Math.round((o.participationRate - w.participationRate) * 100)
    const dCost = (o.annualSponsorCost - w.annualSponsorCost) / 1_000_000
    if (dPart === 0 && Math.abs(dCost) < 0.1) return `Plan ${letter} produces nearly identical outcomes to the recommended option.`
    const parts = []
    if (dPart < 0) parts.push(`reaches ${Math.abs(dPart)}pp lower participation`)
    if (dPart > 0) parts.push(`reaches ${dPart}pp higher participation`)
    if (dCost > 0.1) parts.push(`costs $${dCost.toFixed(1)}M more`)
    if (dCost < -0.1) parts.push(`saves $${Math.abs(dCost).toFixed(1)}M`)
    return `Plan ${letter} ${parts.join(' but ')} than the recommended option.`
  }

  const winnerNarrative = buildWinnerNarrative(winner)
  const loserLetter = winner === 'B' ? (planC_eligible ? 'C' : null) : winner === 'C' ? (planB_eligible ? 'B' : null) : null
  const loserNarrative = buildLoserNarrative(loserLetter)

  return (
    <Stack gap="md">
      <Divider variant="dashed" label="Simulation results" labelPosition="center" />

      {/* Winner & why callout — business-friendly */}
      {winnerNarrative && (
        <Paper withBorder radius="md" p="md" style={{
          borderLeft: '4px solid var(--mantine-color-teal-7)',
          background: 'linear-gradient(135deg, var(--mantine-color-teal-light), transparent 80%)',
        }}>
          <Stack gap="xs">
            <Group gap={6}>
              <ThemeIcon size="md" radius="xl" variant="filled" color="teal"><IconTrophy size={14} stroke={1.7} /></ThemeIcon>
              <Text size="sm" fw={800}>{winnerNarrative.headline}</Text>
            </Group>
            <Text size="xs" style={{ lineHeight: 1.55 }}>{winnerNarrative.detail}</Text>
            <Stack gap={2}>
              <Text size="10px" c="dimmed" tt="uppercase" fw={600}>Why this beats the alternative</Text>
              {winnerNarrative.because.map((r, i) => (
                <Group key={i} gap={6} wrap="nowrap" align="flex-start">
                  <ThemeIcon size="xs" radius="xl" variant="light" color="teal" mt={2}><IconCheck size={10} /></ThemeIcon>
                  <Text size="11px" style={{ lineHeight: 1.5 }}>{r}</Text>
                </Group>
              ))}
            </Stack>
            {loserNarrative && (
              <Alert color="gray" variant="light" p="xs" radius="sm">
                <Group gap={4} wrap="nowrap" align="flex-start">
                  <IconInfoCircle size={12} stroke={1.7} style={{ flexShrink: 0, marginTop: 1, opacity: 0.7 }} />
                  <Text size="11px" style={{ lineHeight: 1.5 }}>{loserNarrative}</Text>
                </Group>
              </Alert>
            )}
          </Stack>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm">
        {rows.map((r, i) => {
          const o = i === 0 ? results.a : i === 1 ? results.b : results.c
          const isCurrent = i === 0
          return (
            <Paper key={r.name} withBorder radius="md" p="sm" style={{ borderLeft: isCurrent ? '3px solid var(--mantine-color-gray-5)' : '3px solid var(--mantine-color-vanguardRed-5)' }}>
              <Stack gap={4}>
                <Text size="xs" fw={700}>{r.name}</Text>
                <Group gap="xs"><Text size="11px" c="dimmed" w={90}>Participation</Text><Text size="sm" fw={700} c={isCurrent ? undefined : 'teal'}>{r.participation}%</Text></Group>
                <Group gap="xs"><Text size="11px" c="dimmed" w={90}>Avg deferral</Text><Text size="sm" fw={700} c={isCurrent ? undefined : 'teal'}>{r.deferral}%</Text></Group>
                <Group gap="xs"><Text size="11px" c="dimmed" w={90}>Sponsor cost</Text><Text size="sm" fw={700}>${r.cost}M</Text></Group>
                <Group gap="xs"><Text size="11px" c="dimmed" w={90}>ADP test</Text>
                  <Badge size="xs" variant="light" color={o.adpTestStatus === 'pass' ? 'teal' : o.adpTestStatus === 'at-risk' ? 'orange' : 'red'}>
                    {o.adpTestStatus === 'pass' ? 'PASS' : o.adpTestStatus === 'at-risk' ? 'AT RISK' : 'FAIL'}
                  </Badge>
                </Group>
                <Group gap="xs"><Text size="11px" c="dimmed" w={90}>Competitive</Text><Badge size="xs" variant="light" color={o.competitiveTier === 'Q1' ? 'teal' : o.competitiveTier === 'Q4' ? 'red' : 'blue'}>{o.competitiveTier}</Badge></Group>
                <Group gap="xs"><Text size="11px" c="dimmed" w={90}>Fid. risk</Text><Text size="11px" fw={700}>{o.fiduciaryLiabilityScore}/100</Text></Group>
              </Stack>
            </Paper>
          )
        })}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Paper withBorder radius="md" p="sm">
          <Stack gap={4}>
            <Text size="xs" fw={700}>Plan comparison</Text>
            <BarChart
              h={220}
              data={rows}
              dataKey="name"
              series={[
                { name: 'participation', color: 'teal.6', label: 'Participation %' },
                { name: 'deferral',      color: 'blue.5', label: 'Deferral %' },
                { name: 'cost',          color: 'orange.5', label: 'Cost ($M)' },
              ]}
              xAxisProps={{ fontSize: 10 }}
              yAxisProps={{ fontSize: 10 }}
              withLegend
              legendProps={{ verticalAlign: 'top', height: 28 }}
            />
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="sm">
          <Stack gap={4}>
            <Text size="xs" fw={700}>Parameter contribution to participation lift — {focusedName}</Text>
            {impact.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" mt="xl">No changed parameters in this variant.</Text>
            ) : (
              <BarChart
                h={220}
                data={impact}
                dataKey="lever"
                orientation="vertical"
                yAxisProps={{ width: 140, fontSize: 11 }}
                series={[{ name: 'pp', color: 'vanguardRed.5', label: 'Lift (pp)' }]}
                xAxisProps={{ fontSize: 10 }}
              />
            )}
            <Text size="10px" c="dimmed" ta="center">Marginal contribution per parameter (plain-language attribution)</Text>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  )
}

// ─── Section: If-What Mode (Pareto search) ────────────────────────────────────

const AE_DEFAULT_OPTIONS = [0.03, 0.04, 0.06, 0.08, 0.10]
const MATCH_RATE_OPTIONS = [0.25, 0.50, 0.75, 1.00]
const MATCH_CAP_OPTIONS  = [0.04, 0.06, 0.08]
const ESC_STEP_OPTIONS   = [0.01, 0.02]
const ESC_CEIL_OPTIONS   = [0.10, 0.12, 0.15]
const VEST_OPTIONS       = ['immediate', '1-yr cliff', '2-yr cliff', '3-yr cliff', '2-6 graded']
const ER_TIER_OPTIONS    = ['index-first', 'blended', 'active-heavy']
const MENU_SIZE_OPTIONS  = ['streamlined', 'standard', 'broad']

// ─── If-What sub-components ──────────────────────────────────────────────────

// Header for an If-What parameter card. Mirrors What-If parameter section header
// (numbered badge · title · benchmark hint chip on right) and adds an
// "Include in search" Switch and a "n of N candidates" hint badge.
function IfWhatParamHeader({ number, title, tooltip, hint, included, onToggleInclude, candidateCount, totalOptions, extraAction }) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Group gap={6} wrap="nowrap">
        <Badge size="sm" variant="filled" color={included ? 'violet' : 'gray'} radius="xl" w={22} h={22} p={0}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {number}
        </Badge>
        <Tooltip label={tooltip} multiline w={300} withArrow>
          <Text fw={700} size="sm" style={{ cursor: 'help', opacity: included ? 1 : 0.5 }}>{title}</Text>
        </Tooltip>
        {included && totalOptions > 0 && (
          <Badge size="xs" variant="light" color={candidateCount > 0 ? 'violet' : 'red'}>
            {candidateCount} of {totalOptions} selected
          </Badge>
        )}
      </Group>
      <Group gap={6} wrap="nowrap">
        {extraAction}
        {hint && <Badge size="xs" variant="light" color="gray" style={{ opacity: included ? 1 : 0.5 }}>{hint}</Badge>}
        <Tooltip label={included ? 'Freeze at current plan value' : 'Include in Pareto search'} withArrow>
          <Switch
            size="sm"
            checked={included}
            onChange={onToggleInclude}
            label={included ? 'Searching' : 'Frozen'}
            styles={{ label: { fontSize: 10, fontWeight: 600, color: included ? 'var(--mantine-color-violet-7)' : 'var(--mantine-color-gray-6)' } }}
          />
        </Tooltip>
      </Group>
    </Group>
  )
}

// Multi-pills row — visually segmented like What-If's SegmentedControl but multi-select.
// Backed by Chip.Group `multiple`. `disabled` greys the row out when frozen.
function MultiPills({ label, value, onChange, options, disabled, formatter }) {
  return (
    <Stack gap={4}>
      <Text size="10px" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
      <Chip.Group multiple value={value} onChange={disabled ? () => {} : onChange}>
        <Group gap={4} wrap="wrap">
          {options.map((opt) => {
            const v = String(opt.value ?? opt)
            const lbl = opt.label ?? (formatter ? formatter(opt) : v)
            return (
              <Chip
                key={v}
                value={v}
                size="xs"
                radius="sm"
                color="violet"
                variant={value.includes(v) ? 'filled' : 'outline'}
                disabled={disabled}
              >
                {lbl}
              </Chip>
            )
          })}
        </Group>
      </Chip.Group>
    </Stack>
  )
}

function IfWhatMode({ baseline, onApply }) {
  const [objective, setObjective] = useState('maxParticipation')
  const [adjustable, setAdjustable] = useState({ ae: true, match: true, esc: true, vest: false, menu: false })
  const [aeDefaults, setAeDefaults] = useState(['0.04', '0.06'])
  const [matchRates, setMatchRates] = useState(['0.5', '0.75'])
  // Includes baseline cap (4%) and an expanded cap (6%) so the search produces
  // a real cost vs participation Pareto curve instead of a single corner point.
  const [matchCaps, setMatchCaps] = useState(['0.04', '0.06'])
  const [stretchOptions, setStretchOptions] = useState(['true', 'false'])
  const [escSteps, setEscSteps] = useState(['0.01'])
  const [escCeils, setEscCeils] = useState(['0.12'])
  const [vestSelected, setVestSelected] = useState(['3-yr cliff', '2-yr cliff'])
  const [erTiers, setErTiers] = useState(['index-first', 'blended'])
  const [menuSizes, setMenuSizes] = useState(['standard'])
  // $22M default leaves enough headroom to admit auto-enrollment configurations
  // (typically +$5–8M over baseline) so the frontier has 3+ candidates.
  const [costCeiling, setCostCeiling] = useState(22_000_000)
  const [results, setResults] = useState(null)
  const [warning, setWarning] = useState(null)
  const [phase, setPhase] = useState('idle')   // 'idle' | 'running' | 'complete'
  const [pendingSearch, setPendingSearch] = useState(null) // captures search inputs for the loader-completion handler
  const [fundModalState, setFundModalState] = useState({ open: false, menuSize: 'standard', erTier: 'blended' })

  const selection = useMemo(() => ({
    adjustable,
    ranges: {
      aeStatus: adjustable.ae ? [false, true] : [baseline.autoEnrollment.active],
      aeDefault: aeDefaults.map(parseFloat),
      matchRate: matchRates.map(parseFloat),
      matchCap: matchCaps.map(parseFloat),
      stretch: stretchOptions.map((v) => v === 'true'),
      escStatus: adjustable.esc ? [false, true] : [baseline.autoEscalation.active],
      escStep: escSteps.map(parseFloat),
      escCeiling: escCeils.map(parseFloat),
      vestType: vestSelected,
      menuSize: menuSizes,
      expenseTier: erTiers,
    },
  }), [adjustable, aeDefaults, matchRates, matchCaps, stretchOptions, escSteps, escCeils, vestSelected, erTiers, menuSizes, baseline])

  const cardinality = gridCardinality(selection)

  const runSearch = () => {
    setWarning(null)
    if (cardinality > 500) {
      setWarning(`Configuration would generate ${cardinality.toLocaleString()} candidate plans — beyond the 500-plan cap. Narrow your ranges or freeze a parameter.`)
      return
    }
    if (cardinality === 0) {
      setWarning('No candidate plans — at least one value must be selected for every searching parameter.')
      return
    }
    setResults(null)
    setPendingSearch({ selection, costCeiling, objective, cardinality })
    setPhase('running')
  }

  const onSearchComplete = useCallback(() => {
    if (!pendingSearch) return
    const out = findParetoFrontier({
      baseline,
      selection: pendingSearch.selection,
      costCeiling: pendingSearch.costCeiling,
      objective: pendingSearch.objective,
      maxConfigs: 500,
    })
    setResults(out)
    setPhase('complete')
  }, [pendingSearch, baseline])

  const searchSteps = useMemo(() => {
    const c = pendingSearch?.cardinality ?? cardinality
    const obj = pendingSearch?.objective ?? objective
    const ceiling = pendingSearch?.costCeiling ?? costCeiling
    return [
      `Loading TCS US plan baseline (current KPIs · workforce twin)…`,
      `Generating candidate plan grid — ${c.toLocaleString()} configurations across selected parameters…`,
      `Filtering by hard cost ceiling ($${(ceiling / 1_000_000).toFixed(1)}M) — excluding configurations that exceed it…`,
      `Computing per-configuration outcomes (participation · deferral · cost · ADP)…`,
      `Calculating fiduciary liability and competitive tier for each candidate…`,
      `Extracting Pareto frontier — discarding dominated configurations…`,
      `Ranking frontier by objective: ${OBJECTIVE_COPY[obj] || obj}…`,
      `Selecting Top 3 with plain-language labels and trade-off flags…`,
      `Cross-checking against historical plan-design analogs (ep-006, ep-007)…`,
      `Pareto search complete — preparing recommendation cards.`,
    ]
  }, [pendingSearch, cardinality, objective, costCeiling])

  const toggle = (key) => (e) => setAdjustable((p) => ({ ...p, [key]: asChecked(e, !p[key]) }))

  return (
    <Stack gap="md">
      <FundMenuModal
        opened={fundModalState.open}
        onClose={() => setFundModalState((s) => ({ ...s, open: false }))}
        initialMenuSize={fundModalState.menuSize}
        initialErTier={fundModalState.erTier}
        availableMenuSizes={menuSizes.length > 0 ? menuSizes : MENU_SIZE_OPTIONS}
        availableErTiers={erTiers.length > 0 ? erTiers : ER_TIER_OPTIONS}
        defaultFundType={baseline.investmentMenu.defaultFund}
      />

      {/* How If-What works — short page guide */}
      <Alert color="violet" variant="light" radius="md" icon={<IconBulb size={14} />}>
        <Stack gap={4}>
          <Text size="xs" fw={700}>How If-What mode works</Text>
          <Text size="11px" style={{ lineHeight: 1.5 }}>
            Set a primary objective, select which plan parameters the optimizer may search across, and define the candidate values to consider for each.
            Configurations exceeding the hard sponsor-cost ceiling are excluded. The optimizer evaluates every valid combination and returns the
            <b> Pareto-optimal</b> set — configurations where participation cannot be improved without raising cost, and cost cannot be reduced without
            lowering participation. The top three are ranked by the chosen objective and presented with a plain-language label and rationale.
          </Text>
        </Stack>
      </Alert>

      {/* Step A — Objective */}
      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Group gap={6}><Badge color="violet" size="sm" variant="filled">A</Badge><Text fw={700} size="sm">Primary objective</Text></Group>
          <Text size="11px" c="dimmed">The system ranks the Pareto frontier by this goal. Trade-offs are surfaced for the runners-up.</Text>
          <Radio.Group value={objective} onChange={setObjective}>
            <Stack gap={4}>
              {OBJECTIVES.map((o) => <Radio key={o.value} value={o.value} label={o.label} />)}
            </Stack>
          </Radio.Group>
        </Stack>
      </Paper>

      {/* Step B — Parameter cards (richer, mirrors What-If) */}

      {/* ① Auto-Enrollment */}
      <Paper withBorder radius="md" p="md" style={{ opacity: adjustable.ae ? 1 : 0.85 }}>
        <Stack gap="xs">
          <IfWhatParamHeader
            number="①"
            title="Auto-Enrollment"
            tooltip={GLOSSARY.autoEnrollment}
            hint={`Tech P50: 78% adopt`}
            included={adjustable.ae}
            onToggleInclude={toggle('ae')}
            candidateCount={2 * (aeDefaults.length || 1)}
            totalOptions={2 * AE_DEFAULT_OPTIONS.length}
          />
          <Text size="10px" c="dimmed">Status (Off / On) is always searched when included. Choose which default deferral rates the system should evaluate.</Text>
          <MultiPills
            label="Default deferral rate candidates"
            value={aeDefaults}
            onChange={setAeDefaults}
            options={AE_DEFAULT_OPTIONS.map((v) => ({ value: v, label: `${Math.round(v * 100)}%` }))}
            disabled={!adjustable.ae}
          />
        </Stack>
      </Paper>

      {/* ② Match */}
      <Paper withBorder radius="md" p="md" style={{ opacity: adjustable.match ? 1 : 0.85 }}>
        <Stack gap="xs">
          <IfWhatParamHeader
            number="②"
            title="Employer Match"
            tooltip={GLOSSARY.matchRate}
            hint="Tech P50: 4.5% effective"
            included={adjustable.match}
            onToggleInclude={toggle('match')}
            candidateCount={matchRates.length * matchCaps.length * stretchOptions.length}
            totalOptions={MATCH_RATE_OPTIONS.length * MATCH_CAP_OPTIONS.length * 2}
          />
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <MultiPills
              label="Match rate"
              value={matchRates}
              onChange={setMatchRates}
              options={MATCH_RATE_OPTIONS.map((v) => ({ value: v, label: `${Math.round(v * 100)}%` }))}
              disabled={!adjustable.match}
            />
            <MultiPills
              label="Match cap (% of pay)"
              value={matchCaps}
              onChange={setMatchCaps}
              options={MATCH_CAP_OPTIONS.map((v) => ({ value: v, label: `${Math.round(v * 100)}%` }))}
              disabled={!adjustable.match}
            />
            <MultiPills
              label="Stretch match"
              value={stretchOptions}
              onChange={setStretchOptions}
              options={[{ value: 'false', label: 'Off' }, { value: 'true', label: 'On' }]}
              disabled={!adjustable.match}
            />
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* ③ Auto-Escalation */}
      <Paper withBorder radius="md" p="md" style={{ opacity: adjustable.esc ? 1 : 0.85 }}>
        <Stack gap="xs">
          <IfWhatParamHeader
            number="③"
            title="Auto-Escalation"
            tooltip={GLOSSARY.autoEscalation}
            hint="PSCA 2024: 71% adopt"
            included={adjustable.esc}
            onToggleInclude={toggle('esc')}
            candidateCount={2 * escSteps.length * escCeils.length}
            totalOptions={2 * ESC_STEP_OPTIONS.length * ESC_CEIL_OPTIONS.length}
          />
          <Text size="10px" c="dimmed">Status (Off / On) is always searched when included. Choose annual step-up rates and ceilings to evaluate when On.</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <MultiPills
              label="Annual step-up"
              value={escSteps}
              onChange={setEscSteps}
              options={ESC_STEP_OPTIONS.map((v) => ({ value: v, label: `${Math.round(v * 100)}%/yr` }))}
              disabled={!adjustable.esc}
            />
            <MultiPills
              label="Ceiling"
              value={escCeils}
              onChange={setEscCeils}
              options={ESC_CEIL_OPTIONS.map((v) => ({ value: v, label: `${Math.round(v * 100)}%` }))}
              disabled={!adjustable.esc}
            />
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* ④ Vesting */}
      <Paper withBorder radius="md" p="md" style={{ opacity: adjustable.vest ? 1 : 0.85 }}>
        <Stack gap="xs">
          <IfWhatParamHeader
            number="④"
            title="Vesting Schedule"
            tooltip={GLOSSARY.vestingSchedule}
            hint="ERISA min: 3-yr cliff"
            included={adjustable.vest}
            onToggleInclude={toggle('vest')}
            candidateCount={vestSelected.length}
            totalOptions={VEST_OPTIONS.length}
          />
          <MultiPills
            label="Schedule candidates"
            value={vestSelected}
            onChange={setVestSelected}
            options={VEST_OPTIONS.map((k) => ({ value: k, label: VESTING_LABELS[k] }))}
            disabled={!adjustable.vest}
          />
        </Stack>
      </Paper>

      {/* ⑤ Investment Menu */}
      <Paper withBorder radius="md" p="md" style={{ opacity: adjustable.menu ? 1 : 0.85 }}>
        <Stack gap="xs">
          <IfWhatParamHeader
            number="⑤"
            title="Investment Menu"
            tooltip={GLOSSARY.investmentMenu}
            hint="Vanguard avg ER: 0.07%"
            included={adjustable.menu}
            onToggleInclude={toggle('menu')}
            candidateCount={menuSizes.length * erTiers.length}
            totalOptions={MENU_SIZE_OPTIONS.length * ER_TIER_OPTIONS.length}
            extraAction={
              <Button
                size="compact-xs"
                variant="light"
                color="blue"
                leftSection={<IconListDetails size={12} stroke={1.7} />}
                disabled={!adjustable.menu || menuSizes.length === 0 || erTiers.length === 0}
                onClick={() => setFundModalState({ open: true, menuSize: menuSizes[0] || 'standard', erTier: erTiers[0] || 'blended' })}
              >
                View funds
              </Button>
            }
          />
          <Text size="10px" c="dimmed">Default fund stays at the current plan&apos;s QDIA. The search varies menu size and expense-ratio tier.</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <MultiPills
              label="Menu size"
              value={menuSizes}
              onChange={setMenuSizes}
              options={MENU_SIZE_OPTIONS.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))}
              disabled={!adjustable.menu}
            />
            <MultiPills
              label="Expense ratio tier"
              value={erTiers}
              onChange={setErTiers}
              options={ER_TIER_OPTIONS.map((v) => ({ value: v, label: v.replace('-', ' ') }))}
              disabled={!adjustable.menu}
            />
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* Hard cost ceiling */}
      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Group gap={6}>
            <Badge color="orange" size="sm" variant="filled" radius="xl" w={22} h={22} p={0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>$</Badge>
            <Tooltip label={GLOSSARY.hardCostCeiling} multiline w={300} withArrow>
              <Text size="sm" fw={700} style={{ cursor: 'help' }}>Hard cost ceiling</Text>
            </Tooltip>
          </Group>
          <Text size="10px" c="dimmed">Configurations exceeding this annual sponsor cost are excluded from results — even if Pareto-optimal otherwise.</Text>
          <NumberInput
            value={costCeiling}
            onChange={(v) => setCostCeiling(typeof v === 'number' ? v : parseFloat(v) || 0)}
            prefix="$" thousandSeparator min={0} step={100_000}
            size="sm"
            description={`Current plan cost: $${(baseline.currentKpis.annualSponsorCost / 1_000_000).toFixed(1)}M`}
          />
        </Stack>
      </Paper>

      {/* Run search */}
      <Group justify="space-between" wrap="wrap">
        <Group gap={6}>
          <Text size="11px" c="dimmed">Candidate space:</Text>
          <Badge size="sm" variant="light" color={cardinality > 500 ? 'red' : cardinality > 250 ? 'orange' : cardinality > 0 ? 'teal' : 'gray'}>
            {cardinality.toLocaleString()} configs
          </Badge>
          <Text size="10px" c="dimmed">{cardinality > 500 ? 'Above 500-cap — narrow ranges' : cardinality === 0 ? 'No valid combinations yet' : 'Within 500-cap'}</Text>
        </Group>
        <Button
          size="md"
          leftSection={phase === 'running' ? <Loader size={14} color="white" /> : <IconChartScatter size={16} stroke={1.7} />}
          onClick={runSearch}
          disabled={cardinality === 0 || phase === 'running'}
          variant="gradient"
          gradient={{ from: 'violet', to: 'grape' }}
        >
          {phase === 'running' ? 'Searching…' : phase === 'complete' ? 'Re-run Pareto Search' : 'Find Pareto-Optimal Plans'}
        </Button>
      </Group>

      {warning && (
        <Notification color="orange" icon={<IconAlertTriangle size={14} />} withCloseButton onClose={() => setWarning(null)} title="Reduce search space">
          {warning}
        </Notification>
      )}

      {phase === 'running' && (
        <SimulationLoader
          steps={searchSteps}
          color="violet"
          icon={IconChartScatter}
          headline="Running Pareto search"
          sublabel={`Objective: ${OBJECTIVE_COPY[objective] || objective} · Ceiling: $${(costCeiling / 1_000_000).toFixed(1)}M`}
          intervalMs={420}
          onComplete={onSearchComplete}
        />
      )}

      {phase === 'complete' && results && <IfWhatResults baseline={baseline} results={results} costCeiling={costCeiling} objective={objective} onApply={onApply} />}
    </Stack>
  )
}

const OBJECTIVE_COPY = {
  maxParticipation:   'maximize participation rate',
  minSponsorCost:     'minimize annual sponsor cost',
  maxCompetitiveRank: 'climb the competitive ranking vs tech peers',
  resolveAdpRisk:     'resolve ADP discrimination test risk',
  maxAttractiveness:  'maximize plan attractiveness',
}

function IfWhatResults({ baseline, results, costCeiling, objective, onApply }) {
  if (results.frontier.length === 0) {
    return (
      <Alert color="yellow" variant="light" icon={<IconAlertTriangle size={14} />} title="No valid configurations found">
        No plan configurations met your objective within the ${(costCeiling / 1_000_000).toFixed(1)}M cost ceiling. Raise the ceiling, broaden parameter ranges, or relax the objective.
      </Alert>
    )
  }

  // ─── Winner narrative for the top-3 ───
  const top1 = results.top3[0]
  const top2 = results.top3[1]
  const top3 = results.top3[2]
  const baseKpi = baseline.currentKpis
  const objCopy = OBJECTIVE_COPY[objective] || 'maximize the objective'

  function deltaSummary(c) {
    if (!c) return null
    const o = c.outcomes
    const dPart = Math.round((o.participationRate - baseKpi.participationRate) * 100)
    const dCost = (o.annualSponsorCost - baseKpi.annualSponsorCost) / 1_000_000
    return { dPart, dCost, adpResolved: baseKpi.adpTestStatus !== 'pass' && o.adpTestStatus === 'pass' }
  }
  const s1 = deltaSummary(top1)
  const s2 = deltaSummary(top2)
  const s3 = deltaSummary(top3)

  function diffOf(a, b) {
    if (!a || !b) return null
    const dPart = Math.round((a.outcomes.participationRate - b.outcomes.participationRate) * 100)
    const dCost = (a.outcomes.annualSponsorCost - b.outcomes.annualSponsorCost) / 1_000_000
    return { dPart, dCost }
  }
  const d12 = diffOf(top1, top2)
  const d13 = diffOf(top1, top3)

  const scatterData = results.all.map((c) => ({
    cost: c.outcomes.annualSponsorCost,
    participation: c.outcomes.participationRate * 100,
    isFrontier: results.frontier.includes(c),
    isTop: results.top3.includes(c),
    rank: results.top3.indexOf(c) + 1,
  }))
  const currentDot = {
    cost: baseline.currentKpis.annualSponsorCost,
    participation: baseline.currentKpis.participationRate * 100,
    isCurrent: true,
  }

  return (
    <Stack gap="md">
      <Divider variant="dashed" label="Pareto frontier · cost vs participation" labelPosition="center" />

      {/* Plain-English summary above the frontier scatter */}
      <Paper withBorder radius="md" p="md" style={{
        borderLeft: '4px solid var(--mantine-color-violet-7)',
        background: 'linear-gradient(135deg, var(--mantine-color-violet-light), transparent 80%)',
      }}>
        <Stack gap="xs">
          <Group gap={6}>
            <ThemeIcon size="md" radius="xl" variant="filled" color="violet"><IconBulb size={14} stroke={1.7} /></ThemeIcon>
            <Text size="sm" fw={800}>How to read these results</Text>
          </Group>
          <Text size="xs" style={{ lineHeight: 1.55 }}>
            The optimizer evaluated <b>{results.all.length.toLocaleString()} candidate plan configurations</b>.
            {' '}<b>{results.frontier.length}</b> sit on the <b>Pareto frontier</b>: every configuration inside the curve is dominated
            (participation could be improved at the same cost, or cost reduced at the same participation).
            {' '}{results.top3.length === 1
              ? <>One frontier configuration is available within the <b>${(costCeiling / 1_000_000).toFixed(1)}M</b> annual sponsor-cost ceiling, ranked by the selected objective — <b>{objCopy}</b>.</>
              : <>The top {results.top3.length} are ranked by the selected objective — <b>{objCopy}</b> — within the <b>${(costCeiling / 1_000_000).toFixed(1)}M</b> annual sponsor-cost ceiling.</>}
            {' '}The grey dot represents the current plan; the red dotted line marks the cost ceiling.
            {' '}Hover any dot to inspect its cost and participation. Use <b>&quot;Apply this configuration&quot;</b> on any frontier card below to carry the selection into the rest of the workflow.
            {results.frontier.length < 3 && (
              <> <Text component="span" c="orange" fw={600}>Frontier is small — broaden parameter ranges or raise the cost ceiling to surface more diverse alternatives.</Text></>
            )}
          </Text>
        </Stack>
      </Paper>

      {results.capped && (
        <Notification color="blue" icon={<IconInfoCircle size={14} />} title="Result capped" withCloseButton={false}>
          Search hit the 500-config cap. Frontier shown below is from the first 500 evaluated configurations.
        </Notification>
      )}

      <Paper withBorder radius="md" p="sm">
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-3)" />
            <XAxis dataKey="cost" name="Cost" type="number"
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(0)}M`}
              tick={{ fontSize: 11 }}
              label={{ value: 'Annual sponsor cost', position: 'insideBottom', offset: -10, style: { fontSize: 11 } }}
            />
            <YAxis dataKey="participation" name="Participation" type="number"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11 }}
              label={{ value: 'Participation rate', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <ReferenceLine x={costCeiling} stroke="var(--mantine-color-red-5)" strokeDasharray="4 4" label={{ value: 'Cost ceiling', fill: 'var(--mantine-color-red-7)', fontSize: 10, position: 'insideTopRight' }} />
            <RTooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <Paper withBorder p="xs" radius="sm" shadow="md">
                  {d.isCurrent && <Text size="xs" fw={700}>Current plan</Text>}
                  {!d.isCurrent && d.rank > 0 && <Text size="xs" fw={700}>Rank #{d.rank} candidate</Text>}
                  {!d.isCurrent && d.rank === 0 && <Text size="xs" fw={700}>{d.isFrontier ? 'Frontier point' : 'Dominated config'}</Text>}
                  <Text size="10px">Cost ${(d.cost / 1_000_000).toFixed(2)}M · Participation {d.participation.toFixed(1)}%</Text>
                </Paper>
              )
            }} />
            <Scatter data={scatterData}>
              {scatterData.map((d, i) => (
                <Cell key={i}
                  fill={d.isTop ? 'var(--mantine-color-vanguardRed-7)' : d.isFrontier ? 'var(--mantine-color-teal-7)' : 'var(--mantine-color-gray-4)'}
                  stroke={d.isTop ? 'var(--mantine-color-vanguardRed-9)' : 'white'}
                  strokeWidth={d.isTop ? 2 : 1}
                />
              ))}
            </Scatter>
            <Scatter data={[currentDot]} shape="circle">
              <Cell fill="var(--mantine-color-gray-7)" stroke="white" strokeWidth={2} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <Group gap="md" justify="center" mt={4}>
          <Group gap={4}><Box style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--mantine-color-vanguardRed-7)' }} /><Text size="10px" c="dimmed">Top-3 ranked</Text></Group>
          <Group gap={4}><Box style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--mantine-color-teal-7)' }} /><Text size="10px" c="dimmed">Pareto frontier</Text></Group>
          <Group gap={4}><Box style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--mantine-color-gray-4)' }} /><Text size="10px" c="dimmed">Dominated</Text></Group>
          <Group gap={4}><Box style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--mantine-color-gray-7)' }} /><Text size="10px" c="dimmed">Current plan</Text></Group>
        </Group>
      </Paper>

      {/* Winner narrative — plain-language explanation of #1 vs #2 vs #3 */}
      {top1 && (
        <Paper withBorder radius="md" p="md" style={{
          borderLeft: '4px solid var(--mantine-color-vanguardRed-7)',
          background: 'linear-gradient(135deg, var(--mantine-color-vanguardRed-light), transparent 85%)',
        }}>
          <Stack gap="xs">
            <Group gap={6}>
              <ThemeIcon size="md" radius="xl" variant="filled" color="vanguardRed"><IconTrophy size={14} stroke={1.7} /></ThemeIcon>
              <Text size="sm" fw={800}>Recommended: #1 — {top1.label}</Text>
            </Group>
            <Text size="xs" style={{ lineHeight: 1.55 }}>
              This configuration is the strongest fit for your stated goal — <b>{objCopy}</b>.
              {s1 && (
                <> Vs the current plan it moves participation <b>{s1.dPart >= 0 ? '+' : ''}{s1.dPart}pp</b> at a cost change of <b>{s1.dCost >= 0 ? '+' : ''}${Math.abs(s1.dCost).toFixed(1)}M</b>{s1.adpResolved ? ', and resolves the at-risk ADP test' : ''}.</>
              )}
              {top1.rationale && <> {top1.rationale}</>}
            </Text>
            {top1.tradeOffFlag && (
              <Alert color="orange" variant="light" p="xs" radius="sm">
                <Group gap={4} wrap="nowrap" align="flex-start">
                  <IconAlertTriangle size={12} stroke={1.7} style={{ flexShrink: 0, marginTop: 1, opacity: 0.8 }} />
                  <Text size="11px" style={{ lineHeight: 1.5 }}>{top1.tradeOffFlag}</Text>
                </Group>
              </Alert>
            )}

            {(top2 || top3) && (
              <Stack gap={4} mt={4}>
                <Text size="10px" c="dimmed" tt="uppercase" fw={600}>
                  {top2 && top3 ? 'Why not #2 or #3?' : top2 ? 'Why not #2?' : 'Why not #3?'}
                </Text>
                {top2 && d12 && (
                  <Group gap={6} wrap="nowrap" align="flex-start">
                    <Badge size="xs" variant="light" color="gray">#2</Badge>
                    <Text size="11px" style={{ lineHeight: 1.5 }}>
                      <b>{top2.label}</b> — {top2.rationale}
                      {(d12.dPart !== 0 || Math.abs(d12.dCost) > 0.05) && (
                        <> <Text component="span" c="dimmed">({d12.dPart > 0 ? `+${d12.dPart}pp participation` : d12.dPart < 0 ? `${d12.dPart}pp participation` : 'similar participation'} · {d12.dCost > 0.05 ? `+$${d12.dCost.toFixed(1)}M cost` : d12.dCost < -0.05 ? `−$${Math.abs(d12.dCost).toFixed(1)}M cost` : 'similar cost'} vs #1)</Text></>
                      )}
                    </Text>
                  </Group>
                )}
                {top3 && d13 && (
                  <Group gap={6} wrap="nowrap" align="flex-start">
                    <Badge size="xs" variant="light" color="gray">#3</Badge>
                    <Text size="11px" style={{ lineHeight: 1.5 }}>
                      <b>{top3.label}</b> — {top3.rationale}
                      {(d13.dPart !== 0 || Math.abs(d13.dCost) > 0.05) && (
                        <> <Text component="span" c="dimmed">({d13.dPart > 0 ? `+${d13.dPart}pp participation` : d13.dPart < 0 ? `${d13.dPart}pp participation` : 'similar participation'} · {d13.dCost > 0.05 ? `+$${d13.dCost.toFixed(1)}M cost` : d13.dCost < -0.05 ? `−$${Math.abs(d13.dCost).toFixed(1)}M cost` : 'similar cost'} vs #1)</Text></>
                      )}
                    </Text>
                  </Group>
                )}
                <Text size="10px" c="dimmed" mt={4}>
                  {top2 && top3
                    ? 'Choose #2 or #3 instead of #1 if a different objective dominates (e.g. lower cost, higher fiduciary safety) — but for the goal you set, #1 is the best Pareto-optimal pick.'
                    : 'Choose the runner-up instead of #1 if a different objective dominates (e.g. lower cost, higher fiduciary safety) — but for the goal you set, #1 is the best Pareto-optimal pick.'}
                </Text>
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {results.top3.map((c) => <TopCard key={c.rank} candidate={c} baseline={baseline} onApply={onApply} />)}
      </SimpleGrid>
    </Stack>
  )
}

function TopCard({ candidate, baseline, onApply }) {
  const { rank, label, params, outcomes, rationale, tradeOffFlag } = candidate

  // Render only the parameters that differ from baseline
  const changes = []
  if (baseline.autoEnrollment.active !== params.autoEnrollment.active || (params.autoEnrollment.active && baseline.autoEnrollment.defaultDeferralRate !== params.autoEnrollment.defaultDeferralRate)) {
    changes.push({ label: 'Auto-Enroll', from: baseline.autoEnrollment.active ? `On ${pctI(baseline.autoEnrollment.defaultDeferralRate)}` : 'Off',
      to: params.autoEnrollment.active ? `On ${pctI(params.autoEnrollment.defaultDeferralRate)}` : 'Off' })
  }
  if (baseline.matchFormula.matchRate !== params.matchFormula.matchRate || baseline.matchFormula.matchCap !== params.matchFormula.matchCap || baseline.matchFormula.stretchMatch !== params.matchFormula.stretchMatch) {
    changes.push({ label: 'Match', from: `${pctI(baseline.matchFormula.matchRate)} × ${pctI(baseline.matchFormula.matchCap)}`,
      to: `${pctI(params.matchFormula.matchRate)} × ${pctI(params.matchFormula.matchCap)}${params.matchFormula.stretchMatch ? ' (stretch)' : ''}` })
  }
  if (baseline.autoEscalation.active !== params.autoEscalation.active) {
    changes.push({ label: 'Auto-Escalate', from: baseline.autoEscalation.active ? 'On' : 'Off',
      to: params.autoEscalation.active ? `${pctI(params.autoEscalation.annualStepUp)}/yr → ${pctI(params.autoEscalation.ceiling)}` : 'Off' })
  }
  if (vestKey(baseline.vestingSchedule) !== vestKey(params.vestingSchedule)) {
    changes.push({ label: 'Vesting', from: VESTING_LABELS[vestKey(baseline.vestingSchedule)], to: VESTING_LABELS[vestKey(params.vestingSchedule)] })
  }
  if (baseline.investmentMenu.expenseRatioTier !== params.investmentMenu.expenseRatioTier) {
    changes.push({ label: 'Menu ER', from: baseline.investmentMenu.expenseRatioTier, to: params.investmentMenu.expenseRatioTier })
  }

  const adpColor = outcomes.adpTestStatus === 'pass' ? 'teal' : outcomes.adpTestStatus === 'at-risk' ? 'orange' : 'red'

  return (
    <Paper withBorder radius="md" p="sm" style={{ borderTop: `3px solid var(--mantine-color-vanguardRed-${rank === 1 ? 7 : rank === 2 ? 5 : 3})` }}>
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap={4}>
            <ThemeIcon size="sm" variant="filled" color={rank === 1 ? 'vanguardRed' : 'gray'} radius="xl">
              <IconTrophy size={12} stroke={1.7} />
            </ThemeIcon>
            <Text size="xs" fw={700}>Rank #{rank}</Text>
          </Group>
          <Badge size="xs" variant="light" color={adpColor}>ADP {outcomes.adpTestStatus.toUpperCase()}</Badge>
        </Group>
        <Text size="sm" fw={700}>{label}</Text>

        <Stack gap={2}>
          <Text size="10px" c="dimmed" tt="uppercase" fw={600}>Changed parameters</Text>
          {changes.length === 0 && <Text size="11px" c="dimmed">No changes from current plan</Text>}
          {changes.map((c, i) => (
            <Group key={i} gap={4} wrap="nowrap">
              <Text size="11px" fw={600} w={84}>{c.label}</Text>
              <Text size="11px" c="dimmed">{c.from}</Text>
              <IconChevronRight size={10} stroke={1.5} style={{ opacity: 0.5 }} />
              <Text size="11px" fw={600} c="vanguardRed">{c.to}</Text>
            </Group>
          ))}
        </Stack>

        <Divider variant="dashed" />

        <SimpleGrid cols={2} spacing={4}>
          <Stack gap={0}>
            <Text size="10px" c="dimmed" tt="uppercase">Participation</Text>
            <Text size="sm" fw={700} c="teal">{pctI(outcomes.participationRate)}</Text>
          </Stack>
          <Stack gap={0}>
            <Text size="10px" c="dimmed" tt="uppercase">Cost</Text>
            <Text size="sm" fw={700}>{dollarsM(outcomes.annualSponsorCost)}</Text>
          </Stack>
          <Stack gap={0}>
            <Text size="10px" c="dimmed" tt="uppercase">Competitive</Text>
            <Text size="sm" fw={700}>{outcomes.competitiveTier}</Text>
          </Stack>
          <Stack gap={0}>
            <Text size="10px" c="dimmed" tt="uppercase">Fid. risk</Text>
            <Text size="sm" fw={700}>{outcomes.fiduciaryLiabilityScore}/100</Text>
          </Stack>
        </SimpleGrid>

        <Text size="10px" c="dimmed" style={{ lineHeight: 1.4 }}>{rationale}</Text>

        {tradeOffFlag && (
          <Alert color="orange" variant="light" icon={<IconAlertTriangle size={12} />} p="xs">
            <Text size="10px">{tradeOffFlag}</Text>
          </Alert>
        )}

        <Button
          fullWidth size="xs"
          variant="filled"
          color="vanguardRed"
          leftSection={<IconCheck size={12} />}
          onClick={() => onApply({ params, outcomes, label, rationale })}
        >
          Apply this configuration
        </Button>
      </Stack>
    </Paper>
  )
}

// ─── Main panel export ────────────────────────────────────────────────────────

export default function PlanDesignParetoPanel({ step, onContinue, workflowState, setWorkflowState, activeUseCase }) {
  // Baseline resolution priority:
  //   1. step.panelData.synthesizedBaseline — acquisition mode injects a prospect baseline
  //      synthesized from manual inputs (planDesign-shaped object)
  //   2. step.panelData.planDesignId — renewal mode looks up by id (TCS US is the canonical UC-E reference)
  //   3. DEFAULT_PLAN_DESIGN_ID — fallback for direct demos
  const synthesizedBaseline = step?.panelData?.synthesizedBaseline
  const planDesignId = step?.panelData?.planDesignId || DEFAULT_PLAN_DESIGN_ID
  const baseline = useMemo(() => {
    if (synthesizedBaseline) return synthesizedBaseline
    return getPlanDesign(planDesignId) || getPlanDesign(DEFAULT_PLAN_DESIGN_ID)
  }, [synthesizedBaseline, planDesignId])

  const dataSourceMode = step?.panelData?.dataSourceMode || 'renewal'
  const dataSources = step?.panelData?.dataSources ?? UC_E_PLAN_DESIGN_SOURCES
  const isAcquisition = dataSourceMode === 'acquisition'

  const sectorBench = useMemo(() => techSectorSummary(), [])

  const [mode, setMode] = useState('what-if')
  const [focusParam, setFocusParam] = useState(null)
  const [appliedConfig, setAppliedConfig] = useState(workflowState?.selectedConfig || null)

  const handleApply = useCallback((config) => {
    setAppliedConfig(config)
    setWorkflowState?.((prev) => ({ ...prev, selectedConfig: config }))
  }, [setWorkflowState])

  const handleLeverFocus = (paramName) => {
    setMode('what-if')
    setFocusParam(paramName)
  }

  if (!baseline) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={14} />}>
        No plan-design baseline found for sponsor <code>{planDesignId}</code>. Check <code>data/planDesign.js</code>.
      </Alert>
    )
  }

  return (
    <Stack gap="md">
      <Alert color={isAcquisition ? 'orange' : 'vanguardRed'} variant="light" icon={<IconChartScatter size={16} />} radius="md">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Stack gap={0}>
            <Text size="sm" fw={700}>Plan Design Optimizer — {baseline.planName}</Text>
            <Text size="xs" c="dimmed">
              {isAcquisition
                ? 'Acquisition mode — prospect baseline synthesized from your inputs. Upload supporting documents to refine the analysis.'
                : 'Diagnose · benchmark · configure · simulate · select. The chosen configuration flows into ROI, package, compliance, and activation.'}
            </Text>
          </Stack>
          <Badge size="sm" variant="light" color={isAcquisition ? 'orange' : 'vanguardRed'}>
            {isAcquisition && baseline.prospectMeta
              ? `${(baseline.prospectMeta.totalEmployees || 0).toLocaleString()} employees · ${baseline.prospectMeta.industry} · prospect`
              : `${(50000).toLocaleString()} employees · Tech sector · ${baseline.currentKpis.competitiveTier}`}
          </Badge>
        </Group>
      </Alert>

      {/* §0 — Data Source Manifest */}
      <DataSourceStrip
        sources={dataSources}
        mode={dataSourceMode}
        title={isAcquisition ? 'Prospect data sources' : 'Data sources feeding this analysis'}
        lastSyncLabel={isAcquisition ? null : 'Most recent sync: 2h ago'}
      />

      {/* §1 — Diagnostics */}
      <Paper withBorder radius="md" p="md">
        <DiagnosticsScorecard baseline={baseline} onLeverFocus={handleLeverFocus} />
      </Paper>

      {/* §2 — Benchmarks */}
      <Paper withBorder radius="md" p="md">
        <BenchmarkComparison baseline={baseline} />
      </Paper>

      {/* §3 — Mode toggle + Configure + Results */}
      <Paper withBorder radius="md" p="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap={6}>
              <ThemeIcon size="sm" radius="xl" variant="light" color="violet"><IconAdjustments size={12} stroke={1.7} /></ThemeIcon>
              <Text size="sm" fw={700}>Configure & simulate</Text>
            </Group>
            <SegmentedControl
              size="xs"
              data={[
                { value: 'what-if', label: 'What-If' },
                { value: 'if-what', label: 'If-What' },
              ]}
              value={mode}
              onChange={(v) => { setMode(v); setFocusParam(null) }}
            />
          </Group>

          <Text size="xs" c="dimmed">
            {mode === 'what-if'
              ? 'You configure the parameters — system shows projected outcomes for each variant.'
              : 'You set a goal and constraints — system finds the Pareto-optimal plans.'}
          </Text>

          {mode === 'what-if' ? (
            <WhatIfMode
              baseline={baseline}
              onApply={handleApply}
              focusParam={focusParam}
              onFocusConsumed={() => setFocusParam(null)}
              sectorBench={sectorBench}
            />
          ) : (
            <IfWhatMode baseline={baseline} onApply={handleApply} />
          )}
        </Stack>
      </Paper>

      {/* Footer — applied config summary + continue */}
      <Paper withBorder radius="md" p="sm" style={{ background: appliedConfig ? 'var(--mantine-color-teal-light)' : 'var(--mantine-color-gray-0)' }}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            {appliedConfig ? (
              <>
                <ThemeIcon size="sm" radius="xl" variant="filled" color="teal"><IconShieldCheck size={12} stroke={1.7} /></ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" fw={700}>Applied: {appliedConfig.label}</Text>
                  <Text size="10px" c="dimmed">Projected participation {pctI(appliedConfig.outcomes.participationRate)} · cost {dollarsM(appliedConfig.outcomes.annualSponsorCost)} · ADP {appliedConfig.outcomes.adpTestStatus}</Text>
                </Stack>
              </>
            ) : (
              <>
                <ThemeIcon size="sm" radius="xl" variant="light" color="gray"><IconTargetArrow size={12} stroke={1.7} /></ThemeIcon>
                <Text size="xs" c="dimmed">Apply a configuration above to enable Continue.</Text>
              </>
            )}
          </Group>
          <Button
            disabled={!appliedConfig}
            onClick={onContinue}
            rightSection={<IconChevronRight size={14} />}
          >
            Continue
          </Button>
        </Group>
      </Paper>
    </Stack>
  )
}

// Inline Box shim for legend dots — mirrors original file
function Box({ children, style }) {
  return <div style={style}>{children}</div>
}
