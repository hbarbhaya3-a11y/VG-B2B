import { Center, Text, Stack, ThemeIcon } from '@mantine/core'
import { IconSparkles } from '@tabler/icons-react'

export default function TrustCompliance() {
  return (
    <Center h={400}>
      <Stack align="center" gap="sm">
        <ThemeIcon size={48} radius="xl" variant="light" color="vanguardRed">
          <IconSparkles size={24} />
        </ThemeIcon>
        <Text fw={600} size="lg">TrustCompliance</Text>
        <Text c="dimmed" size="sm">This module is coming soon.</Text>
      </Stack>
    </Center>
  )
}
