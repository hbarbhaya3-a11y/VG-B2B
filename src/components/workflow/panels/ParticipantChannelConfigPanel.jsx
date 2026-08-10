import { useState } from 'react'
import {
  Paper, Stack, Group, Text, Badge, Button, ThemeIcon, Alert, Divider,
  SimpleGrid, Chip, Select, NumberInput, Slider, Switch, TextInput, Box,
} from '@mantine/core'
import {
  IconChevronRight, IconInfoCircle, IconShieldX, IconSettings,
  IconBuildingBank, IconAdjustments, IconCheck, IconAlertTriangle,
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
  { id: 'auto_enrollment', label: 'Auto Enrollment', required: ['defaultDeferral', 'qdia', 'optOutWindow', 'effectiveDate'],
    assets: ['Committee deck', 'Participant email', 'Portal flow', 'Auto-enroll / QDIA notice'] },
  { id: 'match_stretch', label: 'Match Stretch', required: ['currentFormula', 'proposedFormula', 'matchCap'],
    assets: ['Committee deck', 'Match education', 'Portal calculator', 'Payroll kit'] },
  { id: 'auto_escalation', label: 'Auto Escalation', required: ['annualIncrease', 'cap', 'startMonth'],
    assets: ['Committee deck', 'Escalation email', 'Portal preview', 'Notice draft'] },
  { id: 'reenrollment', label: 'Re-enrollment', required: ['sweepPopulation', 'defaultInvestment', 'noticeWindow', 'effectiveDate'],
    assets: ['Committee deck', 'Re-enrollment comms', 'Portal confirmation', 'Notice pack'] },
  { id: 'education', label: 'Education-only', required: ['messageTheme', 'channel', 'cadence'],
    assets: ['Email', 'Portal banner', 'SMS / push (optional)'] },
  { id: 'holdout', label: 'Holdout', required: ['controlPct', 'randomization', 'measurementWindow'],
    assets: ['Measurement plan', 'Deployment split', 'Readout template'] },
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
    case 'education': return [
      { label: 'Engagement lift', value: '+12pp' },
      { label: 'Content completion', value: '48%' },
    ]
    case 'holdout': return [
      { label: 'Statistical power', value: `${(v.controlPct ?? 10) >= 10 ? '80%' : '70%'}` },
      { label: 'Control size', value: `${v.controlPct ?? 10}%` },
    ]
    default: return []
  }
}

