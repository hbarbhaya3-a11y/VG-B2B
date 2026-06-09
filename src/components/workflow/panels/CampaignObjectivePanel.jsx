import { useState } from 'react'
import {
  Stack, Group, Text, Badge, Button, Card, ThemeIcon, SimpleGrid, Select, Paper, Divider, Box,
} from '@mantine/core'
import {
  IconTarget, IconTrendingUp, IconShieldCheck, IconPlayerPlay, IconBook,
  IconArrowsExchange, IconCurrencyDollar, IconCalendar, IconChevronRight, IconCheck, IconSparkles,
} from '@tabler/icons-react'

const ICON_MAP = {
  IconArrowsExchange,
  IconTrendingUp,
  IconShieldCheck,
  IconPlayerPlay,
  IconBook,
}

export default function CampaignObjectivePanel({ panelData: pd, onContinue }) {
  const [selectedObjective, setSelectedObjective] = useState(pd.defaultObjective)
  const [budget, setBudget] = useState(String(pd.defaultBudget))
  const [duration, setDuration] = useState(String(pd.defaultDuration))

  const kpis = pd.kpiTargets[selectedObjective]
  const selectedObj = pd.objectives.find(o => o.id === selectedObjective)
  const selectedBudgetLabel = pd.budgetOptions.find(b => String(b.value) === String(budget))?.label || budget
  const selectedDurationLabel = pd.durationOptions.find(d => String(d.value) === String(duration))?.label || `${duration} days`

  return (
    <Stack gap="lg">
      {/* Title */}
      <Stack gap={4}>
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" variant="gradient" gradient={{ from: 'vanguardRed', to: 'orange', deg: 135 }}>
            <IconTarget size={18} stroke={1.5} />
          </ThemeIcon>
          <Text size="xl" fw={800}>Define your campaign objective</Text>
        </Group>
        <Text size="sm" c="dimmed">
          Set your goal, budget, and success window before the signal pipeline runs.
        </Text>
      </Stack>

      {/* Objective picker */}
      <Stack gap="sm">
        <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em' }} c="dimmed">Campaign Objective</Text>
        <SimpleGrid cols={3} spacing="sm">
          {pd.objectives.map((obj) => {
            const Icon = ICON_MAP[obj.icon] || IconTarget
            const isSelected = selectedObjective === obj.id
            return (
              <Card
                key={obj.id}
                withBorder
                radius="md"
                p="md"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--mantine-color-vanguardRed-6)' : undefined,
                  borderWidth: isSelected ? 2 : 1,
                  background: isSelected ? 'var(--mantine-color-red-light)' : undefined,
                  transition: 'border-color 150ms ease, background 150ms ease',
                }}
                onClick={() => setSelectedObjective(obj.id)}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <ThemeIcon
                      size={28}
                      radius="md"
                      variant={isSelected ? 'filled' : 'light'}
                      color={isSelected ? 'red' : 'gray'}
                    >
                      <Icon size={16} stroke={1.5} />
                    </ThemeIcon>
                    {isSelected && (
                      <ThemeIcon size={18} radius="xl" color="red" variant="filled">
                        <IconCheck size={10} />
                      </ThemeIcon>
                    )}
                    {obj.recommended && !isSelected && (
                      <Badge size="xs" color="orange" variant="light">Recommended</Badge>
                    )}
                    {obj.recommended && isSelected && (
                      <Badge size="xs" color="red" variant="light">Recommended</Badge>
                    )}
                  </Group>
                  <Text size="sm" fw={700}>{obj.label}</Text>
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>{obj.description}</Text>
                </Stack>
              </Card>
            )
          })}
        </SimpleGrid>
      </Stack>

      {/* KPI targets */}
      {kpis && (
        <Stack gap="sm">
          <Text size="sm" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em' }} c="dimmed">Success KPIs</Text>
          <Group gap="xs">
            <Badge size="sm" color="red" variant="filled" leftSection={<IconSparkles size={10} />}>Primary: {kpis.primary}</Badge>
            <Badge size="sm" color="orange" variant="light">Secondary: {kpis.secondary}</Badge>
            <Badge size="sm" color="gray" variant="outline">Tertiary: {kpis.tertiary}</Badge>
          </Group>
        </Stack>
      )}

      <Divider />

      {/* Budget + Duration */}
      <SimpleGrid cols={2} spacing="md">
        <Stack gap="xs">
          <Group gap="xs">
            <IconCurrencyDollar size={14} stroke={1.5} style={{ color: 'var(--mantine-color-teal-6)' }} />
            <Text size="sm" fw={700}>Campaign Budget</Text>
          </Group>
          <Select
            data={pd.budgetOptions.map(b => ({ value: String(b.value), label: b.label }))}
            value={String(budget)}
            onChange={(val) => setBudget(val)}
            radius="md"
          />
        </Stack>
        <Stack gap="xs">
          <Group gap="xs">
            <IconCalendar size={14} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
            <Text size="sm" fw={700}>Campaign Duration</Text>
          </Group>
          <Select
            data={pd.durationOptions.map(d => ({ value: String(d.value), label: d.label }))}
            value={String(duration)}
            onChange={(val) => setDuration(val)}
            radius="md"
          />
        </Stack>
      </SimpleGrid>

      {/* Summary card */}
      <Paper withBorder radius="md" p="md" style={{ background: 'var(--mantine-color-gray-light)' }}>
        <Stack gap={4}>
          <Group gap="xs">
            <IconSparkles size={14} stroke={1.5} style={{ color: 'var(--mantine-color-violet-6)' }} />
            <Text size="sm" fw={700} c="dimmed">Campaign Summary</Text>
          </Group>
          <Text size="sm">
            You are building a <strong>{selectedDurationLabel.split(' —')[0]}</strong>-day{' '}
            <strong>{selectedObj?.label}</strong> campaign with a{' '}
            <strong>{selectedBudgetLabel.split(' —')[0]}</strong> investment.{' '}
            TwinX will optimise signal detection, segmentation, simulation, and content to this goal.
          </Text>
        </Stack>
      </Paper>

      {/* Continue */}
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
