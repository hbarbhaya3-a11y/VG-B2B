import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider, Alert, Table, Tabs, Progress, Accordion, Loader, List } from '@mantine/core'
import { AreaChart, BarChart } from '@mantine/charts'
import { IconChevronRight, IconActivity, IconTrendingUp, IconRefresh, IconDownload, IconChartBar, IconTarget, IconBrain, IconCheck, IconClipboardCheck, IconShieldCheck } from '@tabler/icons-react'
import { buildPlanRecommendation } from '../../../utils/planNarrative'
import { getPlanDesign } from '../../../data/planDesign'
import PanelGuide from '../../ui/PanelGuide'

/**
 * OutcomeCohortPanel — LEARN stage, scenario-contextual.
 * Contract (step.panelData.outcome):
 *   {
 *     headline: string,                                // big statement of the outcome
 *     headlineValue: string,                           // "$2.8B"
 *     headlineCaption: string,                         // "AUM protected"
 *     outcomes: [{ label, treatment, holdout, delta }],// 3-5 key rows
 *     trend: [{ week: string, treatment: number, holdout: number }],  // time-series
 *     trendUnit?: string,                              // "%" or raw
 *     trendLabel?: string,                             // axis label
 *     recalibration: { priorLabel, priorBefore, priorAfter, note },
 *     episode: { id, title, contribution },            // what was added to the episode library
 *   }
 */

function DeltaBadge({ delta }) {
  if (!delta) return null
  const negative = String(delta).trim().startsWith('-')
  return (
    <Badge size="sm" variant="light" color={negative ? 'red' : 'teal'} leftSection={<IconTrendingUp size={10} style={{ transform: negative ? 'rotate(180deg)' : 'none' }} />}>
      {delta}
    </Badge>
  )
}

const MEASURING_LINES = [
  'Collecting treatment vs holdout outcomes…',
  'Running Shapley attribution analysis…',
  'Computing confidence intervals…',
  'Recalibrating twin behavioral priors…',
  'Archiving episode to learning system…',
]

