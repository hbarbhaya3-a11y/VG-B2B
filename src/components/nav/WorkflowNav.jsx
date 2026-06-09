import { useMemo } from 'react'
import {
  NavLink, Box, Divider, Text, Badge, Tooltip, ThemeIcon, Group, Stack,
  SegmentedControl, ActionIcon, ScrollArea
} from '@mantine/core'
import {
  IconRadar, IconPlayerPlay, IconShieldCheck, IconRoute2, IconRobot,
  IconCheck, IconChevronRight, IconLock, IconHandStop, IconBolt,
  IconTarget, IconChartBar, IconBook, IconSettings, IconTestPipe,
  IconRocket, IconRefresh, IconPlayerStop
} from '@tabler/icons-react'
import { Button, Paper } from '@mantine/core'
import { useUseCase } from '../../contexts/UseCaseContext'
import { useWorkflowNav } from '../../hooks/useWorkflowNav'
import { BUCKET_COLORS, WORKFLOW_BUCKET_ORDER, STAGE_TO_BUCKET } from '../../theme'

// ── Nav spine — 5 visible buckets in static mode ─────────────────────────────
// Sense (home gallery + live signals) → Simulate → Trial → Execute → Learn
// Select appears only during workflow runs (not as a static nav destination).
const NAV_BUCKETS = [
  { id: 'sense',    label: 'Sense',    icon: IconRadar,       color: BUCKET_COLORS.sense    },
  { id: 'simulate', label: 'Simulate', icon: IconPlayerPlay,  color: BUCKET_COLORS.simulate },
  { id: 'select',   label: 'Select',   icon: IconTarget,      color: BUCKET_COLORS.select   },
  { id: 'trial',    label: 'Trial',    icon: IconTestPipe,    color: BUCKET_COLORS.trial    },
  { id: 'execute',  label: 'Execute',  icon: IconRocket,      color: BUCKET_COLORS.execute  },
  { id: 'learn',    label: 'Learn',    icon: IconRefresh,     color: BUCKET_COLORS.learn    },
]

// OPERATE is rendered separately at the bottom (not part of the workflow pipeline)
const OPERATE_BUCKET = { id: 'operate', label: 'Operate', icon: IconRobot, color: BUCKET_COLORS.operate }

// ── Mode Toggle (Guided / Autopilot) ──
function ModeToggle({ collapsed }) {
  const { autonomyMode, setAutonomyMode } = useUseCase()

  if (collapsed) {
    return (
      <Stack gap={4} align="center" mb="xs">
        <Tooltip label={`Guided mode${autonomyMode === 'guided' ? ' (active)' : ''}`} position="right" withArrow>
          <ActionIcon
            size={30} radius="xl"
            variant={autonomyMode === 'guided' ? 'filled' : 'subtle'}
            color={autonomyMode === 'guided' ? 'vanguardRed' : 'gray'}
            onClick={() => setAutonomyMode('guided')}
            style={autonomyMode === 'guided' ? { boxShadow: '0 0 12px rgba(150, 21, 29, 0.4)' } : {}}
          >
            <IconHandStop size={14} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={`Autopilot mode${autonomyMode === 'autonomous' ? ' (active)' : ''}`} position="right" withArrow>
          <ActionIcon
            size={30} radius="xl"
            variant={autonomyMode === 'autonomous' ? 'filled' : 'subtle'}
            color={autonomyMode === 'autonomous' ? 'green' : 'gray'}
            onClick={() => setAutonomyMode('autonomous')}
            style={autonomyMode === 'autonomous' ? { boxShadow: '0 0 12px rgba(34, 197, 94, 0.5)' } : {}}
          >
            <IconBolt size={14} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Stack>
    )
  }

  return (
    <SegmentedControl
      size="sm"
      fullWidth
      radius="md"
      value={autonomyMode}
      onChange={setAutonomyMode}
      data={[
        { label: 'Guided', value: 'guided' },
        { label: 'Autopilot', value: 'autonomous' },
      ]}
      mb="sm"
      styles={{
        root: {
          border: '1px solid var(--mantine-color-default-border)',
          padding: 3,
        },
      }}
    />
  )
}

