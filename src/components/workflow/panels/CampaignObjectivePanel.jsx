import { useState } from 'react'
import {
  Stack, Group, Text, Button, Select, MultiSelect, Paper, Divider, Box,
  ThemeIcon, SimpleGrid, Chip, NumberInput, Badge,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconTarget, IconCalendar, IconChevronRight,
  IconSparkles, IconChartBar, IconUsers, IconAdjustments,
} from '@tabler/icons-react'

// ── Plan-sponsor option libraries ───────────────────────────────────────────
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

// Strategies are MULTI-select — 6 offered, each carries its own levers + a
// logically-matched default KPI that populates when the strategy is picked.
const STRATEGIES = [
  { value: 'auto_enrollment', label: 'Auto Enrollment' },
  { value: 'match_stretch', label: 'Match Stretch' },
  { value: 'auto_escalation', label: 'Auto Escalation' },
  { value: 'reenrollment', label: 'Re-enrollment' },
  { value: 'education', label: 'Education-only' },
  { value: 'holdout', label: 'Holdout' },
]
const strategyLabel = (v) => STRATEGIES.find(s => s.value === v)?.label || v

// Editable levers per strategy — { key, label, type, default, ...opts }
const STRATEGY_LEVERS = {
  auto_enrollment: [
    { key: 'defaultDeferral', label: 'Default deferral %', type: 'number', default: 4, min: 1, max: 15, step: 1 },
    { key: 'optOut', label: 'Opt-out window (days)', type: 'number', default: 90, min: 0, max: 180, step: 15 },
  ],
  match_stretch: [
    { key: 'matchCap', label: 'Match cap %', type: 'number', default: 6, min: 1, max: 12, step: 1 },
    { key: 'stretchTo', label: 'Stretch to deferral %', type: 'number', default: 4, min: 1, max: 12, step: 1 },
  ],
  auto_escalation: [
    { key: 'annualIncrease', label: 'Annual increase %', type: 'number', default: 1, min: 1, max: 3, step: 1 },
    { key: 'cap', label: 'Escalation cap %', type: 'number', default: 10, min: 5, max: 20, step: 1 },
  ],
  reenrollment: [
    { key: 'sweep', label: 'Sweep population', type: 'select', default: 'below_default',
      options: [{ value: 'below_default', label: 'Below default deferral' }, { value: 'all', label: 'All non-electing' }] },
    { key: 'notice', label: 'Notice window (days)', type: 'number', default: 30, min: 15, max: 90, step: 15 },
  ],
  education: [
    { key: 'cadence', label: 'Cadence', type: 'select', default: 'monthly',
      options: [{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }] },
    { key: 'channel', label: 'Channel', type: 'select', default: 'email',
      options: [{ value: 'email', label: 'Participant email' }, { value: 'portal', label: 'Portal banner' }] },
  ],
  holdout: [
    { key: 'holdoutPct', label: 'Holdout %', type: 'number', default: 10, min: 5, max: 30, step: 5 },
  ],
}

// Selecting a strategy sets a logically-matched default primary KPI.
const STRATEGY_KPI = {
  auto_enrollment: 'incremental_enrollment',
  match_stretch: 'match_utilization',
  auto_escalation: 'deferral_lift',
  reenrollment: 'participation_lift',
  education: 'participation_lift',
  holdout: 'incremental_enrollment',
}

const defaultLevers = (s) =>
  Object.fromEntries((STRATEGY_LEVERS[s] || []).map(l => [l.key, l.default]))

const MEASUREMENT_WINDOWS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
]

const FieldLabel = ({ children }) => (
  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>{children}</Text>
)

