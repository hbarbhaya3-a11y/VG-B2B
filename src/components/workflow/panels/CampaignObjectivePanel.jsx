import { useState } from 'react'
import {
  Stack, Group, Text, Badge, Button, Select, Paper, Divider, Box,
  ThemeIcon, SimpleGrid,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconTarget, IconTrendingUp, IconShieldCheck, IconPlayerPlay, IconBook,
  IconArrowsExchange, IconCurrencyDollar, IconCalendar, IconChevronRight,
  IconSparkles, IconChartBar,
} from '@tabler/icons-react'

const ALL_KPIS = [
  { value: 'advisory_starts',      label: 'Advisory consultation starts' },
  { value: 'aum_under_advice',     label: 'AUM transitioned to advice' },
  { value: 'advisor_bookings',     label: 'Advisor appointment bookings' },
  { value: 'incremental_aum',      label: 'Incremental AUM under management' },
  { value: 'portfolio_reviews',    label: 'Portfolio review completions' },
  { value: 'funded_advisory',      label: 'Funded advisory accounts' },
  { value: 'outflow_reduction',    label: 'Reduced asset outflow rate' },
  { value: 'closure_prevention',   label: 'Account closure prevention rate' },
  { value: 're_engagement',        label: 'Re-engagement rate' },
  { value: 'cash_conversion',      label: 'Cash-to-investment conversion' },
  { value: 'planning_engagement',  label: 'Planning-tool engagement rate' },
  { value: 'funded_action',        label: 'Funded action rate' },
  { value: 'planning_completion',  label: 'Planning-tool completion rate' },
  { value: 'content_engagement',   label: 'Content engagement depth' },
  { value: 'return_visit',         label: 'Return visit rate' },
  { value: 'email_open',           label: 'Email open rate' },
  { value: 'click_through',        label: 'Click-through rate' },
  { value: 'campaign_roi',         label: 'Campaign ROI multiple' },
]

const DEFAULT_KPIS = {
  cross_sell:  { primary: 'advisory_starts',     secondary: 'aum_under_advice',    tertiary: 'advisor_bookings' },
  aum_growth:  { primary: 'incremental_aum',     secondary: 'portfolio_reviews',   tertiary: 'funded_advisory' },
  retention:   { primary: 'outflow_reduction',   secondary: 'closure_prevention',  tertiary: 're_engagement' },
  activation:  { primary: 'cash_conversion',     secondary: 'planning_engagement', tertiary: 'funded_action' },
  education:   { primary: 'planning_completion', secondary: 'content_engagement',  tertiary: 'return_visit' },
}

