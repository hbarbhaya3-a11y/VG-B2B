import { useState } from 'react'
import {
  Stack, Group, Text, Badge, Button, Select, MultiSelect, Paper, Divider, Box,
  ThemeIcon, SimpleGrid, ActionIcon, NumberInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconTarget, IconCurrencyDollar, IconCalendar, IconChevronRight,
  IconSparkles, IconChartBar, IconX,
} from '@tabler/icons-react'

const ALL_KPIS = [
  { value: 'advisory_starts',     label: 'Participation lift' },
  { value: 'aum_under_advice',    label: 'Incremental enrollments' },
  { value: 'advisor_bookings',    label: 'New-hire participation rate' },
  { value: 'incremental_aum',     label: 'Average deferral lift' },
  { value: 'portfolio_reviews',   label: 'Match utilization rate' },
  { value: 'funded_advisory',     label: 'Full-match capture rate' },
  { value: 'outflow_reduction',   label: 'Participation-disparity reduction' },
  { value: 'closure_prevention',  label: 'Cohort equity index' },
  { value: 're_engagement',       label: 'Re-enrollment rate' },
  { value: 'cash_conversion',     label: 'Below-match → full-match conversion' },
  { value: 'planning_engagement', label: 'Auto-escalation adoption' },
  { value: 'funded_action',       label: 'Catch-up adoption rate' },
  { value: 'planning_completion', label: 'Retirement-readiness engagement' },
  { value: 'content_engagement',  label: 'Content completion depth' },
  { value: 'return_visit',        label: 'QDIA adoption rate' },
  { value: 'email_open',          label: 'Notice open rate' },
  { value: 'click_through',       label: 'Portal click-through rate' },
  { value: 'campaign_roi',        label: 'Cost-per-incremental-enrollment' },
  { value: 'aum_retained',        label: 'Opt-out rate' },
  { value: 'idle_cash_activated', label: 'Employer cost impact' },
  { value: 'annual_advisory_rev', label: 'Projected retirement-readiness gain' },
]

const DEFAULT_KPIS = {
  cross_sell: ['advisory_starts', 'aum_under_advice', 'aum_retained', 'idle_cash_activated'],
  aum_growth: ['incremental_aum', 'portfolio_reviews', 'funded_advisory'],
  retention:  ['outflow_reduction', 'closure_prevention', 're_engagement'],
  activation: ['cash_conversion', 'planning_engagement', 'funded_action'],
  education:  ['planning_completion', 'content_engagement', 'return_visit'],
}

const DEFAULT_SECONDARY_OBJ = {
  cross_sell: 'aum_growth',
  aum_growth: 'cross_sell',
  retention:  'activation',
  activation: 'cross_sell',
  education:  'activation',
}

const kpiLabel = (val) => ALL_KPIS.find(k => k.value === val)?.label || val

