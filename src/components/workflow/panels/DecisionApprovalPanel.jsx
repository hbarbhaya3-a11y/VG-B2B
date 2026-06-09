import { useState } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, Alert, Divider, ThemeIcon, Progress, Table } from '@mantine/core'
import { IconUserCheck, IconAlertTriangle, IconCheck, IconChevronDown, IconChevronRight } from '@tabler/icons-react'

const KPI_ROWS = [
  { metric: 'Portfolio review starts',            baseline: '1,928',   recommended: '4,973',    incremental: '+3,046',            color: 'teal'   },
  { metric: 'Advisor appointment starts',         baseline: '211',     recommended: '652',      incremental: '+440',              color: 'green'  },
  { metric: 'Digital Advisor assessment starts',  baseline: '293',     recommended: '851',      incremental: '+558',              color: 'blue'   },
  { metric: 'Estimated new advisory relationships',baseline: '211',    recommended: '652',      incremental: '+440',              color: 'green'  },
  { metric: 'AUM moving into advice path',        baseline: '$60.7M',  recommended: '$191.0M',  incremental: '+$130.2M',          color: 'green'  },
  { metric: 'Idle cash activated',                baseline: '$13.8M',  recommended: '$38.1M',   incremental: '+$24.3M',           color: 'teal'   },
  { metric: 'AUM retained / protected',           baseline: 'Baseline leakage risk', recommended: 'Reduced leakage risk', incremental: '+$31.8M protected', color: 'violet' },
  { metric: 'Annual advisory revenue proxy',      baseline: '$182K',   recommended: '$573K',    incremental: '+$391K annualized', color: 'green'  },
  { metric: 'Complaint / opt-out rate',           baseline: '0.08%',   recommended: '0.11%',    incremental: 'Within guardrail',  color: 'gray'   },
]

const SEG_CONTRIBUTIONS = [
  { label: 'Planning-active, advice-undecided',     pct: 34, note: '% of incremental advisor appointments',  color: 'orange' },
  { label: 'High-cash, low-conviction',             pct: 22, note: '% of cash-to-investment actions',        color: 'orange' },
  { label: 'Portfolio complexity builders',          pct: 18, note: '% of portfolio review starts',           color: 'blue'   },
  { label: 'Retirement income / transition planners',pct: 14, note: '% of advisor consultation starts',       color: 'teal'   },
  { label: 'Volatility-sensitive recheckers',        pct:  8, note: '% of retention / reduced reactive actions', color: 'blue' },
  { label: 'Tax-efficiency seekers',                 pct:  3, note: '% of strategy education completions',    color: 'teal'   },
  { label: 'Service-frustrated digital users',       pct:  1, note: '% of advisory conversion (high service-deflection impact)', color: 'grape' },
]

