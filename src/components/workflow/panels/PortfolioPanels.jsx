import { useState } from 'react'
import {
  Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, Table, Chip, Alert, Box, Progress,
  Drawer, Tabs, Button, Switch,
} from '@mantine/core'
import { IconChartBar, IconSparkles, IconInfoCircle, IconLayoutGrid, IconAdjustments, IconShieldCheck, IconPackage, IconRocket, IconBrain, IconCheck } from '@tabler/icons-react'

// ── Shared cohort → strategy allocation matrix ──────────────────────────────
export const ALLOC = [
  { id: 'C1', cohort: 'Eligible nonparticipants', size: 11800, issue: 'Low enrollment', candidates: 'Auto Enrollment, Education-only, Holdout', strategy: 'Auto Enrollment', channels: 'Email + portal + notices', assets: 'Committee deck, email, portal, notice', holdout: 'Randomized eligible holdout', guardrail: 'Pass', kpi: 'Incremental enrollment', rationale: 'Highest fit for the nonparticipation signal', approval: 'Compliance + fiduciary + payroll', contribution: 46, color: 'orange' },
  { id: 'C2', cohort: 'Below-match participants', size: 6200, issue: 'Not capturing full match', candidates: 'Match Stretch, education, Holdout', strategy: 'Match Stretch + education', channels: 'Email + portal calculator', assets: 'Committee deck, portal calculator, payroll kit', holdout: 'Matched cohort holdout', guardrail: 'Cost review', kpi: 'Match utilization / deferral lift', rationale: 'Better aligned to below-match behavior', approval: 'Cost + payroll + committee', contribution: 18, color: 'blue' },
  { id: 'C3', cohort: 'Stuck-at-default participants', size: 5800, issue: 'Deferral flat at default', candidates: 'Auto Escalation, education', strategy: 'Auto Escalation', channels: 'Email + portal preview', assets: 'Escalation email, notice, payroll kit', holdout: 'Holdout by eligible subgroup', guardrail: 'Notice review', kpi: 'Deferral lift', rationale: 'Addresses deferral inertia', approval: 'Notice + payroll', contribution: 16, color: 'teal' },
  { id: 'C4', cohort: 'Legacy elections', size: 4700, issue: 'Inactive / outdated elections', candidates: 'Re-enrollment, education', strategy: 'Re-enrollment', channels: 'Email + portal confirmation + notices', assets: 'Re-enrollment notice, QDIA draft', holdout: 'Holdout if policy allows', guardrail: 'Fiduciary review', kpi: 'Re-election / reset completion', rationale: 'Best fit for outdated elections', approval: 'Fiduciary + compliance', contribution: 12, color: 'grape' },
  { id: 'C5', cohort: 'Low-readiness cohort', size: 3400, issue: 'Operational / service risk', candidates: 'Education-only, Holdout', strategy: 'Education-only', channels: 'Email + FAQ + service prompt', assets: 'Education email, FAQ', holdout: 'A/B content holdout', guardrail: 'Pass', kpi: 'Engagement / enrollment starts', rationale: 'Lower operational risk', approval: 'Content review', contribution: 6, color: 'green' },
  { id: 'H',  cohort: 'Measurement control', size: 4200, issue: 'Causal proof', candidates: 'No-action', strategy: 'Holdout', channels: 'None / suppressed', assets: 'Measurement plan', holdout: 'Locked control', guardrail: 'Pass', kpi: 'Incrementality readout', rationale: 'Required for causal proof', approval: 'Measurement approval', contribution: 2, color: 'gray' },
]

const PORTFOLIOS = [
  { id: 'A', title: 'Default-led participation lift', mix: 'Auto Enrollment + Auto Escalation', note: 'Best for a broad participation gap', lift: '+14pp', cost: '+0.4%', conf: 0.87, best: false },
  { id: 'B', title: 'Cost-aware savings improvement', mix: 'Match Stretch + Auto Escalation', note: 'Best where the cost ceiling is tight', lift: '+4pp', cost: '+0.1%', conf: 0.79, best: false },
  { id: 'C', title: 'Legacy reset package', mix: 'Re-enrollment + notices + portal confirmation', note: 'Best for outdated / inactive elections', lift: '+6pp', cost: '+0.1%', conf: 0.80, best: false },
  { id: 'D', title: 'TwinX Optimized Portfolio', mix: 'Cohort-specific strategy mix', note: 'Maximizes lift within all constraints', lift: '+15pp', cost: '+0.4%', conf: 0.86, best: true },
]

const STRATEGY_MIX = [
  { label: 'Auto Enrollment', pct: 33, color: 'orange' },
  { label: 'Match Stretch', pct: 17, color: 'blue' },
  { label: 'Auto Escalation', pct: 16, color: 'teal' },
  { label: 'Re-enrollment', pct: 13, color: 'grape' },
  { label: 'Education-only', pct: 9, color: 'green' },
  { label: 'Holdout', pct: 12, color: 'gray' },
]

