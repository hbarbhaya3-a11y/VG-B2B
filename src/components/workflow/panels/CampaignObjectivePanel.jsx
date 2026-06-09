import { useState } from 'react'
import {
  Stack, Group, Text, Badge, Button, Select, Paper, Divider, Box,
  ThemeIcon, SimpleGrid, ActionIcon,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconTarget, IconCurrencyDollar, IconCalendar, IconChevronRight,
  IconSparkles, IconChartBar, IconPlus, IconX,
} from '@tabler/icons-react'

const ALL_KPIS = [
  { value: 'advisory_starts',     label: 'Advisory consultation starts' },
  { value: 'aum_under_advice',    label: 'AUM transitioned to advice' },
  { value: 'advisor_bookings',    label: 'Advisor appointment bookings' },
  { value: 'incremental_aum',     label: 'Incremental AUM under management' },
  { value: 'portfolio_reviews',   label: 'Portfolio review completions' },
  { value: 'funded_advisory',     label: 'Funded advisory accounts' },
  { value: 'outflow_reduction',   label: 'Reduced asset outflow rate' },
  { value: 'closure_prevention',  label: 'Account closure prevention rate' },
  { value: 're_engagement',       label: 'Re-engagement rate' },
  { value: 'cash_conversion',     label: 'Cash-to-investment conversion' },
  { value: 'planning_engagement', label: 'Planning-tool engagement rate' },
  { value: 'funded_action',       label: 'Funded action rate' },
  { value: 'planning_completion', label: 'Planning-tool completion rate' },
  { value: 'content_engagement',  label: 'Content engagement depth' },
  { value: 'return_visit',        label: 'Return visit rate' },
  { value: 'email_open',          label: 'Email open rate' },
  { value: 'click_through',       label: 'Click-through rate' },
  { value: 'campaign_roi',        label: 'Campaign ROI multiple' },
]

// Map each objective's KPI values (matching ALL_KPIS values above)
const DEFAULT_KPIS = {
  cross_sell: { primary: 'advisory_starts',     secondary: 'aum_under_advice' },
  aum_growth: { primary: 'incremental_aum',     secondary: 'portfolio_reviews' },
  retention:  { primary: 'outflow_reduction',   secondary: 'closure_prevention' },
  activation: { primary: 'cash_conversion',     secondary: 'planning_engagement' },
  education:  { primary: 'planning_completion', secondary: 'content_engagement' },
}

const kpiLabel = (val) => ALL_KPIS.find(k => k.value === val)?.label || val

export default function CampaignObjectivePanel({ panelData: pd, onContinue }) {
  const [primaryObj,   setPrimaryObj]   = useState(pd.defaultObjective)
  const [secondaryObj, setSecondaryObj] = useState(null)
  const [showSecondary, setShowSecondary] = useState(false)

  const getKpis = (objId) => DEFAULT_KPIS[objId] || DEFAULT_KPIS.cross_sell
  const [primaryKpi,   setPrimaryKpi]   = useState(getKpis(pd.defaultObjective).primary)
  const [secondaryKpi, setSecondaryKpi] = useState(getKpis(pd.defaultObjective).secondary)

  const [budget,    setBudget]    = useState(String(pd.defaultBudget))
  const [startDate, setStartDate] = useState(null)
  const [endDate,   setEndDate]   = useState(null)

  const handlePrimaryObjChange = (val) => {
    setPrimaryObj(val)
    const kpis = getKpis(val)
    setPrimaryKpi(kpis.primary)
    setSecondaryKpi(kpis.secondary)
  }

  const handleAddSecondary = () => {
    setShowSecondary(true)
    // default secondary objective to the next one in the list
    const idx = pd.objectives.findIndex(o => o.id === primaryObj)
    const next = pd.objectives[(idx + 1) % pd.objectives.length]
    setSecondaryObj(next.id)
  }

  const handleRemoveSecondary = () => {
    setShowSecondary(false)
    setSecondaryObj(null)
  }

  const primaryObjData = pd.objectives.find(o => o.id === primaryObj)
  const secondaryObjData = pd.objectives.find(o => o.id === secondaryObj)
  const selectedBudgetLabel = pd.budgetOptions.find(b => String(b.value) === String(budget))?.label || budget

  const durationDays = startDate && endDate
    ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)))
    : null

  // objectives available for secondary — exclude the primary
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
          <Text size="xl" fw={800}>Campaign objective</Text>
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
      {!showSecondary ? (
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          leftSection={<IconPlus size={13} />}
          style={{ alignSelf: 'flex-start' }}
          onClick={handleAddSecondary}
        >
          Add secondary objective
        </Button>
      ) : (
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
      )}

      <Divider />

      {/* Budget + Dates */}
      <SimpleGrid cols={3} spacing="md">
        <Stack gap="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Budget</Text>
          <Select
            data={pd.budgetOptions.map(b => ({ value: String(b.value), label: b.label }))}
            value={String(budget)}
            onChange={setBudget}
            radius="md"
            leftSection={<IconCurrencyDollar size={14} />}
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

      {/* 2 KPI dropdowns */}
      <SimpleGrid cols={2} spacing="md">
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
            size="sm"
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
            size="sm"
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
          {durationDays
            ? <><strong>{durationDays}-day</strong> </>
            : null}
          <strong>{primaryObjData?.label}</strong>
          {secondaryObjData ? <> + <strong>{secondaryObjData.label}</strong></> : null}
          {' '}campaign · <strong>{selectedBudgetLabel.split(' —')[0]}</strong> budget ·
          measuring <strong>{kpiLabel(primaryKpi)}</strong> and <strong>{kpiLabel(secondaryKpi)}</strong>.
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
