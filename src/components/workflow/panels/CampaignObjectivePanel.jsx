import { useState } from 'react'
import {
  Stack, Group, Text, Button, Select, MultiSelect, Paper, Divider, Box,
  ThemeIcon, SimpleGrid,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import {
  IconTarget, IconCalendar, IconChevronRight,
  IconSparkles, IconChartBar, IconUsers,
} from '@tabler/icons-react'

// ── Plan-sponsor option libraries ───────────────────────────────────────────
const PRIMARY_OBJECTIVES = [
  { value: 'participation', label: 'Increase eligible employee participation' },
  { value: 'deferral', label: 'Improve deferral adequacy' },
  { value: 'equity', label: 'Close participation equity gap' },
  { value: 'match', label: 'Reduce employer match leakage' },
]

const SECONDARY_OBJECTIVES = [
  { value: 'deferral_adequacy', label: 'Improve deferral adequacy' },
  { value: 'renewal', label: 'Protect renewal narrative' },
  { value: 'equity', label: 'Reduce participation disparity' },
  { value: 'readiness', label: 'Improve retirement readiness' },
]

const TARGET_COHORTS = [
  { value: 'eligible_nonparticipants', label: 'Eligible nonparticipants' },
  { value: 'new_hires', label: 'New hires' },
  { value: 'below_match', label: 'Below-match participants' },
  { value: 'low_deferral', label: 'Low-deferral participants' },
  { value: 'legacy', label: 'Legacy election holders' },
]

const PRIMARY_KPIS = [
  { value: 'incremental_enrollment', label: 'Incremental enrollment vs holdout' },
  { value: 'participation_lift', label: 'Participation lift (pp)' },
  { value: 'deferral_lift', label: 'Average deferral lift (pp)' },
  { value: 'match_utilization', label: 'Match utilization rate' },
]

const MEASUREMENT_WINDOWS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
]

const FieldLabel = ({ children }) => (
  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>{children}</Text>
)

export default function CampaignObjectivePanel({ onContinue }) {
  const [primaryObj, setPrimaryObj]     = useState('participation')
  const [secondaryObjs, setSecondaryObjs] = useState(['deferral_adequacy', 'renewal'])
  const [cohort, setCohort]             = useState('eligible_nonparticipants')
  const [primaryKpi, setPrimaryKpi]     = useState('incremental_enrollment')
  const [effectiveDate, setEffectiveDate] = useState(new Date('2026-09-01'))
  const [window, setWindow]             = useState('60')

  const objLabel = (v) => PRIMARY_OBJECTIVES.find(o => o.value === v)?.label || v
  const cohortLabel = (v) => TARGET_COHORTS.find(o => o.value === v)?.label || v
  const kpiLabel = (v) => PRIMARY_KPIS.find(o => o.value === v)?.label || v

  return (
    <Stack gap="lg">
      {/* Title */}
      <Group gap="xs">
        <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'vanguardRed', to: 'orange', deg: 135 }}>
          <IconTarget size={18} stroke={1.5} />
        </ThemeIcon>
        <Box>
          <Text size="xl" fw={800}>Portfolio Decision Objective</Text>
          <Text size="sm" c="dimmed">Configure the portfolio objective function — multiple cohorts, multiple strategies, cell-level holdouts.</Text>
        </Box>
      </Group>

      <Divider label="Objectives & cohort" labelPosition="left" />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap="xs">
          <FieldLabel>Primary objective</FieldLabel>
          <Select data={PRIMARY_OBJECTIVES} value={primaryObj} onChange={setPrimaryObj} radius="md" leftSection={<IconTarget size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Secondary objectives</FieldLabel>
          <MultiSelect data={SECONDARY_OBJECTIVES} value={secondaryObjs} onChange={setSecondaryObjs} radius="md" clearable placeholder="Select…" />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Target cohort</FieldLabel>
          <Select data={TARGET_COHORTS} value={cohort} onChange={setCohort} radius="md" leftSection={<IconUsers size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Primary KPI</FieldLabel>
          <Select data={PRIMARY_KPIS} value={primaryKpi} onChange={setPrimaryKpi} radius="md" leftSection={<IconChartBar size={14} />} />
        </Stack>
      </SimpleGrid>

      <Divider label="Timing" labelPosition="left" />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Stack gap="xs">
          <FieldLabel>Effective date</FieldLabel>
          <DatePickerInput value={effectiveDate} onChange={setEffectiveDate} radius="md" leftSection={<IconCalendar size={14} />} />
        </Stack>
        <Stack gap="xs">
          <FieldLabel>Measurement window</FieldLabel>
          <Select data={MEASUREMENT_WINDOWS} value={window} onChange={setWindow} radius="md" />
        </Stack>
      </SimpleGrid>

      {/* Live summary */}
      <Paper withBorder radius="md" p="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
        <Group gap="xs" mb={6}>
          <IconSparkles size={14} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
          <FieldLabel>Sponsor Decision Summary</FieldLabel>
        </Group>
        <Text size="sm" style={{ lineHeight: 1.7 }}>
          Target <strong>{cohortLabel(cohort)}</strong> to <strong>{objLabel(primaryObj).toLowerCase()}</strong>,
          measured by <strong>{kpiLabel(primaryKpi).toLowerCase()}</strong> over a <strong>{window}-day</strong> window.
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
