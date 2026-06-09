import { Group, Stack, Text, Title } from '@mantine/core'

// Props: { title, description, action, color }
export default function SectionHeader({ title, description, action, color = 'blue' }) {
  return (
    <Group justify="space-between" align="flex-start">
      <Stack gap={2}>
        <Title order={4} c={color}>{title}</Title>
        {description && <Text size="sm" c="dimmed">{description}</Text>}
      </Stack>
      {action && <div>{action}</div>}
    </Group>
  )
}
