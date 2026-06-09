import { useState } from 'react'
import {
  Stack, Group, Text, Badge, Button, Box, ThemeIcon, Title,
  Card, Divider, ScrollArea, TextInput, Select,
} from '@mantine/core'
import {
  IconSparkles, IconRoute2, IconRadar, IconUsers, IconChartBar,
  IconLayoutGrid, IconCircleCheck, IconShieldCheck, IconRocket,
  IconTrendingUp, IconSearch, IconChevronRight, IconBolt,
  IconUsersGroup, IconSitemap, IconMathFunction, IconPencil,
  IconPlayerPlay,
} from '@tabler/icons-react'
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import { useCases } from '../data/usecases'
import { useUseCase } from '../contexts/UseCaseContext'

// ── Step icon map ──────────────────────────────────────────────────────────────
const STEP_ICONS = {
  signal_detection:           { icon: IconRadar,        color: 'teal'        },
  participant_segmentation:   { icon: IconUsersGroup,   color: 'blue'        },
  simulation:                 { icon: IconMathFunction, color: 'violet'      },
  participant_channel_config: { icon: IconSitemap,      color: 'orange'      },
  human_approval:             { icon: IconCircleCheck,  color: 'red'         },
  compliance:                 { icon: IconShieldCheck,  color: 'green'       },
  content_generation:         { icon: IconPencil,       color: 'grape'       },
  deployment:                 { icon: IconRocket,       color: 'orange'      },
  attribution:                { icon: IconTrendingUp,   color: 'teal'        },
}

