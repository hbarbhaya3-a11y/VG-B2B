import { Stack, Text, Group, Badge, Tooltip, ThemeIcon, Box } from '@mantine/core'
import { IconRobot, IconUserCheck, IconCheck } from '@tabler/icons-react'

const STAGE_COLORS = {
  SENSE: 'teal',
  SIMULATE: 'violet',
  RESPOND: 'orange',
  GOVERN: 'red',
  LEARN: 'green',
}

export default function StepRail({ steps, currentIndex, onJumpTo }) {
  return (
    <Stack gap={0} style={{ width: 200, flexShrink: 0 }} py="md" px="xs">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex
        const isCurrent = i === currentIndex
        const isHuman = step.actor === 'human'
        const stageColor = isHuman ? 'yellow' : (STAGE_COLORS[step.stage] || 'blue')
        const canJump = isCompleted || isCurrent

        return (
          <Box key={i} style={{ position: 'relative' }}>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <Box style={{
                position: 'absolute',
                left: 15,
                top: 32,
                width: 2,
                height: 28,
                backgroundColor: isCompleted
                  ? `var(--mantine-color-${stageColor}-4)`
                  : 'var(--mantine-color-default-border)',
                zIndex: 0
              }} />
            )}
            <Tooltip label={step.label} position="right" withArrow disabled={!step.label}>
              <Group
                gap="xs"
                py={6}
                px={4}
                style={{
                  cursor: canJump ? 'pointer' : 'default',
                  borderRadius: 8,
                  background: isCurrent ? `var(--mantine-color-${stageColor}-light)` : 'transparent',
                  transition: 'background 150ms ease',
                  position: 'relative',
                  zIndex: 1,
                }}
                onClick={() => canJump && onJumpTo(i)}
              >
                {/* Step circle */}
                <ThemeIcon
                  size={30}
                  radius="xl"
                  variant={isCurrent ? 'filled' : isCompleted ? 'light' : 'outline'}
                  color={isCompleted || isCurrent ? stageColor : 'gray'}
                  style={{ flexShrink: 0 }}
                >
                  {isCompleted
                    ? <IconCheck size={14} stroke={2} />
                    : isHuman
                      ? <IconUserCheck size={14} stroke={1.5} />
                      : <IconRobot size={14} stroke={1.5} />
                  }
                </ThemeIcon>

                {/* Label */}
                <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    size="xs"
                    fw={isCurrent ? 700 : 500}
                    c={isCurrent ? undefined : isCompleted ? 'dimmed' : 'dimmed'}
                    lineClamp={2}
                    style={{ lineHeight: 1.3 }}
                  >
                    {step.label}
                  </Text>
                  {isCurrent && (
                    <Badge size="xs" variant="light" color={stageColor} mt={2} style={{ width: 'fit-content' }}>
                      {isHuman ? 'Action required' : step.stage}
                    </Badge>
                  )}
                </Stack>
              </Group>
            </Tooltip>
          </Box>
        )
      })}
    </Stack>
  )
}
