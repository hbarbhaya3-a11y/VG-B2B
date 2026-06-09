import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Accordion, Button, Alert, Divider, Progress, Tabs, Table, Loader } from '@mantine/core'
import { BarChart, AreaChart } from '@mantine/charts'
import { IconCheck, IconBrain, IconTrendingUp, IconUsers, IconCurrencyDollar, IconChartBar, IconListCheck, IconTarget } from '@tabler/icons-react'

const MEASURING_LINES = [
  'Measuring engagement outcomes (Days 1–7)…',
  'Measuring action outcomes (Days 7–30)…',
  'Measuring AUM outcomes (Days 30–90)…',
  'Comparing treatment vs. holdout control group…',
  'Attribution complete — archiving episode…',
]

function KpiBlock({ label, value, color = 'teal', sub }) {
  return (
    <Stack gap={2}>
      <Text size="xl" fw={800} c={color} style={{ lineHeight: 1 }}>{value}</Text>
      <Text size="xs" c="dimmed">{label}</Text>
      {sub && <Text size="xs" c={color}>{sub}</Text>}
    </Stack>
  )
}

function AcceptedBadge({ accepted }) {
  return (
    <Badge size="xs" color={accepted ? 'green' : 'red'} variant={accepted ? 'filled' : 'light'}>
      {accepted ? 'Accepted' : 'Declined'}
    </Badge>
  )
}

