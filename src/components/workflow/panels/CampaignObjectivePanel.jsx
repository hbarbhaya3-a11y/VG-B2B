import { useState } from 'react'
import {
  Stack, Group, Text, Badge, Button, Select, MultiSelect, Paper, Divider, Box,
  ThemeIcon, SimpleGrid, NumberInput, Slider, Switch, Chip, TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconTarget, IconCurrencyDollar, IconCalendar, IconChevronRight,
  IconSparkles, IconChartBar, IconShieldCheck, IconUsers, IconScale,
} from '@tabler/icons-react'

// ── Plan-sponsor option libraries ───────────────────────────────────────────
const SPONSORS = [
  { value: 'sp-1', label: 'Selected sponsor (from signal)' },
  { value: 'sp-2', label: 'Large service employer 401(k)' },
  { value: 'sp-3', label: 'Manufacturing plan' },
]

const DECISION_TYPES = [
  { value: 'participation_lift', label: 'Participation-lift strategy' },
  { value: 'deferral_adequacy', label: 'Deferral-adequacy strategy' },
  { value: 'plan_health', label: 'Plan-health remediation' },
]

const PRIMARY_OBJECTIVES = [
  { value: 'participation', label: 'Increase eligible employee participation' },
  { value: 'deferral', label: 'Improve deferral adequacy' },
  { value: 'equity', label: 'Close participation equity gap' },
  { value: 'match', label: 'Reduce employer match leakage' },
]

const SECONDARY_OBJECTIVES = [
  { value: 'deferral_adequacy', label: 'Improve deferral adequacy' },
  { value: 'renewal', label: 'Protect renewal narrative' },
  { value: 'equity', label: 'Reduce participation disparity' },
  { value: 'readiness', label: 'Improve retirement readiness' },
]

const TARGET_COHORTS = [
  { value: 'eligible_nonparticipants', label: 'Eligible nonparticipants' },
  { value: 'new_hires', label: 'New hires' },
  { value: 'below_match', label: 'Below-match participants' },
  { value: 'low_deferral', label: 'Low-deferral participants' },
  { value: 'legacy', label: 'Legacy election holders' },
]

const PRIMARY_KPIS = [
  { value: 'incremental_enrollment', label: 'Incremental enrollment vs holdout' },
  { value: 'participation_lift', label: 'Participation lift (pp)' },
  { value: 'deferral_lift', label: 'Average deferral lift (pp)' },
  { value: 'match_utilization', label: 'Match utilization rate' },
]

const REVIEW_OWNERS = [
  { value: 'compliance', label: 'Compliance' },
  { value: 'fiduciary', label: 'Fiduciary review' },
  { value: 'benefits', label: 'Benefits admin' },
  { value: 'legal', label: 'Legal / ERISA counsel' },
]

const MEASUREMENT_WINDOWS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
]

// Strategies are MULTI-select — several can be tested together
const STRATEGIES = [
  { value: 'auto_enrollment', label: 'Auto Enrollment' },
  { value: 'match_stretch', label: 'Match Stretch' },
  { value: 'auto_escalation', label: 'Auto Escalation' },
  { value: 'reenrollment', label: 'Re-enrollment' },
  { value: 'education', label: 'Education-only' },
  { value: 'holdout', label: 'Holdout' },
]

const strategyLabel = (v) => STRATEGIES.find(s => s.value === v)?.label || v

// Per-strategy required fields (dynamic validation surface)
const STRATEGY_FIELDS = {
  auto_enrollment: ['Default deferral %', 'Opt-out path', 'QDIA / default-investment readiness'],
  match_stretch:   ['Current formula', 'Proposed formula', 'Cost-neutral toggle', 'Employer cost ceiling'],
  auto_escalation: ['Annual increase %', 'Cap', 'Start month', 'Opt-out / change-election path'],
  reenrollment:    ['Sweep population', 'Default investment', 'Notice window', 'Exclusions'],
  education:        ['Channel / cadence', 'Message theme', 'No plan-rule change'],
  holdout:          ['Locked strategy parameters', 'Measurement / control rules only'],
}

