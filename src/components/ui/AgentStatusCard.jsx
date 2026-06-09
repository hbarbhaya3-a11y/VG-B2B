import { Card, Group, Stack, Text, Badge, ThemeIcon } from '@mantine/core'
import {
  IconRadar, IconBrain, IconSitemap, IconChartBar, IconPencil,
  IconShield, IconRoute, IconActivity
} from '@tabler/icons-react'
import { fmtRelTime } from '../../utils/format'

const ICONS = {
  'market-sentinel': IconRadar,
  'context-decoder': IconBrain,
  'orchestration-agent': IconSitemap,
  'quant-bridge': IconChartBar,
  'content-architect': IconPencil,
  'guardrail-guardian': IconShield,
  'journey-executor': IconRoute,
  'ai-observability': IconActivity
}

const AUTONOMY_COLORS = { L5: 'green', L4: 'blue', L3: 'orange' }
const STATUS_COLORS = { Active: 'green', Idle: 'gray', Waiting: 'orange' }

// Props: { agent, onClick, isActive }
export default function AgentStatusCard({ agent, onClick, isActive }) {
  const Icon = ICONS[agent.id] || IconBrain
  const lastDecision = agent.recentDecisions?.[0]

  return (
    <Card
      withBorder
      radius="md"
      p="md"
      style={{
        cursor: 'pointer',
        background: isActive ? 'var(--mantine-color-blue-light)' : undefined,
        borderColor: isActive ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-default-border)'
      }}
      onClick={onClick}
    >
      <Stack gap="xs">
        <Group gap="sm">
          <ThemeIcon variant="light" color={agent.color || 'blue'} radius="md" size="lg">
            <Icon size={18} stroke={1.5} />
          </ThemeIcon>
          <Text fw={600} size="sm" flex={1} lineClamp={1}>{agent.name}</Text>
        </Group>
        <Group gap="xs">
          <Badge radius="sm" variant="light" color={AUTONOMY_COLORS[agent.autonomyLevel]} size="xs">
            {agent.autonomyLevel}
          </Badge>
          <Badge radius="sm" variant="filled" color={STATUS_COLORS[agent.status]} size="xs">
            {agent.status}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>{agent.purpose}</Text>
        {lastDecision && (
          <Text size="xs" c="dimmed">Last: {fmtRelTime(lastDecision.timestamp)}</Text>
        )}
      </Stack>
    </Card>
  )
}
