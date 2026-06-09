import { useState, useEffect } from 'react'
import {
  Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider,
  Alert, Loader, Progress
} from '@mantine/core'
import {
  IconChevronRight, IconShieldCheck, IconCheck, IconAlertTriangle,
  IconTarget, IconFlask, IconCircleCheck
} from '@tabler/icons-react'

/**
 * TrialValidationPanel — 2-phase animated panel for the TRIAL stage.
 *
 * Phase 1: Compliance scanning — sequential rail reveals with checkmark animation
 * Phase 2: Virtual trial — sample deployment + CI gate result
 *
 * Data contract (step.panelData.trial):
 *   rails: [{ name: string, status: 'pass'|'flag', note?: string }]
 *   clearanceRate: number (0-1)
 *   totalVariants: number
 *   clearedVariants: number
 *   sampleSize: number
 *   predicted: string        // e.g. "74%"
 *   observed: string         // e.g. "72% ± 4%"
 *   gate: 'PASS' | 'HOLD'
 *   gateNote: string
 */

const DEFAULT_RAILS = [
  { name: 'Education classification confirmed', status: 'pass' },
  { name: 'No specific investment advice language', status: 'pass' },
  { name: 'Holdout cohort defined for attribution', status: 'pass' },
  { name: 'Disclosure packet auto-attached', status: 'pass' },
]

function RailRow({ rail, visible }) {
  if (!visible) return null
  const passed = rail.status === 'pass'
  return (
    <Group gap="sm" wrap="nowrap" py={6}>
      <ThemeIcon
        size={22} radius="xl" variant="filled"
        color={passed ? 'teal' : 'orange'}
      >
        {passed ? <IconCheck size={12} stroke={2.5} /> : <IconAlertTriangle size={12} stroke={2} />}
      </ThemeIcon>
      <Stack gap={0} style={{ flex: 1 }}>
        <Text size="sm" fw={600}>{rail.name}</Text>
        {rail.note && <Text size="xs" c="dimmed">{rail.note}</Text>}
      </Stack>
      <Badge size="xs" variant="light" color={passed ? 'teal' : 'orange'}>
        {passed ? 'Clear' : 'Flag'}
      </Badge>
    </Group>
  )
}