// ── Guardrail checks per strategy ───────────────────────────────────────────
function guardrails(id, v) {
  const ok = (pass, label, detail) => ({ pass, label, detail })
  const base = [
    ok(true, 'Eligibility rules', 'Scoped to eligible employees per plan document'),
    ok(true, 'Payroll readiness', 'Deferral + match fields mapped'),
    ok(true, 'Recordkeeping readiness', 'Cohort + election feeds live'),
    ok(true, 'Fairness monitor', v.fairness ? 'Enabled — disparity tracked' : 'Disabled'),
    ok(true, 'Holdout feasibility', 'Sample size sufficient for 80% power'),
  ]
  if (id === 'auto_enrollment' || id === 'reenrollment')
    base.splice(3, 0, ok(!!(v.optOutWindow || v.noticeWindow), 'Notice + opt-out path', 'QDIA/auto-enroll notice window and opt-out required'))
  if (id === 'match_stretch') {
    const within = v.costNeutral || (Number(v.costCeiling || 0) >= 120000)
    base.unshift(ok(within, 'Employer cost', within ? 'Within approved ceiling' : 'Projected match cost exceeds ceiling'))
  } else {
    base.unshift(ok(true, 'Employer cost', 'Within approved ceiling'))
  }
  if (id === 'education') base.push(ok(true, 'Consent + frequency cap', 'Channel consent verified; within cap'))
  return base
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
      {sel('optOutWindow', 'Opt-out window', [{ value: '30', label: '30 days' }, { value: '60', label: '60 days' }, { value: '90', label: '90 days' }])}
      {txt('effectiveDate', 'Effective date', 'e.g. 2026-09-01')}
    </>)
    case 'match_stretch': return (<>
      {txt('currentFormula', 'Current formula', '100% of 3%')}
      {txt('proposedFormula', 'Proposed formula', '50% of 6%')}
      <Stack gap={4}><FieldLabel>Match cap — {v.matchCap ?? 6}% of pay</FieldLabel>
        <Slider value={v.matchCap ?? 6} onChange={val => set('matchCap', val)} min={3} max={10} step={1} color="blue" /></Stack>
      <Switch checked={!!v.costNeutral} onChange={e => set('costNeutral', e.currentTarget.checked)} label="Cost-neutral toggle" color="teal" />
      {num('costCeiling', 'Employer cost ceiling ($)', { step: 10000, thousandSeparator: ',' })}
    </>)
    case 'auto_escalation': return (<>
      <Stack gap={4}><FieldLabel>Annual increase — {v.annualIncrease ?? 1}%</FieldLabel>
        <Slider value={v.annualIncrease ?? 1} onChange={val => set('annualIncrease', val)} min={1} max={3} step={1} color="teal" /></Stack>
      <Stack gap={4}><FieldLabel>Cap — {v.cap ?? 10}%</FieldLabel>
        <Slider value={v.cap ?? 10} onChange={val => set('cap', val)} min={6} max={15} step={1} color="teal" /></Stack>
      {sel('startMonth', 'Start month', [{ value: 'jan', label: 'January (plan year)' }, { value: 'anniv', label: 'Hire anniversary' }])}
      {txt('optOutPath', 'Opt-out / change-election path', 'Portal + payroll')}
    </>)
    case 'reenrollment': return (<>
      {sel('sweepPopulation', 'Sweep population', [{ value: 'legacy', label: 'Legacy election holders' }, { value: 'all', label: 'All non-QDIA' }])}
      {sel('defaultInvestment', 'Default investment', [{ value: 'tdf', label: 'Target-date series' }, { value: 'balanced', label: 'Balanced fund' }])}
      {sel('noticeWindow', 'Notice window', [{ value: '30', label: '30 days' }, { value: '45', label: '45 days' }])}
      {txt('exclusions', 'Exclusions', 'Self-directed brokerage, opt-outs')}
      {txt('effectiveDate', 'Effective date', 'e.g. 2026-10-01')}
    </>)
    case 'education': return (<>
      {txt('messageTheme', 'Message theme', 'Retirement readiness')}
      {sel('channel', 'Channel', [{ value: 'email', label: 'Email' }, { value: 'portal', label: 'Portal banner' }, { value: 'sms', label: 'SMS / push' }])}
      {sel('cadence', 'Cadence', [{ value: 'weekly', label: 'Weekly' }, { value: 'biweekly', label: 'Bi-weekly' }, { value: 'monthly', label: 'Monthly' }])}
      <Alert color="gray" variant="light" icon={<IconInfoCircle size={14} />} p="xs"><Text size="xs">Education-only — no plan-rule change.</Text></Alert>
    </>)
    case 'holdout': return (<>
      <Stack gap={4}><FieldLabel>Control % — {v.controlPct ?? 10}%</FieldLabel>
        <Slider value={v.controlPct ?? 10} onChange={val => set('controlPct', val)} min={5} max={30} step={1} color="violet" /></Stack>
      {sel('randomization', 'Randomization method', [{ value: 'employee', label: 'Employee-level random' }, { value: 'site', label: 'Site / division random' }])}
      {sel('measurementWindow', 'Measurement window', [{ value: '30', label: '30 days' }, { value: '60', label: '60 days' }, { value: '90', label: '90 days' }])}
      <Alert color="violet" variant="light" icon={<IconInfoCircle size={14} />} p="xs"><Text size="xs">No treatment content — measurement / control only.</Text></Alert>
    </>)
    default: return null
  }
}

