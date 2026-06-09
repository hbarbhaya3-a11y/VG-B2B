import { useEffect, useState, useMemo } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider, Alert, Loader, Progress, Tabs, Table, Pagination } from '@mantine/core'
import { BarChart, DonutChart } from '@mantine/charts'
import {
  IconChevronRight, IconChartBar, IconCheck, IconStars, IconAlertTriangle, IconPlayerPlay,
  IconLayoutGrid, IconUsers, IconTarget
} from '@tabler/icons-react'

/**
 * SimulationCohortPanel — simple, general-purpose simulation panel for any scenario.
 * Contract (all from step.panelData.simulation):
 *   {
 *     cohortSize: number,
 *     metric: { label: string, unit?: string },  // the primary outcome metric name/unit
 *     runningLines: string[],                    // (optional) progress lines during compute
 *     scenarios: [{
 *       id: string,                              // 'A' | 'B' | 'C'
 *       name: string,
 *       description: string,                     // plain-English summary
 *       predictedValue: number,                  // value on the primary metric axis
 *       predictedLabel?: string,                 // display override (e.g. "38%")
 *       confidence: number,                      // 0..1
 *       cost?: 'Low'|'Med'|'High',
 *       recommended?: boolean,
 *       caveat?: string,
 *     }],
 *     compareUnit?: string,                      // chart tick format (% or $M etc.)
 *   }
 */

const DEFAULT_RUNNING_LINES = [
  'Loading twin priors for this cohort…',
  'Fitting behavioral response curves…',
  'Running simulation iterations…',
  'Ranking scenarios by predicted impact…',
  'Calibrating confidence intervals…',
]

function formatValue(s, unit) {
  if (s.predictedLabel) return s.predictedLabel
  if (unit === '%') return `${Math.round(s.predictedValue * 100)}%`
  if (unit === '$M') return `$${s.predictedValue.toFixed(1)}M`
  if (unit === '$k') return `$${s.predictedValue.toFixed(0)}k`
  return s.predictedValue.toLocaleString()
}

function ScenarioCard({ scenario, selected, onSelect, unit }) {
  return (
    <Paper
      withBorder radius="md" p="md"
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        borderLeft: `3px solid var(--mantine-color-${scenario.recommended ? 'teal' : 'gray'}-5)`,
        background: selected
          ? 'linear-gradient(135deg, var(--mantine-color-violet-light), transparent 80%)'
          : 'white',
        boxShadow: selected ? '0 0 0 2px var(--mantine-color-violet-5)' : 'none',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Badge
              size="sm" color={scenario.recommended ? 'teal' : 'gray'}
              variant={scenario.recommended ? 'filled' : 'light'}
              leftSection={scenario.recommended ? <IconStars size={10} /> : null}
            >
              Scenario {scenario.id}
            </Badge>
            {scenario.recommended && <Badge size="xs" variant="outline" color="teal">Recommended</Badge>}
          </Group>
          {scenario.cost && <Badge size="xs" variant="light" color={scenario.cost === 'Low' ? 'teal' : scenario.cost === 'Med' ? 'blue' : 'orange'}>{scenario.cost} cost</Badge>}
        </Group>

        <Stack gap={0}>
          <Text fw={700} size="sm">{scenario.name}</Text>
          <Text size="xs" c="dimmed" lineClamp={3}>{scenario.description}</Text>
        </Stack>

        <Divider variant="dashed" my={2} />

        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
              Predicted
            </Text>
            <Text size="xl" fw={800} c={scenario.recommended ? 'teal' : 'violet'} lh={1}>
              {formatValue(scenario, unit)}
            </Text>
          </Stack>
          <Stack gap={0} align="flex-end">
            <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
              Confidence
            </Text>
            <Text size="sm" fw={700}>{Math.round(scenario.confidence * 100)}%</Text>
          </Stack>
        </Group>

        {scenario.caveat && (
          <Group gap={6} align="flex-start" wrap="nowrap">
            <IconAlertTriangle size={11} stroke={1.8} style={{ color: 'var(--mantine-color-yellow-7)', marginTop: 2, flexShrink: 0 }} />
            <Text size="10px" c="dimmed" lh={1.4}>{scenario.caveat}</Text>
          </Group>
        )}
      </Stack>
    </Paper>
  )
}

