import { useState } from 'react'
import {
  Paper, Stack, Group, Text, Badge, Button, ThemeIcon, Alert, Divider,
  SimpleGrid, Chip, Select, NumberInput, Slider, Switch, TextInput, Box,
} from '@mantine/core'
import {
  IconChevronRight, IconInfoCircle, IconSettings, IconShieldCheck, IconShieldX,
  IconBuildingBank, IconAdjustments, IconAlertTriangle, IconCheck,
} from '@tabler/icons-react'

// ── Current plan design (baseline facts) ────────────────────────────────────
const CURRENT_PLAN = [
  { label: 'Enrollment design', value: 'Voluntary (opt-in)' },
  { label: 'Default deferral', value: 'None' },
  { label: 'Auto-escalation', value: 'Not enabled' },
  { label: 'Match formula', value: '100% of first 3%' },
  { label: 'QDIA', value: 'Target-date series' },
  { label: 'Participation', value: '72% (vs 82% benchmark)' },
  { label: 'Average deferral', value: '5.1%' },
]

// ── Strategy definitions: required controls + assets ────────────────────────
const STRATEGIES = [
  { id: 'auto_enrollment', label: 'Auto Enrollment', required: ['defaultDeferral', 'qdia'],
    assets: ['Committee deck', 'Participant email', 'Portal flow', 'Auto-enroll / QDIA notice'] },
  { id: 'match_stretch', label: 'Match Stretch', required: ['currentFormula', 'proposedFormula', 'matchCap'],
    assets: ['Committee deck', 'Match education', 'Portal calculator', 'Payroll kit'] },
  { id: 'auto_escalation', label: 'Auto Escalation', required: ['annualIncrease', 'cap', 'startMonth'],
    assets: ['Committee deck', 'Escalation email', 'Portal preview', 'Notice draft'] },
  { id: 'reenrollment', label: 'Re-enrollment', required: ['sweepPopulation', 'defaultInvestment'],
    assets: ['Committee deck', 'Re-enrollment comms', 'Portal confirmation', 'Notice pack'] },
]

// ── Projected KPIs per strategy — default values that move with the levers ──
// so the numbers stay logically tied to the configured strategy.
function projectedKpis(id, v) {
  switch (id) {
    case 'auto_enrollment': return [
      { label: 'Participation lift', value: `+${18 + (v.defaultDeferral ?? 4)}pp` },
      { label: 'Projected opt-out', value: `${Math.max(4, 12 - (v.defaultDeferral ?? 4))}%` },
    ]
    case 'match_stretch': return [
      { label: 'Match utilization', value: `+${(v.matchCap ?? 6) * 2}pp` },
      { label: 'Avg deferral lift', value: `+${(((v.matchCap ?? 6) - 3) * 0.4).toFixed(1)}pp` },
    ]
    case 'auto_escalation': return [
      { label: 'Avg deferral lift', value: `+${((v.annualIncrease ?? 1) * 2).toFixed(1)}pp` },
      { label: 'Years to cap', value: `${Math.max(1, Math.round(((v.cap ?? 10) - 3) / (v.annualIncrease ?? 1)))} yrs` },
    ]
    case 'reenrollment': return [
      { label: 'Participation lift', value: '+9pp' },
      { label: 'Re-election rate', value: '71%' },
    ]
    default: return []
  }
}

// Assumed average eligible-employee pay used to project per-employee match cost.
const AVG_PAY = 50000

// ── Delivery channels (multiselect) ─────────────────────────────────────────
const CHANNELS = [
  { id: 'committee', label: 'Committee deck' },
  { id: 'email', label: 'Participant email' },
  { id: 'portal', label: 'Portal' },
  { id: 'sms', label: 'SMS / push' },
  { id: 'mail', label: 'Direct mail' },
]

