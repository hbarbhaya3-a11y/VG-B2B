import { Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, Alert } from '@mantine/core'
import { IconTrendingUp, IconDatabase, IconUsers, IconShieldCheck, IconInfoCircle } from '@tabler/icons-react'
import { BarChart, LineChart } from '@mantine/charts'

const KPI_TILES = [
  { label: 'Engagement Rate', value: '31%', sub: 'treatment cohort · 30-day window', color: 'teal', icon: IconTrendingUp },
  { label: 'AUM Under Advice', value: '$31.8M', sub: '+7.6% vs holdout baseline', color: 'violet', icon: IconDatabase },
  { label: 'Advisory Starts', value: '+440', sub: 'incremental vs do-nothing', color: 'orange', icon: IconUsers },
  { label: 'Investors Converted', value: '919', sub: 'advisory or portfolio review action', color: 'green', icon: IconShieldCheck },
]

const SHAPLEY_DATA = [
  { name: 'Portfolio Review Card', contribution: 38 },
  { name: 'Email Education', contribution: 27 },
  { name: 'App Push Nudge', contribution: 18 },
  { name: 'Secure Site Insight', contribution: 11 },
  { name: 'Advisor Consultation Brief', contribution: 6 },
]

const TREATMENT_VS_HOLDOUT = [
  { episode: 'Advisory Readiness Gap', treatment: 31, holdout: 7 },
  { episode: 'Idle Cash Activation', treatment: 26, holdout: 6 },
  { episode: 'Volatility Response', treatment: 19, holdout: 5 },
]

const AUM_TREND = [
  { day: 'Day 0', treatment: 0, holdout: 0 },
  { day: 'Day 7', treatment: 4.2, holdout: 0.8 },
  { day: 'Day 14', treatment: 11.8, holdout: 1.4 },
  { day: 'Day 21', treatment: 23.4, holdout: 2.1 },
  { day: 'Day 30', treatment: 31.8, holdout: 2.9 },
]

const SEGMENT_ATTRIBUTION = [
  { segment: 'Planning-Intent, Unadvised', investors: 11800, engagementRate: '34%', advisoryStarts: 188, aumLift: '$12.4M', shapleyShare: '39%', color: 'orange' },
  { segment: 'Cash-Heavy, Low-Conviction', investors: 7900, engagementRate: '29%', advisoryStarts: 94, aumLift: '$8.1M', shapleyShare: '26%', color: 'yellow' },
  { segment: 'Multi-Fund Complexity', investors: 6200, engagementRate: '26%', advisoryStarts: 72, aumLift: '$5.9M', shapleyShare: '19%', color: 'blue' },
  { segment: 'Volatility Recheckers', investors: 5800, engagementRate: '38%', advisoryStarts: 48, aumLift: '$3.2M', shapleyShare: '10%', color: 'indigo' },
  { segment: 'Retirement Income Planners', investors: 4700, engagementRate: '22%', advisoryStarts: 28, aumLift: '$1.6M', shapleyShare: '5%', color: 'teal' },
  { segment: 'Tax-Efficiency Seekers + Others', investors: 5600, engagementRate: '18%', advisoryStarts: 10, aumLift: '$0.6M', shapleyShare: '1%', color: 'green' },
]

const MODEL_UPDATE = {
  prior: 'Advisory readiness — planning-intent segment',
  before: '12%',
  after: '34%',
  twinsEnriched: 42000,
  episode: 'Advisory Readiness Gap · 30-day window · 6 behavioral segments',
}

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

