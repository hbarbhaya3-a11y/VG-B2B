import { Paper, Stack, Text, Badge, Group, ThemeIcon, Button } from '@mantine/core'
import { IconRocket } from '@tabler/icons-react'

export default function PlaceholderPanel({ step, onContinue }) {
  return (
    <Paper withBorder p="xl" radius="md">
      <Stack align="center" gap="lg" py="xl">
        <ThemeIcon size={64} radius="xl" variant="light" color="gray">
          <IconRocket size={32} stroke={1.5} />
        </ThemeIcon>
        <Stack gap={4} align="center">
          <Text size="xl" fw={700}>{step?.headline ?? step?.label ?? 'Processing…'}</Text>
          <Text size="sm" c="dimmed" ta="center" maw={500}>
            {step?.description ?? 'This step is processing the pipeline output from the previous stage.'}
          </Text>
        </Stack>
        {step?.metric && (
          <Group gap="xs">
            <Badge variant="light" color="teal">{step.metric.label}: {step.metric.value}</Badge>
            {step?.stage && <Badge variant="light" color="blue">{step.stage}</Badge>}
          </Group>
        )}
        <Button variant="light" rightSection={<IconRocket size={14} />} onClick={onContinue}>
          Continue workflow
        </Button>
      </Stack>
    </Paper>
  )
}