// ── Variant mini-card (shown during generating phase) ──
function VariantMiniCard({ v, idx }) {
  return (
    <Paper withBorder radius="md" p="xs"
      style={{ borderLeft: `3px solid var(--mantine-color-${v.recommended ? 'teal' : 'gray'}-4)` }}>
      <Stack gap={2}>
        <Group gap={4} wrap="nowrap">
          <Badge size="xs" variant="light" color="violet">#{idx + 1}</Badge>
          <Text size="10px" fw={600} truncate>{v.tone} · {v.framing}</Text>
          {v.recommended && <Badge size="xs" variant="filled" color="teal">Top</Badge>}
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2} lh={1.3}>{v.copy || v.description}</Text>
        <Group gap={4}>
          <Badge size="xs" variant="outline" color="gray">{v.channel}</Badge>
          {v.predictedLift && <Badge size="xs" variant="light" color="teal">{v.predictedLift}</Badge>}
        </Group>
      </Stack>
    </Paper>
  )
}

const GEN_LINES = [
  'Sampling hyperparameter grid (tone × framing × channel)…',
  'Generating content variants with controlled parameters…',
  'Applying compliance pre-screen…',
  'Scoring variants against twin behavioral models…',
  'Variants ready — ranking by predicted impact…',
]

// ── Participant-level prediction table (paginated, generated from segments) ──
const P_FIRST = ['Maya','Liam','Priya','Diego','Aisha','Jordan','Noah','Sofia','Chen','Ezra','Amara','Ravi','Ingrid','Omar','Lena','Miguel','Yuki','Kofi','Nina','Theo','Zara','Hiro','Iris','Malik','Elena','Arjun','Freya','Dante','Asha','Leo','Sana','Ben','Rosa','Caleb','Ayla','Finn']
const P_LAST = ['Okafor','Chen','Gupta','Rivera','Ahmed','Sato','Brennan','Park','Kowalski','Singh','Okoye','Diaz','Nguyen','Hall','Morales','Romano','Petrov','Kapoor','Lindqvist','Yamada','Haddad','Obi','Navarro','Patel','Shaw','Reyes','Kim','Tesfaye','Vogel','Iqbal']

function generateParticipantPredictions(segments) {
  if (!segments) return []
  const rows = []
  let idx = 0
  for (const seg of segments) {
    for (let i = 0; i < seg.count; i++) {
      const name = `${P_FIRST[(idx * 7 + i * 3) % P_FIRST.length]} ${P_LAST[(idx * 11 + i * 5) % P_LAST.length]}`
      const noise = ((idx * 17 + i * 31) % 20) - 10
      const engagement = Math.max(15, Math.min(99, seg.predicted + noise))
      const actionRate = Math.max(10, Math.min(95, Math.round(engagement * 0.82 + ((idx * 3) % 8) - 4)))
      rows.push({ name, tier: seg.label, tierColor: seg.color, channel: seg.channel, engagement, actionRate })
      idx++
    }
  }
  return rows
}

const PRED_PAGE = 25

