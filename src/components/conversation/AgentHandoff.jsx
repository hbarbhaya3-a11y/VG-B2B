import { Box, Divider, Text, Group } from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'

export default function AgentHandoff({ message }) {
  const { fromAgent, fromColor, toAgent, toColor, context } = message

  return (
    <Box my="md">
      <Divider
        my="xs"
        label={
          <Group gap="xs">
            <Text size="xs" fw={600} c={fromColor}>{fromAgent}</Text>
            <IconArrowRight size={12} stroke={1.5} />
            <Text size="xs" fw={600} c={toColor}>{toAgent}</Text>
          </Group>
        }
        labelPosition="center"
        style={{
          '--divider-color': `var(--mantine-color-${fromColor}-3)`,
        }}
      />
      {context && (
        <Text size="xs" c="dimmed" ta="center" mb="xs">
          Context: {context}
        </Text>
      )}
    </Box>
  )
}