// ── Expanded Accordion Nav (240px) during workflow ──
function AccordionNav({ activePage, onNavigate, workflowNav }) {
  const { activeUseCase, stepIndex, currentStep, totalSteps, goToStep } = useUseCase()
  const { activeBucket, completedBuckets, lockedBuckets, futureBuckets } = workflowNav

  const steps = activeUseCase?.steps || []

  const stepsByBucket = useMemo(() => {
    const groups = {}
    steps.forEach((step, i) => {
      const bucket = STAGE_TO_BUCKET[step.stage] || 'deploy'
      if (!groups[bucket]) groups[bucket] = []
      groups[bucket].push({ ...step, index: i })
    })
    return groups
  }, [steps])

  return (
    <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Step wayfinding header */}
      <Box px="sm" py={8} mb={2} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
          Step {stepIndex + 1} of {totalSteps}
        </Text>
        <Text style={{ fontSize: 15 }} fw={700} lineClamp={1}>
          {currentStep?.label || 'Starting...'}
        </Text>
      </Box>

      {/* Buckets — scrollable when steps overflow */}
      <ScrollArea style={{ flex: 1 }} type="auto" offsetScrollbars>
      <Stack gap={6} style={{ justifyContent: 'flex-start', paddingTop: 12, paddingBottom: 12 }}>
        {NAV_BUCKETS.map((bucket) => {
          const isCompleted = completedBuckets.includes(bucket.id)
          const isLocked = lockedBuckets.includes(bucket.id)
          const isActive = activeBucket === bucket.id
          const isFuture = futureBuckets.includes(bucket.id)
          const bucketSteps = stepsByBucket[bucket.id] || []
          const completedCount = bucketSteps.filter(s => s.index < stepIndex).length
          const totalCount = bucketSteps.length
          const Icon = bucket.icon

          // Hide buckets with zero steps in this scenario
          if (totalCount === 0) return null

          // Past (completed+locked) buckets use gray, not their original stage color
          const isPast = isCompleted && !isActive
          const displayColor = isPast ? 'gray' : bucket.color
          const iconVariant = isActive ? 'gradient' : (isPast ? 'light' : (isCompleted ? 'light' : 'subtle'))

          return (
            <Box key={bucket.id}>
              <NavLink
                label={
                  <Text
                    fw={isActive ? 700 : (isPast ? 400 : 500)}
                    style={{
                      fontSize: 15,
                      opacity: isLocked ? 0.35 : (isPast ? 0.55 : (isFuture ? 0.5 : 1)),
                      textDecoration: isLocked ? 'line-through' : 'none',
                      color: (isLocked || isPast) ? 'var(--mantine-color-dimmed)' : undefined,
                    }}
                  >
                    {bucket.label}
                  </Text>
                }
                leftSection={
                  <ThemeIcon
                    size={isActive ? 28 : (isPast ? 24 : 26)} radius="xl"
                    variant={iconVariant}
                    gradient={isActive ? { from: bucket.color, to: bucket.color, deg: 135 } : undefined}
                    color={isLocked ? 'gray' : displayColor}
                    style={{
                      transition: 'all 250ms ease',
                      ...(isActive ? { boxShadow: `0 0 8px var(--mantine-color-${bucket.color}-4)` } : {}),
                    }}
                  >
                    {isLocked ? <IconLock size={14} stroke={1.5} /> :
                     isCompleted ? <IconCheck size={14} stroke={2} /> :
                     <Icon size={16} stroke={1.5} />}
                  </ThemeIcon>
                }
                rightSection={
                  isActive ? <Badge size="xs" variant="filled" color={bucket.color}>{completedCount}/{totalCount}</Badge> :
                  isCompleted ? <IconCheck size={14} stroke={2} color="var(--mantine-color-dimmed)" /> :
                  totalCount > 0 ? <Text size="xs" c="dimmed">{completedCount}/{totalCount}</Text> : null
                }
                active={isActive}
                color={isActive ? bucket.color : (isPast ? 'gray' : bucket.color)}
                radius="md"
                opened={isActive || isCompleted}
                disabled={isFuture}
                style={{
                  cursor: isLocked ? 'not-allowed' : (isFuture ? 'default' : 'pointer'),
                  opacity: isLocked ? 0.35 : (isPast ? 0.6 : (isFuture ? 0.5 : 1)),
                  boxShadow: isActive
                    ? `inset 3px 0 0 0 var(--mantine-color-${bucket.color}-6), 0 1px 4px 0 rgba(0,0,0,0.06)`
                    : undefined,
                  background: isActive
                    ? `linear-gradient(90deg, var(--mantine-color-${bucket.color}-light), transparent 70%)`
                    : undefined,
                  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {bucketSteps.map((step) => {
                  const isDone = step.index < stepIndex
                  const isCurrent = step.index === stepIndex
                  const isStepLocked = lockedBuckets.includes(bucket.id)
                  const canClick = (isDone || isCurrent) && !isStepLocked
                  const stepColor = isStepLocked ? 'var(--mantine-color-dimmed)' : `var(--mantine-color-${bucket.color}-6)`

                  return (
                    <NavLink
                      key={step.index}
                      label={
                        <Text style={{
                          fontSize: 13,
                          color: isStepLocked ? 'var(--mantine-color-dimmed)' : undefined,
                        }}>
                          {step.label}
                        </Text>
                      }
                      leftSection={
                        <Box style={{ width: 28, display: 'flex', justifyContent: 'center' }}>
                          {isDone ? <IconCheck size={12} stroke={2} color={stepColor} /> :
                           isCurrent ? <Box style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--mantine-color-${bucket.color}-6)`, boxShadow: `0 0 6px var(--mantine-color-${bucket.color}-4)` }} /> :
                           <Box style={{ width: 6, height: 6, borderRadius: '50%', border: '1.5px solid var(--mantine-color-dimmed)' }} />}
                        </Box>
                      }
                      rightSection={isCurrent ? <IconChevronRight size={10} stroke={2} color={`var(--mantine-color-${bucket.color}-6)`} /> : null}
                      active={isCurrent}
                      color={isStepLocked ? 'gray' : bucket.color}
                      radius="sm"
                      onClick={canClick ? () => goToStep(step.index) : undefined}
                      styles={{ root: { padding: '5px var(--mantine-spacing-sm)' } }}
                      style={{
                        cursor: canClick ? 'pointer' : 'default',
                        opacity: isStepLocked ? 0.4 : (isDone ? 0.7 : (isCurrent ? 1 : 0.4)),
                      }}
                    />
                  )
                })}
              </NavLink>
            </Box>
          )
        })}
      </Stack>
      </ScrollArea>
    </Box>
  )
}

// ── Collapsed Pipeline Spine (70px) during workflow ──
function PipelineSpine({ workflowNav }) {
  const { activeBucket, completedBuckets, lockedBuckets, futureBuckets, jumpToBucket, bucketStepRanges } = workflowNav

  const activeBucketIdx = WORKFLOW_BUCKET_ORDER.indexOf(activeBucket)
  const trackPercent = activeBucketIdx >= 0 ? ((activeBucketIdx + 0.5) / WORKFLOW_BUCKET_ORDER.length) * 100 : 0

  return (
    <Box style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, paddingTop: 8 }}>
      {/* Track background */}
      <Box style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        top: 24, bottom: 24, width: 4, borderRadius: 4,
        background: 'var(--mantine-color-default-border)',
      }} />
      {/* Filled track with glow */}
      <Box style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        top: 24, width: 4, borderRadius: 4,
        height: `${trackPercent}%`,
        background: activeBucket ? `var(--mantine-color-${BUCKET_COLORS[activeBucket] || 'vanguardRed'}-6)` : 'transparent',
        boxShadow: activeBucket ? `0 0 10px var(--mantine-color-${BUCKET_COLORS[activeBucket] || 'vanguardRed'}-4)` : 'none',
        transition: 'height 350ms cubic-bezier(0.4, 0, 0.2, 1)',
      }} />

      <Stack gap="lg" align="center" style={{ position: 'relative', zIndex: 2, flex: 1, justifyContent: 'space-around', padding: '16px 0' }}>
        {NAV_BUCKETS.filter(b => bucketStepRanges[b.id]).map((bucket) => {
          const isCompleted = completedBuckets.includes(bucket.id)
          const isLocked = lockedBuckets.includes(bucket.id)
          const isActive = activeBucket === bucket.id
          const isFuture = futureBuckets.includes(bucket.id)
          const Icon = bucket.icon

          const size = isActive ? 40 : 32
          const variant = isActive ? 'gradient' : (isCompleted ? 'light' : 'outline')
          const gradient = isActive ? { from: bucket.color, to: bucket.color, deg: 135 } : undefined

          return (
            <Tooltip
              key={bucket.id}
              label={`${bucket.label} — ${isLocked ? 'Locked' : isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}`}
              position="right" withArrow
            >
              <ThemeIcon
                size={size}
                radius="xl"
                variant={variant}
                gradient={gradient}
                color={isLocked || isFuture ? 'gray' : bucket.color}
                style={{
                  cursor: isLocked || isFuture ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.4 : (isFuture ? 0.5 : 1),
                  transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: isActive
                    ? `0 0 0 3px var(--mantine-color-${bucket.color}-2), 0 0 16px var(--mantine-color-${bucket.color}-4)`
                    : isCompleted ? `0 0 0 2px var(--mantine-color-${bucket.color}-2)` : 'none',
                }}
                onClick={() => !isLocked && !isFuture && jumpToBucket(bucket.id)}
              >
                {isLocked ? <IconLock size={14} stroke={1.5} /> :
                 isCompleted ? <IconCheck size={14} stroke={2} /> :
                 <Icon size={16} stroke={1.5} />}
              </ThemeIcon>
            </Tooltip>
          )
        })}
      </Stack>
    </Box>
  )
}

// ── Static Nav (no workflow active) ──
// Hide 'select' and 'trial' in static mode — they only appear during workflow runs.
const STATIC_HIDDEN = new Set(['select', 'trial'])
function StaticNav({ activePage, onNavigate, collapsed }) {
  const allBuckets = [...NAV_BUCKETS.filter(b => !STATIC_HIDDEN.has(b.id)), OPERATE_BUCKET]
  const isOperate = (id) => id === 'operate'

  return (
    <>
      {allBuckets.map((bucket) => {
        const isActive = activePage === bucket.id
        const Icon = bucket.icon

        const content = (
          <NavLink
            label={collapsed ? null : bucket.label}
            leftSection={
              <ThemeIcon
                size={22} radius="xl"
                variant={isActive ? 'gradient' : 'subtle'}
                gradient={isActive ? { from: bucket.color, to: bucket.color, deg: 135 } : undefined}
                color={bucket.color}
                style={isActive ? { boxShadow: `0 0 6px var(--mantine-color-${bucket.color}-4)` } : {}}
              >
                <Icon size={14} stroke={1.5} />
              </ThemeIcon>
            }
            rightSection={isActive && !collapsed ? <IconChevronRight size={14} stroke={1.5} /> : null}
            active={isActive}
            color={bucket.color}
            radius="md"
            onClick={() => onNavigate(bucket.id)}
            style={isActive ? {
              background: `linear-gradient(90deg, var(--mantine-color-${bucket.color}-light), transparent)`,
              borderLeft: `3px solid var(--mantine-color-${bucket.color}-6)`,
            } : { borderLeft: '3px solid transparent' }}
          />
        )

        if (isOperate(bucket.id)) {
          return (
            <Box key={bucket.id} style={{ marginTop: 'auto' }}>
              <Divider my="xs" />
              {collapsed ? <Tooltip label={bucket.label} position="right" withArrow>{content}</Tooltip> : content}
            </Box>
          )
        }

        return (
          <Box key={bucket.id}>
            {collapsed ? <Tooltip label={bucket.label} position="right" withArrow>{content}</Tooltip> : content}
          </Box>
        )
      })}
    </>
  )
}

// ── Running-Scenario Panel (expanded nav) ──
// Shows scenario title + projected outcome KPI + Stop-run control.
// Renders only when a use case is active and the nav is expanded.
function RunningScenarioPanel() {
  const { activeUseCase, exit } = useUseCase()
  if (!activeUseCase) return null
  const outcome = activeUseCase.outcome || ''
  const attributed = outcome.match(/\$[\d,.]+[MBK]?/)?.[0] || outcome
  return (
    <Paper
      withBorder radius="md" p="xs" mb="xs"
      style={{
        borderLeft: `3px solid var(--mantine-color-${activeUseCase.color || 'vanguardRed'}-6)`,
        background: `linear-gradient(135deg, var(--mantine-color-${activeUseCase.color || 'vanguardRed'}-light), transparent 85%)`,
      }}
    >
      <Stack gap={4}>
        <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
          Running scenario
        </Text>
        <Text size="xs" fw={700} lineClamp={2} lh={1.25}>
          {activeUseCase.title}
        </Text>
        {attributed && (
          <Group gap={4} align="baseline" mt={2}>
            <Text size="lg" fw={800} c={activeUseCase.color || 'vanguardRed'} lh={1}>
              {attributed}
            </Text>
            <Text size="9px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
              attributed
            </Text>
          </Group>
        )}
        <Button
          size="xs" variant="subtle" color="gray"
          leftSection={<IconPlayerStop size={12} stroke={1.8} />}
          onClick={exit}
          fullWidth
          mt={4}
        >
          Stop run
        </Button>
      </Stack>
    </Paper>
  )
}

// ── Main Component ──
export default function WorkflowNav({ activePage, onNavigate, collapsed }) {
  const workflowNav = useWorkflowNav()
  const { isWorkflowActive } = workflowNav

  if (isWorkflowActive) {
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Mode toggle at top of nav */}
        <ModeToggle collapsed={collapsed} />

        {/* Running-scenario KPI + Stop run — matches original layout */}
        {!collapsed && <RunningScenarioPanel />}

        {collapsed ? (
          <>
            <PipelineSpine workflowNav={workflowNav} />
            <Divider my="xs" />
            <Box style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
              <Tooltip label="Operate" position="right" withArrow>
                <ThemeIcon
                  size={32} radius="xl" variant="light" color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate('operate')}
                >
                  <IconRobot size={16} stroke={1.5} />
                </ThemeIcon>
              </Tooltip>
            </Box>
          </>
        ) : (
          <>
            <AccordionNav activePage={activePage} onNavigate={onNavigate} workflowNav={workflowNav} />
            <Divider my="xs" />
            <NavLink
              label="Operate"
              leftSection={
                <ThemeIcon size={22} radius="xl" variant="subtle" color="blue">
                  <IconRobot size={14} stroke={1.5} />
                </ThemeIcon>
              }
              active={activePage === 'operate'}
              color="blue"
              radius="md"
              onClick={() => onNavigate('operate')}
            />
          </>
        )}
      </Box>
    )
  }

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <StaticNav activePage={activePage} onNavigate={onNavigate} collapsed={collapsed} />
    </Box>
  )
}
