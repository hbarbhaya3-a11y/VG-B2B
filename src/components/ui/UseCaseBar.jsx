import { Paper, Group, Badge, Text, ActionIcon, CloseButton, Divider, Box, Tooltip } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useUseCase } from '../../contexts/UseCaseContext'

// Blueprint 6-stage + legacy names for back-compat
const STAGE_COLORS = {
  SENSE: 'teal', SIMULATE: 'violet', SELECT: 'vanguardRed',
  TRIAL: 'orange', EXECUTE: 'green', LEARN: 'grape',
  // legacy
  DECIDE: 'vanguardRed', GOVERN: 'vanguardRed',
  DEPLOY: 'green', MEASURE: 'grape', RESPOND: 'green',
}
const STAGE_CSS = STAGE_COLORS

export default function UseCaseBar({ onNavigate }) {
  const ctx = useUseCase()
  if (!ctx) return null
  const { activeUseCase, stepIndex, currentStep, totalSteps, isFirst, isLast, advance, retreat, exit, goToStep } = ctx

  if (!activeUseCase || !currentStep) return null

  const stageColor = STAGE_COLORS[currentStep.stage] || 'blue'

  const handlePrev = () => {
    retreat()
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0 && onNavigate) {
      onNavigate(activeUseCase.steps[prevIndex].page)
    }
  }

  const handleNext = () => {
    advance()
    const nextIndex = stepIndex + 1
    if (nextIndex < totalSteps && onNavigate) {
      onNavigate(activeUseCase.steps[nextIndex].page)
    }
  }

  const handleDotClick = (i) => {
    goToStep(i)
    if (onNavigate) onNavigate(activeUseCase.steps[i].page)
  }

  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      mb="sm"
      style={{ borderLeft: `3px solid var(--mantine-color-${STAGE_CSS[currentStep.stage] || 'blue'}-6)` }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Badge size="xs" color={stageColor} variant="filled" style={{ flexShrink: 0 }}>
            {currentStep.stage}
          </Badge>
          <Text size="sm" fw={600} style={{ flexShrink: 0 }}>{activeUseCase.title}</Text>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>Step {stepIndex + 1} of {totalSteps}</Text>
          <Divider orientation="vertical" h={14} style={{ alignSelf: 'center', flexShrink: 0 }} />
          <Text size="xs" fw={500} style={{ flexShrink: 0 }}>{currentStep.agent}</Text>
          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{currentStep.timing}</Text>
          <Divider orientation="vertical" h={14} style={{ alignSelf: 'center', flexShrink: 0 }} />
          <Text size="xs" c="dimmed" lineClamp={1} style={{ minWidth: 0 }}>
            {currentStep.description}
          </Text>
        </Group>
        <Group gap={4} style={{ flexShrink: 0 }}>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            radius="md"
            onClick={handlePrev}
            disabled={isFirst}
          >
            <IconChevronLeft size={14} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="light"
            color={stageColor}
            radius="md"
            onClick={handleNext}
            disabled={isLast}
          >
            <IconChevronRight size={14} stroke={1.5} />
          </ActionIcon>
          <CloseButton size="sm" onClick={exit} />
        </Group>
      </Group>

      {/* Step progress dots */}
      <Group gap={6} mt="xs">
        {activeUseCase.steps.map((step, i) => {
          const dotColor = STAGE_COLORS[step.stage] || 'blue'
          const isCurrent = i === stepIndex
          const isCompleted = i < stepIndex
          return (
            <Tooltip key={i} label={step.label} position="bottom" withArrow>
              <Box
                onClick={() => handleDotClick(i)}
                style={{
                  width: isCurrent ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'width 200ms ease',
                  backgroundColor: isCompleted || isCurrent
                    ? `var(--mantine-color-${dotColor}-6)`
                    : `var(--mantine-color-${dotColor}-2)`,
                  opacity: isCompleted ? 0.6 : 1
                }}
              />
            </Tooltip>
          )
        })}
        <Text size="xs" c="dimmed" ml="xs">{currentStep.label}</Text>
      </Group>
    </Paper>
  )
}