export default function OutcomeAttribution() {
  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Text size="xl" fw={800} c="grape">Outcome Attribution</Text>
        <Text size="sm" c="dimmed">Shapley attribution and causal measurement across advisory conversion, AUM uplift, and engagement — treatment vs. holdout controlled measurement on every deployed intervention</Text>
      </Stack>

      <SimpleGrid cols={4} spacing="sm">
        {KPI_TILES.map(t => <KpiTile key={t.label} {...t} />)}
      </SimpleGrid>

      <SimpleGrid cols={2} spacing="md">
        {/* Shapley attribution */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="xs">
            <Group gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Shapley Attribution — Content Contribution to AUM Outcomes</Text>
            </Group>
            <BarChart
              h={220}
              data={SHAPLEY_DATA}
              dataKey="name"
              series={[{ name: 'contribution', color: 'green', label: 'Contribution to AUM Lift (%)' }]}
              tickLine="none"
              gridAxis="x"
            />
          </Stack>
        </Paper>

        {/* Treatment vs holdout — last 3 episodes */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Treatment vs. Holdout — Last 3 Episodes</Text>
            <BarChart
              h={220}
              data={TREATMENT_VS_HOLDOUT}
              dataKey="episode"
              series={[
                { name: 'treatment', color: 'green', label: 'Treatment' },
                { name: 'holdout', color: 'gray', label: 'Holdout' },
              ]}
              tickLine="none"
              gridAxis="x"
            />
          </Stack>
        </Paper>

        {/* AUM accumulation curve */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>AUM Accumulation — Treatment vs. Holdout ($M)</Text>
            <LineChart
              h={200}
              data={AUM_TREND}
              dataKey="day"
              series={[
                { name: 'treatment', color: 'violet', label: 'Treatment' },
                { name: 'holdout', color: 'gray', label: 'Holdout' },
              ]}
              tickLine="none"
              gridAxis="x"
            />
          </Stack>
        </Paper>

        {/* Twin model update */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="sm">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Learning System — Twin Model Update</Text>
            <Paper withBorder p="sm" radius="md" style={{ background: 'var(--mantine-color-violet-light)' }}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" fw={600}>{MODEL_UPDATE.prior}</Text>
                  <Badge size="xs" color="violet" variant="light">Updated</Badge>
                </Group>
                <Group gap="xl">
                  <Stack gap={2} align="center">
                    <Text size="xs" c="dimmed">Prior (before)</Text>
                    <Text size="lg" fw={800} c="dimmed">{MODEL_UPDATE.before}</Text>
                  </Stack>
                  <Text size="lg" c="dimmed">→</Text>
                  <Stack gap={2} align="center">
                    <Text size="xs" c="dimmed">Posterior (after)</Text>
                    <Text size="lg" fw={800} c="violet">{MODEL_UPDATE.after}</Text>
                  </Stack>
                </Group>
                <Divider />
                <Text size="xs" c="dimmed">{MODEL_UPDATE.twinsEnriched.toLocaleString()} investor twins enriched · {MODEL_UPDATE.episode}</Text>
              </Stack>
            </Paper>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>
              Every investor that engaged in this episode has an updated behavioral prior. The next signal matching this pattern will benefit from richer model calibration.
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Segment-level attribution table */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Segment-Level Attribution — Advisory Readiness Gap Episode</Text>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                  {['Segment', 'Investors', 'Engagement Rate', 'Advisory Starts', 'AUM Lift', 'Shapley Share'].map(h => (
                    <th key={h} style={{ padding: '6px 12px', textAlign: 'left', color: 'var(--mantine-color-dimmed)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SEGMENT_ATTRIBUTION.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--mantine-color-gray-2)', background: i % 2 === 0 ? 'transparent' : 'var(--mantine-color-gray-0)' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <Group gap="xs">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--mantine-color-${row.color}-5)`, flexShrink: 0 }} />
                        <Text size="xs" fw={600}>{row.segment}</Text>
                      </Group>
                    </td>
                    <td style={{ padding: '8px 12px' }}><Text size="xs">{row.investors.toLocaleString()}</Text></td>
                    <td style={{ padding: '8px 12px' }}><Text size="xs" c="teal" fw={600}>{row.engagementRate}</Text></td>
                    <td style={{ padding: '8px 12px' }}><Text size="xs" c="orange" fw={600}>+{row.advisoryStarts}</Text></td>
                    <td style={{ padding: '8px 12px' }}><Text size="xs" c="violet" fw={600}>{row.aumLift}</Text></td>
                    <td style={{ padding: '8px 12px' }}><Text size="xs" fw={600}>{row.shapleyShare}</Text></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Stack>
      </Paper>

      <Alert color="teal" variant="light" icon={<IconInfoCircle size={14} />} p="sm">
        <Text size="xs">Always-on 10% holdout group — causal estimation, not correlation. Holdout investors receive no interventions during the episode measurement window.</Text>
      </Alert>
    </Stack>
  )
}