// ── Live signals ───────────────────────────────────────────────────────────────
const LIVE_SIGNALS = [
  {
    ucId: 'uc-advisory-readiness',
    severity: 'HIGH',
    severityColor: 'orange',
    stage: 'SENSE',
    title: 'Advisory Readiness Surge — 42,000 Planning-Intent Investors Unadvised',
    description: 'Behavior Radar detects a 3.4× surge in planning-tool usage, advice-page repeat visits, and portfolio review events — with no advisory relationship initiated. 18% of in-scope investors have visited the advice page 3+ times in the past 14 days.',
    sourceChip: 'VANGUARD BEHAVIOR RADAR · PLANNING-TOOL EVENTS',
    agent: 'Market Sentinel',
    date: '5/12/2026',
    investorCount: 42000,
    investorLabel: '42,000',
    investorSub: '4,200 accounts',
    precedents: 3,
    precedentNote: null,
    confidence: 91,
    window: '30-day response window',
    trendLabel: 'PLANNING-TOOL USAGE SURGE (3.4× BASELINE)',
    trendData: [
      { x: 'W-6', v: 0 }, { x: 'W-5', v: 200 }, { x: 'W-4', v: 800 },
      { x: 'W-3', v: 2400 }, { x: 'W-2', v: 8000 }, { x: 'W-1', v: 24000 }, { x: 'Now', v: 42000 },
    ],
    scenario: 'Advisory Readiness Gap',
    scenarioSub: 'Self-directed investors → advisory invitation → AUM under advice',
  },
  {
    ucId: 'uc-idle-cash-activation',
    severity: 'HIGH',
    severityColor: 'orange',
    stage: 'SENSE',
    title: 'Idle Cash Accumulation — 31,000 Investors Underinvested vs. Goals',
    description: 'Cross-referencing payroll signals and balance data identifies 31,000 investors with >20% cash/money-market allocation and low recent investment activity. Average idle balance: $48,200. Cash Plus deepening and investment education eligible.',
    sourceChip: 'PAYROLL FEED · TWIN REGISTRY · BALANCE SIGNALS',
    agent: 'Market Sentinel',
    date: '5/10/2026',
    investorCount: 31000,
    investorLabel: '31,000',
    investorSub: '3,100 accounts',
    precedents: 4,
    precedentNote: null,
    confidence: 87,
    window: '60-day response window',
    trendLabel: 'IDLE CASH COHORT SIZE (ABOVE THRESHOLD)',
    trendData: [
      { x: 'W-6', v: 0 }, { x: 'W-5', v: 400 }, { x: 'W-4', v: 1800 },
      { x: 'W-3', v: 6000 }, { x: 'W-2', v: 14000 }, { x: 'W-1', v: 24000 }, { x: 'Now', v: 31000 },
    ],
    scenario: 'Idle Cash Activation',
    scenarioSub: 'Cash-heavy investors → investment education → net new invested assets',
  },
  {
    ucId: 'uc-diversification',
    severity: 'MEDIUM',
    severityColor: 'blue',
    stage: 'SENSE',
    title: 'Concentration Risk — 24,000 Investors with Elevated Single-Asset Exposure',
    description: 'Twin Registry flags 24,000 investors with >40% single-stock or single-sector concentration and low diversification engagement. Portfolio health-check and rebalancing education eligible based on behavioral profile.',
    sourceChip: 'TWIN REGISTRY · PORTFOLIO COMPOSITION FEED',
    agent: 'Market Sentinel',
    date: '5/08/2026',
    investorCount: 24000,
    investorLabel: '24,000',
    investorSub: '2,400 accounts',
    precedents: 5,
    precedentNote: null,
    confidence: 83,
    window: '45-day response window',
    trendLabel: 'CONCENTRATION RISK COHORT SIZE',
    trendData: [
      { x: 'W-6', v: 0 }, { x: 'W-5', v: 300 }, { x: 'W-4', v: 1200 },
      { x: 'W-3', v: 4500 }, { x: 'W-2', v: 11000 }, { x: 'W-1', v: 19000 }, { x: 'Now', v: 24000 },
    ],
    scenario: 'Portfolio Concentration / Diversification Gap',
    scenarioSub: 'Concentrated investors → portfolio health education → diversification action',
  },
  {
    ucId: 'uc-volatility-reassurance',
    severity: 'CRITICAL',
    severityColor: 'red',
    stage: 'SENSE',
    title: 'Anxiety Spike — 38,000 Investors Showing Volatility Panic Behavior',
    description: 'Behavior Radar detects 38,000 investors with 3× login surge, active sell-flow research, and support contact spikes within the 12M equity-exposed population — a 3.1-sigma deviation from the 7-day baseline. CalmEngine protective window: 6 hours.',
    sourceChip: 'VANGUARD BEHAVIOR RADAR · MARKET REGIME CLASSIFIER',
    agent: 'Market Sentinel',
    date: '4/15/2026',
    investorCount: 38000,
    investorLabel: '38,000',
    investorSub: '3,800 accounts',
    precedents: 2,
    precedentNote: 'Limited history',
    confidence: 92,
    window: '6h–72h response window',
    trendLabel: 'INVESTOR LOGIN SURGE (3×+ / 24H)',
    trendData: [
      { x: 'W-6', v: 0 }, { x: 'W-5', v: 80 }, { x: 'W-4', v: 400 },
      { x: 'W-3', v: 2000 }, { x: 'W-2', v: 8000 }, { x: 'W-1', v: 22000 }, { x: 'Now', v: 38000 },
    ],
    scenario: 'Market Volatility Reassurance',
    scenarioSub: 'Anxiety-spiking investors → reassurance education → panic-selling prevented',
  },
  {
    ucId: 'uc-rollover-ira',
    severity: 'HIGH',
    severityColor: 'orange',
    stage: 'SENSE',
    title: 'Rollover Decision Window — 14,000 Investors in Active Transition Moment',
    description: 'Reaction-based signals from secure site IRA/rollover content engagement, job-change events, and account activity detect 14,000 investors in an active transition moment. 45-day window before assets risk moving away. Education-classified response eligible.',
    sourceChip: 'SECURE SITE CONTENT EVENTS · IRA SIGNALS · ACCOUNT FEED',
    agent: 'Market Sentinel',
    date: '5/05/2026',
    investorCount: 14000,
    investorLabel: '14,000',
    investorSub: '1,400 accounts',
    precedents: 3,
    precedentNote: null,
    confidence: 88,
    window: '45-day response window',
    trendLabel: 'IRA / ROLLOVER ENGAGEMENT SURGE',
    trendData: [
      { x: 'W-6', v: 0 }, { x: 'W-5', v: 120 }, { x: 'W-4', v: 700 },
      { x: 'W-3', v: 2800 }, { x: 'W-2', v: 7000 }, { x: 'W-1', v: 11500 }, { x: 'Now', v: 14000 },
    ],
    scenario: 'Rollover / IRA Decision Moment',
    scenarioSub: 'Transition-moment investors → rollover education → AUM retained',
  },
]