// Editable lever card — rendered ONLY for the strategy the user selected.
function StrategyLeverCard({ strategy, values, onChange }) {
  const levers = STRATEGY_LEVERS[strategy] || []
  return (
    <Paper withBorder p="sm" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-orange-4)' }}>
      <Stack gap={8}>
        <Group gap="xs">
          <Badge size="xs" color="orange" variant="filled">{strategyLabel(strategy)}</Badge>
          <Text size="xs" c="dimmed">Levers</Text>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={8}>
          {levers.map(l => (
            <Stack key={l.key} gap={2}>
              <Text size="xs">{l.label}</Text>
              {l.type === 'number' ? (
                <NumberInput size="xs" radius="md" value={values[l.key]} min={l.min} max={l.max} step={l.step}
                  onChange={v => onChange(strategy, l.key, v)} />
              ) : (
                <Select size="xs" radius="md" data={l.options} value={values[l.key]}
                  onChange={v => onChange(strategy, l.key, v)} />
              )}
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Paper>
  )
}

export default function CampaignObjectivePanel({ onContinue }) {
  const [primaryObj, setPrimaryObj]     = useState('participation')
  const [secondaryObjs, setSecondaryObjs] = useState(['deferral_adequacy', 'renewal'])
  const [cohort, setCohort]             = useState('eligible_nonparticipants')
  const [strategies, setStrategies]     = useState(['auto_enrollment'])
  const [leverValues, setLeverValues]   = useState({ auto_enrollment: defaultLevers('auto_enrollment') })
  const [primaryKpi, setPrimaryKpi]     = useState(STRATEGY_KPI.auto_enrollment)
  const [effectiveDate, setEffectiveDate] = useState(new Date('2026-09-01'))
  const [window, setWindow]             = useState('60')

  // Selecting a strategy seeds its lever defaults and a matched default KPI.
  const handleStrategies = (next) => {
    setStrategies(next)
    setLeverValues(prev => {
      const nv = {}
      next.forEach(s => { nv[s] = prev[s] || defaultLevers(s) })
      return nv
    })
    if (next.length) setPrimaryKpi(STRATEGY_KPI[next[next.length - 1]] || primaryKpi)
  }
  const setLever = (s, key, val) =>
    setLeverValues(prev => ({ ...prev, [s]: { ...prev[s], [key]: val } }))

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
          <Text size="xl" fw={800}>Portfolio Decision Objective</Text>
          <Text size="sm" c="dimmed">Configure the portfolio objective function — multiple cohorts, multiple strategies, cell-level holdouts.</Text>
        </Box>
      </Group>

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

      <Divider label="Strategy configuration (select one or more — 6 available)" labelPosition="left" />

      {/* MULTI-select strategies — 6 offered in the recommendation */}
      <Chip.Group multiple value={strategies} onChange={handleStrategies}>
        <Group gap="xs">
          {STRATEGIES.map(s => (
            <Chip key={s.value} value={s.value} variant="outline" color="orange" radius="md" size="sm">{s.label}</Chip>
          ))}
        </Group>
      </Chip.Group>

      {/* Editable levers ONLY for the strategies the user selected */}
      {strategies.length > 0 ? (
        <Stack gap="xs">
          {strategies.map(s => (
            <StrategyLeverCard key={s} strategy={s} values={leverValues[s] || defaultLevers(s)} onChange={setLever} />
          ))}
        </Stack>
      ) : (
        <Group gap="xs">
          <IconAdjustments size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Text size="xs" c="dimmed">Select a strategy to configure its levers.</Text>
        </Group>
      )}

      <Divider label="Timing" labelPosition="left" />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap="xs">
          <FieldLabel>Effective date</FieldLabel>
          <DatePickerInput value={effectiveDate} onChange={setEffectiveDate} radius="md" leftSection={<IconCalendar size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Measurement window</FieldLabel>
          <Select data={MEASUREMENT_WINDOWS} value={window} onChange={setWindow} radius="md" />
        </Stack>
      </SimpleGrid>

      {/* Live summary */}
      <Paper withBorder radius="md" p="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
        <Group gap="xs" mb={6}>
          <IconSparkles size={14} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
          <FieldLabel>Sponsor Decision Summary</FieldLabel>
        </Group>
        <Text size="sm" style={{ lineHeight: 1.7 }}>
          Test <strong>{strategies.length ? strategies.map(strategyLabel).join(', ') : '(no strategy selected)'}</strong>
          {' '}for <strong>{cohortLabel(cohort)}</strong> to <strong>{objLabel(primaryObj).toLowerCase()}</strong>,
          measured by <strong>{kpiLabel(primaryKpi).toLowerCase()}</strong> over a <strong>{window}-day</strong> window.
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