export default function OutcomeCohortPanel({ step, onContinue, onExit, activeUseCase, workflowState }) {
  const pd = step?.panelData?.outcome || {}
  const outcomes = pd.outcomes || []
  const trend = pd.trend || []
  const trendUnit = pd.trendUnit || ''
  const recal = pd.recalibration
  const episode = pd.episode

  // Plan-design recommendation block — only renders when the panelData declares
  // a recommendation, OR when workflowState carries a live selectedConfig.
  // Live path supersedes panelData per plan §"Logical-flow integrity".
  const liveSelected = workflowState?.selectedConfig
  const liveRail6 = workflowState?.rail6Output
  const planDesignId = step?.panelData?.planDesignId || pd?.recommendation?.planDesignId
  const baseline = planDesignId ? getPlanDesign(planDesignId) : null
  const showRecommendation = !!(liveSelected || pd.recommendation)

  let recommendationData = null
  if (liveSelected && baseline) {
    const built = buildPlanRecommendation({ baseline, selected: liveSelected, rail6Output: liveRail6 })
    recommendationData = {
      planName: baseline.planName,
      summary: built.summary,
      changedParameters: built.changedParameters,
      nextSteps: built.nextSteps,
      timeline: built.timeline,
      projectedKpis: liveSelected.outcomes,
      observedKpis: pd.recommendation?.observedKpis || null,
    }
  } else if (pd.recommendation) {
    recommendationData = pd.recommendation
  }

  const [phase, setPhase] = useState('measuring')
  const [lineIdx, setLineIdx] = useState(0)

  useEffect(() => {
    if (phase !== 'measuring') return
    const interval = setInterval(() => {
      setLineIdx(l => {
        if (l >= MEASURING_LINES.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('complete'), 400)
          return l
        }
        return l + 1
      })
    }, 400)
    return () => clearInterval(interval)
  }, [phase])

  if (phase === 'measuring') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="lg">
          <Loader size="lg" color="grape" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Measuring outcomes…</Text>
            {MEASURING_LINES.slice(0, lineIdx + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < lineIdx
                  ? <ThemeIcon size="xs" color="teal" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="grape" />
                }
                <Text size="xs" c={i < lineIdx ? 'teal' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(lineIdx / Math.max(1, MEASURING_LINES.length - 1)) * 100} color="grape" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  const guide = step?.panelData?.panelGuide

  return (
    <Stack gap="md">
      {guide && <PanelGuide {...guide} />}
      <Alert color="grape" variant="light" icon={<IconActivity size={16} />} radius="md">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Stack gap={0}>
            <Text size="sm" fw={700}>Outcome measured — closed-loop learning</Text>
            <Text size="xs" c="dimmed">Twin behavioral priors recalibrated; pattern added to episode library.</Text>
          </Stack>
          <Badge size="sm" color="grape" variant="filled">LEARN</Badge>
        </Group>
      </Alert>

      {/* Hero */}
      <Paper withBorder p="lg" radius="md"
        style={{ background: 'linear-gradient(135deg, var(--mantine-color-grape-light), transparent 85%)' }}>
        <Stack gap={4} align="center">
          <Text size="11px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
            {pd.headlineCaption || 'Outcome'}
          </Text>
          <Text size="42px" fw={800} c="grape.8" lh={1}>{pd.headlineValue || '—'}</Text>
          <Text size="sm" c="dimmed" ta="center" maw={700}>{pd.headline || 'Scenario outcome vs. holdout'}</Text>
        </Stack>
      </Paper>

      {showRecommendation && recommendationData && (
        <PlanRecommendationBlock data={recommendationData} planName={recommendationData.planName} />
      )}

      {/* Two-tab deep view — Output Tracking + Outcome KPIs */}
      <Tabs defaultValue="outcomes" radius="md" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="output" leftSection={<IconChartBar size={14} />}>Output Tracking</Tabs.Tab>
          <Tabs.Tab value="outcomes" leftSection={<IconTarget size={14} />}>Outcome KPIs</Tabs.Tab>
        </Tabs.List>

        {/* Tab 1 — Output Tracking (content delivery metrics) */}
        <Tabs.Panel value="output" pt="md">
          <Stack gap="md">
            {pd.outputTracking ? (
              <>
                <SimpleGrid cols={4} spacing="sm">
                  {(pd.outputTracking.kpis || []).map(k => (
                    <Paper key={k.label} withBorder p="sm" radius="md">
                      <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>{k.label}</Text>
                      <Text size="lg" fw={800} c={k.color || 'teal'}>{k.value}</Text>
                      {k.sub && <Text size="10px" c="dimmed">{k.sub}</Text>}
                    </Paper>
                  ))}
                </SimpleGrid>
                {pd.outputTracking.contentActions && (
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" fw={700} mb="sm">Content actions breakdown</Text>
                    <BarChart
                      h={160}
                      data={pd.outputTracking.contentActions}
                      dataKey="type"
                      series={[{ name: 'count', color: 'teal.6' }]}
                      withBarValueLabel
                      tickLine="y"
                      barProps={{ radius: 4 }}
                    />
                  </Paper>
                )}
                {pd.outputTracking.participantSample && (
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" fw={700} mb="sm">Participant sample — delivery log</Text>
                    <Table withTableBorder striped fz="xs" verticalSpacing="xs">
                      <Table.Thead><Table.Tr>
                        <Table.Th>Participant</Table.Th><Table.Th>Tier</Table.Th><Table.Th>Content pushed</Table.Th><Table.Th>Opened</Table.Th><Table.Th>Engaged</Table.Th><Table.Th>Action taken</Table.Th>
                      </Table.Tr></Table.Thead>
                      <Table.Tbody>
                        {pd.outputTracking.participantSample.map(p => (
                          <Table.Tr key={p.name}>
                            <Table.Td><Text size="xs" fw={600}>{p.name}</Text></Table.Td>
                            <Table.Td><Badge size="xs" color={p.tierColor || 'gray'} variant="light">Tier {p.tier}</Badge></Table.Td>
                            <Table.Td><Text size="xs">{p.content}</Text></Table.Td>
                            <Table.Td><Text size="xs" c={p.opened ? 'teal' : 'dimmed'}>{p.opened ? 'Yes' : 'No'}</Text></Table.Td>
                            <Table.Td><Text size="xs" c={p.engaged ? 'teal' : 'dimmed'}>{p.engaged ? 'Yes' : 'No'}</Text></Table.Td>
                            <Table.Td><Text size="xs" fw={600} c={p.action ? 'teal' : 'dimmed'}>{p.action || '—'}</Text></Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                )}
              </>
            ) : (
              <Paper withBorder p="md" radius="md">
                <Text size="xs" c="dimmed">Output tracking not available — upgrade panelData with outputTracking field.</Text>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>

        {/* Tab 2 — Outcome KPIs (the existing outcomes table + trend chart) */}
        <Tabs.Panel value="outcomes" pt="md">
          <Stack gap="md">
            {outcomes.length > 0 && (
              <Paper withBorder p="md" radius="md">
                <Group gap="xs" mb="xs">
                  <ThemeIcon size="sm" radius="xl" variant="light" color="teal"><IconTrendingUp size={12} /></ThemeIcon>
                  <Text fw={700} size="sm">Key outcomes vs. holdout</Text>
                </Group>
                <Table withTableBorder striped fz="xs" verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Metric</Table.Th><Table.Th>Treatment</Table.Th><Table.Th>Holdout</Table.Th><Table.Th>Delta</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {outcomes.map(o => (
                      <Table.Tr key={o.label}>
                        <Table.Td><Text size="xs" fw={600}>{o.label}</Text></Table.Td>
                        <Table.Td><Text size="xs" fw={700} c="teal.7">{o.treatment}</Text></Table.Td>
                        <Table.Td><Text size="xs" c="dimmed">{o.holdout}</Text></Table.Td>
                        <Table.Td><DeltaBadge delta={o.delta} /></Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            )}

            {trend.length > 0 && (
              <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="sm">
                  <Text fw={700} size="sm">{pd.trendLabel || 'Outcome over time — treatment vs. holdout'}</Text>
                  <Text size="xs" c="dimmed">{trend.length} data points</Text>
                </Group>
                <AreaChart
                  h={200}
                  data={trend}
                  dataKey="week"
                  withGradient
                  withDots={false}
                  series={[
                    { name: 'treatment', label: 'Treatment', color: 'teal.6' },
                    { name: 'holdout',   label: 'Holdout',   color: 'gray.5' },
                  ]}
                  curveType="monotone"
                  valueFormatter={v => trendUnit === '%' ? `${v}%` : trendUnit === '$M' ? `$${v}M` : v.toLocaleString()}
                  tickLine="xy"
                />
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Recalibration + episode */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {recal && (
          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs">
              <ThemeIcon size="sm" radius="xl" variant="light" color="violet"><IconRefresh size={12} /></ThemeIcon>
              <Text fw={700} size="sm">Twin recalibration</Text>
            </Group>
            <Stack gap={4}>
              <Text size="xs" c="dimmed">{recal.priorLabel || 'Behavioral prior updated'}</Text>
              <Group gap="lg" align="baseline">
                <Stack gap={0}>
                  <Text size="10px" c="dimmed">Before</Text>
                  <Text size="sm" fw={700}>{typeof recal.priorBefore === 'number' ? recal.priorBefore.toFixed(2) : recal.priorBefore}</Text>
                </Stack>
                <IconChevronRight size={14} style={{ color: 'var(--mantine-color-gray-5)' }} />
                <Stack gap={0}>
                  <Text size="10px" c="dimmed">After</Text>
                  <Text size="sm" fw={700} c="teal.7">{typeof recal.priorAfter === 'number' ? recal.priorAfter.toFixed(2) : recal.priorAfter}</Text>
                </Stack>
              </Group>
              {recal.note && <Text size="xs" c="dimmed" mt={4}>{recal.note}</Text>}
            </Stack>
          </Paper>
        )}
        {episode && (
          <Paper withBorder p="md" radius="md">
            <Group gap="xs" mb="xs">
              <ThemeIcon size="sm" radius="xl" variant="light" color="blue"><IconDownload size={12} /></ThemeIcon>
              <Text fw={700} size="sm">Episode added to TwinX library</Text>
            </Group>
            <Stack gap={4}>
              <Badge size="xs" variant="light" color="blue">Episode {episode.id || '—'}</Badge>
              <Text size="xs" fw={600}>{episode.title}</Text>
              <Text size="xs" c="dimmed">{episode.contribution}</Text>
            </Stack>
          </Paper>
        )}
      </SimpleGrid>

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">Workflow complete. You can exit or keep exploring scenarios.</Text>
        <Group gap="xs">
          {onContinue && <Button variant="default" onClick={onContinue}>Next step</Button>}
          {onExit && <Button color="teal" onClick={onExit} rightSection={<IconChevronRight size={14} />}>Exit to gallery</Button>}
        </Group>
      </Group>
    </Stack>
  )
}

// ─── Plan Recommendation Block (UC-E only) ───────────────────────────────────
// Renders the post-12-month recommendation summary for a plan-design redesign:
// changed-parameters table, projected-vs-observed KPI grid, narrative paragraph,
// and Rail-6 next-steps checklist.

function PlanRecommendationBlock({ data, planName }) {
  if (!data) return null
  const { summary, changedParameters = [], nextSteps = [], timeline, projectedKpis, observedKpis } = data

  const kpiRows = [
    { label: 'Participation rate', proj: projectedKpis?.participationRate, obs: observedKpis?.participationRate, format: 'pct' },
    { label: 'Avg deferral rate',  proj: projectedKpis?.avgDeferralRate,   obs: observedKpis?.avgDeferralRate,  format: 'pct' },
    { label: 'Annual sponsor cost', proj: projectedKpis?.annualSponsorCost, obs: observedKpis?.annualSponsorCost, format: 'cost' },
    { label: 'ADP test status',    proj: projectedKpis?.adpTestStatus,     obs: observedKpis?.adpTestStatus,    format: 'text' },
    { label: 'Competitive tier',   proj: projectedKpis?.competitiveTier,   obs: observedKpis?.competitiveTier,   format: 'text' },
  ]

  const fmt = (v, f) => {
    if (v == null) return '—'
    if (f === 'pct') return `${(v * 100).toFixed(1)}%`
    if (f === 'cost') return `$${(v / 1_000_000).toFixed(1)}M`
    return String(v).toUpperCase()
  }

  return (
    <Paper withBorder radius="md" p="md" style={{ borderLeft: '4px solid var(--mantine-color-vanguardRed-6)', background: 'var(--mantine-color-vanguardRed-light)' }}>
      <Stack gap="md">
        <Group gap={8}>
          <ThemeIcon size="md" radius="xl" variant="filled" color="vanguardRed">
            <IconClipboardCheck size={16} stroke={1.7} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={800}>Plan recommendation summary{planName ? ` — ${planName}` : ''}</Text>
            <Text size="11px" c="dimmed">Board-ready rollup of the redesign and its 12-month observed outcomes</Text>
          </Stack>
        </Group>

        {summary && (
          <Paper p="sm" radius="sm" style={{ background: 'white' }}>
            <Text size="sm" style={{ lineHeight: 1.55 }}>{summary}</Text>
          </Paper>
        )}

        {changedParameters.length > 0 && (
          <Paper p="sm" radius="sm" style={{ background: 'white' }}>
            <Stack gap={6}>
              <Text size="11px" c="dimmed" tt="uppercase" fw={600}>Changed parameters · from → to</Text>
              {changedParameters.map((c, i) => (
                <Group key={i} gap={6} wrap="nowrap">
                  <Text size="11px" fw={700} w={130}>{c.parameter}</Text>
                  <Text size="11px" c="dimmed">{c.from}</Text>
                  <IconChevronRight size={10} stroke={1.5} style={{ opacity: 0.5 }} />
                  <Text size="11px" fw={600} c="vanguardRed">{c.to}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

        {(projectedKpis || observedKpis) && (
          <Paper p="sm" radius="sm" style={{ background: 'white' }}>
            <Stack gap={6}>
              <Text size="11px" c="dimmed" tt="uppercase" fw={600}>Projected vs observed (12 months)</Text>
              <Table fz="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>KPI</Table.Th>
                    <Table.Th>Projected</Table.Th>
                    <Table.Th>Observed</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {kpiRows.map((r, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>{r.label}</Table.Td>
                      <Table.Td><Text size="11px">{fmt(r.proj, r.format)}</Text></Table.Td>
                      <Table.Td><Text size="11px" fw={observedKpis ? 700 : 400} c={observedKpis ? 'teal' : 'dimmed'}>{fmt(r.obs, r.format)}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Paper>
        )}

        {nextSteps.length > 0 && (
          <Paper p="sm" radius="sm" style={{ background: 'white' }}>
            <Stack gap={6}>
              <Group gap={6}>
                <ThemeIcon size="xs" variant="light" color="teal" radius="xl"><IconShieldCheck size={10} /></ThemeIcon>
                <Text size="11px" c="dimmed" tt="uppercase" fw={600}>Next steps · Rail 6 fiduciary closure</Text>
              </Group>
              <List size="xs" spacing={4}>
                {nextSteps.map((s, i) => <List.Item key={i}>{s}</List.Item>)}
              </List>
            </Stack>
          </Paper>
        )}

        {timeline && (
          <Group gap={6}>
            <Badge size="xs" variant="light" color="blue">Implementation timeline</Badge>
            <Text size="11px" c="dimmed">{timeline}</Text>
          </Group>
        )}
      </Stack>
    </Paper>
  )
}
