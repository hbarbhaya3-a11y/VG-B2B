import { Stack, SimpleGrid, Card, Group, Text, Badge, Button, Box, ThemeIcon, Title } from '@mantine/core'
import { IconRoute2, IconSparkles, IconChevronRight } from '@tabler/icons-react'
import { useCases } from '../data/usecases'
import { useUseCase } from '../contexts/UseCaseContext'

export default function UseCaseCatalog({ onRunScenario }) {
  const { launch } = useUseCase()

  const handleRun = (uc) => {
    if (onRunScenario) {
      onRunScenario(uc)
    } else {
      launch(uc)
    }
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Box>
        <Group gap="sm" mb={4}>
          <ThemeIcon size={28} radius="md" variant="gradient" gradient={{ from: '#96151D', to: '#C0392B', deg: 135 }}>
            <IconSparkles size={16} color="white" />
          </ThemeIcon>
          <Title order={3} fw={700}>Personal Wealth Signal Scenarios</Title>
          <Badge variant="light" color="vanguardRed" size="sm">Vanguard Personal Wealth</Badge>
        </Group>
        <Text size="sm" c="dimmed" maw={720}>
          Five end-to-end value chains. Each traces a signal through the full agent pipeline — detection, twin scoring, simulation, content generation, compliance, and attribution.
        </Text>
      </Box>

      {/* Use case cards */}
      <Stack gap="sm">
        {useCases.map((uc) => (
          <Card
            key={uc.id}
            withBorder
            radius="md"
            p="md"
            style={{ borderLeft: `3px solid var(--mantine-color-${uc.color}-6)` }}
          >
            <Group justify="space-between" align="flex-start" mb="xs">
              <Box style={{ flex: 1 }}>
                <Group gap="xs" mb={2}>
                  <Text fw={700} size="sm">{uc.title}</Text>
                </Group>
                <Text size="xs" c="dimmed">{uc.subtitle}</Text>
              </Box>
              <Badge color="green" variant="light" size="sm">{uc.outcome}</Badge>
            </Group>

            <Group gap={4} mb="xs" wrap="wrap">
              <Text size="xs" c="dimmed">{uc.duration}</Text>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">{uc.variants}</Text>
            </Group>

            {/* Agent chain */}
            <Group gap={4} mb="md" wrap="wrap">
              {uc.agentChain?.map((agent, i) => (
                <Group key={i} gap={4}>
                  <Badge variant="outline" size="xs" color={uc.color}>{agent}</Badge>
                  {i < uc.agentChain.length - 1 && (
                    <Text size="xs" c="dimmed">→</Text>
                  )}
                </Group>
              ))}
            </Group>

            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">{uc.steps?.length} steps · {uc.outcomeDetail}</Text>
              <Button
                size="xs"
                color={uc.color}
                radius="md"
                rightSection={<IconRoute2 size={12} stroke={1.5} />}
                onClick={() => handleRun(uc)}
              >
                Run Scenario
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
