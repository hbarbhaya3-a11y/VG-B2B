import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Badge, Progress, ThemeIcon, Divider, Button, Loader, Alert } from '@mantine/core'
import { IconCheck, IconAlertTriangle, IconShieldCheck, IconUserCheck, IconChevronRight } from '@tabler/icons-react'
import PanelGuide from '../../ui/PanelGuide'

const RAIL_COLORS = { pass: 'green', flag: 'yellow', escalate: 'orange', fail: 'red' }
const RAIL_ICONS = { pass: IconCheck, flag: IconAlertTriangle, escalate: IconAlertTriangle, fail: IconAlertTriangle }

function RailRow({ rail, visible }) {
  if (!visible) return null
  const Icon = RAIL_ICONS[rail.status] ?? IconCheck
  const color = RAIL_COLORS[rail.status] ?? 'gray'

  return (
    <Stack gap="xs">
      <Group
        justify="space-between"
        p="xs"
        style={{
          borderRadius: 8,
          background: rail.status === 'flag'
            ? 'var(--mantine-color-yellow-light)'
            : 'var(--mantine-color-default-hover)',
        }}
      >
        <Group gap="sm">
          <ThemeIcon size="sm" color={color} radius="xl" variant={rail.status === 'pass' ? 'filled' : 'light'}>
            <Icon size={12} stroke={2} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="xs" fw={700}>Rail {rail.id} — {rail.name}</Text>
            <Text size="xs" c="dimmed">{rail.detail}</Text>
          </Stack>
        </Group>
        <Badge size="xs" color={color} variant={rail.status === 'pass' ? 'filled' : 'light'}>
          {rail.status === 'pass' ? 'PASS' : rail.status === 'flag' ? 'AUTO-CORRECTED' : rail.status === 'escalate' ? 'ON HOLD' : 'FAIL'}
        </Badge>
      </Group>

      {/* Flag detail */}
      {(rail.status === 'flag' || rail.status === 'escalate') && rail.flag && (
        <Paper withBorder p="sm" radius="md" ml="md">
          <Stack gap="xs">
            <Group gap="xs">
              <Badge size="xs" color="red" variant="light">{rail.flag.rule}</Badge>
              <Text size="xs" c="dimmed">{rail.flag.type}</Text>
            </Group>
            <Divider label="Original" labelPosition="left" />
            <Text size="xs" td="line-through" c="red">"{rail.flag.original}"</Text>
            <Divider label="Auto-corrected" labelPosition="left" />
            <Text size="xs" c="green" fw={500}>"{rail.flag.corrected}"</Text>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}

export default function CompliancePanel({ step, onContinue }) {
  const pd = step.panelData
  const [visibleRails, setVisibleRails] = useState(0)
  const [phase, setPhase] = useState('scanning')

  useEffect(() => {
    if (phase !== 'scanning') return
    const timer = setInterval(() => {
      setVisibleRails(n => {
        if (n >= pd.rails.length) {
          clearInterval(timer)
          setTimeout(() => setPhase('complete'), 500)
          return n
        }
        return n + 1
      })
    }, 400)
    return () => clearInterval(timer)
  }, [phase, pd.rails.length])

  const ea = pd.experienceApprover
  const guide = pd.panelGuide

  return (
    <Stack gap="md">
      {guide && <PanelGuide {...guide} />}
      {/* Header */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-red-5)' }}>
        <Group justify="space-between">
          <Stack gap={2}>
            <Group gap="xs">
              <Badge size="sm" color="red" variant="filled">GOVERN</Badge>
              <Badge size="sm" color="gray" variant="light">Guardrail Guardian</Badge>
            </Group>
            {phase === 'complete' ? (
              <Text size="lg" fw={700}>
                {Math.round(pd.clearanceRate * 100)}% first-pass clearance — {pd.totalVariants} variants processed
              </Text>
            ) : (
              <Group gap="xs">
                <Loader size="xs" color="red" />
                <Text size="sm" fw={600}>Scanning {pd.totalVariants} variants — five-rail trust pipeline…</Text>
              </Group>
            )}
          </Stack>
          {phase === 'complete' && (
            <Group gap="sm">
              {[
                { label: pd.totalVariants, sub: 'processed', color: 'gray' },
                { label: pd.cleared, sub: 'cleared', color: 'green' },
                { label: pd.autoCorrected, sub: 'corrected', color: 'yellow' },
                { label: pd.escalated, sub: 'escalated', color: 'red' },
              ].map(({ label, sub, color }) => (
                <Stack key={sub} gap={0} align="center">
                  <Text size="lg" fw={800} c={color}>{label}</Text>
                  <Text size="xs" c="dimmed">{sub}</Text>
                </Stack>
              ))}
            </Group>
          )}
        </Group>
        {phase === 'complete' && (
          <Stack gap={4} mt="sm">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">First-pass clearance rate</Text>
              <Text size="xs" fw={700} c="green">{Math.round(pd.clearanceRate * 100)}%</Text>
            </Group>
            <Progress value={pd.clearanceRate * 100} color="green" size="md" radius="sm" />
          </Stack>
        )}
      </Paper>

      {/* Rails */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Five-rail compliance pipeline
          </Text>
          {pd.rails.map((rail, i) => (
            <RailRow key={rail.id} rail={rail} visible={i < visibleRails} />
          ))}
          {phase === 'scanning' && visibleRails < pd.rails.length && (
            <Group gap="xs" p="xs">
              <Loader size="xs" color="red" />
              <Text size="xs" c="dimmed">Scanning Rail {visibleRails + 1}…</Text>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Experience Approver */}
      {phase === 'complete' && (
        <Paper withBorder p="md" radius="md">
          <Stack gap="sm">
            <Group gap="xs">
              <ThemeIcon size="sm" color="green" radius="sm" variant="light">
                <IconShieldCheck size={12} stroke={1.5} />
              </ThemeIcon>
              <Text size="sm" fw={700}>Experience Approver</Text>
            </Group>
            <Divider />
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="xs" c="dimmed">Brand voice cosine similarity</Text>
                <Group gap="xs">
                  <Text size="xl" fw={800} c="green">{(ea.brandVoiceScore * 100).toFixed(1)}%</Text>
                  <Stack gap={2}>
                    <Badge size="xs" color="green" variant="filled">PASS</Badge>
                    <Text size="xs" c="dimmed">threshold: {(ea.threshold * 100).toFixed(0)}%</Text>
                  </Stack>
                </Group>
                <Progress value={ea.brandVoiceScore * 100} color="green" size="sm" w={200} />
              </Stack>
              <Stack gap="xs">
                <Text size="xs" c="dimmed" fw={600}>Attributions verified</Text>
                {ea.attributions.map((attr) => (
                  <Group key={attr.name} gap="xs">
                    <ThemeIcon size="xs" color="green" radius="xl" variant="filled">
                      <IconUserCheck size={8} />
                    </ThemeIcon>
                    <Text size="xs" fw={600}>{attr.name}</Text>
                    <Text size="xs" c="dimmed">— {attr.role}{attr.tenure ? `, ${attr.tenure}` : ''}</Text>
                    <Badge size="xs" color="green" variant="light">{attr.status}</Badge>
                  </Group>
                ))}
              </Stack>
            </Group>
            <Alert color="green" variant="light" icon={<IconCheck size={14} />}>
              <Text size="xs">All 5 compliance layers present in all {pd.totalVariants} variants ✓</Text>
            </Alert>
          </Stack>
        </Paper>
      )}

      {phase === 'complete' && (
        <Button
          size="md"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
          rightSection={<IconChevronRight size={16} stroke={2} />}
          onClick={onContinue}
          styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
          style={{ alignSelf: 'flex-end' }}
        >
          {pd.continueLabel || 'Continue to Decision'}
        </Button>
      )}
    </Stack>
  )
}