function ParticipantPredictionTable({ segments, cohortSize }) {
  const [page, setPage] = useState(1)
  const [tierIdx, setTierIdx] = useState(-1)
  const allRows = useMemo(() => generateParticipantPredictions(segments), [segments])
  const filtered = tierIdx < 0 ? allRows : allRows.filter(r => r.tier === segments[tierIdx]?.label)
  const totalPages = Math.ceil(filtered.length / PRED_PAGE)
  const pageRows = filtered.slice((page - 1) * PRED_PAGE, page * PRED_PAGE)

  if (!segments || segments.length === 0) return null

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <Text size="xs" fw={700}>Participant-level predicted engagement</Text>
          <Badge size="xs" variant="light" color="violet">{filtered.length.toLocaleString()} participants</Badge>
        </Group>
        <Group gap={4}>
          <Badge size="xs" variant={tierIdx < 0 ? 'filled' : 'light'} color="gray" style={{ cursor: 'pointer' }}
            onClick={() => { setTierIdx(-1); setPage(1) }}>All</Badge>
          {segments.map((s, i) => (
            <Badge key={s.label} size="xs" variant={tierIdx === i ? 'filled' : 'light'} color={s.color || 'gray'}
              style={{ cursor: 'pointer' }} onClick={() => { setTierIdx(i); setPage(1) }}>{s.label}</Badge>
          ))}
        </Group>
      </Group>
      <Table withTableBorder striped fz="xs" verticalSpacing="xs">
        <Table.Thead><Table.Tr>
          <Table.Th>Participant</Table.Th><Table.Th>Segment</Table.Th><Table.Th>Channel</Table.Th><Table.Th>Pred. engagement</Table.Th><Table.Th>Pred. action rate</Table.Th>
        </Table.Tr></Table.Thead>
        <Table.Tbody>
          {pageRows.map((p, i) => (
            <Table.Tr key={i}>
              <Table.Td><Text size="xs" fw={600}>{p.name}</Text></Table.Td>
              <Table.Td><Badge size="xs" color={p.tierColor || 'gray'} variant="light">{p.tier}</Badge></Table.Td>
              <Table.Td><Text size="xs" c="dimmed">{p.channel}</Text></Table.Td>
              <Table.Td><Text size="xs" fw={700} c={p.engagement >= 70 ? 'teal' : p.engagement >= 50 ? 'blue' : 'orange'}>{p.engagement}%</Text></Table.Td>
              <Table.Td><Text size="xs" fw={700} c={p.actionRate >= 60 ? 'teal' : p.actionRate >= 40 ? 'blue' : 'orange'}>{p.actionRate}%</Text></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Group justify="space-between" mt="sm">
        <Text size="xs" c="dimmed">Showing {((page-1)*PRED_PAGE)+1}–{Math.min(page*PRED_PAGE, filtered.length)} of {filtered.length.toLocaleString()}</Text>
        <Pagination size="xs" total={totalPages} value={page} onChange={setPage} />
      </Group>
    </Paper>
  )
}

export default function SimulationCohortPanel({ step, onContinue, workflowState, setWorkflowState, activeUseCase }) {
  const pd = step?.panelData?.simulation || {}
  const scenarios = pd.scenarios || []
  const variants = pd.variants || []
  const unit = pd.compareUnit || '%'
  const cohortSize = pd.cohortSize
  const metric = pd.metric || { label: 'Predicted action rate', unit: '%' }
  const runningLines = pd.runningLines || DEFAULT_RUNNING_LINES
  const hasVariants = variants.length > 0

  // Phases: generating (optional, if variants) → running → results
  const [phase, setPhase] = useState(hasVariants ? 'generating' : 'running')
  const [genLine, setGenLine] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)

  // Phase 0: variant generation animation (if variants provided)
  useEffect(() => {
    if (phase !== 'generating') return
    const interval = setInterval(() => {
      setGenLine(l => {
        if (l >= GEN_LINES.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('variants_shown'), 400)
          return l
        }
        return l + 1
      })
    }, 350)
    return () => clearInterval(interval)
  }, [phase])

  // Auto-advance from variants_shown → running after 2s
  useEffect(() => {
    if (phase !== 'variants_shown') return
    const timer = setTimeout(() => setPhase('running'), 2000)
    return () => clearTimeout(timer)
  }, [phase])

  // Phase 1: simulation running animation
  useEffect(() => {
    if (phase !== 'running') return
    const interval = setInterval(() => {
      setLineIndex(l => {
        if (l >= runningLines.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('results'), 400)
          return l
        }
        return l + 1
      })
    }, 500)
    return () => clearInterval(interval)
  }, [phase, runningLines.length])

  // Default to the recommended scenario, not the first one
  const recommended = scenarios.find(s => s.recommended) || scenarios[0]
  const selectedId = workflowState?.selectedScenarioId
  const selected = scenarios.find(s => s.id === selectedId) || recommended

  useEffect(() => {
    // When results phase starts, always set to the recommended scenario
    if (phase === 'results' && recommended) {
      setWorkflowState?.(s => ({ ...s, selectedScenarioId: recommended.id }))
    }
  }, [phase])

  if (scenarios.length === 0) {
    return (
      <Alert color="yellow" variant="light" icon={<IconAlertTriangle size={16} />}>
        <Text size="sm" fw={600}>Scenarios not configured for this step.</Text>
        <Text size="xs" c="dimmed">Expected panelData.simulation.scenarios[].</Text>
      </Alert>
    )
  }

  // Phase 0a: generating animation
  if (phase === 'generating') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="lg">
          <Loader size="lg" color="orange" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Generating {variants.length || '…'} content variants{cohortSize ? ` for ${cohortSize.toLocaleString()} twin cohort` : ''}…</Text>
            {GEN_LINES.slice(0, genLine + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < genLine
                  ? <ThemeIcon size="xs" color="teal" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="orange" />
                }
                <Text size="xs" c={i < genLine ? 'teal' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(genLine / Math.max(1, GEN_LINES.length - 1)) * 100} color="orange" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  // Phase 0b: show generated variant cards briefly
  if (phase === 'variants_shown') {
    return (
      <Stack gap="md">
        <Paper withBorder p="sm" radius="md" style={{ background: 'var(--mantine-color-orange-light)' }}>
          <Group gap="xs" wrap="nowrap">
            <ThemeIcon size="sm" color="orange" variant="filled" radius="sm"><IconStars size={12} /></ThemeIcon>
            <Text size="sm" fw={700}>{variants.length} content variants generated</Text>
            <Badge size="xs" color="orange" variant="light">Previewing top {Math.min(4, variants.length)}</Badge>
          </Group>
        </Paper>
        <SimpleGrid cols={{ base: 1, md: 2, lg: Math.min(4, variants.length) }} spacing="sm">
          {variants.slice(0, 4).map((v, i) => <VariantMiniCard key={i} v={v} idx={i} />)}
        </SimpleGrid>
        <Group justify="center">
          <Loader size="xs" color="violet" />
          <Text size="xs" c="dimmed">Scoring variants against twin cohort…</Text>
        </Group>
      </Stack>
    )
  }

  if (phase === 'running') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="lg">
          <Loader size="lg" color="violet" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Running {scenarios.length}-scenario simulation{cohortSize ? ` against ${cohortSize.toLocaleString()} twin cohort` : ''}…</Text>
            {runningLines.slice(0, lineIndex + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < lineIndex
                  ? <ThemeIcon size="xs" color="teal" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="violet" />
                }
                <Text size="xs" c={i < lineIndex ? 'teal' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(lineIndex / Math.max(1, runningLines.length - 1)) * 100} color="violet" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  // Build comparison chart data
  const chartData = scenarios.map(s => ({
    scenario: `Scenario ${s.id}`,
    Predicted: Math.round(s.predictedValue * (unit === '%' ? 100 : 1) * 10) / 10,
  }))

  return (
    <Stack gap="md">
      <Paper withBorder p="sm" radius="md" style={{ background: 'var(--mantine-color-violet-light)' }}>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size="sm" color="violet" variant="filled" radius="sm"><IconChartBar size={12} /></ThemeIcon>
          <Text size="sm" fw={700}>{scenarios.length} scenarios generated</Text>
          <Badge size="xs" color="violet" variant="light">TwinX simulation complete</Badge>
          {cohortSize && <Badge size="xs" color="gray" variant="outline">{cohortSize.toLocaleString()} twins</Badge>}
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {scenarios.map(scenario => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            selected={selectedId === scenario.id}
            onSelect={() => setWorkflowState?.(s => ({ ...s, selectedScenarioId: scenario.id }))}
            unit={unit}
          />
        ))}
      </SimpleGrid>

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" align="center" mb="sm">
          <Text fw={700} size="sm">{metric.label} by scenario</Text>
          <Text size="xs" c="dimmed">Unit: {unit}</Text>
        </Group>
        <BarChart
          h={180}
          data={chartData}
          dataKey="scenario"
          series={[{ name: 'Predicted', color: 'violet.6' }]}
          withBarValueLabel
          valueFormatter={v => unit === '%' ? `${v}%` : unit === '$M' ? `$${v}M` : v.toString()}
          tickLine="y"
          barProps={{ radius: 6 }}
        />
      </Paper>

      {/* Deeper views — all logical cuts, reactive to selected scenario */}
      {(() => {
        // Scenario multiplier: adjusts all engagement numbers based on selected strategy
        const scenarioMult = selected
          ? (selected.predictedValue / Math.max(0.01, (recommended?.predictedValue || selected.predictedValue)))
          : 1
        const adj = (base) => Math.max(5, Math.min(99, Math.round(base * scenarioMult)))

        return (pd.contentBreakdown || pd.segmentBreakdown) && (
        <Tabs defaultValue="content" radius="md" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="content" leftSection={<IconLayoutGrid size={14} />}>Content × Channel</Tabs.Tab>
            <Tabs.Tab value="segments" leftSection={<IconUsers size={14} />}>By Segment</Tabs.Tab>
            <Tabs.Tab value="seg-channel">Segment × Channel</Tabs.Tab>
            <Tabs.Tab value="seg-content">Segment × Content</Tabs.Tab>
            <Tabs.Tab value="cross">Full Cross-Tab</Tabs.Tab>
            {pd.segmentBreakdown && <Tabs.Tab value="predicted" leftSection={<IconTarget size={14} />}>Predicted Engagement</Tabs.Tab>}
          </Tabs.List>

          <Tabs.Panel value="content" pt="md">
            {pd.contentBreakdown ? (
              <SimpleGrid cols={2} spacing="md">
                <Paper withBorder p="md" radius="md">
                  <Text size="xs" fw={700} mb="sm">Predicted impact by content type</Text>
                  <DonutChart
                    h={180}
                    data={(pd.contentBreakdown || []).map(c => ({ name: c.type, value: Math.round(c.impact * scenarioMult), color: c.color || 'teal.6' }))}
                    withLabels
                    labelsType="percent"
                    tooltipDataSource="segment"
                  />
                </Paper>
                <Paper withBorder p="md" radius="md">
                  <Text size="xs" fw={700} mb="sm">Content type response matrix</Text>
                  <Table withTableBorder striped fz="xs" verticalSpacing="xs">
                    <Table.Thead><Table.Tr>
                      <Table.Th>Content type</Table.Th><Table.Th>Channel</Table.Th><Table.Th>Pred. engagement</Table.Th><Table.Th>Confidence</Table.Th>
                    </Table.Tr></Table.Thead>
                    <Table.Tbody>
                      {(pd.contentBreakdown || []).map(c => (
                        <Table.Tr key={c.type}>
                          <Table.Td><Text size="xs" fw={600}>{c.type}</Text></Table.Td>
                          <Table.Td><Text size="xs" c="dimmed">{c.channel}</Text></Table.Td>
                          <Table.Td><Text size="xs" fw={700} c="teal">{adj(parseFloat(c.engagement))}%</Text></Table.Td>
                          <Table.Td><Badge size="xs" variant="light" color={parseFloat(c.confidence) >= 85 ? 'teal' : 'orange'}>{c.confidence}</Badge></Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Paper>
              </SimpleGrid>
            ) : <Text size="xs" c="dimmed">Content breakdown not available for this scenario.</Text>}
          </Tabs.Panel>

          <Tabs.Panel value="segments" pt="md">
            {pd.segmentBreakdown ? (
              <Stack gap="md">
                <BarChart
                  h={200}
                  data={(pd.segmentBreakdown || []).map(s => ({ segment: s.label, Predicted: adj(s.predicted) }))}
                  dataKey="segment"
                  series={[{ name: 'Predicted', color: 'violet.6' }]}
                  withBarValueLabel
                  valueFormatter={v => `${v}%`}
                  tickLine="y"
                  barProps={{ radius: 6 }}
                />
                <SimpleGrid cols={pd.segmentBreakdown.length} spacing="sm">
                  {(pd.segmentBreakdown || []).map(s => (
                    <Paper key={s.label} withBorder p="sm" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${s.color || 'gray'}-5)` }}>
                      <Stack gap={2}>
                        <Text size="xs" fw={700}>{s.label}</Text>
                        <Text size="xl" fw={800} c={s.color || 'teal'}>{adj(s.predicted)}%</Text>
                        <Text size="10px" c="dimmed">{s.count?.toLocaleString()} participants · {s.channel}</Text>
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            ) : <Text size="xs" c="dimmed">Segment breakdown not available.</Text>}
          </Tabs.Panel>

          {/* Segment × Channel */}
          <Tabs.Panel value="seg-channel" pt="md">
            {pd.segmentBreakdown && pd.contentBreakdown ? (
              <Stack gap="md">
                <Text size="xs" fw={700}>Predicted engagement: Segment × Channel</Text>
                <Table withTableBorder striped fz="xs" verticalSpacing="xs">
                  <Table.Thead><Table.Tr>
                    <Table.Th>Segment</Table.Th>
                    {[...new Set((pd.contentBreakdown || []).map(c => c.channel))].map(ch => (
                      <Table.Th key={ch}>{ch}</Table.Th>
                    ))}
                  </Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {(pd.segmentBreakdown || []).map(seg => {
                      const channels = [...new Set((pd.contentBreakdown || []).map(c => c.channel))]
                      return (
                        <Table.Tr key={seg.label}>
                          <Table.Td><Group gap={4}><div style={{ width: 8, height: 8, borderRadius: 2, background: `var(--mantine-color-${seg.color || 'gray'}-5)` }} /><Text size="xs" fw={600}>{seg.label}</Text></Group></Table.Td>
                          {channels.map(ch => {
                            const match = (pd.contentBreakdown || []).find(c => c.channel === ch)
                            const base = match ? parseFloat(match.engagement) : 0
                            const segAdj = (seg.predicted * scenarioMult) / 74
                            const val = Math.round(base * segAdj)
                            return <Table.Td key={ch}><Text size="xs" fw={700} c={val >= 60 ? 'teal' : val >= 40 ? 'blue' : 'orange'}>{val}%</Text></Table.Td>
                          })}
                        </Table.Tr>
                      )
                    })}
                  </Table.Tbody>
                </Table>
                <Text size="xs" c="dimmed">Cell values are predicted engagement rates from TwinX simulation, adjusted by segment propensity.</Text>
              </Stack>
            ) : <Text size="xs" c="dimmed">Cross-tab requires both segment and content breakdown data.</Text>}
          </Tabs.Panel>

          {/* Segment × Content */}
          <Tabs.Panel value="seg-content" pt="md">
            {pd.segmentBreakdown && pd.contentBreakdown ? (
              <Stack gap="md">
                <Text size="xs" fw={700}>Predicted engagement: Segment × Content Type</Text>
                <Table withTableBorder striped fz="xs" verticalSpacing="xs">
                  <Table.Thead><Table.Tr>
                    <Table.Th>Segment</Table.Th>
                    {(pd.contentBreakdown || []).map(c => (
                      <Table.Th key={c.type}>{c.type}</Table.Th>
                    ))}
                  </Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {(pd.segmentBreakdown || []).map(seg => (
                      <Table.Tr key={seg.label}>
                        <Table.Td><Group gap={4}><div style={{ width: 8, height: 8, borderRadius: 2, background: `var(--mantine-color-${seg.color || 'gray'}-5)` }} /><Text size="xs" fw={600}>{seg.label}</Text></Group></Table.Td>
                        {(pd.contentBreakdown || []).map(ct => {
                          const base = parseFloat(ct.engagement)
                          const segAdj = (seg.predicted * scenarioMult) / 74
                          const val = Math.round(base * segAdj)
                          return <Table.Td key={ct.type}><Text size="xs" fw={700} c={val >= 60 ? 'teal' : val >= 40 ? 'blue' : 'orange'}>{val}%</Text></Table.Td>
                        })}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
                <BarChart
                  h={200}
                  data={(pd.segmentBreakdown || []).map(seg => {
                    const row = { segment: seg.label }
                    ;(pd.contentBreakdown || []).forEach(ct => {
                      row[ct.type] = Math.round(parseFloat(ct.engagement) * seg.predicted * scenarioMult / 74)
                    })
                    return row
                  })}
                  dataKey="segment"
                  series={(pd.contentBreakdown || []).map((ct, i) => ({ name: ct.type, color: ct.color || ['teal.6','blue.6','violet.6','orange.5','grape.5'][i % 5] }))}
                  withBarValueLabel
                  valueFormatter={v => `${v}%`}
                  tickLine="y"
                  barProps={{ radius: 4 }}
                  type="stacked"
                />
              </Stack>
            ) : <Text size="xs" c="dimmed">Cross-tab requires both segment and content breakdown data.</Text>}
          </Tabs.Panel>

          {/* Full Cross-Tab: Segment × Content × Channel */}
          <Tabs.Panel value="cross" pt="md">
            {pd.segmentBreakdown && pd.contentBreakdown ? (
              <Stack gap="md">
                <Text size="xs" fw={700}>Full cross-tab: Segment × Content × Channel</Text>
                <Table withTableBorder striped fz="xs" verticalSpacing="xs">
                  <Table.Thead><Table.Tr>
                    <Table.Th>Segment</Table.Th><Table.Th>Content type</Table.Th><Table.Th>Channel</Table.Th><Table.Th>Participants</Table.Th><Table.Th>Pred. engagement</Table.Th><Table.Th>Pred. actions</Table.Th><Table.Th>Confidence</Table.Th>
                  </Table.Tr></Table.Thead>
                  <Table.Tbody>
                    {(pd.segmentBreakdown || []).flatMap(seg =>
                      (pd.contentBreakdown || []).map(ct => {
                        const segAdj = (seg.predicted * scenarioMult) / 74
                        const eng = Math.round(parseFloat(ct.engagement) * segAdj)
                        const actions = Math.round(seg.count * eng / 100)
                        return (
                          <Table.Tr key={`${seg.label}-${ct.type}`}>
                            <Table.Td><Group gap={4}><div style={{ width: 6, height: 6, borderRadius: 2, background: `var(--mantine-color-${seg.color || 'gray'}-5)` }} /><Text size="xs">{seg.label}</Text></Group></Table.Td>
                            <Table.Td><Text size="xs" fw={600}>{ct.type}</Text></Table.Td>
                            <Table.Td><Text size="xs" c="dimmed">{ct.channel}</Text></Table.Td>
                            <Table.Td><Text size="xs">{seg.count?.toLocaleString()}</Text></Table.Td>
                            <Table.Td><Text size="xs" fw={700} c={eng >= 60 ? 'teal' : eng >= 40 ? 'blue' : 'orange'}>{eng}%</Text></Table.Td>
                            <Table.Td><Text size="xs" fw={700}>{actions.toLocaleString()}</Text></Table.Td>
                            <Table.Td><Badge size="xs" variant="light" color={parseFloat(ct.confidence) >= 85 ? 'teal' : 'orange'}>{ct.confidence}</Badge></Table.Td>
                          </Table.Tr>
                        )
                      })
                    )}
                  </Table.Tbody>
                </Table>
                <Text size="xs" c="dimmed">
                  {(pd.segmentBreakdown || []).length} segments × {(pd.contentBreakdown || []).length} content types = {(pd.segmentBreakdown || []).length * (pd.contentBreakdown || []).length} combinations. Engagement rates adjusted by segment propensity from twin simulation.
                </Text>
              </Stack>
            ) : <Text size="xs" c="dimmed">Full cross-tab requires both segment and content breakdown data.</Text>}
          </Tabs.Panel>

          {pd.segmentBreakdown && (
            <Tabs.Panel value="predicted" pt="md">
              <Stack gap="md">
                <Paper withBorder p="md" radius="md">
                  <Text size="xs" fw={700} mb="sm">Predicted engagement across all {cohortSize?.toLocaleString() || '—'} participants</Text>
                  <Table withTableBorder striped fz="xs" verticalSpacing="xs">
                    <Table.Thead><Table.Tr>
                      <Table.Th>Segment</Table.Th><Table.Th>Participants</Table.Th><Table.Th>Channel</Table.Th><Table.Th>Pred. engagement</Table.Th><Table.Th>Pred. action rate</Table.Th><Table.Th>Est. actions</Table.Th>
                    </Table.Tr></Table.Thead>
                    <Table.Tbody>
                      {(pd.segmentBreakdown || []).map(s => (
                        <Table.Tr key={s.label}>
                          <Table.Td><Group gap={4}><div style={{ width: 8, height: 8, borderRadius: 2, background: `var(--mantine-color-${s.color || 'gray'}-5)` }} /><Text size="xs" fw={600}>{s.label}</Text></Group></Table.Td>
                          <Table.Td><Text size="xs">{s.count?.toLocaleString()}</Text></Table.Td>
                          <Table.Td><Text size="xs" c="dimmed">{s.channel}</Text></Table.Td>
                          <Table.Td><Text size="xs" fw={700} c="teal">{s.predicted}%</Text></Table.Td>
                          <Table.Td><Text size="xs" fw={700} c="violet">{Math.round(s.predicted * 0.85)}%</Text></Table.Td>
                          <Table.Td><Text size="xs" fw={700}>{Math.round(s.count * s.predicted / 100).toLocaleString()}</Text></Table.Td>
                        </Table.Tr>
                      ))}
                      <Table.Tr style={{ fontWeight: 700 }}>
                        <Table.Td><Text size="xs" fw={800}>Total</Text></Table.Td>
                        <Table.Td><Text size="xs" fw={800}>{(pd.segmentBreakdown || []).reduce((s, x) => s + (x.count || 0), 0).toLocaleString()}</Text></Table.Td>
                        <Table.Td></Table.Td>
                        <Table.Td><Text size="xs" fw={800} c="teal">{Math.round((pd.segmentBreakdown || []).reduce((s, x) => s + x.predicted * (x.count || 0), 0) / Math.max(1, (pd.segmentBreakdown || []).reduce((s, x) => s + (x.count || 0), 0)))}%</Text></Table.Td>
                        <Table.Td></Table.Td>
                        <Table.Td><Text size="xs" fw={800}>{(pd.segmentBreakdown || []).reduce((s, x) => s + Math.round(x.count * x.predicted / 100), 0).toLocaleString()}</Text></Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Paper>
                <ParticipantPredictionTable segments={pd.segmentBreakdown} cohortSize={cohortSize} />
              </Stack>
            </Tabs.Panel>
          )}
        </Tabs>
      )
      })()}

      {pd.sensitivityNote && (
        <Alert color="blue" variant="light" icon={<IconChartBar size={14} />} p="sm">
          <Text size="xs">{pd.sensitivityNote}</Text>
        </Alert>
      )}

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          Pick a scenario above. Your selection carries forward to the approval step.
        </Text>
        <Button onClick={onContinue} rightSection={<IconChevronRight size={14} />}>Continue to approval</Button>
      </Group>
    </Stack>
  )
}