export default function DecisionApprovalPanel({ step, workflowState, onApprove }) {
  const pd = step.panelData
  const [overrideText, setOverrideText] = useState(workflowState.overrideText || pd.defaultOverride)
  const [segOpen, setSegOpen] = useState(false)

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '4px solid var(--mantine-color-yellow-5)', background: 'var(--mantine-color-yellow-light)' }}>
        <Group gap="sm">
          <ThemeIcon size={40} radius="xl" color="yellow" variant="filled">
            <IconUserCheck size={20} stroke={1.5} />
          </ThemeIcon>
          <Stack gap={2}>
            <Group gap="xs">
              <Text size="md" fw={800}>Decision Owner Approval Required</Text>
              <Badge size="sm" color="yellow" variant="filled">APPROVAL GATE</Badge>
            </Group>
            <Text size="xs" c="dimmed">Simulation Results — Recommended Action vs Do Nothing</Text>
          </Stack>
        </Group>
      </Paper>

      {/* Assumptions */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Simulation Assumptions</Text>
          <SimpleGrid cols={3} spacing="xs">
            {[
              { label: 'Audience',         value: '42,000 eligible investors' },
              { label: 'Treatment',        value: '37,800' },
              { label: 'Holdout',          value: '4,200' },
              { label: 'Test period',      value: '30 days' },
              { label: 'Simulation method',value: 'Digital-twin response simulation + historical precedent matching' },
              { label: 'Confidence',       value: '89%' },
            ].map(item => (
              <Stack key={item.label} gap={1}>
                <Text size="xs" c="dimmed">{item.label}</Text>
                <Text size="xs" fw={600}>{item.value}</Text>
              </Stack>
            ))}
          </SimpleGrid>
          <Alert variant="light" color="teal" p="xs">
            <Group gap="xs">
              <IconCheck size={14} stroke={2} />
              <Text size="xs" fw={600}>Recommendation: Proceed to guardrail clearance</Text>
            </Group>
          </Alert>
        </Stack>
      </Paper>

      {/* Business KPI table */}
      <Stack gap="xs">
        <Text size="sm" fw={700}>Business KPI Simulation</Text>
        <Paper withBorder radius="md" style={{ overflow: 'auto' }}>
          <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Metric</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Do nothing baseline</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Recommended outreach</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Incremental impact</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {KPI_ROWS.map(row => (
                <Table.Tr key={row.metric}>
                  <Table.Td fw={500}>{row.metric}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }} c="dimmed">{row.baseline}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }} fw={600} c={row.color}>{row.recommended}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Badge size="xs" variant="light" color={row.color}>{row.incremental}</Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      {/* Outcome summary */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-teal-5)', background: 'var(--mantine-color-teal-light)' }}>
        <Stack gap="sm">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Outcome Summary</Text>
          <Stack gap={4}>
            <Text size="xs" fw={700} c="dimmed">Recommended strategy</Text>
            <Text size="sm" fw={600}>Behavior-matched, education-first advisory readiness journey.</Text>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" fw={700} c="dimmed">Predicted lift</Text>
            <Group gap="xs" wrap="wrap">
              {[
                '3.3× advisor appointment starts',
                '2.6× portfolio review starts',
                '2.7× Digital Advisor assessment starts',
                'Complaint / opt-out rate within guardrail',
              ].map(item => (
                <Badge key={item} size="sm" variant="light" color="teal">{item}</Badge>
              ))}
            </Group>
          </Stack>
        </Stack>
      </Paper>

      {/* Segment contribution */}
      <Paper withBorder p="md" radius="md">
        <Group
          gap="xs"
          justify="space-between"
          style={{ cursor: 'pointer' }}
          onClick={() => setSegOpen(o => !o)}
          mb={segOpen ? 'sm' : 0}
        >
          <Group gap="xs">
            {segOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            <Text size="sm" fw={700}>Segment Contribution to Incremental Impact</Text>
          </Group>
          <Badge size="xs" variant="light" color="violet">7 segments</Badge>
        </Group>
        {segOpen && (
          <Stack gap="xs">
            {SEG_CONTRIBUTIONS.map((seg, i) => (
              <Stack key={seg.label} gap={4}>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap={6} wrap="nowrap">
                    <Text size="xs" c="dimmed" fw={600} style={{ minWidth: 16 }}>{i + 1}.</Text>
                    <div style={{ width: 3, height: 16, borderRadius: 2, background: `var(--mantine-color-${seg.color}-5)`, flexShrink: 0 }} />
                    <Text size="xs" fw={600}>{seg.label}</Text>
                  </Group>
                  <Group gap="xs" wrap="nowrap">
                    <Text size="xs" fw={700} c={seg.color}>{seg.pct}%</Text>
                    <Text size="xs" c="dimmed">{seg.note}</Text>
                  </Group>
                </Group>
                <Progress value={seg.pct} color={seg.color} size="xs" ml={22} />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Approve / Decline */}
      <Group justify="flex-end" gap="md">
        <Button size="md" variant="light" color="red">Decline</Button>
        <Button
          size="md"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
          styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
          leftSection={<IconCheck size={16} stroke={2} />}
          onClick={() => onApprove('')}
        >
          Approve and send for clearance
        </Button>
      </Group>
    </Stack>
  )
}
