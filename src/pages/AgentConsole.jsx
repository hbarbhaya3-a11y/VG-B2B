import { Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, ScrollArea, Table } from '@mantine/core'
import { IconRadar, IconBrain, IconSettings, IconChartLine, IconEdit, IconShield, IconRoute, IconEye, IconCircle, IconClock } from '@tabler/icons-react'

const AGENTS = [
  {
    id: 'market-sentinel', name: 'Market Sentinel', level: 'L5', status: 'ACTIVE', color: 'teal',
    icon: IconRadar,
    description: 'Continuous signal detection: secure site behavioral stream, Adobe Analytics, CRM engagement feed, planning tool events, and market data anomalies.',
    lastActive: '< 1 min ago',
  },
  {
    id: 'context-decoder', name: 'Context Decoder', level: 'L4', status: 'ACTIVE', color: 'cyan',
    icon: IconBrain,
    description: 'Maps behavioral signals to investor populations via digital twin queries. Produces scored investor cohorts with need-state vectors and propensity scores.',
    lastActive: '2 min ago',
  },
  {
    id: 'orchestration-agent', name: 'Orchestration Agent', level: 'L3', status: 'ACTIVE', color: 'blue',
    icon: IconSettings,
    description: 'Coordinates multi-agent workflows, manages episode state transitions, resolves conflicts between agent recommendations, routes decisions requiring human sign-off.',
    lastActive: '4 min ago',
  },
  {
    id: 'twinx-simulation', name: 'TwinX Simulation', level: 'L4', status: 'ACTIVE', color: 'violet',
    icon: IconChartLine,
    description: 'Runs TwinX simulation iterations for episode AUM impact, builds response curves, generates P5/P50/P95 confidence intervals against historical episode priors.',
    lastActive: '8 min ago',
  },
  {
    id: 'content-architect', name: 'Content Architect', level: 'L4', status: 'ACTIVE', color: 'orange',
    icon: IconEdit,
    description: 'Selects, personalizes, and assembles content variants for each investor segment. Maps need-state vectors to content types and manages A/B test variant assignment.',
    lastActive: '12 min ago',
  },
  {
    id: 'guardrail-guardian', name: 'Guardrail Guardian', level: 'L3', status: 'ACTIVE', color: 'red',
    icon: IconShield,
    description: 'Enforces five-rail compliance: education/advice boundary, product eligibility, disclosure language, contact frequency caps, and brand tone. Auto-corrects before output.',
    lastActive: '15 min ago',
  },
  {
    id: 'journey-executor', name: 'Journey Executor', level: 'L5', status: 'ACTIVE', color: 'green',
    icon: IconRoute,
    description: 'Orchestrates multi-touch investor journeys across Secure Site, Email, App Push, and Advisor Consultation channels. Manages send scheduling and holdout preservation.',
    lastActive: '18 min ago',
  },
  {
    id: 'ai-observability', name: 'AI Observability', level: 'L4', status: 'ACTIVE', color: 'gray',
    icon: IconEye,
    description: 'Monitors model drift, data quality degradation, prediction accuracy decay, and agent performance metrics. Triggers retraining workflows when thresholds are breached.',
    lastActive: '22 min ago',
  },
]

const LEVEL_COLORS = { L3: 'blue', L4: 'violet', L5: 'green' }

