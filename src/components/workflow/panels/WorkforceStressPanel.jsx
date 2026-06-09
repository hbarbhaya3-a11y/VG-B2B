import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider, Alert, Progress } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import {
  IconChevronRight, IconCurrencyDollar, IconTrendingDown, IconTrendingUp,
  IconShieldCheck, IconBuildingBank, IconUsers, IconHeartbeat, IconHourglass
} from '@tabler/icons-react'
import PanelGuide from '../../ui/PanelGuide'

const DEFAULT = {
  employer: 'Northstar Retail',
  employeeCount: 4800,
  annualCost: 18_400_000,
  industryP50: 13_200_000,
  breakdown: [
    { key: 'Productivity loss',  pct: 0.42, icon: IconHourglass, color: 'orange' },
    { key: 'Turnover',           pct: 0.28, icon: IconUsers,     color: 'red' },
    { key: 'Healthcare claims',  pct: 0.21, icon: IconHeartbeat, color: 'grape' },
    { key: 'Absenteeism',        pct: 0.09, icon: IconTrendingDown, color: 'yellow' },
  ],
  interventions: [
    { name: 'Emergency-savings match for <35', y1Savings: 2_100_000, breakeven: '14 months', roi: 2.4 },
    { name: 'Financial-coaching portal',        y1Savings: 1_150_000, breakeven: '20 months', roi: 1.6 },
    { name: 'Auto-escalate cap to 12%',         y1Savings: 640_000,   breakeven: '28 months', roi: 1.2 },
  ],
}

export default function WorkforceStressPanel({ step, onContinue, activeUseCase }) {
  const d = step?.panelData?.stress || DEFAULT
  const vsIndustry = Math.round(((d.annualCost - d.industryP50) / d.industryP50) * 100)
  const breakdownData = d.breakdown.map(b => ({
    key: b.key,
    'Annual cost': Math.round(d.annualCost * b.pct),
  }))
  const guide = step?.panelData?.panelGuide

  return (
    <Stack gap="md">
      {guide && <PanelGuide {...guide} />}
      <Alert color="red" variant="light" icon={<IconCurrencyDollar size={16} />} radius="md">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Stack gap={0}>
            <Text size="sm" fw={700}>Workforce financial stress — CFO view</Text>
            <Text size="xs" c="dimmed">
              {d.employer} · {d.employeeCount.toLocaleString()} employees · benchmarked against industry peer set
            </Text>
          </Stack>
          <Badge size="sm" variant="filled" color={vsIndustry > 0 ? 'red' : 'teal'}>
            {vsIndustry > 0 ? '+' : ''}{vsIndustry}% vs. industry P50
          </Badge>
        </Group>
      </Alert>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper withBorder p="lg" radius="md"
          style={{ background: 'linear-gradient(135deg, var(--mantine-color-red-light), transparent 85%)' }}>
          <Stack gap={4} align="center">
            <ThemeIcon size={44} radius="xl" variant="gradient" gradient={{ from: 'red', to: 'orange', deg: 135 }}>
              <IconCurrencyDollar size={22} />
            </ThemeIcon>
            <Text size="11px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
              Annual stress cost
            </Text>
            <Text size="32px" fw={800} c="red.7" lh={1}>
              ${(d.annualCost / 1e6).toFixed(1)}M
            </Text>
            <Text size="xs" c="dimmed">~${Math.round(d.annualCost / d.employeeCount).toLocaleString()} per employee / year</Text>
            <Divider w="100%" my={4} />
            <Text size="xs" c="dimmed" ta="center">
              Industry P50: ${(d.industryP50 / 1e6).toFixed(1)}M · your exposure is{' '}
              <Text span fw={700} c={vsIndustry > 0 ? 'red.7' : 'teal.7'}>{Math.abs(vsIndustry)}%</Text>{' '}
              {vsIndustry > 0 ? 'above' : 'below'} peer median
            </Text>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md" style={{ gridColumn: 'span 2' }}>
          <Stack gap={6}>
            <Text fw={700} size="sm">Cost breakdown by driver</Text>
            <BarChart
              h={220}
              data={breakdownData}
              dataKey="key"
              orientation="vertical"
              series={[{ name: 'Annual cost', color: 'vanguardRed.6' }]}
              valueFormatter={v => `$${(v / 1e6).toFixed(1)}M`}
              withBarValueLabel
              barProps={{ radius: 4 }}
              tickLine="y"
            />
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon size="sm" radius="xl" variant="light" color="teal"><IconTrendingUp size={12} /></ThemeIcon>
              <Text fw={700} size="sm">Intervention ROI simulator</Text>
            </Group>
            <Text size="xs" c="dimmed">Ranked by year-1 savings · simulated against your workforce twin</Text>
          </Group>
          <Stack gap={6}>
            {d.interventions.map((it, i) => (
              <Paper key={it.name} withBorder radius="md" p="sm"
                style={{ borderLeft: `3px solid var(--mantine-color-${i === 0 ? 'teal' : 'blue'}-6)` }}>
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="10px" fw={700} c="dimmed" w={16}>#{i + 1}</Text>
                    <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={600}>{it.name}</Text>
                      <Text size="10px" c="dimmed">Breakeven {it.breakeven} · ROI {it.roi}x</Text>
                    </Stack>
                  </Group>
                  <Stack gap={0} align="flex-end">
                    <Text size="sm" fw={800} c="teal.7">${(it.y1Savings / 1e6).toFixed(1)}M</Text>
                    <Text size="9px" c="dimmed" tt="uppercase">Year-1 savings</Text>
                  </Stack>
                  {i === 0 && <Badge size="xs" variant="filled" color="teal">Top ROI</Badge>}
                </Group>
                <Progress value={Math.min(100, (it.y1Savings / d.interventions[0].y1Savings) * 100)} color={i === 0 ? 'teal' : 'blue'} size="xs" mt={6} radius="sm" />
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          <IconShieldCheck size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Translates participant financial-wellness signals into quantified business cost for CFO / CHRO conversations.
        </Text>
        <Button onClick={onContinue} rightSection={<IconChevronRight size={14} />}>Continue</Button>
      </Group>
    </Stack>
  )
}