// ── Step icon chain ────────────────────────────────────────────────────────────
function StepChain({ steps, color }) {
  return (
    <Group gap={6} wrap="nowrap" align="center">
      {steps.map((step, i) => {
        const meta = STEP_ICONS[step.panelType] || { icon: IconBolt, color: 'gray' }
        const Icon = meta.icon
        const isAgent = step.actor === 'agent'
        return (
          <Group key={i} gap={6} wrap="nowrap" align="center">
            <ThemeIcon
              size={28}
              radius="xl"
              variant={isAgent ? 'light' : 'filled'}
              color={meta.color}
              style={{ flexShrink: 0 }}
            >
              <Icon size={14} stroke={1.8} />
            </ThemeIcon>
            {i < steps.length - 1 && (
              <Box
                style={{
                  width: 18, height: 1.5, flexShrink: 0,
                  background: `var(--mantine-color-${color}-3)`,
                  borderRadius: 2,
                }}
              />
            )}
          </Group>
        )
      })}
      <Text size="xs" c="dimmed" fw={500} ml={4}>{steps.length} STEPS</Text>
    </Group>
  )
}

// ── Signal severity badge ──────────────────────────────────────────────────────
function SeverityBadge({ severity, color }) {
  return (
    <Badge
      size="xs"
      variant="filled"
      color={color}
      style={{ letterSpacing: '0.04em', fontWeight: 700 }}
    >
      {severity}
    </Badge>
  )
}

