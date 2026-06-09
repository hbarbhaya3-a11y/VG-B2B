import { useState } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Textarea, Button, Alert, Divider, ThemeIcon, Progress, Collapse } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconUserCheck, IconAlertTriangle, IconCheck, IconX, IconTrendingUp, IconChevronDown, IconChevronRight, IconSettings } from '@tabler/icons-react'

export default function DecisionApprovalPanel({ step, workflowState, onApprove }) {
  const pd = step.panelData
  const [overrideText, setOverrideText] = useState(workflowState.overrideText || pd.defaultOverride)
  const scenarioId = workflowState.selectedScenarioId ?? 'A'
  const [configOpened, { toggle: toggleConfig }] = useDisclosure(false)

  const scenarioData = {
    A: { engagement: 22, aum: 185, cost: 145, confidence: 84, ci: '±2%', advisors: 7900 },
    B: { engagement: 28, aum: 240, cost: 380, confidence: 64, ci: '±6%', advisors: 7900 },
    C: { engagement: 14, aum: 105, cost: 75,  confidence: 87, ci: '±3%', advisors: 7900 },
  }[scenarioId] ?? { engagement: 22, aum: 185, cost: 145, confidence: 84, ci: '±2%', advisors: 7900 }

  const rationale = pd.scenarioRationale[scenarioId] ?? pd.scenarioRationale.A
  const dn = pd.doNothing

  const engagementLift = scenarioData.engagement - Math.round(dn.engagement * 100)
  const aumLift = scenarioData.aum
  const roi = Math.round(scenarioData.aum * 1000000 / (scenarioData.cost * 1000))
  const advisorsUnreached = scenarioData.advisors - dn.advisorsReached

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper
        withBorder p="md" radius="md"
        style={{ borderLeft: '4px solid var(--mantine-color-yellow-5)', background: 'var(--mantine-color-yellow-light)' }}
      >
        <Group gap="sm">
          <ThemeIcon size={40} radius="xl" color="yellow" variant="filled">
            <IconUserCheck size={20} stroke={1.5} />
          </ThemeIcon>
          <Stack gap={2}>
            <Group gap="xs">
              <Text size="md" fw={800}>Decision Owner Approval Required</Text>
              <Badge size="sm" color="yellow" variant="filled">APPROVAL GATE</Badge>
            </Group>
            <Text size="xs" c="dimmed">
              Scenario <strong>{scenarioId}</strong> selected in simulation · Review the comparison and approve to proceed
            </Text>
          </Stack>
        </Group>
      </Paper>

      {/* Side-by-side comparison */}
      <SimpleGrid cols={2} spacing="md">
        {/* Recommended — KPIs + collapsible config */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-teal-5)' }}>
          <Stack gap="sm">
            <Group gap="xs">
              <Badge size="sm" color="teal" variant="filled">Recommended</Badge>
              <Badge size="sm" color="blue" variant="light">Scenario {scenarioId}</Badge>
            </Group>
            <Divider />
            <SimpleGrid cols={2} spacing="xs">
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Engagement</Text>
                <Text size="xl" fw={800} c="teal" style={{ lineHeight: 1 }}>{scenarioData.engagement}%</Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Est. AUM</Text>
                <Text size="xl" fw={800} c="green" style={{ lineHeight: 1 }}>${scenarioData.aum}M</Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Campaign cost</Text>
                <Text size="xl" fw={800} style={{ lineHeight: 1 }}>${scenarioData.cost}K</Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Confidence</Text>
                <Text size="xl" fw={800} c="teal" style={{ lineHeight: 1 }}>{scenarioData.confidence}%</Text>
                <Progress value={scenarioData.confidence} color="teal" size="xs" />
              </Stack>
            </SimpleGrid>
            <Group gap="xs">
              <Badge size="xs" color="teal" variant="light">7,900 advisors</Badge>
              <Badge size="xs" color="violet" variant="light">400 holdout</Badge>
              <Badge size="xs" color="gray" variant="outline">{scenarioData.ci} CI</Badge>
            </Group>

            {/* Collapsible configuration details */}
            <Divider />
            <Group
              gap="xs"
              style={{ cursor: 'pointer' }}
              onClick={toggleConfig}
            >
              {configOpened ? <IconChevronDown size={14} stroke={1.5} /> : <IconChevronRight size={14} stroke={1.5} />}
              <IconSettings size={12} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" fw={600}>Configuration details</Text>
              {!configOpened && (
                <Badge size="xs" variant="light" color="teal" ml="auto">
                  7,900 adv · 11 types · 3 ch · 97% cleared
                </Badge>
              )}
            </Group>
            <Collapse in={configOpened}>
              <Stack gap="xs" mt="xs">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>Pipeline</Text>
                <Group gap="xs"><Text size="xs" c="dimmed">Advisors:</Text><Text size="xs" fw={600}>7,900 (3 tiers + 400 holdout)</Text></Group>
                <Group gap="xs"><Text size="xs" c="dimmed">Content:</Text><Text size="xs" fw={600}>12 types, 212 outputs</Text></Group>
                <Group gap="xs"><Text size="xs" c="dimmed">Clearance:</Text><Text size="xs" fw={600}>97% — 4 corrected, 2 on hold</Text></Group>
                <Group gap="xs"><Text size="xs" c="dimmed">Simulation:</Text><Text size="xs" fw={600}>1,000 iterations</Text></Group>
                <Divider my={4} />
                <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.04em' }}>Channel mix</Text>
                <Group gap="xs"><Text size="xs" c="dimmed">Tier 1 (150):</Text><Text size="xs" fw={600}>Wholesaler call + brief</Text></Group>
                <Group gap="xs"><Text size="xs" c="dimmed">Tier 2 (1,200):</Text><Text size="xs" fw={600}>Email A/B + portal</Text></Group>
                <Group gap="xs"><Text size="xs" c="dimmed">Tier 3 (6,550):</Text><Text size="xs" fw={600}>Portal notification</Text></Group>
              </Stack>
            </Collapse>
          </Stack>
        </Paper>

        {/* Do Nothing */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-gray-4)' }}>
          <Stack gap="sm">
            <Group gap="xs">
              <Badge size="sm" color="gray" variant="light">Alternative</Badge>
              <Badge size="sm" color="gray" variant="outline">Do Nothing</Badge>
            </Group>
            <Divider />
            <SimpleGrid cols={2} spacing="xs">
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Engagement</Text>
                <Text size="xl" fw={800} c="dimmed" style={{ lineHeight: 1 }}>6%</Text>
                <Text size="xs" c="dimmed">organic only</Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Est. AUM</Text>
                <Text size="xl" fw={800} c="dimmed" style={{ lineHeight: 1 }}>$0</Text>
                <Text size="xs" c="dimmed">no incremental</Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Campaign cost</Text>
                <Text size="xl" fw={800} c="dimmed" style={{ lineHeight: 1 }}>$0</Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">Advisors reached</Text>
                <Text size="xl" fw={800} c="dimmed" style={{ lineHeight: 1 }}>0</Text>
                <Text size="xs" c="dimmed">proactively</Text>
              </Stack>
            </SimpleGrid>
            <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>{dn.description}</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Delta callout */}
      <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-teal-light)', borderLeft: '3px solid var(--mantine-color-teal-5)' }}>
        <SimpleGrid cols={4} spacing="md">
          <Stack gap={2} align="center">
            <Text size="xl" fw={900} c="teal" style={{ lineHeight: 1 }}>+{engagementLift}pp</Text>
            <Text size="xs" c="dimmed" ta="center">Engagement lift</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xl" fw={900} c="green" style={{ lineHeight: 1 }}>+${aumLift}M</Text>
            <Text size="xs" c="dimmed" ta="center">Incremental AUM</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Group gap={4} align="center">
              <ThemeIcon size="sm" variant="filled" color="blue" radius="sm">
                <IconTrendingUp size={12} stroke={1.5} />
              </ThemeIcon>
              <Text size="xl" fw={900} c="blue" style={{ lineHeight: 1 }}>{roi}×</Text>
            </Group>
            <Text size="xs" c="dimmed" ta="center">ROI</Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xl" fw={900} c="red" style={{ lineHeight: 1 }}>{advisorsUnreached.toLocaleString()}</Text>
            <Text size="xs" c="dimmed" ta="center">advisors unsupported if no action</Text>
          </Stack>
        </SimpleGrid>
        <Divider my="xs" />
        <Group gap={4}>
          <IconAlertTriangle size={12} stroke={1.5} style={{ color: 'var(--mantine-color-red-5)', flexShrink: 0 }} />
          <Text size="xs" c="red">
            {advisorsUnreached.toLocaleString()} advisors receive no proactive support during this volatility window.
          </Text>
        </Group>
      </Paper>

      {/* System rationale */}
      <Alert icon={<IconAlertTriangle size={16} stroke={1.5} />} color="yellow" variant="light" title="System rationale">
        <Text size="xs">{rationale}</Text>
      </Alert>

      <Divider label="Field override" labelPosition="left" />

      {/* Override input */}
      <Stack gap="xs">
        <Textarea
          label="Field override or constraint (optional)"
          description="Edit or clear as needed. Overrides are logged as human-preference signals for model retraining."
          value={overrideText}
          onChange={(e) => setOverrideText(e.target.value)}
          minRows={2}
          radius="md"
        />
        <Alert icon={<IconAlertTriangle size={14} stroke={1.5} />} color="yellow" variant="light" p="xs">
          <Text size="xs">{pd.overrideRationale}</Text>
        </Alert>
      </Stack>

      {/* Approve / Decline */}
      <Group justify="flex-end" gap="md">
        <Button size="md" variant="light" color="red">
          Decline
        </Button>
        <Button
          size="md"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
          styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
          leftSection={<IconCheck size={16} stroke={2} />}
          onClick={() => onApprove(overrideText)}
        >
          Approve &amp; Proceed
        </Button>
      </Group>
    </Stack>
  )
}