export default function CampaignObjectivePanel({ panelData: pd, onContinue }) {
  const [selectedObjective, setSelectedObjective] = useState(pd.defaultObjective)

  const defaultKpis = DEFAULT_KPIS[pd.defaultObjective]
  const [primaryKpi,   setPrimaryKpi]   = useState(defaultKpis.primary)
  const [secondaryKpi, setSecondaryKpi] = useState(defaultKpis.secondary)
  const [tertiaryKpi,  setTertiaryKpi]  = useState(defaultKpis.tertiary)

  const [budget,    setBudget]    = useState(String(pd.defaultBudget))
  const [startDate, setStartDate] = useState(null)
  const [endDate,   setEndDate]   = useState(null)

  const selectedObj = pd.objectives.find(o => o.id === selectedObjective)
  const selectedBudgetLabel = pd.budgetOptions.find(b => String(b.value) === String(budget))?.label || budget

  const kpiLabel = (val) => ALL_KPIS.find(k => k.value === val)?.label || val

  const handleObjectiveChange = (val) => {
    setSelectedObjective(val)
    const kpis = DEFAULT_KPIS[val] || defaultKpis
    setPrimaryKpi(kpis.primary)
    setSecondaryKpi(kpis.secondary)
    setTertiaryKpi(kpis.tertiary)
  }

  const durationDays = startDate && endDate
    ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : null

  const summaryDuration = durationDays ? `${durationDays}-day` : 'undefined-duration'

  return (
    <Stack gap="lg">
      {/* Title */}
      <Group gap="xs">
        <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'vanguardRed', to: 'orange', deg: 135 }}>
          <IconTarget size={18} stroke={1.5} />
        </ThemeIcon>
        <Box>
          <Text size="xl" fw={800}>Define your campaign objective</Text>
          <Text size="sm" c="dimmed">Set your goal, dates, budget, and KPIs before the signal pipeline runs.</Text>
        </Box>
      </Group>

      {/* Row 1: Objective + Budget */}
      <SimpleGrid cols={2} spacing="md">
        <Stack gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Campaign Objective</Text>
          <Select
            data={pd.objectives.map(o => ({ value: o.id, label: o.label }))}
            value={selectedObjective}
            onChange={handleObjectiveChange}
            radius="md"
            leftSection={<IconTarget size={14} />}
            description={selectedObj?.description}
          />
          {selectedObj?.recommended && (
            <Badge size="xs" color="orange" variant="light" style={{ alignSelf: 'flex-start' }}>Recommended for advisory readiness signal</Badge>
          )}
        </Stack>

        <Stack gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Campaign Budget</Text>
          <Select
            data={pd.budgetOptions.map(b => ({ value: String(b.value), label: b.label }))}
            value={String(budget)}
            onChange={setBudget}
            radius="md"
            leftSection={<IconCurrencyDollar size={14} />}
          />
        </Stack>
      </SimpleGrid>

      {/* Row 2: Start date + End date */}
      <SimpleGrid cols={2} spacing="md">
        <Stack gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Campaign Start Date</Text>
          <DatePickerInput
            placeholder="Pick start date"
            value={startDate}
            onChange={setStartDate}
            radius="md"
            leftSection={<IconCalendar size={14} />}
            minDate={new Date()}
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Campaign End Date</Text>
          <DatePickerInput
            placeholder="Pick end date"
            value={endDate}
            onChange={setEndDate}
            radius="md"
            leftSection={<IconCalendar size={14} />}
            minDate={startDate || new Date()}
          />
        </Stack>
      </SimpleGrid>

      {durationDays && (
        <Badge size="sm" variant="light" color="violet" style={{ alignSelf: 'flex-start' }}>
          {durationDays} days · {startDate?.toLocaleDateString()} → {endDate?.toLocaleDateString()}
        </Badge>
      )}

      <Divider label="Success KPIs" labelPosition="left" />

      {/* KPI dropdowns */}
      <SimpleGrid cols={3} spacing="md">
        <Stack gap="xs">
          <Group gap={4}>
            <IconChartBar size={13} stroke={1.5} style={{ color: 'var(--mantine-color-red-6)' }} />
            <Text size="xs" fw={700} c="red">Primary KPI</Text>
          </Group>
          <Select
            data={ALL_KPIS}
            value={primaryKpi}
            onChange={setPrimaryKpi}
            radius="md"
            size="xs"
          />
        </Stack>
        <Stack gap="xs">
          <Group gap={4}>
            <IconChartBar size={13} stroke={1.5} style={{ color: 'var(--mantine-color-orange-6)' }} />
            <Text size="xs" fw={700} c="orange">Secondary KPI</Text>
          </Group>
          <Select
            data={ALL_KPIS}
            value={secondaryKpi}
            onChange={setSecondaryKpi}
            radius="md"
            size="xs"
          />
        </Stack>
        <Stack gap="xs">
          <Group gap={4}>
            <IconChartBar size={13} stroke={1.5} style={{ color: 'var(--mantine-color-gray-6)' }} />
            <Text size="xs" fw={700} c="dimmed">Tertiary KPI</Text>
          </Group>
          <Select
            data={ALL_KPIS}
            value={tertiaryKpi}
            onChange={setTertiaryKpi}
            radius="md"
            size="xs"
          />
        </Stack>
      </SimpleGrid>

      {/* Summary */}
      <Paper withBorder radius="md" p="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
        <Group gap="xs" mb={6}>
          <IconSparkles size={14} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Campaign Summary</Text>
        </Group>
        <Text size="sm">
          A <strong>{summaryDuration}</strong> <strong>{selectedObj?.label}</strong> campaign
          with a <strong>{selectedBudgetLabel.split(' —')[0]}</strong> budget.
          TwinX will optimise signal detection, segmentation, simulation, and content to this goal,
          measuring <strong>{kpiLabel(primaryKpi)}</strong> as the primary success metric.
        </Text>
      </Paper>

      <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="md"
          variant="gradient"
          gradient={{ from: 'red', to: 'orange', deg: 135 }}
          rightSection={<IconChevronRight size={16} stroke={2} />}
          onClick={onContinue}
          styles={{ root: { boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)' } }}
        >
          Confirm objective &amp; run signal scan →
        </Button>
      </Box>
    </Stack>
  )
}