const CONSTRAINT_COLS = ['Cost', 'Readiness', 'Fairness', 'Compliance', 'Notice', 'Payroll', 'Holdout']
// per-cohort status: g=good, w=warn, b=block
const HEATMAP = {
  C1: ['g', 'g', 'g', 'w', 'w', 'g', 'g'],
  C2: ['w', 'g', 'g', 'g', 'g', 'w', 'g'],
  C3: ['g', 'w', 'g', 'g', 'w', 'g', 'g'],
  C4: ['g', 'w', 'g', 'w', 'w', 'g', 'w'],
  C5: ['g', 'w', 'g', 'g', 'g', 'g', 'g'],
  H:  ['g', 'g', 'g', 'g', 'g', 'g', 'g'],
}
const HC = { g: 'green', w: 'yellow', b: 'red' }

const OPTIMIZER = ['Participation lift', 'Deferral lift', 'Employer cost', 'Readiness', 'Fairness', 'Confidence', 'Holdout coverage']

const PORTFOLIO_KPIS = [
  { label: 'Participation lift', value: '+15pp', color: 'green' },
  { label: 'Incremental enrollments', value: '+8,900', color: 'teal' },
  { label: 'Deferral lift', value: '+1.3pp', color: 'blue' },
  { label: 'Employer cost impact', value: '+0.4%', color: 'orange' },
  { label: 'Cost ceiling utilization', value: '80%', color: 'orange' },
  { label: 'Opt-out risk', value: '10.4%', color: 'red' },
  { label: 'Readiness score', value: '88', color: 'teal' },
  { label: 'Fairness / equity impact', value: 'Improves', color: 'pink' },
  { label: 'Portfolio confidence', value: '86%', color: 'violet' },
  { label: 'Holdout coverage', value: '5 / 6 cells', color: 'grape' },
]

const guardColor = (g) => g === 'Pass' ? 'green' : /review/i.test(g) ? 'yellow' : 'red'

