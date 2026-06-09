import { Modal, Stack, Card, Group, Text, Badge, Button, SimpleGrid } from '@mantine/core'
import { IconRoute2 } from '@tabler/icons-react'
import { useUseCase } from '../../contexts/UseCaseContext'
import { useCases } from '../../data/usecases'

export default function UseCaseLauncher({ opened, onClose, onNavigate }) {
  const { launch } = useUseCase()

  const handleLaunch = (uc) => {
    launch(uc)
    onClose()
    if (onNavigate) onNavigate(uc.steps[0].page)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconRoute2 size={18} stroke={1.5} />
          <Text fw={700} size="md">Personal Wealth Signal Scenarios</Text>
          <Badge variant="light" color="vanguardRed" size="sm">Vanguard Personal Wealth</Badge>
        </Group>
      }
      size="xl"
    >
      <Text size="sm" c="dimmed" mb="md">
        Five end-to-end value chains. Each traces a signal through the full agent pipeline — detection, twin scoring, simulation, content generation, compliance, and attribution. Navigate any scenario to see the platform in action with live context at each step.
      </Text>
      <Stack gap="sm">
        {useCases.map(uc => (
          <Card key={uc.id} withBorder radius="md" p="md" style={{ borderLeft: `3px solid var(--mantine-color-${uc.color}-6)` }}>
            <Group justify="space-between" align="flex-start" mb="xs">
              <div>
                <Group gap="xs" mb={2}>
                  <Text fw={700} size="sm">{uc.title}</Text>
                </Group>
                <Text size="xs" c="dimmed">{uc.subtitle}</Text>
              </div>
              <Badge color="green" variant="light" size="sm">{uc.outcome}</Badge>
            </Group>

            <Group gap={4} mb="xs" wrap="wrap">
              <Text size="xs" c="dimmed">{uc.duration}</Text>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">{uc.variants}</Text>
            </Group>

            {/* Agent chain */}
            <Group gap={4} mb="md" wrap="wrap">
              {uc.agentChain.map((agent, i) => (
                <Group key={i} gap={4}>
                  <Badge variant="outline" size="xs" color={uc.color}>{agent}</Badge>
                  {i < uc.agentChain.length - 1 && (
                    <Text size="xs" c="dimmed">→</Text>
                  )}
                </Group>
              ))}
            </Group>

            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">{uc.steps.length} steps · {uc.outcomeDetail}</Text>
              <Button
                size="xs"
                color={uc.color}
                radius="md"
                rightSection={<IconRoute2 size={12} stroke={1.5} />}
                onClick={() => handleLaunch(uc)}
              >
                Run Scenario
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Modal>
  )
}
