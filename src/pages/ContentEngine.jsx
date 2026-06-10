import { useState } from 'react'
import { Paper, Stack, Group, Text, Badge, Select, Button, ThemeIcon, Divider, SimpleGrid, Table, Alert, Loader, Progress, Center } from '@mantine/core'
import { IconSparkles, IconCheck, IconShieldCheck, IconEye, IconEdit } from '@tabler/icons-react'
import { BarChart, LineChart } from '@mantine/charts'

const SIGNALS = [
  { value: 'advisory-gap', label: 'Advisory Readiness Gap — 42,000 Investors in Scope' },
  { value: 'idle-cash', label: 'Idle Cash Activation — 31,000 Investors in Scope' },
  { value: 'volatility', label: 'Volatility Response — 18,500 Investors in Scope' },
  { value: 'retirement', label: 'Retirement Income Planning — 9,200 Investors in Scope' },
]

const COHORT_PROFILES = [
  { value: 'planning-intent', label: 'Planning-Intent, Unadvised Investors', description: 'Uses planning tools repeatedly but no advisory relationship — responds to portfolio lens content' },
  { value: 'cash-heavy', label: 'Cash-Heavy, Low-Conviction Savers', description: 'High cash balance, low recent action — responds to "put cash to work" education' },
  { value: 'volatility-rech', label: 'Volatility-Triggered Recheckers', description: 'Repeated logins during drawdown — responds to calm, stay-the-course framing' },
  { value: 'retirement-planner', label: 'Retirement Income Planners', description: 'Age 60–70, researching drawdown — responds to income projection tools' },
  { value: 'tax-seeker', label: 'Tax-Efficiency Seekers', description: 'High-balance, Roth research — responds to tax-smart investing content' },
]

const PRODUCT_ANGLES = [
  { value: 'portfolio-review', label: 'Complimentary Portfolio Review' },
  { value: 'digital-advisor', label: 'Digital Advisor Assessment' },
  { value: 'advisor-consult', label: 'Personal Advisor Consultation' },
  { value: 'tax-education', label: 'Tax-Smart Investing Education' },
]

const SIGNAL_META = {
  'advisory-gap': { count: '42,000', plans: '—', confidence: '91%', maturity: 'L3', critical: true },
  'idle-cash': { count: '31,000', plans: '—', confidence: '88%', maturity: 'L3', critical: false },
  'volatility': { count: '18,500', plans: '—', confidence: '84%', maturity: 'L2', critical: false },
  'retirement': { count: '9,200', plans: '—', confidence: '79%', maturity: 'L2', critical: false },
}

const DEMAND_SIGNALS = [
  { label: 'Advisory Readiness Content', severity: 'CRITICAL', count: 'Segment 1 · 11,800 investors', delta: '+34% this month' },
  { label: 'Idle Cash Management', severity: 'HIGH', count: 'Segment 2 · 7,900 investors', delta: '+28% this month' },
  { label: 'Volatility Reassurance', severity: 'HIGH', count: 'Segment 4 · 5,800 investors', delta: '+22% this month' },
  { label: 'Retirement Income Planning', severity: 'MEDIUM', count: 'Segment 5 · 4,700 investors', delta: '+11% this month' },
  { label: 'Tax-Efficiency Education', severity: 'MEDIUM', count: 'Segment 6 · 3,400 investors', delta: '+18% this month' },
]

const AUM_LIFT_DATA = [
  { name: 'Portfolio Review Guide', aum: 8.4 },
  { name: 'Stay the Course', aum: 6.2 },
  { name: 'Cash Management', aum: 5.1 },
  { name: 'Roth Conversion Ed.', aum: 3.8 },
  { name: 'Advisor Intro', aum: 2.6 },
  { name: 'Income Planner', aum: 1.9 },
]

const CHANNEL_REACH_DATA = [
  { name: 'Portfolio Review', securesite: 4200, email: 3100, apppush: 1800 },
  { name: 'Stay the Course', securesite: 2800, email: 2100, apppush: 3200 },
  { name: 'Cash Mgmt.', securesite: 3600, email: 2900, apppush: 1400 },
  { name: 'Roth Ed.', securesite: 1900, email: 3800, apppush: 900 },
  { name: 'Advisor Intro', securesite: 5100, email: 2200, apppush: 1600 },
]