// ── Guardrail validation — common across ALL selected strategies ────────────
function aggregateGuardrails(selected, values) {
  const checks = [
    { pass: true, label: 'Eligibility rules', detail: 'Scoped to eligible employees per plan document' },
    { pass: true, label: 'Payroll readiness', detail: 'Deferral + match fields mapped' },
    { pass: true, label: 'Recordkeeping readiness', detail: 'Cohort + election feeds live' },
    { pass: true, label: 'Fairness monitor', detail: 'Enabled — disparity tracked across cohorts' },
    { pass: true, label: 'Holdout feasibility', detail: 'Sample size sufficient for 80% power' },
  ]
  // Employer cost is evaluated PER ELIGIBLE EMPLOYEE (not plan-level) and
  // depends on the Match Stretch configuration when selected.
  if (selected.includes('match_stretch')) {
    const v = values.match_stretch || {}
    const perEmp = Math.round((v.matchCap ?? 6) / 100 * AVG_PAY)   // projected employer match $ per employee
    const ceiling = Number(v.costCeiling || 0)
    const within = v.costNeutral || perEmp <= ceiling
    checks.unshift({ pass: within, label: 'Employer cost (per employee)',
      detail: `Projected $${perEmp.toLocaleString()}/emp ${within ? 'within' : 'exceeds'} $${ceiling.toLocaleString()}/emp ceiling` })
  } else {
    checks.unshift({ pass: true, label: 'Employer cost (per employee)', detail: 'Within approved per-employee ceiling' })
  }
  return checks
}

const FieldLabel = ({ children }) => (
  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>{children}</Text>
)

// ── Per-strategy proposed controls (levers) ─────────────────────────────────
function StrategyControls({ id, v, set }) {
  const num = (k, label, props = {}) => (
    <Stack gap={4}><FieldLabel>{label}</FieldLabel>
      <NumberInput value={v[k] ?? ''} onChange={val => set(k, val)} radius="md" {...props} /></Stack>
  )
  const sel = (k, label, data) => (
    <Stack gap={4}><FieldLabel>{label}</FieldLabel>
      <Select value={v[k] ?? null} onChange={val => set(k, val)} data={data} radius="md" placeholder="Select…" /></Stack>
  )
  const txt = (k, label, ph) => (
    <Stack gap={4}><FieldLabel>{label}</FieldLabel>
      <TextInput value={v[k] ?? ''} onChange={e => set(k, e.currentTarget.value)} radius="md" placeholder={ph} /></Stack>
  )
  switch (id) {
    case 'auto_enrollment': return (<>
      <Stack gap={4}><FieldLabel>Default deferral — {v.defaultDeferral ?? 4}%</FieldLabel>
        <Slider value={v.defaultDeferral ?? 4} onChange={val => set('defaultDeferral', val)} min={1} max={10} step={1} color="orange"
          marks={[{ value: 3, label: '3%' }, { value: 6, label: '6%' }, { value: 10, label: '10%' }]} /></Stack>
      {sel('qdia', 'QDIA / default investment', [{ value: 'tdf', label: 'Target-date series' }, { value: 'balanced', label: 'Balanced fund' }, { value: 'managed', label: 'Managed account' }])}
    </>)
    case 'match_stretch': return (<>
      {txt('currentFormula', 'Current formula', '100% of 3%')}
      {txt('proposedFormula', 'Proposed formula', '50% of 6%')}
      <Stack gap={4}><FieldLabel>Match cap — {v.matchCap ?? 6}% of pay</FieldLabel>
        <Slider value={v.matchCap ?? 6} onChange={val => set('matchCap', val)} min={3} max={10} step={1} color="blue" /></Stack>
      <Switch checked={!!v.costNeutral} onChange={e => set('costNeutral', e.currentTarget.checked)} label="Cost-neutral toggle" color="teal" />
      {num('costCeiling', 'Employer cost ceiling ($ / employee)', { step: 250, thousandSeparator: ',' })}
    </>)
    case 'auto_escalation': return (<>
      <Stack gap={4}><FieldLabel>Annual increase — {v.annualIncrease ?? 1}%</FieldLabel>
        <Slider value={v.annualIncrease ?? 1} onChange={val => set('annualIncrease', val)} min={1} max={3} step={1} color="teal" /></Stack>
      <Stack gap={4}><FieldLabel>Cap — {v.cap ?? 10}%</FieldLabel>
        <Slider value={v.cap ?? 10} onChange={val => set('cap', val)} min={6} max={15} step={1} color="teal" /></Stack>
      {sel('startMonth', 'Start month', [{ value: 'jan', label: 'January (plan year)' }, { value: 'anniv', label: 'Hire anniversary' }])}
    </>)
    case 'reenrollment': return (<>
      {sel('sweepPopulation', 'Sweep population', [{ value: 'legacy', label: 'Legacy election holders' }, { value: 'all', label: 'All non-QDIA' }])}
      {sel('defaultInvestment', 'Default investment', [{ value: 'tdf', label: 'Target-date series' }, { value: 'balanced', label: 'Balanced fund' }])}
    </>)
    default: return null
  }
}

