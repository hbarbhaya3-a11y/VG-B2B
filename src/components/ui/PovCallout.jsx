import { Paper, Stack, Text, Badge, Group } from '@mantine/core'

// Props: { today, withTwinx, metric }
export default function PovCallout({ today, withTwinx, metric }) {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        borderLeft: '4px solid var(--mantine-color-orange-5)',
        background: 'var(--mantine-color-orange-light)'
      }}
    >
      <Stack gap="xs">
        {metric && (
          <Badge radius="sm" variant="light" color="orange" size="lg">
            {metric}
          </Badge>
        )}
        <Group gap="xs" align="flex-start">
          <Text size="xs" fw={700} c="orange" style={{ minWidth: 130 }}>Vanguard Today:</Text>
          <Text size="xs" c="dimmed" flex={1}>{today}</Text>
        </Group>
        <Group gap="xs" align="flex-start">
          <Text size="xs" fw={700} c="blue" style={{ minWidth: 130 }}>With TwinX:</Text>
          <Text size="xs" flex={1}>{withTwinx}</Text>
        </Group>
      </Stack>
    </Paper>
  )
}