// Default lever seeds per strategy (applied when a strategy is first selected).
const SEED = {
  auto_enrollment: { defaultDeferral: 4, fairness: true },
  match_stretch:   { matchCap: 6, fairness: true },
  auto_escalation: { annualIncrease: 1, cap: 10, fairness: true },
  reenrollment:    { fairness: true },
  education:       {},
  holdout:         { controlPct: 10 },
}

export default function ParticipantChannelConfigPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const pd = step.panelData
  const [selected, setSelected] = useState(['auto_enrollment'])
  const [values, setValues] = useState({ auto_enrollment: { ...SEED.auto_enrollment } })

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
  const allBlockers = selected.flatMap(id => guardrails(id, values[id] || {}).filter(c => !c.pass))

  const handleContinue = () => {
    const primary = selected[0]
    setWorkflowState(s => ({
      ...s,
      // Preserve downstream contract (simulation reads strategy + values)
      strategyConfig: { strategy: primary, values: values[primary] || {}, strategies: selected, allValues: values },
      selectedOffers: (pd.offers || []).map(o => o.id),
      selectedSegments: (pd.segments || []).map(sg => sg.id),
      selectedChannels: ['committee', 'email', 'portal'],
    }))
    onContinue()
  }

  return (
    <Stack gap="md">
      {/* Header + multiselect strategy picker (6 available) */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" variant="light" color="orange"><IconSettings size={16} /></ThemeIcon>
            <Text size="lg" fw={700}>Strategy Configuration</Text>
          </Group>
          <Badge size="sm" variant="light" color={allComplete && allBlockers.length === 0 ? 'green' : 'orange'}>
            {selected.length === 0 ? 'Select a strategy'
              : allComplete ? (allBlockers.length === 0 ? 'Ready to simulate' : `${allBlockers.length} guardrail block(s)`)
              : 'Required controls incomplete'}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" mb={8}>Select one or more strategies — 6 available. Levers and projected KPIs update per selected strategy.</Text>
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
        const checks = guardrails(id, v)
        const blk = checks.filter(c => !c.pass)
        return (
          <Paper key={id} withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${blk.length ? 'red' : 'orange'}-5)` }}>
            <Group justify="space-between" mb="xs">
              <Group gap="xs"><ThemeIcon size="sm" variant="light" color="orange"><IconAdjustments size={12} /></ThemeIcon><Text size="sm" fw={700}>{strat.label}</Text></Group>
              <Badge size="xs" variant="light" color={isComplete(id) ? (blk.length ? 'yellow' : 'green') : 'orange'}>
                {isComplete(id) ? (blk.length ? `${blk.length} block(s)` : 'Ready') : 'Incomplete'}
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
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
              {/* Guardrail validation */}
              <Stack gap="sm">
                <FieldLabel>Guardrail validation</FieldLabel>
                {checks.map(c => (
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
              </Stack>
            </SimpleGrid>
          </Paper>
        )
      })}

      {/* Summary */}
      <Alert variant="light" color={allComplete && !allBlockers.length ? 'teal' : 'orange'} icon={allComplete && !allBlockers.length ? <IconInfoCircle size={16} /> : <IconAlertTriangle size={16} />}>
        <Text size="sm">
          <strong>{selected.length}</strong> strateg{selected.length === 1 ? 'y' : 'ies'} selected — <strong>{selected.map(id => STRATEGIES.find(s => s.id === id).label).join(', ') || 'none'}</strong>.
          {' '}{allComplete ? 'All required controls complete.' : 'Some required controls still needed.'}
          {allBlockers.length > 0 && <> Guardrail blockers: <strong>{allBlockers.map(b => b.label).join(', ')}</strong>.</>}
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
        disabled={!allComplete || allBlockers.length > 0}
      >
        Run Simulation
      </Button>
    </Stack>
  )
}
