import { useState } from 'react'
import {
  Paper, Stack, Group, Text, Badge, Button, ThemeIcon, Alert, Divider,
  SimpleGrid, Tabs, Select, NumberInput, Slider, Switch, TextInput, SegmentedControl, Box,
} from '@mantine/core'
import {
  IconChevronRight, IconInfoCircle, IconShieldCheck, IconShieldX, IconSettings,
  IconBuildingBank, IconAdjustments, IconCheck, IconAlertTriangle,
} from '@tabler/icons-react'

// ── Current plan design (baseline facts) ────────────────────────────────────
const CURRENT_PLAN = [
  { label: 'Enrollment design', value: 'Voluntary (opt-in)' },
  { label: 'Default deferral', value: 'None' },
  { label: 'Auto-escalation', value: 'Not enabled' },
  { label: 'Match formula', value: '100% of first 3%' },
  { label: 'QDIA', value: 'Target-date series' },
  { label: 'Participation', value: '67% (vs 82% benchmark)' },
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

// ── Per-strategy proposed controls ──────────────────────────────────────────
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

export default function ParticipantChannelConfigPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const pd = step.panelData
  const [active, setActive] = useState('auto_enrollment')
  const [values, setValues] = useState({ auto_enrollment: { defaultDeferral: 4, fairness: true }, match_stretch: { matchCap: 6, fairness: true }, auto_escalation: { annualIncrease: 1, cap: 10, fairness: true }, reenrollment: { fairness: true }, education: {}, holdout: { controlPct: 10 } })

  const strat = STRATEGIES.find(s => s.id === active)
  const v = values[active] || {}
  const set = (k, val) => setValues(prev => ({ ...prev, [active]: { ...prev[active], [k]: val } }))

  const complete = strat.required.every(k => {
    const val = v[k]
    return val !== undefined && val !== null && val !== ''
  })
  const checks = guardrails(active, v)
  const blockers = checks.filter(c => !c.pass)

  const handleContinue = () => {
    // Preserve downstream contract (simulation reads these)
    setWorkflowState(s => ({
      ...s,
      strategyConfig: { strategy: active, values: v },
      selectedOffers: (pd.offers || []).map(o => o.id),
      selectedSegments: (pd.segments || []).map(sg => sg.id),
      selectedChannels: ['committee', 'email', 'portal'],
    }))
    onContinue()
  }

  return (
    <Stack gap="md">
      {/* Header + strategy package selector */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" variant="light" color="orange"><IconSettings size={16} /></ThemeIcon>
            <Text size="lg" fw={700}>Strategy Configuration</Text>
          </Group>
          <Badge size="sm" variant="light" color={complete && blockers.length === 0 ? 'green' : 'orange'}>
            {complete ? (blockers.length === 0 ? 'Ready to simulate' : `${blockers.length} guardrail block(s)`) : 'Required controls incomplete'}
          </Badge>
        </Group>
        <Tabs value={active} onChange={setActive} variant="pills" radius="md" color="orange">
          <Tabs.List>
            {STRATEGIES.map(s => <Tabs.Tab key={s.id} value={s.id}>{s.label}</Tabs.Tab>)}
          </Tabs.List>
        </Tabs>
      </Paper>

      {/* 3-column: current | proposed | guardrails */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {/* Left — current plan design */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-gray-4)' }}>
          <Stack gap="sm">
            <Group gap="xs"><ThemeIcon size="sm" variant="light" color="gray"><IconBuildingBank size={12} /></ThemeIcon><Text size="sm" fw={700}>Current plan design</Text></Group>
            <Divider />
            {CURRENT_PLAN.map(r => (
              <Group key={r.label} justify="space-between" wrap="nowrap">
                <Text size="xs" c="dimmed">{r.label}</Text>
                <Text size="xs" fw={600} ta="right">{r.value}</Text>
              </Group>
            ))}
          </Stack>
        </Paper>

        {/* Center — proposed controls */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-orange-5)' }}>
          <Stack gap="sm">
            <Group gap="xs"><ThemeIcon size="sm" variant="light" color="orange"><IconAdjustments size={12} /></ThemeIcon><Text size="sm" fw={700}>Proposed — {strat.label}</Text></Group>
            <Divider />
            <StrategyControls id={active} v={v} set={set} />
            <Divider label="Required assets" labelPosition="left" />
            <Group gap={6}>
              {strat.assets.map(a => <Badge key={a} size="xs" variant="outline" color="orange">{a}</Badge>)}
            </Group>
          </Stack>
        </Paper>

        {/* Right — guardrail validation */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${blockers.length ? 'red' : 'green'}-5)` }}>
          <Stack gap="sm">
            <Group gap="xs"><ThemeIcon size="sm" variant="light" color={blockers.length ? 'red' : 'green'}><IconShieldCheck size={12} /></ThemeIcon><Text size="sm" fw={700}>Guardrail validation</Text></Group>
            <Divider />
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
        </Paper>
      </SimpleGrid>

      {/* Bottom — generated configuration summary */}
      <Alert variant="light" color={complete && !blockers.length ? 'teal' : 'orange'} icon={complete && !blockers.length ? <IconInfoCircle size={16} /> : <IconAlertTriangle size={16} />}>
        <Text size="sm">
          <strong>{strat.label}</strong> configured for eligible cohorts with{' '}
          <strong>{strat.required.length}</strong> required controls
          {complete ? ' complete' : ` — ${strat.required.filter(k => !(v[k] !== undefined && v[k] !== null && v[k] !== '')).length} still required`}.
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
        disabled={!complete || blockers.length > 0}
      >
        Run Simulation
      </Button>
    </Stack>
  )
}