// ══════════════════════════════════════════════════════════════════════════
// Screen 7 — Portfolio Simulation & Allocation Lab
// ══════════════════════════════════════════════════════════════════════════
export function PortfolioLab() {
  const [weights, setWeights] = useState(['Participation lift', 'Fairness'])

  return (
    <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-violet-5)' }}>
      <Stack gap="md">
        <Group gap="xs">
          <ThemeIcon size="sm" variant="light" color="violet"><IconLayoutGrid size={12} /></ThemeIcon>
          <Text size="sm" fw={700}>Portfolio Simulation & Allocation Lab</Text>
          <Badge size="xs" color="violet" variant="light">Compares complete strategy portfolios</Badge>
        </Group>

        {/* Portfolio-level KPI cards */}
        <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
          {PORTFOLIO_KPIS.map(k => (
            <Paper key={k.label} withBorder p="sm" radius="md" style={{ borderTop: `3px solid var(--mantine-color-${k.color}-5)` }}>
              <Stack gap={2}><Text size="lg" fw={900} c={k.color} style={{ lineHeight: 1 }}>{k.value}</Text>
                <Text size="10px" c="dimmed" style={{ lineHeight: 1.2 }}>{k.label}</Text></Stack>
            </Paper>
          ))}
        </SimpleGrid>

        {/* Portfolio scenario cards */}
        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm">
          {PORTFOLIOS.map(pf => (
            <Paper key={pf.id} withBorder p="sm" radius="md"
              style={{ borderLeft: `3px solid var(--mantine-color-${pf.best ? 'violet' : 'gray'}-5)`, outline: pf.best ? '2px solid var(--mantine-color-violet-5)' : 'none' }}>
              <Stack gap={4}>
                <Group gap="xs"><Badge size="xs" color={pf.best ? 'violet' : 'gray'} variant="filled">Portfolio {pf.id}</Badge>{pf.best && <Badge size="xs" color="violet" variant="light">Recommended</Badge>}</Group>
                <Text size="xs" fw={700}>{pf.title}</Text>
                <Text size="10px" c="dimmed">{pf.mix}</Text>
                <Text size="10px" c="dimmed">{pf.note}</Text>
                <Group gap={4} mt={2}>
                  <Badge size="xs" variant="light" color="green">{pf.lift}</Badge>
                  <Badge size="xs" variant="light" color="orange">{pf.cost}</Badge>
                  <Badge size="xs" variant="light" color="violet">{Math.round(pf.conf * 100)}%</Badge>
                </Group>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        {/* Optimizer controls */}
        <Paper withBorder p="sm" radius="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
          <Group gap="sm" wrap="wrap">
            <Group gap={4}><IconAdjustments size={13} /><Text size="xs" fw={700} tt="uppercase" c="dimmed">Optimize for</Text></Group>
            <Chip.Group multiple value={weights} onChange={setWeights}>
              <Group gap={6}>{OPTIMIZER.map(o => <Chip key={o} value={o} size="xs" variant="outline" color="violet" radius="md">{o}</Chip>)}</Group>
            </Chip.Group>
          </Group>
        </Paper>

        {/* Cohort × Strategy × Channel allocation matrix */}
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 1000 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Cohort</Table.Th><Table.Th ta="right">Size</Table.Th><Table.Th>Baseline issue</Table.Th>
                <Table.Th>Candidates tested</Table.Th><Table.Th>Recommended</Table.Th><Table.Th>Channel mix</Table.Th>
                <Table.Th>Holdout design</Table.Th><Table.Th>Guardrail</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ALLOC.map(r => (
                <Table.Tr key={r.id}>
                  <Table.Td><Group gap={6} wrap="nowrap"><div style={{ width: 3, height: 20, borderRadius: 2, background: `var(--mantine-color-${r.color}-5)` }} /><Text size="xs" fw={600}>{r.cohort}</Text></Group></Table.Td>
                  <Table.Td ta="right"><Text size="xs" fw={700} c={r.color}>{r.size.toLocaleString()}</Text></Table.Td>
                  <Table.Td c="dimmed">{r.issue}</Table.Td>
                  <Table.Td c="dimmed">{r.candidates}</Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color={r.color}>{r.strategy}</Badge></Table.Td>
                  <Table.Td c="dimmed">{r.channels}</Table.Td>
                  <Table.Td c="dimmed">{r.holdout}</Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color={guardColor(r.guardrail)}>{r.guardrail}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>

        {/* Charts: frontier + contribution + strategy mix + heatmap */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {/* Frontier */}
          <Paper withBorder p="sm" radius="md">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Portfolio frontier — cost vs participation lift</Text>
            <Box style={{ position: 'relative', height: 140, borderLeft: '1px solid var(--mantine-color-default-border)', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
              {PORTFOLIOS.map(pf => {
                const x = (parseFloat(pf.cost) / 0.5) * 90
                const y = (parseFloat(pf.lift) / 16) * 90
                return <Box key={pf.id} title={pf.title} style={{ position: 'absolute', left: `${x}%`, bottom: `${y}%`, width: 22, height: 22, borderRadius: '50%', background: `var(--mantine-color-${pf.best ? 'violet' : 'gray'}-5)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{pf.id}</Box>
              })}
            </Box>
            <Group justify="space-between"><Text size="9px" c="dimmed">→ employer cost</Text><Text size="9px" c="dimmed">↑ participation lift</Text></Group>
          </Paper>

          {/* Cohort contribution stacked bar */}
          <Paper withBorder p="sm" radius="md">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Cohort contribution to total lift</Text>
            <Group gap={0} style={{ height: 22, borderRadius: 6, overflow: 'hidden' }}>
              {ALLOC.map(r => r.contribution > 0 && (
                <div key={r.id} title={`${r.cohort} ${r.contribution}%`} style={{ flex: r.contribution, background: `var(--mantine-color-${r.color}-5)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {r.contribution >= 10 && <Text size="9px" c="white" fw={700}>{r.contribution}%</Text>}
                </div>
              ))}
            </Group>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mt="md" mb="xs">Strategy mix (% of population)</Text>
            <Stack gap={4}>
              {STRATEGY_MIX.map(s => (
                <Group key={s.label} gap="xs" wrap="nowrap"><Text size="10px" style={{ width: 100 }}>{s.label}</Text><Progress value={s.pct} color={s.color} size="sm" style={{ flex: 1 }} /><Text size="10px" c="dimmed" style={{ width: 28 }}>{s.pct}%</Text></Group>
              ))}
            </Stack>
          </Paper>
        </SimpleGrid>

        {/* Constraint heatmap */}
        <Paper withBorder p="sm" radius="md">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Constraint heatmap</Text>
          <Box style={{ overflowX: 'auto' }}>
            <Table fz="xs" withColumnBorders style={{ minWidth: 620 }}>
              <Table.Thead><Table.Tr><Table.Th>Cohort</Table.Th>{CONSTRAINT_COLS.map(c => <Table.Th key={c} ta="center">{c}</Table.Th>)}</Table.Tr></Table.Thead>
              <Table.Tbody>
                {ALLOC.map(r => (
                  <Table.Tr key={r.id}>
                    <Table.Td><Text size="10px" fw={600}>{r.cohort}</Text></Table.Td>
                    {(HEATMAP[r.id] || []).map((s, i) => (
                      <Table.Td key={i} ta="center"><div style={{ width: 14, height: 14, borderRadius: 3, margin: '0 auto', background: `var(--mantine-color-${HC[s]}-5)` }} /></Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Paper>
      </Stack>
    </Paper>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Screen 8 — Portfolio Recommendation: Segment-to-Strategy Plan
// ══════════════════════════════════════════════════════════════════════════
const REC_SUMMARY = [
  { label: 'Cohorts assigned', value: '6' },
  { label: 'Strategies in parallel', value: '5' },
  { label: 'Participation lift', value: '+15pp' },
  { label: 'Deferral lift', value: '+1.3pp' },
  { label: 'Employer cost', value: '+0.4%' },
  { label: 'Holdout coverage', value: '5 / 6' },
  { label: 'Required approvals', value: '6 paths' },
  { label: 'Launch readiness', value: 'Ready pending approval' },
]

const WHY_NOT_ONE = [
  'Different cohorts have different behavioral barriers',
  'Strategies have different operational dependencies',
  'Notices, payroll, QDIA and fiduciary review vary by strategy',
  'Employer cost impact varies by cohort',
  'Holdout design must be preserved at the cell level',
]

export function PortfolioRecommendation() {
  return (
    <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-indigo-5)', background: 'var(--mantine-color-indigo-light)' }}>
      <Stack gap="md">
        <Group gap="xs">
          <ThemeIcon size="sm" variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}><IconSparkles size={12} color="white" /></ThemeIcon>
          <Text size="sm" fw={800}>Recommended Portfolio — participation-lift strategy mix</Text>
        </Group>

        {/* Summary cards */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {REC_SUMMARY.map(s => (
            <Paper key={s.label} withBorder p="sm" radius="md"><Stack gap={2}><Text size="sm" fw={800} c="indigo" style={{ lineHeight: 1 }}>{s.value}</Text><Text size="10px" c="dimmed">{s.label}</Text></Stack></Paper>
          ))}
        </SimpleGrid>

        {/* Narrative */}
        <Text size="sm" style={{ lineHeight: 1.7 }}>
          TwinX does not recommend one universal plan-design action. It recommends a <strong>portfolio</strong>: Auto Enrollment for eligible nonparticipants, Match Stretch for below-match savers, Auto Escalation for stuck-at-default participants, Re-enrollment for legacy elections, Education-only for low-readiness cohorts, and holdout cells for causal proof.
        </Text>

        {/* Recommendation matrix */}
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 980 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th><Table.Th>Cohort</Table.Th><Table.Th>Recommended strategy</Table.Th>
                <Table.Th>Primary KPI</Table.Th><Table.Th>Channels</Table.Th><Table.Th>Rationale</Table.Th>
                <Table.Th ta="center">Holdout</Table.Th><Table.Th>Approval path</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ALLOC.map((r, i) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{i + 1}</Table.Td>
                  <Table.Td><Group gap={6} wrap="nowrap"><div style={{ width: 3, height: 20, borderRadius: 2, background: `var(--mantine-color-${r.color}-5)` }} /><Text size="xs" fw={600}>{r.cohort}</Text></Group></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color={r.color}>{r.strategy}</Badge></Table.Td>
                  <Table.Td c="dimmed">{r.kpi}</Table.Td>
                  <Table.Td c="dimmed">{r.channels}</Table.Td>
                  <Table.Td c="dimmed">{r.rationale}</Table.Td>
                  <Table.Td ta="center">{r.id === 'H' ? <Badge size="xs" color="gray" variant="filled">Locked</Badge> : r.id === 'C5' ? <Badge size="xs" color="teal" variant="light">A/B</Badge> : <Badge size="xs" color="violet" variant="light">Yes</Badge>}</Table.Td>
                  <Table.Td c="dimmed">{r.approval}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>

        {/* Why not one strategy */}
        <Alert color="indigo" variant="light" icon={<IconInfoCircle size={16} />} title="Why TwinX recommends a portfolio, not one strategy">
          <Stack gap={2}>{WHY_NOT_ONE.map((w, i) => <Text key={i} size="xs">• {w}</Text>)}</Stack>
        </Alert>
      </Stack>
    </Paper>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Screen 10 — Portfolio Guardrail Matrix
// ══════════════════════════════════════════════════════════════════════════
const GR_CELLS = [
  { key: 'ae', label: 'Auto Enrollment', sub: 'nonparticipants', cohort: 'Eligible nonparticipants' },
  { key: 'ms', label: 'Match Stretch', sub: 'below-match', cohort: 'Below-match participants' },
  { key: 'aes', label: 'Auto Escalation', sub: 'default-stuck', cohort: 'Stuck-at-default' },
  { key: 're', label: 'Re-enrollment', sub: 'legacy', cohort: 'Legacy elections' },
  { key: 'edu', label: 'Education-only', sub: 'low-readiness', cohort: 'Low-readiness cohort' },
  { key: 'ho', label: 'Holdout', sub: 'control', cohort: 'Measurement control' },
]
const GR_ROWS = [
  { g: 'Employer cost ceiling',   v: { ae: 'Warn', ms: 'Pass / Warn', aes: 'Pass', re: 'Pass', edu: 'Pass', ho: 'Pass' } },
  { g: 'Eligibility / exclusion', v: { ae: 'Pass', ms: 'Pass', aes: 'Pass', re: 'Warn', edu: 'Pass', ho: 'Pass' } },
  { g: 'Notice readiness',        v: { ae: 'Block', ms: 'N/A', aes: 'Warn', re: 'Block', edu: 'N/A', ho: 'N/A' } },
  { g: 'QDIA / default invest.',  v: { ae: 'Required', ms: 'N/A', aes: 'N/A', re: 'Required', edu: 'N/A', ho: 'N/A' } },
  { g: 'Payroll readiness',       v: { ae: 'Required', ms: 'Required', aes: 'Required', re: 'Required', edu: 'N/A', ho: 'N/A' } },
  { g: 'Recordkeeping readiness', v: { ae: 'Required', ms: 'Required', aes: 'Required', re: 'Required', edu: 'N/A', ho: 'N/A' } },
  { g: 'Fairness monitor',        v: { ae: 'Required', ms: 'Required', aes: 'Required', re: 'Required', edu: 'Required', ho: 'Required' } },
  { g: 'Consent / suppression',   v: { ae: 'Required', ms: 'Required', aes: 'Required', re: 'Required', edu: 'Required', ho: 'Suppressed' } },
  { g: 'Data minimization',       v: { ae: 'Pass', ms: 'Pass', aes: 'Pass', re: 'Pass', edu: 'Pass', ho: 'Pass' } },
  { g: 'Holdout feasibility',     v: { ae: 'Required', ms: 'Required', aes: 'Required', re: 'Required', edu: 'Required', ho: 'Required' } },
  { g: 'Claim approval',          v: { ae: 'Warn', ms: 'Required', aes: 'Required', re: 'Warn', edu: 'Required', ho: 'N/A' } },
]
const grColor = (s) => /Block/i.test(s) ? 'red' : /Warn/i.test(s) ? 'yellow' : /N\/A/i.test(s) ? 'gray' : /Suppressed/i.test(s) ? 'grape' : 'green'

export function GuardrailMatrix() {
  const [detail, setDetail] = useState(null)
  return (
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon size="sm" variant="light" color="green"><IconShieldCheck size={12} /></ThemeIcon>
        <Text size="sm" fw={700}>Portfolio Guardrail Matrix</Text>
        <Badge size="xs" variant="light" color="green">Guardrails × cohort-strategy cells · click any cell</Badge>
      </Group>
      <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
        <Table fz="xs" withColumnBorders verticalSpacing="sm" horizontalSpacing="sm" style={{ minWidth: 920 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Guardrail</Table.Th>
              {GR_CELLS.map(c => <Table.Th key={c.key} ta="center"><Text size="10px" fw={700}>{c.label}</Text><Text size="9px" c="dimmed">{c.sub}</Text></Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {GR_ROWS.map(r => (
              <Table.Tr key={r.g}>
                <Table.Td><Text size="xs" fw={600}>{r.g}</Text></Table.Td>
                {GR_CELLS.map(c => (
                  <Table.Td key={c.key} ta="center" style={{ cursor: 'pointer' }} onClick={() => setDetail({ row: r, cell: c })}>
                    <Badge size="xs" variant="light" color={grColor(r.v[c.key])}>{r.v[c.key]}</Badge>
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
      <Drawer opened={!!detail} onClose={() => setDetail(null)} position="right" size="md" title="Guardrail detail">
        {detail && (
          <Stack gap="sm">
            <Group gap="xs"><Badge color="blue" variant="light">{detail.cell.label}</Badge><Badge color="gray" variant="light">{detail.cell.cohort}</Badge></Group>
            <Divider />
            {[
              ['Guardrail', detail.row.g],
              ['Status', detail.row.v[detail.cell.key]],
              ['Evidence', 'Derived from plan document, payroll + recordkeeping feeds, and the strategy config.'],
              ['Owner', /Notice|QDIA/.test(detail.row.g) ? 'Compliance / fiduciary' : /cost/i.test(detail.row.g) ? 'Cost owner' : 'Plan ops'],
              ['Required fix', /Block/i.test(detail.row.v[detail.cell.key]) ? 'Complete required variables: effective date, default deferral, QDIA label, opt-out path.' : 'None — within tolerance.'],
              ['Impact if unresolved', /Block/i.test(detail.row.v[detail.cell.key]) ? 'This cell cannot deploy until resolved.' : 'Monitored; no launch impact.'],
              ['Suggested alternative', /Block/i.test(detail.row.v[detail.cell.key]) ? 'Run the Education-only cell while the notice package is completed.' : '—'],
            ].map(([k, val]) => (
              <Box key={k}><Text size="10px" tt="uppercase" c="dimmed" fw={700}>{k}</Text><Text size="xs">{val}</Text></Box>
            ))}
          </Stack>
        )}
      </Drawer>
    </Stack>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Screen 11 — Multi-Package Launch Kit Factory
// ══════════════════════════════════════════════════════════════════════════
const KIT_PACKAGES = [
  { id: 'auto_enrollment', label: 'Auto Enrollment', cohort: 'Eligible nonparticipants', channel: 'Email + portal + notices', version: 'AE-v1.2', owner: 'Plan ops', status: 'In review', missing: 'Effective date, QDIA label', claims: 'Enrollment default + opt-out', dep: 'Notice pack', color: 'orange',
    assets: ['Committee deck section', 'Participant email', 'Portal guided flow', 'Auto-enroll notice', 'QDIA notice', 'Payroll kit'] },
  { id: 'match_stretch', label: 'Match Stretch', cohort: 'Below-match participants', channel: 'Email + portal calculator', version: 'MS-v1.1', owner: 'Payroll owner', status: 'Approved', missing: '—', claims: 'Match formula comparison', dep: 'Cost review', color: 'blue',
    assets: ['Committee deck section', 'Match education email', 'Portal match explainer', 'Payroll formula checklist'] },
  { id: 'auto_escalation', label: 'Auto Escalation', cohort: 'Stuck-at-default', channel: 'Email + portal preview', version: 'AES-v1.0', owner: 'Payroll owner', status: 'In review', missing: 'Escalation cap', claims: 'Schedule + cap explanation', dep: 'Notice draft', color: 'teal',
    assets: ['Escalation email', 'Portal contribution preview', 'Escalation notice', 'Payroll schedule'] },
  { id: 'reenrollment', label: 'Re-enrollment', cohort: 'Legacy elections', channel: 'Email + portal + notices', version: 'RE-v0.9', owner: 'Compliance', status: 'Pending', missing: 'QDIA draft', claims: 'Election reset + default invest.', dep: 'Fiduciary review', color: 'grape',
    assets: ['Re-enrollment notice', 'QDIA draft', 'Portal confirmation flow'] },
  { id: 'education', label: 'Education-only', cohort: 'Low-readiness', channel: 'Email + FAQ', version: 'EDU-v1.0', owner: 'Content owner', status: 'Approved', missing: '—', claims: 'Readiness education (no plan change)', dep: 'Content review', color: 'green',
    assets: ['Education email', 'FAQ', 'Portal article'] },
  { id: 'holdout', label: 'Holdout / measurement', cohort: 'Holdout', channel: 'Suppressed', version: 'M-v1.0', owner: 'Measurement owner', status: 'Locked', missing: '—', claims: 'None (measurement only)', dep: 'Measurement plan', color: 'gray',
    assets: ['Measurement plan', 'Suppression list', 'Readout template'] },
]
const APPROVED_CLAIMS = [
  { label: 'Claims approved for committee deck', color: 'green' },
  { label: 'Claims approved for participant content', color: 'green' },
  { label: 'Claims requiring substantiation', color: 'yellow' },
  { label: 'Simulation claims marked "projected"', color: 'violet' },
  { label: 'Holdout-measured claims — released only after Learn phase', color: 'gray' },
]

export function LaunchKitFactory({ onContinue }) {
  const [tab, setTab] = useState('auto_enrollment')
  const pkg = KIT_PACKAGES.find(p => p.id === tab)
  const statusColor = (s) => s === 'Approved' ? 'green' : s === 'Pending' ? 'yellow' : s === 'Locked' ? 'gray' : 'orange'
  return (
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon size="sm" variant="light" color="grape"><IconPackage size={12} /></ThemeIcon>
        <Text size="sm" fw={700}>Multi-Package Launch Kit Factory</Text>
        <Badge size="xs" variant="light" color="grape">Separate asset bundles per cohort-strategy cell</Badge>
      </Group>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {/* Left — package tabs */}
        <Paper withBorder p="sm" radius="md">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Strategy packages</Text>
          <Tabs value={tab} onChange={setTab} orientation="vertical" variant="pills" color="grape">
            <Tabs.List>{KIT_PACKAGES.map(p => <Tabs.Tab key={p.id} value={p.id}>{p.label}</Tabs.Tab>)}</Tabs.List>
          </Tabs>
        </Paper>
        {/* Center — asset card for selected package */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${pkg.color}-5)` }}>
          <Stack gap="xs">
            <Group justify="space-between"><Text size="sm" fw={700}>{pkg.label}</Text><Badge size="xs" color={statusColor(pkg.status)} variant="light">{pkg.status}</Badge></Group>
            <SimpleGrid cols={2} spacing={4}>
              <Text size="10px" c="dimmed">Cohort: <Text span fw={600} c="dark">{pkg.cohort}</Text></Text>
              <Text size="10px" c="dimmed">Channel: <Text span fw={600} c="dark">{pkg.channel}</Text></Text>
              <Text size="10px" c="dimmed">Version: <Text span fw={600} c="dark">{pkg.version}</Text></Text>
              <Text size="10px" c="dimmed">Owner: <Text span fw={600} c="dark">{pkg.owner}</Text></Text>
              <Text size="10px" c="dimmed">Missing vars: <Text span fw={600} c={pkg.missing === '—' ? 'dark' : 'orange'}>{pkg.missing}</Text></Text>
              <Text size="10px" c="dimmed">Dependency: <Text span fw={600} c="dark">{pkg.dep}</Text></Text>
            </SimpleGrid>
            <Divider label="Required assets" labelPosition="left" />
            <Stack gap={4}>{pkg.assets.map(a => <Group key={a} gap={6}><ThemeIcon size="xs" radius="xl" variant="light" color={pkg.color}><IconCheck size={9} /></ThemeIcon><Text size="xs">{a}</Text></Group>)}</Stack>
            <Text size="10px" c="dimmed" mt={4}>Approved claims: {pkg.claims}</Text>
          </Stack>
        </Paper>
        {/* Right — approved claims panel */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-teal-5)' }}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Approved-claims panel</Text>
          <Stack gap={6}>{APPROVED_CLAIMS.map(c => <Group key={c.label} gap="xs" wrap="nowrap"><Badge size="xs" color={c.color} variant="light" style={{ flexShrink: 0 }}>●</Badge><Text size="xs">{c.label}</Text></Group>)}</Stack>
          <Alert color="grape" variant="light" mt="md" p="xs"><Text size="10px">One sponsor committee deck is generated: portfolio-level rationale + a strategy page per segment.</Text></Alert>
        </Paper>
      </SimpleGrid>
      {onContinue && (
        <Button size="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 135 }} style={{ alignSelf: 'flex-end' }} onClick={onContinue}>
          Send kits to deployment →
        </Button>
      )}
    </Stack>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Screen 12 — Parallel Strategy Deployment Control Tower
// ══════════════════════════════════════════════════════════════════════════
const LANES = [
  { id: 'L1', cohort: 'Eligible nonparticipants', strategy: 'Auto Enrollment', channel: 'Email + portal + notices', version: 'AE-v1.2', treat: 10620, hold: 1180, status: 'Scheduled', owner: 'Plan ops', color: 'orange' },
  { id: 'L2', cohort: 'Below-match participants', strategy: 'Match Stretch', channel: 'Email + portal', version: 'MS-v1.1', treat: 5580, hold: 620, status: 'Ready', owner: 'Payroll owner', color: 'blue' },
  { id: 'L3', cohort: 'Stuck-at-default', strategy: 'Auto Escalation', channel: 'Email + portal', version: 'AES-v1.0', treat: 5220, hold: 580, status: 'Blocked', owner: 'Payroll owner', color: 'teal' },
  { id: 'L4', cohort: 'Legacy elections', strategy: 'Re-enrollment', channel: 'Email + notices + portal', version: 'RE-v0.9', treat: 4230, hold: 470, status: 'Pending review', owner: 'Compliance', color: 'grape' },
  { id: 'L5', cohort: 'Low-readiness', strategy: 'Education-only', channel: 'Email + FAQ', version: 'EDU-v1.0', treat: 3060, hold: 340, status: 'Ready', owner: 'Content owner', color: 'green' },
  { id: 'H',  cohort: 'Measurement control', strategy: 'Holdout', channel: 'Suppressed', version: 'M-v1.0', treat: 0, hold: 4200, status: 'Locked', owner: 'Measurement owner', color: 'gray' },
]
const laneColor = (s) => s === 'Ready' ? 'green' : s === 'Scheduled' ? 'blue' : s === 'Blocked' ? 'red' : s === 'Locked' ? 'gray' : 'yellow'
const CONNECTORS = ['SFMC / Adobe Campaign', 'AJO', 'CRM / Dynamics', 'Secure-site personalization', 'Mobile push', 'Recordkeeping / payroll']

export function DeploymentControlTower({ onContinue }) {
  return (
    <Stack gap="md">
      <Group gap="xs">
        <ThemeIcon size="sm" variant="light" color="orange"><IconRocket size={12} /></ThemeIcon>
        <Text size="sm" fw={700}>Parallel Strategy Deployment Control Tower</Text>
        <Badge size="xs" variant="light" color="orange">Lane-based · holdout preserved</Badge>
      </Group>
      <Group gap={6}>{CONNECTORS.map(c => <Badge key={c} size="xs" variant="outline" color="gray">{c}</Badge>)}</Group>
      <Paper withBorder radius="md" style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 960 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Lane</Table.Th><Table.Th>Cohort</Table.Th><Table.Th>Strategy</Table.Th><Table.Th>Channel</Table.Th>
              <Table.Th>Asset ver.</Table.Th><Table.Th ta="right">Treatment</Table.Th><Table.Th ta="right">Holdout</Table.Th>
              <Table.Th>Status</Table.Th><Table.Th>Owner</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {LANES.map(l => (
              <Table.Tr key={l.id}>
                <Table.Td fw={700}>{l.id}</Table.Td>
                <Table.Td><Group gap={6} wrap="nowrap"><div style={{ width: 3, height: 20, borderRadius: 2, background: `var(--mantine-color-${l.color}-5)` }} /><Text size="xs" fw={600}>{l.cohort}</Text></Group></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color={l.color}>{l.strategy}</Badge></Table.Td>
                <Table.Td c="dimmed">{l.channel}</Table.Td>
                <Table.Td c="dimmed">{l.version}</Table.Td>
                <Table.Td ta="right">{l.treat ? l.treat.toLocaleString() : '—'}</Table.Td>
                <Table.Td ta="right" c="violet" fw={600}>{l.hold.toLocaleString()}</Table.Td>
                <Table.Td><Badge size="xs" variant="light" color={laneColor(l.status)}>{l.status}</Badge></Table.Td>
                <Table.Td c="dimmed">{l.owner}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
      <Group gap="xs">
        {['Launch all approved lanes', 'Launch selected lanes', 'Pause lane', 'Roll back lane', 'Replace blocked lane with fallback', 'Export treatment/holdout files', 'View channel eligibility', 'View suppression reasons'].map(c => (
          <Button key={c} size="compact-xs" variant="light" color="gray">{c}</Button>
        ))}
      </Group>
      <Alert color="teal" variant="light" p="xs" icon={<IconInfoCircle size={14} />}>
        <Text size="xs">Approved lanes (L2, L5) can launch now; blocked/pending lanes (L3, L4) stay queued. Holdout cell H stays locked and suppressed for causal measurement.</Text>
      </Alert>
      {onContinue && (
        <Button size="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 135 }} style={{ alignSelf: 'flex-end' }} onClick={onContinue}>
          Launch approved lanes →
        </Button>
      )}
    </Stack>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Screen 13 — Portfolio Learning & Policy Update
// ══════════════════════════════════════════════════════════════════════════
const LEARN_DASH = [
  { label: 'Portfolio status', value: 'On track', color: 'green' },
  { label: 'Measurement window', value: '60 days', color: 'gray' },
  { label: 'Treatment cells', value: '5', color: 'teal' },
  { label: 'Holdout cells', value: '5 / 6', color: 'grape' },
  { label: 'Participation lift vs holdout', value: '+13.8pp', color: 'green' },
  { label: 'Deferral lift vs holdout', value: '+1.2pp', color: 'blue' },
  { label: 'Employer cost variance', value: '−2% vs plan', color: 'orange' },
  { label: 'Fairness movement', value: '+ improves', color: 'pink' },
  { label: 'Prediction accuracy', value: '92%', color: 'violet' },
  { label: 'Reusable policy readiness', value: '4 / 6 cells', color: 'teal' },
]
const LEARN_ROWS = [
  { cohort: 'Eligible nonparticipants', strategy: 'Auto Enrollment', pred: '+13pp', treat: '81%', hold: '67%', lift: '+14pp', cost: '+0.35%', rec: 'Scale', recColor: 'green', color: 'orange' },
  { cohort: 'Below-match participants', strategy: 'Match Stretch', pred: '+0.9pp def.', treat: '6.1%', hold: '5.1%', lift: '+1.0pp def.', cost: '+0.02%', rec: 'Refine formula', recColor: 'yellow', color: 'blue' },
  { cohort: 'Stuck-at-default', strategy: 'Auto Escalation', pred: '+1.0pp def.', treat: '6.3%', hold: '5.2%', lift: '+1.1pp def.', cost: '+0.15%', rec: 'Continue', recColor: 'teal', color: 'teal' },
  { cohort: 'Legacy elections', strategy: 'Re-enrollment', pred: '+6pp', treat: '88%', hold: '82%', lift: '+6pp', cost: '+0.10%', rec: 'Governance review', recColor: 'grape', color: 'grape' },
  { cohort: 'Low-readiness', strategy: 'Education-only', pred: '+1pp', treat: '58%', hold: '57%', lift: '+1pp', cost: '+0.01%', rec: 'Promote / retire', recColor: 'orange', color: 'green' },
  { cohort: 'Holdout', strategy: 'No-action', pred: 'Baseline', treat: '—', hold: 'Baseline', lift: '—', cost: '—', rec: 'Preserve', recColor: 'gray', color: 'gray' },
]
const LEARN_INSIGHTS = [
  { k: 'Scale candidate', v: 'Cells with positive incremental lift, acceptable cost variance, and guardrail pass — e.g. Auto Enrollment / nonparticipants.', c: 'green' },
  { k: 'Refine candidate', v: 'Positive lift but cost or fairness outside tolerance — e.g. Match Stretch / below-match.', c: 'yellow' },
  { k: 'Stop candidate', v: 'Weak lift or excessive operational / compliance friction — e.g. Education-only if enrollment starts are flat.', c: 'red' },
  { k: 'Policy candidate', v: 'Reusable rule: "If a nonparticipant cohort has high portal readiness and notice readiness is complete, recommend Auto Enrollment + portal guided flow."', c: 'violet' },
]

export function PortfolioLearning() {
  return (
    <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-teal-5)' }}>
      <Stack gap="md">
        <Group gap="xs">
          <ThemeIcon size="sm" variant="light" color="teal"><IconBrain size={12} /></ThemeIcon>
          <Text size="sm" fw={700}>Portfolio Learning & Policy Update</Text>
          <Badge size="xs" variant="light" color="teal">Portfolio · strategy · cohort levels</Badge>
        </Group>
        <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
          {LEARN_DASH.map(d => (
            <Paper key={d.label} withBorder p="sm" radius="md" style={{ borderTop: `3px solid var(--mantine-color-${d.color}-5)` }}>
              <Stack gap={2}><Text size="sm" fw={900} c={d.color} style={{ lineHeight: 1 }}>{d.value}</Text><Text size="10px" c="dimmed" style={{ lineHeight: 1.2 }}>{d.label}</Text></Stack>
            </Paper>
          ))}
        </SimpleGrid>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 960 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Cohort</Table.Th><Table.Th>Strategy</Table.Th><Table.Th>Predicted</Table.Th>
                <Table.Th>Treatment</Table.Th><Table.Th>Holdout</Table.Th><Table.Th>Incremental lift</Table.Th>
                <Table.Th>Cost var.</Table.Th><Table.Th>Recommendation</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {LEARN_ROWS.map(r => (
                <Table.Tr key={r.cohort}>
                  <Table.Td><Group gap={6} wrap="nowrap"><div style={{ width: 3, height: 20, borderRadius: 2, background: `var(--mantine-color-${r.color}-5)` }} /><Text size="xs" fw={600}>{r.cohort}</Text></Group></Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color={r.color}>{r.strategy}</Badge></Table.Td>
                  <Table.Td c="dimmed">{r.pred}</Table.Td>
                  <Table.Td fw={600}>{r.treat}</Table.Td>
                  <Table.Td c="dimmed">{r.hold}</Table.Td>
                  <Table.Td fw={700} c="green">{r.lift}</Table.Td>
                  <Table.Td c="dimmed">{r.cost}</Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color={r.recColor}>{r.rec}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          {LEARN_INSIGHTS.map(i => (
            <Paper key={i.k} withBorder p="sm" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${i.c}-5)` }}>
              <Text size="xs" fw={700} c={i.c}>{i.k}</Text><Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{i.v}</Text>
            </Paper>
          ))}
        </SimpleGrid>
        <Alert color="teal" variant="light" p="xs" icon={<IconInfoCircle size={14} />}>
          <Text size="xs">Learning updates the segment-to-strategy allocation rules for the next cycle — not just a saved campaign template.</Text>
        </Alert>
      </Stack>
    </Paper>
  )
}