export default function TrialValidationPanel({ step, onContinue }) {
  const pd = step?.panelData?.trial || {}
  const rails = pd.rails || DEFAULT_RAILS
  const totalVariants = pd.totalVariants || 24
  const clearedVariants = pd.clearedVariants || 8
  const sampleSize = pd.sampleSize || 2000
  const predicted = pd.predicted || '—'
  const observed = pd.observed || '—'
  const gate = pd.gate || 'PASS'
  const gateNote = pd.gateNote || 'Virtual trial passes the confidence-interval gate. Cleared for deployment.'

  // Phase management
  const [phase, setPhase] = useState('scanning')
  const [visibleRails, setVisibleRails] = useState(0)
  const [trialProgress, setTrialProgress] = useState(0)

  // Phase 1: compliance scanning — reveal rails sequentially
  useEffect(() => {
    if (phase !== 'scanning') return
    const interval = setInterval(() => {
      setVisibleRails(v => {
        if (v >= rails.length) {
          clearInterval(interval)
          setTimeout(() => setPhase('trialing'), 500)
          return v
        }
        return v + 1
      })
    }, 400)
    return () => clearInterval(interval)
  }, [phase, rails.length])

  // Phase 2: virtual trial — progress animation
  useEffect(() => {
    if (phase !== 'trialing') return
    const interval = setInterval(() => {
      setTrialProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => setPhase('complete'), 400)
          return 100
        }
        return p + 4
      })
    }, 80)
    return () => clearInterval(interval)
  }, [phase])

  const passCount = rails.filter(r => r.status === 'pass').length
  const clearancePct = rails.length > 0 ? Math.round((passCount / rails.length) * 100) : 100
  const gatePassed = gate === 'PASS'

  return (
    <Stack gap="md">
      {/* Phase 1: Compliance scanning */}
      <Paper withBorder p="md" radius="md"
        style={{
          borderLeft: `3px solid var(--mantine-color-${phase === 'scanning' ? 'teal' : visibleRails >= rails.length ? 'teal' : 'gray'}-6)`,
          background: phase === 'scanning' ? 'linear-gradient(135deg, var(--mantine-color-teal-light), transparent 85%)' : undefined,
        }}>
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon size="sm" radius="xl" variant={visibleRails >= rails.length ? 'filled' : 'light'} color="teal">
                {visibleRails >= rails.length ? <IconCheck size={12} stroke={2.5} /> : <IconShieldCheck size={12} />}
              </ThemeIcon>
              <Text fw={700} size="sm">Compliance clearance</Text>
              {phase === 'scanning' && <Loader size="xs" color="teal" />}
            </Group>
            <Group gap="xs">
              <Badge size="xs" variant="light" color="teal">{totalVariants} variants generated</Badge>
              <Badge size="xs" variant={visibleRails >= rails.length ? 'filled' : 'light'} color="teal">
                {visibleRails >= rails.length ? `${clearedVariants} cleared` : `Scanning ${visibleRails}/${rails.length}…`}
              </Badge>
            </Group>
          </Group>

          <Divider variant="dashed" />

          <Stack gap={0}>
            {rails.map((rail, i) => (
              <RailRow key={rail.name} rail={rail} visible={i < visibleRails} />
            ))}
          </Stack>

          {visibleRails >= rails.length && (
            <Group gap="xs" align="center">
              <Text size="xs" c="dimmed">Clearance: {passCount}/{rails.length} rails passed</Text>
              <Progress value={clearancePct} color="teal" size="xs" w={120} radius="sm" />
              <Text size="xs" fw={700} c="teal">{clearancePct}%</Text>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Phase 2: Virtual trial */}
      {(phase === 'trialing' || phase === 'complete') && (
        <Paper withBorder p="md" radius="md"
          style={{
            borderLeft: `3px solid var(--mantine-color-${phase === 'complete' ? (gatePassed ? 'teal' : 'orange') : 'violet'}-6)`,
            background: phase === 'trialing' ? 'linear-gradient(135deg, var(--mantine-color-violet-light), transparent 85%)' : undefined,
          }}>
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ThemeIcon size="sm" radius="xl" variant={phase === 'complete' ? 'filled' : 'light'} color={phase === 'complete' ? (gatePassed ? 'teal' : 'orange') : 'violet'}>
                  {phase === 'complete' ? <IconTarget size={12} /> : <IconFlask size={12} />}
                </ThemeIcon>
                <Text fw={700} size="sm">Virtual trial</Text>
                {phase === 'trialing' && <Loader size="xs" color="violet" />}
              </Group>
              <Badge size="sm" variant="light" color="violet">{sampleSize.toLocaleString()}-twin sample</Badge>
            </Group>

            {phase === 'trialing' && (
              <Stack gap="xs">
                <Text size="xs" c="dimmed">Deploying {clearedVariants} cleared variants to {sampleSize.toLocaleString()}-twin representative sample…</Text>
                <Progress value={trialProgress} color="violet" size="sm" animated radius="sm" />
              </Stack>
            )}

            {phase === 'complete' && (
              <>
                <Divider variant="dashed" />
                <SimpleGrid cols={3} spacing="md">
                  <Stack gap={2}>
                    <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Predicted</Text>
                    <Text size="lg" fw={800} c="violet" lh={1}>{predicted}</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Observed (95% CI)</Text>
                    <Text size="lg" fw={800} c={gatePassed ? 'teal' : 'orange'} lh={1}>{observed}</Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Gate</Text>
                    <Badge size="lg" variant="filled" color={gatePassed ? 'teal' : 'orange'} leftSection={gatePassed ? <IconCircleCheck size={14} /> : <IconAlertTriangle size={14} />}>
                      {gate}
                    </Badge>
                  </Stack>
                </SimpleGrid>
                <Alert color={gatePassed ? 'teal' : 'orange'} variant="light" p="xs" radius="sm">
                  <Text size="xs">{gateNote}</Text>
                </Alert>
              </>
            )}
          </Stack>
        </Paper>
      )}

      {/* Continue — only after completion */}
      {phase === 'complete' && (
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {totalVariants} variants generated · {clearedVariants} cleared · {sampleSize.toLocaleString()}-twin trial · gate {gate}
          </Text>
          <Button onClick={onContinue} rightSection={<IconChevronRight size={14} />}>
            Continue to deployment
          </Button>
        </Group>
      )}
    </Stack>
  )
}
