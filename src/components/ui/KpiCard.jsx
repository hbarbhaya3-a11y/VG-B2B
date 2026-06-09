import { Card, Group, Stack, Text, Badge, ThemeIcon, Tooltip } from '@mantine/core'
import { fmtPct } from '../../utils/format'

// Props: { label, value, subValue, delta, color='blue', icon, tooltip }
export default function KpiCard({ label, value, subValue, delta, color = 'blue', icon, tooltip }) {
  const card = (
    <Card withBorder radius="md" p="lg">
      <Group gap="md" wrap="nowrap">
        {icon && (
          <ThemeIcon variant="light" color={color} radius="md" size="lg">
            {icon}
          </ThemeIcon>
        )}
        <Stack gap={2} flex={1}>
          <Text size="xs" c="dimmed" fw={500}>{label}</Text>
          <Text size="xl" fw={700} c={color}>{value}</Text>
          {subValue && <Text size="xs" c="dimmed">{subValue}</Text>}
        </Stack>
        {delta !== null && delta !== undefined && (
          <Badge
            radius="sm"
            variant="light"
            color={delta >= 0 ? 'green' : 'red'}
          >
            {fmtPct(delta)}
          </Badge>
        )}
      </Group>
    </Card>
  )

  if (tooltip) {
    return <Tooltip label={tooltip} withArrow>{card}</Tooltip>
  }
  return card
}