export default function CampaignObjectivePanel({ panelData: pd, onContinue }) {
  const [primaryObj,   setPrimaryObj]   = useState(pd.defaultObjective)
  const [secondaryObj, setSecondaryObj] = useState(DEFAULT_SECONDARY_OBJ[pd.defaultObjective] ?? null)
  const [showSecondary, setShowSecondary] = useState(true)

  const [selectedKpis, setSelectedKpis] = useState(DEFAULT_KPIS[pd.defaultObjective] ?? [])

  const [budget,    setBudget]    = useState(pd.defaultBudget)
  const [startDate, setStartDate] = useState(new Date('2026-06-15'))
  const [endDate,   setEndDate]   = useState(new Date('2026-07-15'))

  const handlePrimaryObjChange = (val) => {
    setPrimaryObj(val)
    setSelectedKpis(DEFAULT_KPIS[val] ?? [])
    // update secondary if it conflicts
    if (secondaryObj === val) setSecondaryObj(DEFAULT_SECONDARY_OBJ[val] ?? null)
  }

  const handleRemoveSecondary = () => {
    setShowSecondary(false)
    setSecondaryObj(null)
  }

  const primaryObjData   = pd.objectives.find(o => o.id === primaryObj)
  const secondaryObjData = pd.objectives.find(o => o.id === secondaryObj)
  const validBudget      = budget !== '' && budget !== null && !isNaN(Number(budget)) && Number(budget) > 0
  const formattedBudget  = validBudget ? `$${Number(budget).toLocaleString()}` : 'unset'

  const durationDays = startDate && endDate
    ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : null

  const secondaryObjectiveOptions = pd.objectives
    .filter(o => o.id !== primaryObj)
    .map(o => ({ value: o.id, label: o.label }))

  return (
    <Stack gap="lg">
      {/* Title */}
      <Group gap="xs">
        <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'vanguardRed', to: 'orange', deg: 135 }}>
          <IconTarget size={18} stroke={1.5} />
        </ThemeIcon>
        <Box>
          <Text size="xl" fw={800}>Sponsor decision objective</Text>
          <Text size="sm" c="dimmed">Set your goal, dates, and budget — TwinX will align the full pipeline to this.</Text>
        </Box>
      </Group>

      {/* Primary objective */}
      <Stack gap="xs">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Primary Objective</Text>
        <Select
          data={pd.objectives.map(o => ({ value: o.id, label: o.label }))}
          value={primaryObj}
          onChange={handlePrimaryObjChange}
          radius="md"
          leftSection={<IconTarget size={14} />}
          description={primaryObjData?.description}
        />
        {primaryObjData?.recommended && (
          <Badge size="xs" color="orange" variant="light" style={{ alignSelf: 'flex-start' }}>
            Recommended for this signal
          </Badge>
        )}
      </Stack>

      {/* Secondary objective */}
      {showSecondary ? (
        <Stack gap="xs">
          <Group gap="xs" align="center">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Secondary Objective</Text>
            <ActionIcon size="xs" variant="subtle" color="gray" onClick={handleRemoveSecondary}>
              <IconX size={11} />
            </ActionIcon>
          </Group>
          <Select
            data={secondaryObjectiveOptions}
            value={secondaryObj}
            onChange={setSecondaryObj}
            radius="md"
            leftSection={<IconTarget size={14} />}
            description={secondaryObjData?.description}
          />
        </Stack>
      ) : (
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          leftSection={<IconTarget size={13} />}
          style={{ alignSelf: 'flex-start' }}
          onClick={() => { setShowSecondary(true); setSecondaryObj(DEFAULT_SECONDARY_OBJ[primaryObj] ?? null) }}
        >
          Add secondary objective
        </Button>
      )}

      <Divider />

      {/* Budget + Dates */}
      <SimpleGrid cols={3} spacing="md">
        <Stack gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Employer cost ceiling ($)</Text>
          <NumberInput
            value={budget}
            onChange={setBudget}
            radius="md"
            min={0}
            step={10000}
            thousandSeparator=","
            leftSection={<IconCurrencyDollar size={14} />}
            placeholder="e.g. 150000"
          />
        </Stack>
        <Stack gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Start Date</Text>
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
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>End Date</Text>
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

      {/* Multi-select KPIs */}
      <Stack gap="xs">
        <Group gap={4}>
          <IconChartBar size={13} stroke={1.5} style={{ color: 'var(--mantine-color-red-6)' }} />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>KPIs to track</Text>
          <Badge size="xs" variant="light" color="orange">{selectedKpis.length} selected</Badge>
        </Group>
        <MultiSelect
          data={ALL_KPIS}
          value={selectedKpis}
          onChange={setSelectedKpis}
          radius="md"
          placeholder="Select one or more KPIs…"
          searchable
          clearable
          maxDropdownHeight={300}
        />
      </Stack>

      {/* Summary */}
      <Paper withBorder radius="md" p="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
        <Group gap="xs" mb={6}>
          <IconSparkles size={14} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Sponsor Decision Summary</Text>
        </Group>
        <Text size="sm">
          {durationDays ? <><strong>{durationDays}-day </strong></> : null}
          <strong>{primaryObjData?.label}</strong>
          {secondaryObjData ? <> + <strong>{secondaryObjData.label}</strong></> : null}
          {' '}campaign · budget <strong>{formattedBudget}</strong>
          {selectedKpis.length > 0 && (
            <> · measuring <strong>{selectedKpis.map(k => kpiLabel(k)).join(', ')}</strong></>
          )}
          .
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
          Confirm &amp; continue →
        </Button>
      </Box>
    </Stack>
  )
}
