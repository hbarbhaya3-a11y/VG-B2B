import { useState } from 'react'
import {
  Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, Table, Chip, Alert, Box, Progress,
} from '@mantine/core'
import { IconChartBar, IconSparkles, IconInfoCircle, IconLayoutGrid, IconAdjustments } from '@tabler/icons-react'

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