const ACTIVITY_FEED = [
  { agent: 'TwinX Simulation', color: 'violet', action: 'Advisory Readiness Gap simulation complete: P50 engagement 11.6%, P50 AUM $31.8M, 1,000 iterations. Scenario A recommended at 87% confidence.', entity: 'Episode: VPW-ARG-2026-001', confidence: 0.87, time: '2 min ago' },
  { agent: 'Market Sentinel', color: 'teal', action: 'Advisory Readiness Gap signal classified: 42,000 self-directed investors showing planning intent without advisory relationship. LSTM confidence 91%.', entity: 'Signal: sig-vpw-001 · Campaign: VPW-ARG-2026', confidence: 0.91, time: '8 min ago' },
  { agent: 'Guardrail Guardian', color: 'red', action: 'Variant A for Planning-Intent segment auto-corrected: implied performance-outcome language removed before output. 14 of 15 variants cleared first-pass.', entity: 'Episode: VPW-ARG-2026-001 · Rail 3: Disclosure', confidence: 0.99, time: '14 min ago' },
  { agent: 'Content Architect', color: 'orange', action: 'Content variants generated for 7 behavioral segments: 15 education-classified assets across Secure Site, Email, and App Push. C2PA credentials attached.', entity: 'Episode: VPW-ARG-2026-001', confidence: 0.84, time: '22 min ago' },
  { agent: 'Journey Executor', color: 'green', action: 'Journey wave 1 deployed: 42,000 investor profiles pushed to Adobe Experience Platform + SFMC. 4,200 holdout preserved. Frequency cap enforced.', entity: 'Campaign: VPW-ARG-2026-001 · Batch: BATCH-20260609-001', confidence: 0.90, time: '38 min ago' },
  { agent: 'Orchestration Agent', color: 'blue', action: 'Episode VPW-ARG-2026-001 promoted from SIMULATE → EXECUTE lifecycle stage after human approval gate cleared.', entity: 'Episode: VPW-ARG-2026-001', confidence: 0.95, time: '1h ago' },
  { agent: 'AI Observability', color: 'gray', action: 'Advisory readiness model PSI within acceptable range (0.07) — no drift detected. Prediction accuracy: actual 31.0% vs predicted 34.0%, within 1σ tolerance.', entity: 'Model: advisory-readiness-v2.4', confidence: 0.91, time: '2h ago' },
  { agent: 'Context Decoder', color: 'cyan', action: 'Scored 42,000 investors for advisory readiness signal — 7 behavioral segments produced, 4,200 holdout assigned via stratified random sampling.', entity: 'Episode: VPW-ARG-2026-001', confidence: 0.88, time: '3h ago' },
]

const MCP_CONNECTORS = [
  { name: 'Vanguard Secure Site Behavioral Stream', status: 'CONNECTED', freshness: '< 1 min' },
  { name: 'Adobe Analytics', status: 'CONNECTED', freshness: '< 5 min' },
  { name: 'CRM Engagement Feed (Salesforce)', status: 'CONNECTED', freshness: '< 1 min' },
  { name: 'Planning Tool Events', status: 'CONNECTED', freshness: '< 2 min' },
  { name: 'Adobe Experience Platform', status: 'PENDING H2', freshness: 'N/A' },
  { name: 'SFMC (Marketing Cloud)', status: 'CONNECTED', freshness: '< 3 min' },
  { name: 'Investor Digital Twin Store', status: 'CONNECTED', freshness: '< 1 min' },
  { name: 'Compliance Engine (Actimize)', status: 'CONNECTED', freshness: '11 min' },
  { name: 'Content Library (CMS)', status: 'CONNECTED', freshness: '< 1 min' },
  { name: 'Human Review Queue', status: 'CONNECTED', freshness: '< 1 min' },
  { name: 'Bloomberg', status: 'CONNECTED', freshness: '< 1 min' },
  { name: 'SEC EDGAR', status: 'CONNECTED', freshness: '6 min' },
]

const IDENTITY_MGMT = [
  { agent: 'Market Sentinel', level: 'L5', scopes: ['INVESTOR: READ', 'SIGNAL: READ/WRITE', 'EPISODE: READ', 'OUTCOME: READ'] },
  { agent: 'Context Decoder', level: 'L4', scopes: ['INVESTOR: READ/WRITE', 'SEGMENT: READ/WRITE', 'EPISODE: READ/WRITE', 'OUTCOME: READ'] },
  { agent: 'Orchestration Agent', level: 'L3', scopes: ['EPISODE: READ/WRITE', 'INTERVENTION: READ/WRITE', 'OUTCOME: READ/WRITE'] },
  { agent: 'TwinX Simulation', level: 'L4', scopes: ['EPISODE: READ/WRITE', 'SIMULATION: READ/WRITE', 'OUTCOME: READ'] },
  { agent: 'Content Architect', level: 'L4', scopes: ['CONTENT: READ/WRITE', 'INTERVENTION: READ/WRITE', 'SEGMENT: READ'] },
  { agent: 'Guardrail Guardian', level: 'L3', scopes: ['CONTENT: READ/WRITE', 'COMPLIANCE: READ/WRITE', 'INTERVENTION: READ'] },
  { agent: 'Journey Executor', level: 'L5', scopes: ['INTERVENTION: READ/WRITE', 'CHANNEL: READ/WRITE', 'OUTCOME: READ/WRITE'] },
  { agent: 'AI Observability', level: 'L4', scopes: ['MODEL: READ/WRITE', 'DRIFT: READ/WRITE', 'OUTCOME: READ'] },
]