// ── Trend chart ────────────────────────────────────────────────────────────────
function SignalTrendChart({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={`var(--mantine-color-${color}-6)`} stopOpacity={0.25} />
            <stop offset="95%" stopColor={`var(--mantine-color-${color}-6)`} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="x"
          tick={{ fontSize: 10, fill: 'var(--mantine-color-dimmed)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: 'var(--mantine-color-dimmed)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
        />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 6, padding: '4px 10px' }}
          formatter={v => [v.toLocaleString(), 'Investors']}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={`var(--mantine-color-${color}-6)`}
          strokeWidth={2}
          fill="url(#sigGrad)"
          dot={{ r: 3, fill: `var(--mantine-color-${color}-6)` }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function UseCaseCatalog({ onRunScenario }) {
  const { launch } = useUseCase()
  const [selectedSignalIdx, setSelectedSignalIdx] = useState(0)
  const [signalFilter, setSignalFilter] = useState('All')

  const handleRun = (uc) => {
    if (onRunScenario) onRunScenario(uc)
    else launch(uc)
  }

  const handleRunByTitle = (scenarioTitle) => {
    const uc = useCases.find(u => u.title === scenarioTitle)
    if (uc) handleRun(uc)
  }

  const selectedSignal = LIVE_SIGNALS[selectedSignalIdx]

  const filteredSignals = signalFilter === 'All'
    ? LIVE_SIGNALS
    : LIVE_SIGNALS.filter(s => s.severity === signalFilter)

  return (
    <Stack gap="lg">
      {/* ── Header banner ──────────────────────────────────────────────── */}
      <Card withBorder radius="md" p="md" style={{ borderLeft: '3px solid var(--mantine-color-vanguardRed-6)' }}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <Box>
            <Group gap="xs" mb={4}>
              <ThemeIcon size={22} radius="md" variant="gradient" gradient={{ from: '#96151D', to: '#C0392B', deg: 135 }}>
                <IconSparkles size={12} color="white" />
              </ThemeIcon>
              <Text fw={800} size="sm" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                Personal Wealth Signal Scenarios for Vanguard's Investors
              </Text>
            </Group>
            <Text size="xs" c="dimmed" maw={580}>
              Behavioral-finance-informed guidance · education-first outreach · ERISA-aligned fiduciary posture
            </Text>
          </Box>
          <Group gap="xs" wrap="wrap">
            {['Simulation-Native', '6-Stage Lifecycle', 'Guided & Autopilot Modes', 'Closed-Loop Learning'].map(t => (
              <Badge key={t} variant="outline" color="vanguardRed" size="xs" style={{ letterSpacing: '0.04em', fontWeight: 600 }}>
                {t}
              </Badge>
            ))}
          </Group>
        </Group>
      </Card>

      {/* ════════════════ LIVE SIGNALS ════════════════════════════════ */}
      <Group align="flex-start" gap="md" wrap="nowrap" style={{ minHeight: 600 }}>
          {/* ── Signal list ───────────────────────────────── */}
          <Stack gap="xs" style={{ width: 320, flexShrink: 0 }}>
            {/* Search + filter */}
            <TextInput
              placeholder="Search signals..."
              size="xs"
              radius="md"
              leftSection={<IconSearch size={13} />}
              styles={{ input: { fontSize: 12 } }}
            />
            <Select
              size="xs"
              radius="md"
              data={['All', 'CRITICAL', 'HIGH', 'MEDIUM']}
              value={signalFilter}
              onChange={v => setSignalFilter(v || 'All')}
              styles={{ input: { fontSize: 12 } }}
            />
            <Text size="10px" c="dimmed" style={{ letterSpacing: '0.06em' }}>
              Live signals map 1:1 to scenarios
            </Text>

            <ScrollArea h={560} type="scroll" offsetScrollbars>
              <Stack gap={6} pr={8}>
                {filteredSignals.map((sig, idx) => {
                  const realIdx = LIVE_SIGNALS.indexOf(sig)
                  const isSelected = realIdx === selectedSignalIdx
                  return (
                    <Card
                      key={sig.ucId}
                      withBorder
                      radius="md"
                      p="sm"
                      onClick={() => setSelectedSignalIdx(realIdx)}
                      style={{
                        cursor: 'pointer',
                        borderColor: isSelected ? `var(--mantine-color-${sig.severityColor}-6)` : undefined,
                        background: isSelected ? `var(--mantine-color-${sig.severityColor}-light)` : undefined,
                      }}
                    >
                      <Group mb={4} gap="xs">
                        <SeverityBadge severity={sig.severity} color={sig.severityColor} />
                      </Group>
                      <Text fw={600} size="xs" style={{ lineHeight: 1.35 }} mb={4}>
                        {sig.title}
                      </Text>
                      <Text size="10px" c="dimmed" lineClamp={2} mb={6}>
                        {sig.description}
                      </Text>
                      <Group gap="xs" mb={4}>
                        <Group gap={4}>
                          <IconUsers size={11} />
                          <Text size="10px">{sig.investorLabel} investors</Text>
                        </Group>
                        <Text size="10px" c="dimmed">·</Text>
                        <Text size="10px">{sig.precedents} precedents</Text>
                      </Group>
                      <Group justify="space-between" align="center">
                        <Text size="9px" c="dimmed">{sig.sourceChip.split('·')[0].trim()}</Text>
                        <Text size="9px" c="dimmed">{sig.window}</Text>
                      </Group>
                    </Card>
                  )
                })}
              </Stack>
            </ScrollArea>
          </Stack>

          {/* ── Signal detail ─────────────────────────────── */}
          {selectedSignal && (
            <Card withBorder radius="md" p="md" style={{ flex: 1 }}>
              {/* Header */}
              <Group gap="xs" mb="xs" align="flex-start">
                <ThemeIcon size={28} radius="xl" variant="light" color={selectedSignal.severityColor}>
                  <IconBolt size={14} stroke={2} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Group gap="xs" mb={2} wrap="wrap">
                    <Text fw={700} size="sm" style={{ lineHeight: 1.3 }}>{selectedSignal.title}</Text>
                  </Group>
                  <Group gap="xs">
                    <SeverityBadge severity={selectedSignal.severity} color={selectedSignal.severityColor} />
                  </Group>
                </Box>
              </Group>

              {/* Stats row */}
              <Group gap="xl" mb="md" wrap="wrap">
                <Box>
                  <Text fw={800} size="xl" c="green">{selectedSignal.confidence}%</Text>
                  <Text size="10px" c="dimmed">Confidence</Text>
                  <Box style={{ width: 80, height: 3, borderRadius: 2, marginTop: 3, background: 'var(--mantine-color-green-1)' }}>
                    <Box style={{ width: `${selectedSignal.confidence}%`, height: '100%', borderRadius: 2, background: 'var(--mantine-color-green-6)' }} />
                  </Box>
                </Box>
                <Box>
                  <Text fw={800} size="xl" c={selectedSignal.severityColor}>{selectedSignal.investorLabel}</Text>
                  <Text size="10px" c="dimmed">Investors in scope</Text>
                  <Text size="10px" c="dimmed">{selectedSignal.investorSub}</Text>
                </Box>
                <Box>
                  <Text fw={800} size="xl" c={selectedSignal.precedentNote ? 'orange' : 'dark'}>
                    {selectedSignal.precedents}
                  </Text>
                  <Text size="10px" c="dimmed">Historical precedents</Text>
                  {selectedSignal.precedentNote && (
                    <Text size="10px" c="orange">{selectedSignal.precedentNote}</Text>
                  )}
                </Box>
              </Group>

              {/* Source + agent + date */}
              <Group gap="xs" mb="xs" wrap="wrap">
                <Badge size="xs" variant="outline" color="gray" style={{ fontFamily: 'monospace', fontSize: 9 }}>
                  {selectedSignal.sourceChip}
                </Badge>
                <Badge size="xs" variant="light" color="green">{selectedSignal.agent}</Badge>
                <Text size="10px" c="dimmed">{selectedSignal.date}</Text>
              </Group>

              <Divider mb="xs" />

              {/* Trend chart */}
              <Group justify="space-between" mb={4}>
                <Text size="10px" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.07em' }}>
                  {selectedSignal.trendLabel}
                </Text>
                <Text size="10px" c={selectedSignal.severityColor} fw={700} style={{ letterSpacing: '0.04em' }}>
                  CURRENT: {selectedSignal.investorLabel}
                </Text>
              </Group>
              <SignalTrendChart data={selectedSignal.trendData} color={selectedSignal.severityColor} />

              <Divider mt="xs" mb="xs" />

              {/* Signal detail */}
              <Text size="10px" c="dimmed" fw={700} tt="uppercase" mb={4} style={{ letterSpacing: '0.07em' }}>
                Signal Detail
              </Text>
              <Text size="xs" c="dimmed" mb="xs">{selectedSignal.description}</Text>

              {/* Response window */}
              <Text size="xs" c="dimmed" mb="md">
                <Text span fw={600} c="dark" size="xs">Response window: </Text>
                {selectedSignal.window}
              </Text>

              {/* Ready-to-run */}
              <Box style={{ background: 'var(--mantine-color-default-hover)', borderRadius: 8, padding: '10px 14px' }}>
                <Text size="10px" c="dimmed" mb={4}>Ready-to-run scenario</Text>
                <Group justify="space-between" align="center">
                  <Box>
                    <Text fw={700} size="sm">{selectedSignal.scenario}</Text>
                    <Text size="10px" c="dimmed">{selectedSignal.scenarioSub}</Text>
                  </Box>
                  <Button
                    size="xs"
                    color="vanguardRed"
                    radius="md"
                    leftSection={<IconPlayerPlay size={12} stroke={1.8} />}
                    onClick={() => handleRunByTitle(selectedSignal.scenario)}
                  >
                    Run scenario
                  </Button>
                </Group>
              </Box>
            </Card>
          )}
      </Group>
    </Stack>
  )
}
