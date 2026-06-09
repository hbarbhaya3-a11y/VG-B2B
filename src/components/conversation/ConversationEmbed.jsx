import { useState } from 'react'
import { Paper, Group, Text, ActionIcon, Collapse, Box } from '@mantine/core'
import { IconChevronDown, IconChevronRight, IconArrowsMaximize } from '@tabler/icons-react'

export default function ConversationEmbed({ title, summary, color, collapsed: initialCollapsed = false, onPopOut, children }) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)

  return (
    <Paper
      withBorder
      radius="sm"
      mt="xs"
      style={{
        borderLeft: `2px solid var(--mantine-color-${color || 'gray'}-4)`,
        background: 'var(--mantine-color-body)',
      }}
    >
      {/* Header — always visible */}
      <Group
        gap="xs"
        px="sm"
        py={6}
        style={{ cursor: 'pointer' }}
        onClick={() => setIsCollapsed(c => !c)}
        justify="space-between"
      >
        <Group gap="xs">
          {isCollapsed
            ? <IconChevronRight size={14} stroke={1.5} />
            : <IconChevronDown size={14} stroke={1.5} />
          }
          <Text size="xs" fw={600}>{title}</Text>
          {isCollapsed && summary && (
            <Text size="xs" c="dimmed" lineClamp={1}> — {summary}</Text>
          )}
        </Group>
        {onPopOut && (
          <ActionIcon
            size="xs"
            variant="subtle"
            color="gray"
            onClick={(e) => { e.stopPropagation(); onPopOut() }}
          >
            <IconArrowsMaximize size={12} stroke={1.5} />
          </ActionIcon>
        )}
      </Group>

      {/* Collapsible content */}
      <Collapse in={!isCollapsed}>
        <Box px="sm" pb="sm">
          {children}
        </Box>
      </Collapse>
    </Paper>
  )
}
