import { Alert, Group, Badge, Text } from '@mantine/core'
import { IconRobot } from '@tabler/icons-react'
import { useUseCase } from '../../contexts/UseCaseContext'

const STAGE_COLORS = { SENSE: 'teal', SIMULATE: 'violet', RESPOND: 'orange', GOVERN: 'red', LEARN: 'green' }

// Renders a contextual callout on the page when a use case step is active for this page.
// pageId must match one of the page IDs defined in usecases.js step.page fields.
export default function StepInsightCard({ pageId }) {
  const ctx = useUseCase()
  if (!ctx) return null
  const { activeUseCase, currentStep } = ctx
  if (!activeUseCase || !currentStep || currentStep.page !== pageId) return null

  const stageColor = STAGE_COLORS[currentStep.stage] || 'blue'

  return (
    <Alert
      variant="light"
      color={stageColor}
      radius="md"
      mb="md"
      icon={<IconRobot size={16} stroke={1.5} />}
      title={
        <Group gap="xs">
          <Text size="xs" fw={700}>{currentStep.agent}</Text>
          <Text size="xs" c="dimmed">·</Text>
          <Text size="xs" c="dimmed">{activeUseCase.title}</Text>
          <Text size="xs" c="dimmed">·</Text>
          <Text size="xs" c="dimmed">{currentStep.timing}</Text>
          {currentStep.metric && (
            <Badge size="xs" color={stageColor} variant="filled" ml="auto">
              {currentStep.metric.label}: {currentStep.metric.value}
            </Badge>
          )}
        </Group>
      }
    >
      <Text size="xs">{currentStep.description}</Text>
    </Alert>
  )
}
