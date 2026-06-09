import { Paper, Group, Text, Progress, Loader, ThemeIcon, Box } from '@mantine/core'
import {
  IconRadar, IconBrain, IconPencil, IconChartBar, IconShield, IconRoute, IconActivity
} from '@tabler/icons-react'

const AGENT_ICONS = {
  'market-sentinel': IconRadar,
  'context-decoder': IconBrain,
  'content-architect': IconPencil,
  'quant-bridge': IconChartBar,
  'guardrail-guardian': IconShield,
  'journey-executor': IconRoute,
  'learning-system': IconActivity,
}

export default function ProgressMessage({ message }) {
  const { agentId, agentName, color, label, progress } = message
  const Icon = AGENT_ICONS[agentId] || IconRadar
  const isDone = progress >= 100

  return (
    <Box mb="xs">
      <Paper withBorder p="xs" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${color}-6)` }}>
        <Group gap="xs" mb={4}>
          <ThemeIcon size={20} radius="xl" variant="light" color={color}>
            <Icon size={12} stroke={1.5} />
          </ThemeIcon>
          <Text size="xs" fw={500} c="dimmed">{agentName}</Text>
          {!isDone && <Loader size={12} color={color} />}
        </Group>
        <Text size="xs" mb={4}>{label}</Text>
        {progress > 0 && (
          <Progress value={progress} color={color} size="xs" radius="xl" animated={!isDone} />
        )}
      </Paper>
    </Box>
  )
}
