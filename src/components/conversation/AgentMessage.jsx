import { Paper, Group, Text, Badge, ThemeIcon, Stack, Box } from '@mantine/core'
import {
  IconRadar, IconBrain, IconPencil, IconChartBar, IconUserCheck,
  IconShield, IconRoute, IconActivity
} from '@tabler/icons-react'

const AGENT_ICONS = {
  'market-sentinel': IconRadar,
  'context-decoder': IconBrain,
  'content-architect': IconPencil,
  'quant-bridge': IconChartBar,
  'decision-owner': IconUserCheck,
  'guardrail-guardian': IconShield,
  'journey-executor': IconRoute,
  'learning-system': IconActivity,
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AgentMessage({ message, children }) {
  const { agentId, agentName, color, text, timestamp, type } = message
  const Icon = AGENT_ICONS[agentId] || IconRadar
  const isAuto = message.auto === true

  return (
    <Box mb="sm">
      <Paper
        withBorder
        p="sm"
        radius="md"
        style={{
          borderLeft: `3px solid var(--mantine-color-${color}-6)`,
        }}
      >
        {/* Agent header */}
        <Group gap="xs" mb="xs" justify="space-between">
          <Group gap="xs">
            <ThemeIcon size={24} radius="xl" variant="light" color={color}>
              <Icon size={14} stroke={1.5} />
            </ThemeIcon>
            <Text size="sm" fw={600}>{agentName}</Text>
            {isAuto && <Badge size="xs" variant="light" color="gray">auto</Badge>}
          </Group>
          <Text size="xs" c="dimmed">{formatTime(timestamp)}</Text>
        </Group>

        {/* Narrative text */}
        {text && (
          <Text size="sm" style={{ lineHeight: 1.6 }}>
            {text}
          </Text>
        )}

        {/* Embedded content (charts, tables, etc.) */}
        {children}
      </Paper>
    </Box>
  )
}
