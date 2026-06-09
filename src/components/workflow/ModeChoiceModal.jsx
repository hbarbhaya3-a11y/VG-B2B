import { useState, useEffect } from 'react'
import { Modal, SimpleGrid, Paper, Group, Text, ThemeIcon, Badge, Button, Stack, Box, Tooltip, Alert } from '@mantine/core'
import { IconHandStop, IconBolt, IconChevronRight, IconShieldLock } from '@tabler/icons-react'

const MODES = [
  {
    value: 'guided',
    label: 'Guided',
    description: 'Agents ask before each action. You confirm at every step — full control over the pipeline.',
    icon: IconHandStop,
    color: 'blue',
    tag: 'Recommended for first run',
  },
  {
    value: 'autonomous',
    label: 'Autopilot',
    description: 'Agents auto-proceed through steps. Pipeline only pauses at mandatory approval gates.',
    icon: IconBolt,
    color: 'green',
    tag: null,
  },
]

export default function ModeChoiceModal({ opened, onClose, signal, onLaunch }) {
  const [selected, setSelected] = useState('guided')

  // If the launching signal is fiduciary-sensitive (e.g. ADP test risk),
  // Autopilot is forbidden — force Guided. This implements PRD §10 / E5-02.
  const fiduciarySensitive = !!signal?.fiduciarySensitive
  useEffect(() => {
    if (fiduciarySensitive) setSelected('guided')
  }, [fiduciarySensitive])

  const handleLaunch = () => {
    onLaunch(selected)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Text size="lg" fw={700}>Choose Mode</Text>
          {signal && <Text size="sm" c="dimmed">{signal.headline || signal.title}</Text>}
        </Stack>
      }
      size="lg"
      radius="md"
      centered
    >
      <Text size="sm" c="dimmed" mb="md">
        Choose how you want to interact with the agent pipeline.
      </Text>

      {fiduciarySensitive && (
        <Alert
          color="red"
          variant="light"
          icon={<IconShieldLock size={16} />}
          radius="md"
          mb="md"
          title="Fiduciary-sensitive flow"
        >
          This signal carries fiduciary risk (e.g. ADP discrimination testing or plan-amendment trigger).
          Autopilot is unavailable — Guided mode is required so a human reviews each step before action.
        </Alert>
      )}

      <SimpleGrid cols={2} spacing="md" mb="lg">
        {MODES.map((mode) => {
          const isSelected = selected === mode.value
          const Icon = mode.icon
          const disabled = fiduciarySensitive && mode.value === 'autonomous'

          const card = (
            <Paper
              key={mode.value}
              withBorder
              p="lg"
              radius="md"
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: isSelected && !disabled
                  ? `2px solid var(--mantine-color-${mode.color}-6)`
                  : '2px solid var(--mantine-color-default-border)',
                boxShadow: isSelected && !disabled
                  ? `0 0 0 1px var(--mantine-color-${mode.color}-3), 0 4px 16px rgba(0,0,0,0.08)`
                  : '0 1px 4px rgba(0,0,0,0.04)',
                background: isSelected && !disabled
                  ? `var(--mantine-color-${mode.color}-light)`
                  : undefined,
                opacity: disabled ? 0.5 : 1,
                transition: 'all 200ms ease',
              }}
              onClick={() => { if (!disabled) setSelected(mode.value) }}
            >
              <Stack gap="sm" align="center">
                <ThemeIcon
                  size={48}
                  radius="xl"
                  variant={isSelected && !disabled ? 'gradient' : 'light'}
                  gradient={isSelected && !disabled ? { from: mode.color, to: mode.color, deg: 135 } : undefined}
                  color={mode.color}
                  style={isSelected && !disabled ? { boxShadow: `0 0 12px var(--mantine-color-${mode.color}-3)` } : {}}
                >
                  <Icon size={24} stroke={1.5} />
                </ThemeIcon>
                <Group gap={6}>
                  <Text size="md" fw={700} ta="center">{mode.label}</Text>
                  {disabled && <IconShieldLock size={14} stroke={1.7} color="var(--mantine-color-red-6)" />}
                </Group>
                <Text size="sm" c="dimmed" ta="center" style={{ lineHeight: 1.5 }}>
                  {mode.description}
                </Text>
                {mode.tag && !disabled && (
                  <Badge size="sm" variant="light" color={mode.color}>{mode.tag}</Badge>
                )}
                {disabled && (
                  <Badge size="sm" variant="light" color="red">Disabled — fiduciary-sensitive</Badge>
                )}
              </Stack>
            </Paper>
          )

          return disabled
            ? <Tooltip key={mode.value} label="Fiduciary-sensitive flow — Guided mode required" withArrow>{card}</Tooltip>
            : card
        })}
      </SimpleGrid>

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        fullWidth
        rightSection={<IconChevronRight size={16} stroke={2} />}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        onClick={handleLaunch}
      >
        Launch {selected === 'guided' ? 'Guided Mode' : 'Autopilot Mode'}
      </Button>
    </Modal>
  )
}