// Default lever seeds per strategy (applied when a strategy is first selected).
const SEED = {
  auto_enrollment: { defaultDeferral: 4, qdia: 'tdf' },
  match_stretch:   { currentFormula: '100% of 3%', proposedFormula: '50% of 6%', matchCap: 6, costCeiling: 3000, costNeutral: false },
  auto_escalation: { annualIncrease: 1, cap: 10, startMonth: 'jan' },
  reenrollment:    { sweepPopulation: 'legacy', defaultInvestment: 'tdf' },
}

export default function ParticipantChannelConfigPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const pd = step.panelData
  const [selected, setSelected] = useState(['auto_enrollment'])
  const [values, setValues] = useState({ auto_enrollment: { ...SEED.auto_enrollment } })
  const [channels, setChannels] = useState(['committee', 'email', 'portal'])

  // Selecting a strategy seeds its default levers (which drive default KPIs).
  const onSelect = (next) => {
    setSelected(next)
    setValues(prev => {
      const nv = { ...prev }
      next.forEach(id => { if (!nv[id]) nv[id] = { ...SEED[id] } })
      return nv
    })
  }
  const setLever = (id, k, val) => setValues(prev => ({ ...prev, [id]: { ...prev[id], [k]: val } }))

  const isComplete = (id) => STRATEGIES.find(s => s.id === id).required.every(k => {
    const val = values[id]?.[k]
    return val !== undefined && val !== null && val !== ''
  })
  const allComplete = selected.length > 0 && selected.every(isComplete)
  const guardChecks = aggregateGuardrails(selected, values)
  const blockers = guardChecks.filter(c => !c.pass)
  const ready = allComplete && blockers.length === 0 && channels.length > 0

  const handleContinue = () => {
    const primary = selected[0]
    setWorkflowState(s => ({
      ...s,
      // Preserve downstream contract (simulation reads strategy + values)
      strategyConfig: { strategy: primary, values: values[primary] || {}, strategies: selected, allValues: values },
      selectedOffers: (pd.offers || []).map(o => o.id),
      selectedSegments: (pd.segments || []).map(sg => sg.id),
      selectedChannels: channels,
    }))
    onContinue()
  }

  return (
    <Stack gap="md">
      {/* Header + multiselect strategy picker */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" variant="light" color="orange"><IconSettings size={16} /></ThemeIcon>
            <Text size="lg" fw={700}>Strategy Configuration</Text>
          </Group>
          <Badge size="sm" variant="light" color={ready ? 'green' : 'orange'}>
            {selected.length === 0 ? 'Select a strategy'
              : ready ? 'Ready to simulate'
              : !allComplete ? 'Required controls incomplete'
              : blockers.length ? `${blockers.length} guardrail block(s)`
              : 'Select a channel'}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>Select one or more strategies — 4 available. Levers and projected KPIs update per selected strategy.</Text>
        <Chip.Group multiple value={selected} onChange={onSelect}>
          <Group gap="xs">
            {STRATEGIES.map(s => (
              <Chip key={s.id} value={s.id} variant="outline" color="orange" radius="md" size="sm">{s.label}</Chip>
            ))}
          </Group>
        </Chip.Group>
      </Paper>

      {/* Current plan design reference */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-gray-4)' }}>
        <Group gap="xs" mb="xs"><ThemeIcon size="sm" variant="light" color="gray"><IconBuildingBank size={12} /></ThemeIcon><Text size="sm" fw={700}>Current plan design</Text></Group>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {CURRENT_PLAN.map(r => (
            <Box key={r.label}><Text size="10px" c="dimmed">{r.label}</Text><Text size="xs" fw={600}>{r.value}</Text></Box>
          ))}
        </SimpleGrid>
      </Paper>

      {selected.length === 0 && (
        <Alert color="gray" variant="light" icon={<IconInfoCircle size={16} />}>Select at least one strategy to configure its levers.</Alert>
      )}

      {/* One editable config block per SELECTED strategy */}
      {selected.map(id => {
        const strat = STRATEGIES.find(s => s.id === id)
        const v = values[id] || {}
        return (
          <Paper key={id} withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-orange-5)' }}>
            <Group justify="space-between" mb="xs">
              <Group gap="xs"><ThemeIcon size="sm" variant="light" color="orange"><IconAdjustments size={12} /></ThemeIcon><Text size="sm" fw={700}>{strat.label}</Text></Group>
              <Badge size="xs" variant="light" color={isComplete(id) ? 'green' : 'orange'}>
                {isComplete(id) ? 'Ready' : 'Incomplete'}
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {/* Levers — editable only for this selected strategy */}
              <Stack gap="sm">
                <FieldLabel>Proposed levers</FieldLabel>
                <StrategyControls id={id} v={v} set={(k, val) => setLever(id, k, val)} />
              </Stack>
              {/* Projected KPIs — default values that move with the levers */}
              <Stack gap="sm">
                <FieldLabel>Projected KPIs</FieldLabel>
                {projectedKpis(id, v).map(k => (
                  <Group key={k.label} justify="space-between" wrap="nowrap">
                    <Text size="xs" c="dimmed">{k.label}</Text>
                    <Badge size="sm" variant="light" color="teal">{k.value}</Badge>
                  </Group>
                ))}
                <Divider label="Required assets" labelPosition="left" />
                <Group gap={6}>{strat.assets.map(a => <Badge key={a} size="xs" variant="outline" color="orange">{a}</Badge>)}</Group>
              </Stack>
            </SimpleGrid>
          </Paper>
        )
      })}

      {/* Delivery channels — multiselect */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-blue-5)' }}>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={700}>Channels</Text>
          <Badge size="xs" variant="light" color={channels.length ? 'blue' : 'orange'}>
            {channels.length ? `${channels.length} selected` : 'Select at least one'}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>Choose how the selected strategies are delivered to eligible cohorts.</Text>
        <Chip.Group multiple value={channels} onChange={setChannels}>
          <Group gap="xs">
            {CHANNELS.map(c => (
              <Chip key={c.id} value={c.id} variant="outline" color="blue" radius="md" size="sm">{c.label}</Chip>
            ))}
          </Group>
        </Chip.Group>
      </Paper>

      {/* Guardrail validation — one common panel across all selected strategies */}
      {selected.length > 0 && (
        <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${blockers.length ? 'red' : 'green'}-5)` }}>
          <Group gap="xs" mb="xs">
            <ThemeIcon size="sm" variant="light" color={blockers.length ? 'red' : 'green'}><IconShieldCheck size={12} /></ThemeIcon>
            <Text size="sm" fw={700}>Guardrail validation</Text>
            <Badge size="xs" variant="light" color="gray">across all selected strategies</Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {guardChecks.map(c => (
              <Group key={c.label} gap="xs" align="flex-start" wrap="nowrap">
                <ThemeIcon size="xs" radius="xl" variant="light" color={c.pass ? 'green' : 'red'} mt={2}>
                  {c.pass ? <IconCheck size={9} /> : <IconShieldX size={9} />}
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text size="xs" fw={600}>{c.label}</Text>
                  <Text size="10px" c={c.pass ? 'dimmed' : 'red'}>{c.detail}</Text>
                </Box>
              </Group>
            ))}
          </SimpleGrid>
        </Paper>
      )}

      {/* Summary */}
      <Alert variant="light" color={ready ? 'teal' : 'orange'} icon={ready ? <IconInfoCircle size={16} /> : <IconAlertTriangle size={16} />}>
        <Text size="sm">
          <strong>{selected.length}</strong> strateg{selected.length === 1 ? 'y' : 'ies'} selected — <strong>{selected.map(id => STRATEGIES.find(s => s.id === id).label).join(', ') || 'none'}</strong>.
          {' '}{allComplete ? 'All required controls complete.' : 'Some required controls still needed.'}
          {blockers.length > 0 && <> Guardrail blockers: <strong>{blockers.map(b => b.label).join(', ')}</strong>.</>}
        </Text>
      </Alert>

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
        onClick={handleContinue}
        disabled={!ready}
      >
        Run Simulation
      </Button>
    </Stack>
  )
}