const ENGAGEMENT_TREND = [
  { month: 'Jan-26', treatment: 2800, holdout: 320 },
  { month: 'Feb-26', treatment: 3100, holdout: 290 },
  { month: 'Mar-26', treatment: 3400, holdout: 340 },
  { month: 'Apr-26', treatment: 3800, holdout: 310 },
  { month: 'May-26', treatment: 4200, holdout: 380 },
  { month: 'Jun-26', treatment: 5600, holdout: 410 },
]

const CONTENT_LIBRARY = [
  { title: 'Portfolio Review — What to Expect', author: 'Personal Wealth Team', reach: '11.8K', opens: '6.2K', conversions: 218, aumLift: '$8.4M', compliance: 93, c2pa: true },
  { title: 'Staying the Course: Markets and Your Plan', author: 'CIO', reach: '5.8K', opens: '3.4K', conversions: 132, aumLift: '$6.2M', compliance: 91, c2pa: true },
  { title: 'Put Your Cash to Work — Or Know When Not To', author: 'Planning Team', reach: '7.9K', opens: '4.1K', conversions: 174, aumLift: '$5.1M', compliance: 88, c2pa: true },
  { title: 'Roth Conversion: A Tax-Smart Strategy Guide', author: 'Tax Team', reach: '3.4K', opens: '2.1K', conversions: 74, aumLift: '$3.8M', compliance: 96, c2pa: false },
  { title: 'Introducing Vanguard Personal Advisor Services', author: 'Advisory Team', reach: '4.7K', opens: '2.8K', conversions: 96, aumLift: '$2.6M', compliance: 94, c2pa: true },
]

const SEVERITY_COLORS = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow' }

function KpiTile({ label, value, sub, color, icon: Icon }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group gap="sm" align="flex-start">
        <ThemeIcon size={36} radius="md" color={color} variant="light">
          <Icon size={20} stroke={1.5} />
        </ThemeIcon>
        <Stack gap={2}>
          <Text size="xs" c="dimmed">{label}</Text>
          <Text size="xl" fw={800} c={color}>{value}</Text>
          {sub && <Text size="xs" c="dimmed">{sub}</Text>}
        </Stack>
      </Group>
    </Paper>
  )
}

const GENERATE_LINES = [
  'Retrieving content priors from episode library…',
  'Matching cohort need-state vector to content types…',
  'Assembling A/B variants for each channel…',
  'Running education/advice boundary check…',
  'Attaching C2PA content credentials…',
  'Content ready — education-classified, compliant.',
]

function GeneratingState({ onDone }) {
  const [idx, setIdx] = useState(0)
  useState(() => {
    let i = 0
    const iv = setInterval(() => {
      i++; setIdx(i)
      if (i >= GENERATE_LINES.length - 1) { clearInterval(iv); setTimeout(onDone, 400) }
    }, 380)
    return () => clearInterval(iv)
  }, [])
  return (
    <Stack align="center" gap="md" py="xl">
      <Loader size="lg" color="orange" />
      <Stack gap="xs" align="center">
        <Text size="sm" fw={600}>Content Architect generating…</Text>
        {GENERATE_LINES.slice(0, idx + 1).map((line, i) => (
          <Group key={i} gap="xs">
            {i < idx
              ? <ThemeIcon size="xs" color="orange" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
              : <Loader size="xs" color="orange" />}
            <Text size="xs" c={i < idx ? 'orange' : 'dimmed'}>{line}</Text>
          </Group>
        ))}
      </Stack>
      <Progress value={(idx / (GENERATE_LINES.length - 1)) * 100} color="orange" size="sm" w={300} animated />
    </Stack>
  )
}