const STATUS_COLORS = { CONNECTED: 'green', 'PENDING H2': 'yellow' }

export default function AgentConsole() {
  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Text size="xl" fw={800}>Agent Console</Text>
        <Text size="sm" c="dimmed">8 governed AI agents — real-time decisions, MCP connectors, A2A protocol, identity management</Text>
      </Stack>

      {/* Agent grid */}
      <SimpleGrid cols={4} spacing="sm">
        {AGENTS.map(agent => {
          const Icon = agent.icon
          return (
            <Paper key={agent.id} withBorder p="md" radius="md" style={{ cursor: 'pointer' }}>
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start">
                  <Group gap="xs">
                    <ThemeIcon size={32} radius="md" color={agent.color} variant="light">
                      <Icon size={18} stroke={1.5} />
                    </ThemeIcon>
                    <Stack gap={2}>
                      <Text size="sm" fw={700}>{agent.name}</Text>
                      <Group gap={4}>
                        <Badge size="xs" color={LEVEL_COLORS[agent.level]} variant="light">{agent.level}</Badge>
                        <Badge size="xs" color="green" variant="filled">{agent.status}</Badge>
                      </Group>
                    </Stack>
                  </Group>
                </Group>
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }} lineClamp={3}>{agent.description}</Text>
                <Group gap={4}>
                  <IconClock size={10} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                  <Text size="xs" c="dimmed">Last: {agent.lastActive}</Text>
                </Group>
              </Stack>
            </Paper>
          )
        })}
      </SimpleGrid>

      <SimpleGrid cols={3} spacing="md">
        {/* Activity Feed */}
        <Paper withBorder p="md" radius="md" style={{ gridColumn: 'span 1' }}>
          <Stack gap="sm">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Activity Feed</Text>
            <ScrollArea h={420} offsetScrollbars>
              <Stack gap="sm">
                {ACTIVITY_FEED.map((ev, i) => (
                  <Stack key={i} gap="xs" pb="sm" style={{ borderBottom: i < ACTIVITY_FEED.length - 1 ? '1px solid var(--mantine-color-gray-2)' : 'none' }}>
                    <Group gap="xs" align="flex-start">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--mantine-color-${ev.color}-5)`, flexShrink: 0, marginTop: 4 }} />
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text size="xs" fw={700}>{ev.agent}</Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>{ev.action}</Text>
                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace', fontSize: 10 }}>{ev.entity}</Text>
                        <Group gap="xs">
                          <Badge size="xs" color="teal" variant="light">CONFIDENCE: {Math.round(ev.confidence * 100)}%</Badge>
                          <Text size="xs" c="dimmed">{ev.time}</Text>
                        </Group>
                      </Stack>
                    </Group>
                  </Stack>
                ))}
              </Stack>
            </ScrollArea>
          </Stack>
        </Paper>

        {/* MCP Connectors */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="sm">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>MCP Connectors</Text>
            <Table fz="xs" withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Connector</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Freshness</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {MCP_CONNECTORS.map((c, i) => (
                  <Table.Tr key={i}>
                    <Table.Td fw={c.status === 'CONNECTED' ? 500 : 400} c={c.status !== 'CONNECTED' ? 'dimmed' : undefined}>{c.name}</Table.Td>
                    <Table.Td>
                      <Badge size="xs" color={STATUS_COLORS[c.status] || 'gray'} variant="filled">{c.status}</Badge>
                    </Table.Td>
                    <Table.Td c="dimmed">{c.freshness}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>

        {/* Agent Identity Management */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="sm">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Agent Identity Management</Text>
            <ScrollArea h={400} offsetScrollbars>
              <Stack gap="md">
                {IDENTITY_MGMT.map((ag, i) => (
                  <Stack key={i} gap="xs">
                    <Group justify="space-between">
                      <Text size="xs" fw={700}>{ag.agent}</Text>
                      <Badge size="xs" color={LEVEL_COLORS[ag.level]} variant="light">Autonomy: {ag.level}</Badge>
                    </Group>
                    <Group gap={4} wrap="wrap">
                      {ag.scopes.map(scope => (
                        <Badge key={scope} size="xs" variant="outline" color="gray" style={{ fontFamily: 'monospace', fontSize: 9 }}>{scope}</Badge>
                      ))}
                    </Group>
                    {i < IDENTITY_MGMT.length - 1 && <Divider />}
                  </Stack>
                ))}
              </Stack>
            </ScrollArea>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  )
}