export default function AttributionPanel({ step, onExit }) {
  const pd = step.panelData
  const { engagement, action, aum, pnl, modelUpdate, outputTracking, outcomeSample, aumTrend } = pd
  const [phase, setPhase] = useState('measuring')
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (phase !== 'measuring') return
    const interval = setInterval(() => {
      setLineIndex(l => {
        if (l >= MEASURING_LINES.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('complete'), 400)
          return l
        }
        return l + 1
      })
    }, 450)
    return () => clearInterval(interval)
  }, [phase])

  if (phase === 'measuring') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="xl">
          <Loader size="lg" color="green" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Measuring outcomes…</Text>
            {MEASURING_LINES.slice(0, lineIndex + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < lineIndex
                  ? <ThemeIcon size="xs" color="green" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="green" />}
                <Text size="xs" c={i < lineIndex ? 'green' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(lineIndex / (MEASURING_LINES.length - 1)) * 100} color="green" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  const engagementData = [
    { segment: 'Tier 1', rate: Math.round(engagement.tier1 * 100) },
    { segment: 'Tier 2 (winner)', rate: Math.round(engagement.tier2WinnerRate ?? engagement.tier2VariantB * 100) },
    { segment: 'Tier 3', rate: Math.round(engagement.tier3 * 100) },
    { segment: 'Holdout', rate: Math.round(engagement.holdout * 100) },
  ]

  const actionFunnelData = [
    { step: 'Advisors targeted', count: 7900 },
    { step: 'Portfolio tool opens', count: action.portfolioToolOpens ?? 0 },
    { step: 'Wholesaler follow-ups', count: action.wholesalerFollowUps ?? 0 },
    { step: 'Rebalancing transactions', count: action.rebalancingTransactions ?? 0 },
  ]

  const ot = outputTracking
  const ca = ot.contentActions

  return (
    <Stack gap="md">
      {/* Workflow complete banner */}
      <Alert
        icon={<IconCheck size={20} stroke={2} />}
        color="green"
        variant="filled"
        title={pd.episodeTitle || 'Workflow Complete — VIX Spike Response Episode #19'}
      >
        <Text size="xs">
          Signal detected → Advisors targeted → Simulation run → Approved → Content generated → Compliance cleared → Deployed → Outcomes measured. Episode archived to TwinX.
        </Text>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="output" variant="outline" radius="md">
        <Tabs.List>
          <Tabs.Tab value="output" leftSection={<IconListCheck size={14} stroke={1.5} />}>
            Output tracking
          </Tabs.Tab>
          <Tabs.Tab value="outcomes" leftSection={<IconTarget size={14} stroke={1.5} />}>
            Outcome KPIs
          </Tabs.Tab>
        </Tabs.List>

        {/* Tab 1 — Output tracking */}
        <Tabs.Panel value="output" pt="md">
          <Stack gap="md">
            {/* KPI strip */}
            <SimpleGrid cols={4} spacing="md">
              <Paper withBorder p="md" radius="md">
                <KpiBlock label="Profiles pushed" value={ot.totalPushed.toLocaleString()} color="teal" />
              </Paper>
              <Paper withBorder p="md" radius="md">
                <KpiBlock
                  label="Content accepted"
                  value={ot.accepted.toLocaleString()}
                  color="green"
                  sub={`${Math.round(ot.acceptanceRate * 100)}% acceptance rate`}
                />
                <Progress value={ot.acceptanceRate * 100} color="green" size="xs" mt="xs" />
              </Paper>
              <Paper withBorder p="md" radius="md">
                <KpiBlock label="Feedback received" value={ot.feedbackReceived} color="blue" />
              </Paper>
              <Paper withBorder p="md" radius="md">
                <KpiBlock
                  label="Total content actions"
                  value={((ca.briefsOpened ?? 0) + (ca.emailsOpened ?? 0) + (ca.portalClicks ?? 0) + (ca.articlesRead ?? 0) + (ca.toolInteractions ?? 0) + (ca.wholesalerCalls ?? 0) + (ca.pdfsRedistributed ?? 0)).toLocaleString()}
                  color="violet"
                />
              </Paper>
            </SimpleGrid>

            {/* Content actions micro-grid */}
            <Paper withBorder p="md" radius="md">
              <Stack gap="sm">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Content actions breakdown</Text>
                <SimpleGrid cols={7} spacing="xs">
                  {[
                    { label: 'Briefs opened', value: ca.briefsOpened ?? 0, color: 'orange' },
                    { label: 'Emails opened', value: ca.emailsOpened ?? 0, color: 'blue' },
                    { label: 'Portal clicks', value: ca.portalClicks ?? 0, color: 'teal' },
                    { label: 'Articles read', value: ca.articlesRead ?? 0, color: 'violet' },
                    { label: 'Tool interactions', value: ca.toolInteractions ?? 0, color: 'indigo' },
                    { label: 'Wholesaler calls', value: ca.wholesalerCalls ?? 0, color: 'orange' },
                    { label: 'PDFs redistributed', value: ca.pdfsRedistributed ?? 0, color: 'green' },
                  ].map(({ label, value, color }) => (
                    <Paper key={label} withBorder p="xs" radius="md">
                      <Stack gap={2} align="center">
                        <Text size="lg" fw={800} c={color} style={{ lineHeight: 1 }}>{value}</Text>
                        <Text size="xs" c="dimmed" ta="center" style={{ lineHeight: 1.2 }}>{label}</Text>
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Paper>

            {/* Advisor sample table */}
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
              <Stack gap={0}>
                <Group px="md" py="sm" style={{ background: 'var(--mantine-color-default-hover)' }}>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
                    Advisor output sample — {ot.advisorSample.length} records
                  </Text>
                </Group>
                <Table striped highlightOnHover withTableBorder={false} fz="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Advisor</Table.Th>
                      <Table.Th>Firm</Table.Th>
                      <Table.Th>Tier</Table.Th>
                      <Table.Th>Content pushed</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Action</Table.Th>
                      <Table.Th>Feedback</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {ot.advisorSample.map((row, i) => {
                      const tierColors = { 1: 'orange', 2: 'blue', 3: 'teal' }
                      return (
                        <Table.Tr key={i}>
                          <Table.Td fw={600}>{row.name}</Table.Td>
                          <Table.Td c="dimmed">{row.firm}</Table.Td>
                          <Table.Td>
                            <Badge size="xs" color={tierColors[row.tier] ?? 'gray'} variant="light">T{row.tier}</Badge>
                          </Table.Td>
                          <Table.Td>{row.contentPushed}</Table.Td>
                          <Table.Td><AcceptedBadge accepted={row.accepted} /></Table.Td>
                          <Table.Td c={row.action === '—' ? 'dimmed' : undefined}>{row.action}</Table.Td>
                          <Table.Td c="dimmed" style={{ fontStyle: row.feedback ? 'italic' : 'normal' }}>
                            {row.feedback ?? '—'}
                          </Table.Td>
                        </Table.Tr>
                      )
                    })}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>

        {/* Tab 2 — Outcome KPIs */}
        <Tabs.Panel value="outcomes" pt="md">
          <Stack gap="md">
            {/* Hero banner */}
            <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-green-light)', borderLeft: '3px solid var(--mantine-color-green-5)' }}>
              <Group justify="space-between" align="center">
                <Stack gap={2}>
                  <Group gap="xs">
                    <Badge size="sm" color="green" variant="filled">Causal measurement</Badge>
                    <Badge size="sm" color="teal" variant="light">Treatment vs holdout · 30–90 days</Badge>
                  </Group>
                  <Text size="sm" fw={600}>Advisory Readiness Gap — Episode #1 · 42,000 participants · 4,200 holdout</Text>
                </Stack>
                <Text size="xs" c="dimmed">95% CI: {aum.ciLow}–{aum.ciHigh} bps vs holdout</Text>
              </Group>
            </Paper>

            {/* Primary KPI tiles — matches simulation results */}
            <SimpleGrid cols={4} spacing="sm">
              {[
                { label: 'Advisor appointment starts', value: '+440', sub: 'vs do-nothing baseline', color: 'green' },
                { label: 'AUM retained / protected',   value: '+$31.8M', sub: 'reduced leakage risk', color: 'violet' },
                { label: 'Idle cash activated',         value: '+$24.3M', sub: 'cash-to-investment', color: 'teal' },
                { label: 'Annual advisory revenue',     value: '+$391K', sub: 'annualized proxy', color: 'orange' },
              ].map(kpi => (
                <Paper key={kpi.label} withBorder p="md" radius="md" style={{ borderTop: `3px solid var(--mantine-color-${kpi.color}-5)` }}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>{kpi.label}</Text>
                    <Text size="xl" fw={900} c={kpi.color} style={{ lineHeight: 1 }}>{kpi.value}</Text>
                    <Text size="xs" c="dimmed">{kpi.sub}</Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>

            {/* Secondary KPIs */}
            <SimpleGrid cols={2} spacing="md">
              <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-green-5)' }}>
                <Stack gap="sm">
                  <Badge size="sm" color="green" variant="light">Business KPIs — actual vs projected</Badge>
                  <Divider />
                  <SimpleGrid cols={2} spacing="xs">
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">Portfolio review starts</Text>
                      <Text size="xl" fw={800} c="teal" style={{ lineHeight: 1 }}>4,973</Text>
                      <Text size="xs" c="dimmed">vs 1,928 baseline</Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">Digital Advisor assessment starts</Text>
                      <Text size="xl" fw={800} c="blue" style={{ lineHeight: 1 }}>851</Text>
                      <Text size="xs" c="dimmed">vs 293 baseline</Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">AUM into advice path</Text>
                      <Text size="xl" fw={800} c="green" style={{ lineHeight: 1 }}>$191M</Text>
                      <Text size="xs" c="dimmed">vs $60.7M baseline</Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">Complaint / opt-out rate</Text>
                      <Text size="xl" fw={800} c="gray" style={{ lineHeight: 1 }}>0.11%</Text>
                      <Text size="xs" c="dimmed">Within guardrail (&lt;0.20%)</Text>
                    </Stack>
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-blue-5)' }}>
                <Stack gap="sm">
                  <Badge size="sm" color="blue" variant="light">Engagement outcomes</Badge>
                  <Divider />
                  <SimpleGrid cols={2} spacing="xs">
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">Content acceptance</Text>
                      <Text size="xl" fw={800} c="teal" style={{ lineHeight: 1 }}>
                        {Math.round(ot.acceptanceRate * 100)}%
                      </Text>
                      <Text size="xs" c="dimmed">{ot.accepted.toLocaleString()} of {ot.totalPushed.toLocaleString()}</Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">Emails opened</Text>
                      <Text size="xl" fw={800} c="violet" style={{ lineHeight: 1 }}>
                        {(ca.emailsOpened ?? 0).toLocaleString()}
                      </Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">Tool interactions</Text>
                      <Text size="xl" fw={800} c="indigo" style={{ lineHeight: 1 }}>{(ca.toolInteractions ?? 0).toLocaleString()}</Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">Portal clicks</Text>
                      <Text size="xl" fw={800} c="green" style={{ lineHeight: 1 }}>{(ca.portalClicks ?? 0).toLocaleString()}</Text>
                    </Stack>
                  </SimpleGrid>
                </Stack>
              </Paper>
            </SimpleGrid>

            {/* AUM trend chart */}
            <Paper withBorder p="md" radius="md">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
                    AUM accumulation — treatment vs. holdout (12 weeks)
                  </Text>
                  <Group gap="md">
                    <Group gap={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--mantine-color-teal-5)' }} />
                      <Text size="xs" c="dimmed">Treatment group</Text>
                    </Group>
                    <Group gap={4}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--mantine-color-gray-4)' }} />
                      <Text size="xs" c="dimmed">Holdout baseline</Text>
                    </Group>
                  </Group>
                </Group>
                <AreaChart
                  h={200}
                  data={aumTrend}
                  dataKey="week"
                  series={[
                    { name: 'treatment', color: 'teal', label: 'Treatment ($M accumulation)' },
                    { name: 'holdout', color: 'gray', label: 'Holdout ($M accumulation)' },
                  ]}
                  withTooltip
                  withLegend={false}
                  fillOpacity={0.15}
                  yAxisProps={{ tickFormatter: (v) => `$${v}M` }}
                />
                <Text size="xs" c="dimmed" ta="center">
                  Treatment group diverges from holdout from Week 2, reaching +$49M incremental by Week 10 and stabilising.
                </Text>
              </Stack>
            </Paper>

            {/* Per-advisor sample */}
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
              <Stack gap={0}>
                <Group px="md" py="sm" style={{ background: 'var(--mantine-color-default-hover)' }}>
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Per-advisor KPIs — sample</Text>
                </Group>
                <Table striped highlightOnHover fz="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Advisor</Table.Th>
                      <Table.Th>Firm</Table.Th>
                      <Table.Th>Open rate</Table.Th>
                      <Table.Th>Click rate</Table.Th>
                      <Table.Th>Engagement</Table.Th>
                      <Table.Th>Impressions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {outcomeSample.map((row, i) => (
                      <Table.Tr key={i}>
                        <Table.Td fw={600}>{row.name}</Table.Td>
                        <Table.Td c="dimmed">{row.firm}</Table.Td>
                        <Table.Td fw={600} c={row.openRate >= 0.8 ? 'green' : row.openRate > 0 ? 'teal' : 'dimmed'}>
                          {Math.round(row.openRate * 100)}%
                        </Table.Td>
                        <Table.Td fw={600} c={row.clickRate >= 0.5 ? 'teal' : row.clickRate > 0 ? 'blue' : 'dimmed'}>
                          {Math.round(row.clickRate * 100)}%
                        </Table.Td>
                        <Table.Td fw={600} c={row.engagementRate >= 0.7 ? 'green' : row.engagementRate > 0 ? 'teal' : 'dimmed'}>
                          {Math.round(row.engagementRate * 100)}%
                        </Table.Td>
                        <Table.Td>{row.impressions}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Detailed breakdown (existing accordions) */}
      <Divider label="Detailed breakdown" labelPosition="left" />
      <Accordion variant="separated" radius="md">
        <Accordion.Item value="engagement">
          <Accordion.Control icon={<IconUsers size={16} stroke={1.5} />}>
            <Group gap="xs">
              <Text size="sm" fw={600}>Engagement outcomes — Days 1–7</Text>
              <Badge size="xs" color="teal" variant="light">Tier 1: {Math.round(engagement.tier1 * 100)}%</Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <SimpleGrid cols={4} spacing="sm">
                {[
                  { label: 'Tier 1', value: `${Math.round(engagement.tier1 * 100)}%`, sub: 'call + portal', color: 'orange' },
                  { label: 'Tier 2 (Variant B wins)', value: `${Math.round(engagement.tier2VariantB * 100)}%`, sub: `+${Math.round(engagement.tier2Lift * 100)}pp vs. Variant A`, color: 'blue' },
                  { label: 'Tier 3', value: `${Math.round(engagement.tier3 * 100)}%`, sub: 'portal click-through', color: 'teal' },
                  { label: 'Holdout baseline', value: `${Math.round(engagement.holdout * 100)}%`, sub: 'organic (causal control)', color: 'gray' },
                ].map(({ label, value, sub, color }) => (
                  <Paper key={label} withBorder p="sm" radius="md">
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">{label}</Text>
                      <Text size="xl" fw={800} c={color}>{value}</Text>
                      <Text size="xs" c="dimmed">{sub}</Text>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
              <BarChart
                h={180}
                data={engagementData}
                dataKey="segment"
                series={[{ name: 'rate', color: 'teal', label: 'Engagement rate (%)' }]}
                withTooltip
                withLegend={false}
                yAxisProps={{ tickFormatter: (v) => `${v}%` }}
                referenceLines={[{ y: Math.round(engagement.holdout * 100), label: 'Holdout baseline', color: 'gray' }]}
              />
              <Text size="xs" c="dimmed">
                Marketing Lab redistribution: {engagement.redistributionAdvisors ?? 0} of 200 advisors co-branded and sent PDF to ~{(engagement.redistributionEndClients ?? 0).toLocaleString()} end-clients
              </Text>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="action">
          <Accordion.Control icon={<IconTrendingUp size={16} stroke={1.5} />}>
            <Group gap="xs">
              <Text size="sm" fw={600}>Action outcomes — Days 7–30</Text>
              <Badge size="xs" color="violet" variant="light">{action.portfolioToolOpens ?? 0} tool opens</Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <SimpleGrid cols={3} spacing="sm">
                {[
                  { label: 'Portfolio tool opens', value: action.portfolioToolOpens ?? 0, sub: 'AEP tracking', color: 'violet' },
                  { label: 'Wholesaler follow-ups', value: action.wholesalerFollowUps ?? 0, sub: 'requested follow-up call', color: 'blue' },
                  { label: 'Rebalancing transactions', value: action.rebalancingTransactions ?? 0, sub: 'fund flow data', color: 'orange' },
                ].map(({ label, value, sub, color }) => (
                  <Paper key={label} withBorder p="sm" radius="md">
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">{label}</Text>
                      <Text size="xl" fw={800} c={color}>{value}</Text>
                      <Text size="xs" c="dimmed">{sub}</Text>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
              <Stack gap="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Conversion funnel</Text>
                {actionFunnelData.map((d, i) => {
                  const pct = (d.count / 7900) * 100
                  return (
                    <Group key={i} gap="sm">
                      <Text size="xs" c="dimmed" style={{ minWidth: 160 }}>{d.step}</Text>
                      <Progress value={pct} color="violet" size="sm" flex={1} />
                      <Text size="xs" fw={600} style={{ minWidth: 50 }}>{d.count.toLocaleString()}</Text>
                    </Group>
                  )
                })}
              </Stack>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="aum">
          <Accordion.Control icon={<IconCurrencyDollar size={16} stroke={1.5} />}>
            <Group gap="xs">
              <Text size="sm" fw={600}>AUM outcomes — Days 30–90</Text>
              <Badge size="xs" color="green" variant="filled">$49M incremental</Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <SimpleGrid cols={3} spacing="sm">
                <Paper withBorder p="sm" radius="md">
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">AUM growth vs. holdout</Text>
                    <Text size="2xl" fw={900} c="teal">+{aum.bpsVsHoldout} bps</Text>
                    <Text size="xs" c="dimmed">95% CI: {aum.ciLow}–{aum.ciHigh} bps</Text>
                    <Progress value={(aum.bpsVsHoldout / 120) * 100} color="teal" size="xs" />
                  </Stack>
                </Paper>
                <Paper withBorder p="sm" radius="md">
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">Incremental AUM</Text>
                    <Text size="2xl" fw={900} c="green">${(aum.incrementalAUM / 1000000).toFixed(0)}M</Text>
                    <Text size="xs" c="dimmed">from 90-minute intervention</Text>
                  </Stack>
                </Paper>
                <Paper withBorder p="sm" radius="md">
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">Quarterly revenue</Text>
                    <Text size="2xl" fw={900} c="orange">${(pnl.quarterlyRevenue / 1000).toFixed(0)}K</Text>
                    <Text size="xs" c="dimmed">{(pnl.takeRate * 100).toFixed(2)}% blended take rate</Text>
                  </Stack>
                </Paper>
              </SimpleGrid>
              <Paper p="sm" radius="md" withBorder>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">P&L:</Text>
                  <Text size="xs" fw={600}>${(aum.incrementalAUM / 1000000).toFixed(0)}M × {(pnl.takeRate * 100).toFixed(2)}% blended take rate =</Text>
                  <Text size="xs" fw={800} c="green">${(pnl.quarterlyRevenue / 1000).toFixed(0)}K incremental quarterly revenue</Text>
                </Group>
              </Paper>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Model learning callout */}
      <Alert
        icon={<IconBrain size={16} stroke={1.5} />}
        color="yellow"
        variant="light"
        title="Learning system update"
      >
        <Stack gap="xs">
          <Group gap="xl">
            <Stack gap={0}>
              <Text size="xs" c="dimmed">{modelUpdate.priorLabel || 'Volatility engagement prior'}</Text>
              <Group gap="xs">
                <Text size="sm" fw={700}>{Math.round(modelUpdate.priorBefore * 100)}%</Text>
                <Text size="xs" c="dimmed">→</Text>
                <Text size="sm" fw={700} c="teal">{(modelUpdate.priorAfter * 100).toFixed(1)}%</Text>
              </Group>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" c="dimmed">Advisor twins enriched</Text>
              <Text size="sm" fw={700}>{modelUpdate.twinsEnriched.toLocaleString()}</Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" c="dimmed">Episode archived</Text>
              <Text size="sm" fw={700}>Episode #{modelUpdate.episodeNumber}</Text>
            </Stack>
          </Group>
          <Text size="xs" c="dimmed">
            {modelUpdate.episodeContext || 'This episode is now part of the baseline for future VIX events. Next time this signal fires, the simulation will include Episode #19 outcome data.'}
          </Text>
        </Stack>
      </Alert>

      <Button
        size="md"
        variant="light"
        color="gray"
        onClick={onExit}
        leftSection={<IconChartBar size={16} stroke={1.5} />}
      >
        Exit workflow — explore the platform
      </Button>
    </Stack>
  )
}