function StrategyFieldCard({ strategy }) {
  const fields = STRATEGY_FIELDS[strategy] || []
  return (
    <Paper withBorder p="sm" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-orange-4)' }}>
      <Stack gap={6}>
        <Group gap="xs">
          <Badge size="xs" color="orange" variant="filled">{strategyLabel(strategy)}</Badge>
          <Text size="xs" c="dimmed">Required to configure</Text>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={6}>
          {fields.map(f => (
            <Group key={f} gap={6} wrap="nowrap">
              <ThemeIcon size="xs" radius="xl" variant="light" color="orange"><IconChevronRight size={9} /></ThemeIcon>
              <Text size="xs">{f}</Text>
            </Group>
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  )
}

const FieldLabel = ({ children }) => (
  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>{children}</Text>
)

export default function CampaignObjectivePanel({ panelData: pd = {}, onContinue }) {
  const [sponsor, setSponsor]           = useState('sp-1')
  const [decisionType, setDecisionType] = useState('participation_lift')
  const [strategies, setStrategies]     = useState(['auto_enrollment', 'auto_escalation'])
  const [primaryObj, setPrimaryObj]     = useState('participation')
  const [secondaryObjs, setSecondaryObjs] = useState(['deferral_adequacy', 'renewal'])
  const [cohort, setCohort]             = useState('eligible_nonparticipants')
  const [primaryKpi, setPrimaryKpi]     = useState('incremental_enrollment')
  const [costCeiling, setCostCeiling]   = useState(pd.defaultBudget ?? 150000)
  const [optOutCeiling, setOptOutCeiling] = useState(12)
  const [readiness, setReadiness]       = useState(90)
  const [fairness, setFairness]         = useState(true)
  const [holdout, setHoldout]           = useState(10)
  const [effectiveDate, setEffectiveDate] = useState(new Date('2026-09-01'))
  const [window, setWindow]             = useState('60')
  const [owner, setOwner]               = useState('Sponsor Relationship Executive')
  const [reviewers, setReviewers]       = useState(['compliance', 'fiduciary', 'benefits'])

  const objLabel = (v) => PRIMARY_OBJECTIVES.find(o => o.value === v)?.label || v
  const cohortLabel = (v) => TARGET_COHORTS.find(o => o.value === v)?.label || v
  const kpiLabel = (v) => PRIMARY_KPIS.find(o => o.value === v)?.label || v

  return (
    <Stack gap="lg">
      {/* Title */}
      <Group gap="xs">
        <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'vanguardRed', to: 'orange', deg: 135 }}>
          <IconTarget size={18} stroke={1.5} />
        </ThemeIcon>
        <Box>
          <Text size="xl" fw={800}>Sponsor Decision Objective</Text>
          <Text size="sm" c="dimmed">One sponsor · one cohort · one decision — with agreed metric, guardrails, and holdout design.</Text>
        </Box>
      </Group>

      {/* Sponsor + decision type */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap="xs">
          <FieldLabel>Sponsor</FieldLabel>
          <Select data={SPONSORS} value={sponsor} onChange={setSponsor} radius="md" leftSection={<IconUsers size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Decision type</FieldLabel>
          <Select data={DECISION_TYPES} value={decisionType} onChange={setDecisionType} radius="md" leftSection={<IconTarget size={14} />} />
        </Stack>
      </SimpleGrid>

      <Divider label="Strategies to test (select one or more)" labelPosition="left" />

      {/* MULTI-select strategies */}
      <Chip.Group multiple value={strategies} onChange={setStrategies}>
        <Group gap="xs">
          {STRATEGIES.map(s => (
            <Chip key={s.value} value={s.value} variant="outline" color="orange" radius="md" size="sm">{s.label}</Chip>
          ))}
        </Group>
      </Chip.Group>

      {/* Per-strategy dynamic required fields */}
      {strategies.length > 0 && (
        <Stack gap="xs">
          {strategies.map(s => <StrategyFieldCard key={s} strategy={s} />)}
        </Stack>
      )}

      <Divider label="Objectives & cohort" labelPosition="left" />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap="xs">
          <FieldLabel>Primary objective</FieldLabel>
          <Select data={PRIMARY_OBJECTIVES} value={primaryObj} onChange={setPrimaryObj} radius="md" leftSection={<IconTarget size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Secondary objectives</FieldLabel>
          <MultiSelect data={SECONDARY_OBJECTIVES} value={secondaryObjs} onChange={setSecondaryObjs} radius="md" clearable placeholder="Select…" />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Target cohort</FieldLabel>
          <Select data={TARGET_COHORTS} value={cohort} onChange={setCohort} radius="md" leftSection={<IconUsers size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Primary KPI</FieldLabel>
          <Select data={PRIMARY_KPIS} value={primaryKpi} onChange={setPrimaryKpi} radius="md" leftSection={<IconChartBar size={14} />} />
        </Stack>
      </SimpleGrid>

      <Divider label="Guardrails" labelPosition="left" />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Stack gap="xs">
          <FieldLabel>Employer cost guardrail ($)</FieldLabel>
          <NumberInput value={costCeiling} onChange={setCostCeiling} radius="md" min={0} step={10000}
            thousandSeparator="," leftSection={<IconCurrencyDollar size={14} />} />
          <Text size="10px" c="dimmed">Do not exceed the approved cost ceiling.</Text>
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Opt-out risk ceiling — {optOutCeiling}%</FieldLabel>
          <Slider value={optOutCeiling} onChange={setOptOutCeiling} min={0} max={30} step={1} color="orange"
            marks={[{ value: 0, label: '0%' }, { value: 15, label: '15%' }, { value: 30, label: '30%' }]} />
        </Stack>
        <Stack gap="xs" mt="sm">
          <FieldLabel>Readiness threshold — {readiness}%</FieldLabel>
          <Slider value={readiness} onChange={setReadiness} min={50} max={100} step={1} color="teal"
            marks={[{ value: 50, label: '50%' }, { value: 100, label: '100%' }]} />
          <Text size="10px" c="dimmed">Minimum payroll + recordkeeping data readiness.</Text>
        </Stack>
        <Stack gap="xs" mt="sm">
          <FieldLabel>Holdout design — {holdout}%</FieldLabel>
          <Slider value={holdout} onChange={setHoldout} min={0} max={30} step={1} color="violet"
            marks={[{ value: 10, label: '10%' }, { value: 30, label: '30%' }]} />
        </Stack>
      </SimpleGrid>

      <Group justify="space-between" wrap="wrap">
        <Switch checked={fairness} onChange={e => setFairness(e.currentTarget.checked)}
          label="Fairness monitor" color="teal" thumbIcon={<IconScale size={10} />} />
        <Group gap="xs">
          <IconShieldCheck size={14} style={{ color: 'var(--mantine-color-green-6)' }} />
          <Text size="xs" c="dimmed">Cohort-level only · opt-out preserved · required notices attached</Text>
        </Group>
      </Group>

      <Divider label="Timing & ownership" labelPosition="left" />

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Stack gap="xs">
          <FieldLabel>Effective date</FieldLabel>
          <DatePickerInput value={effectiveDate} onChange={setEffectiveDate} radius="md" leftSection={<IconCalendar size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Measurement window</FieldLabel>
          <Select data={MEASUREMENT_WINDOWS} value={window} onChange={setWindow} radius="md" />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Decision owner</FieldLabel>
          <TextInput value={owner} onChange={e => setOwner(e.currentTarget.value)} radius="md" />
        </Stack>
      </SimpleGrid>

      <Stack gap="xs">
        <FieldLabel>Review owners</FieldLabel>
        <MultiSelect data={REVIEW_OWNERS} value={reviewers} onChange={setReviewers} radius="md" clearable />
      </Stack>

      {/* Live summary */}
      <Paper withBorder radius="md" p="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
        <Group gap="xs" mb={6}>
          <IconSparkles size={14} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
          <FieldLabel>Sponsor Decision Summary</FieldLabel>
        </Group>
        <Text size="sm" style={{ lineHeight: 1.7 }}>
          Test <strong>{strategies.length ? strategies.map(strategyLabel).join(', ') : '(no strategy selected)'}</strong>
          {' '}for <strong>{cohortLabel(cohort)}</strong> to <strong>{objLabel(primaryObj).toLowerCase()}</strong>,
          measured by <strong>{kpiLabel(primaryKpi).toLowerCase()}</strong> over a <strong>{window}-day</strong> window
          with a <strong>{holdout}%</strong> holdout — constrained by an employer cost ceiling of{' '}
          <strong>${Number(costCeiling || 0).toLocaleString()}</strong>, an opt-out ceiling of <strong>{optOutCeiling}%</strong>,
          a readiness minimum of <strong>{readiness}%</strong>{fairness ? ', fairness monitoring on' : ''}, and
          {' '}compliance / fiduciary / benefits review.
        </Text>
      </Paper>

      <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="md"
          variant="gradient"
          gradient={{ from: 'red', to: 'orange', deg: 135 }}
          rightSection={<IconChevronRight size={16} stroke={2} />}
          onClick={onContinue}
          disabled={strategies.length === 0}
          styles={{ root: { boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)' } }}
        >
          Confirm &amp; continue →
        </Button>
      </Box>
    </Stack>
  )
}