function GeneratedContent({ signal, cohort, angle }) {
  const cohortObj = COHORT_PROFILES.find(c => c.value === cohort) || COHORT_PROFILES[0]
  return (
    <Stack gap="md">
      <Group gap="xs">
        <Badge color="green" variant="filled" size="sm">✓ Content generated</Badge>
        <Badge color="gray" variant="light" size="sm">Education-classified</Badge>
        <Badge color="teal" variant="light" size="sm">C2PA credentials attached</Badge>
      </Group>
      <Divider />
      {[
        { variant: 'A', channel: 'Secure Site Card', headline: 'Is your portfolio aligned with your goals?', copy: "You've been exploring your investment options — take 5 minutes to see how a portfolio review can surface what you may be missing. No commitment required." },
        { variant: 'B', channel: 'Email', headline: 'A fresh look at your portfolio — at no cost', copy: "As a Vanguard investor, you're eligible for a complimentary portfolio review. See where you stand, explore your options, and decide if a different path makes sense." },
        { variant: 'C', channel: 'App Push', headline: 'Your portfolio, reviewed in minutes', copy: 'Tap to explore a personalized portfolio review. Education-only — no sales, no obligation.' },
      ].map(v => (
        <Paper key={v.variant} withBorder p="sm" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${v.variant === 'A' ? 'teal' : v.variant === 'B' ? 'blue' : 'violet'}-5)` }}>
          <Stack gap="xs">
            <Group gap="xs">
              <Badge size="xs" color={v.variant === 'A' ? 'teal' : v.variant === 'B' ? 'blue' : 'violet'} variant="filled">Variant {v.variant}</Badge>
              <Badge size="xs" color="gray" variant="outline">{v.channel}</Badge>
              <Badge size="xs" color="green" variant="light">Education</Badge>
            </Group>
            <Text size="sm" fw={700}>{v.headline}</Text>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{v.copy}</Text>
          </Stack>
        </Paper>
      ))}
      <Alert color="teal" variant="light" icon={<IconShieldCheck size={14} />} p="xs">
        <Text size="xs">All variants education-classified · No advice payload · Disclosures attached · C2PA provenance recorded</Text>
      </Alert>
    </Stack>
  )
}

import { IconSend, IconDatabase, IconChartBar, IconTrendingUp } from '@tabler/icons-react'

export default function ContentEngine() {
  const [signal, setSignal] = useState('advisory-gap')
  const [cohort, setCohort] = useState('planning-intent')
  const [angle, setAngle] = useState('portfolio-review')
  const [phase, setPhase] = useState('ready') // ready | generating | done
  const meta = SIGNAL_META[signal] || SIGNAL_META['advisory-gap']
  const cohortObj = COHORT_PROFILES.find(c => c.value === cohort) || COHORT_PROFILES[0]

  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Text size="xl" fw={800} c="orange">Content Engine</Text>
        <Text size="sm" c="dimmed">AI-powered investor content supply chain — signal-driven brief to multi-channel deployment with five-rail compliance processing, education/advice boundary classification, and AUM attribution on every piece</Text>
      </Stack>

      <SimpleGrid cols={4} spacing="sm">
        <KpiTile label="Total Reach (90d)" value="37K" color="orange" icon={IconSend} />
        <KpiTile label="Conversions" value="919" sub="investor actions taken" color="teal" icon={IconTrendingUp} />
        <KpiTile label="AUM Under Advice" value="$31.8M" sub="attributed to content" color="violet" icon={IconDatabase} />
        <KpiTile label="Avg Compliance Score" value="93/100" color="green" icon={IconShieldCheck} />
      </SimpleGrid>

      <SimpleGrid cols={2} spacing="md">
        {/* Left — Content Architect Brief */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon size={24} radius="md" color="orange" variant="light">
                <IconEdit size={14} stroke={1.5} />
              </ThemeIcon>
              <Text fw={700} size="sm">Content Architect Brief</Text>
            </Group>

            <Stack gap="xs">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Market Signal</Text>
              <Select data={SIGNALS} value={signal} onChange={v => { setSignal(v); setPhase('ready') }} />
            </Stack>

            <Stack gap="xs">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Participant Cohort Profile</Text>
              <Select data={COHORT_PROFILES.map(c => ({ value: c.value, label: c.label }))} value={cohort} onChange={v => { setCohort(v); setPhase('ready') }} />
              <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>{cohortObj.description}</Text>
            </Stack>

            <Stack gap="xs">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Product Angle</Text>
              <Select data={PRODUCT_ANGLES} value={angle} onChange={v => { setAngle(v); setPhase('ready') }} />
            </Stack>

            <Alert
              color={meta.critical ? 'red' : 'orange'}
              variant="light"
              p="sm"
            >
              <Stack gap={4}>
                <Badge size="xs" color={meta.critical ? 'red' : 'orange'} variant="filled">{meta.critical ? 'CRITICAL' : 'HIGH'}</Badge>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">{meta.count} investors · cohort in scope</Text>
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">Confidence: {meta.confidence} · {meta.maturity} maturity</Text>
                </Group>
                <Text size="xs" c="dimmed">Content Architect will generate content grounded in this signal</Text>
              </Stack>
            </Alert>

            <Button
              leftSection={<IconSparkles size={14} />}
              color="orange"
              onClick={() => setPhase('generating')}
              disabled={phase === 'generating'}
            >
              Generate Content
            </Button>
          </Stack>
        </Paper>

        {/* Right — generated content or placeholder */}
        <Paper withBorder p="md" radius="md" style={{ minHeight: 420 }}>
          {phase === 'ready' && (
            <Center h={380}>
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="xl" variant="light" color="orange">
                  <IconSparkles size={24} stroke={1.5} />
                </ThemeIcon>
                <Text fw={600} size="sm">Content Architect ready</Text>
                <Text size="xs" c="dimmed" ta="center" maw={260}>
                  Select a signal and participant cohort profile, then click Generate Content to create education-classified content across Secure Site, Email, and App Push channels.
                </Text>
              </Stack>
            </Center>
          )}
          {phase === 'generating' && <GeneratingState onDone={() => setPhase('done')} />}
          {phase === 'done' && <GeneratedContent signal={signal} cohort={cohort} angle={angle} />}
        </Paper>
      </SimpleGrid>

      {/* Analytics section */}
      <Stack gap="xs">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Content Performance & Analytics</Text>
        <SimpleGrid cols={2} spacing="md">
          {/* Demand signals */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Investor Content Demand Signals</Text>
              {DEMAND_SIGNALS.map((s, i) => (
                <Group key={i} justify="space-between" align="center">
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text size="xs" fw={600}>{s.label}</Text>
                      <Badge size="xs" color={SEVERITY_COLORS[s.severity]} variant="light">{s.severity}</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{s.count}</Text>
                  </Stack>
                  <Text size="xs" c="green" fw={600}>{s.delta}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          {/* AUM lift chart */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>AUM Lift Attributed Per Content Piece (90d · $M)</Text>
              <BarChart
                h={200}
                data={AUM_LIFT_DATA}
                dataKey="name"
                series={[{ name: 'aum', color: 'orange', label: 'AUM Lift ($M)' }]}
                tickLine="none"
                gridAxis="x"
              />
            </Stack>
          </Paper>

          {/* Channel reach */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Channel Reach by Content Piece</Text>
              <BarChart
                h={200}
                data={CHANNEL_REACH_DATA}
                dataKey="name"
                series={[
                  { name: 'securesite', color: 'teal', label: 'Secure Site' },
                  { name: 'email', color: 'orange', label: 'Email' },
                  { name: 'apppush', color: 'violet', label: 'App Push' },
                ]}
                type="stacked"
                tickLine="none"
                gridAxis="x"
              />
            </Stack>
          </Paper>

          {/* Engagement trend */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Content Engagement Trend — 6 Months</Text>
              <LineChart
                h={200}
                data={ENGAGEMENT_TREND}
                dataKey="month"
                series={[
                  { name: 'treatment', color: 'teal', label: 'Treatment' },
                  { name: 'holdout', color: 'orange', label: 'Holdout' },
                ]}
                tickLine="none"
                gridAxis="x"
              />
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>

      {/* Content library table */}
      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Vanguard Personal Wealth Content Library — Performance</Text>
          <Table striped highlightOnHover withTableBorder fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Content</Table.Th>
                <Table.Th>Author</Table.Th>
                <Table.Th>Reach</Table.Th>
                <Table.Th>Opens</Table.Th>
                <Table.Th>Conversions</Table.Th>
                <Table.Th>AUM Lift</Table.Th>
                <Table.Th>Compliance</Table.Th>
                <Table.Th>C2PA</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {CONTENT_LIBRARY.map((row, i) => (
                <Table.Tr key={i}>
                  <Table.Td fw={600}>{row.title}</Table.Td>
                  <Table.Td c="dimmed">{row.author}</Table.Td>
                  <Table.Td>{row.reach}</Table.Td>
                  <Table.Td>{row.opens}</Table.Td>
                  <Table.Td c="green" fw={600}>{row.conversions}</Table.Td>
                  <Table.Td c="violet" fw={600}>{row.aumLift}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Progress value={row.compliance} color={row.compliance >= 90 ? 'green' : 'orange'} size="xs" w={40} />
                      <Text size="xs" c={row.compliance >= 90 ? 'green' : 'orange'} fw={600}>{row.compliance}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color={row.c2pa ? 'teal' : 'gray'} variant={row.c2pa ? 'filled' : 'outline'}>
                      {row.c2pa ? 'C2PA' : 'HUMAN'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  )
}
