import { useState } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, Alert, Divider, ThemeIcon, Table, Switch, Box } from '@mantine/core'
import { IconUserCheck, IconAlertTriangle, IconCheck, IconLock, IconShieldX } from '@tabler/icons-react'

// Cohort-strategy approval cells
const CELLS = [
  { id: 'P1-C1', cohort: 'Eligible nonparticipants', strategy: 'Auto Enrollment', owners: 'Compliance, fiduciary, payroll', status: 'Pending', blocker: 'Notice variables missing', independent: false },
  { id: 'P1-C2', cohort: 'Below-match participants', strategy: 'Match Stretch', owners: 'Cost owner, payroll', status: 'Approved', blocker: '—', independent: true },
  { id: 'P1-C3', cohort: 'Stuck-at-default', strategy: 'Auto Escalation', owners: 'Compliance, payroll', status: 'Changes requested', blocker: 'Escalation cap unclear', independent: false },
  { id: 'P1-C4', cohort: 'Legacy elections', strategy: 'Re-enrollment', owners: 'Fiduciary, compliance', status: 'Pending', blocker: 'QDIA review', independent: false },
  { id: 'P1-C5', cohort: 'Low-readiness', strategy: 'Education-only', owners: 'Content reviewer', status: 'Approved', blocker: '—', independent: true },
  { id: 'P1-H',  cohort: 'Holdout cells', strategy: 'No-action', owners: 'Measurement owner', status: 'Approved', blocker: '—', independent: true },
]

const statusColor = (s) => s === 'Approved' ? 'green' : s === 'Pending' ? 'yellow' : 'orange'

// Shared (portfolio-level) constraints that gate full launch
const SHARED = [
  { label: 'Employer cost ceiling', ok: true,  detail: 'Portfolio within +0.5% payroll ceiling' },
  { label: 'Holdout design',        ok: true,  detail: '5 / 6 cells hold a control group' },
  { label: 'Compliance review',     ok: false, detail: 'Auto-enroll notice variables outstanding' },
]

export default function DecisionApprovalPanel({ step, workflowState, onApprove }) {
  const [independentLaunch, setIndependentLaunch] = useState(true)

  const approved = CELLS.filter(c => c.status === 'Approved')
  const blocked = CELLS.filter(c => c.status !== 'Approved')
  const sharedBlockers = SHARED.filter(s => !s.ok)
  const canLaunchApprovedCells = independentLaunch && sharedBlockers.length === 0
  const portfolioLaunchOk = blocked.length === 0 && sharedBlockers.length === 0

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '4px solid var(--mantine-color-yellow-5)', background: 'var(--mantine-color-yellow-light)' }}>
        <Group gap="sm">
          <ThemeIcon size={40} radius="xl" color="yellow" variant="filled"><IconUserCheck size={20} stroke={1.5} /></ThemeIcon>
          <Stack gap={2}>
            <Group gap="xs"><Text size="md" fw={800}>Portfolio Approval Workspace</Text><Badge size="sm" color="yellow" variant="filled">APPROVAL GATE</Badge></Group>
            <Text size="xs" c="dimmed">Approval happens at portfolio level and strategy-cell level. Independent cells may launch before the whole portfolio clears.</Text>
          </Stack>
        </Group>
      </Paper>

      {/* Zone 1 — Portfolio approval summary */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        {[
          { label: 'Cells', value: `${CELLS.length}`, color: 'gray' },
          { label: 'Approved', value: `${approved.length}`, color: 'green' },
          { label: 'Blocked / pending', value: `${blocked.length}`, color: 'orange' },
          { label: 'Shared blockers', value: `${sharedBlockers.length}`, color: sharedBlockers.length ? 'red' : 'green' },
        ].map(s => (
          <Paper key={s.label} withBorder p="sm" radius="md"><Stack gap={2}><Text size="lg" fw={900} c={s.color} style={{ lineHeight: 1 }}>{s.value}</Text><Text size="10px" c="dimmed">{s.label}</Text></Stack></Paper>
        ))}
      </SimpleGrid>

      {/* Zone 2 — Strategy-cell approval table */}
      <Stack gap="xs">
        <Text size="sm" fw={700}>Strategy-cell approval</Text>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 900 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Cell</Table.Th><Table.Th>Cohort</Table.Th><Table.Th>Strategy</Table.Th>
                <Table.Th>Approval owners</Table.Th><Table.Th>Status</Table.Th><Table.Th>Blocking reason</Table.Th>
                <Table.Th ta="center">Launch independently?</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {CELLS.map(c => (
                <Table.Tr key={c.id}>
                  <Table.Td fw={600}>{c.id}</Table.Td>
                  <Table.Td>{c.cohort}</Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color="blue">{c.strategy}</Badge></Table.Td>
                  <Table.Td c="dimmed">{c.owners}</Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color={statusColor(c.status)}>{c.status}</Badge></Table.Td>
                  <Table.Td c={c.blocker === '—' ? 'dimmed' : 'orange'}>{c.blocker}</Table.Td>
                  <Table.Td ta="center">{c.independent && c.status === 'Approved' ? <Badge size="xs" color="green" variant="light">Yes</Badge> : <Badge size="xs" color="gray" variant="light">No</Badge>}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>

      {/* Zone 3 — Dependency blocker panel */}
      <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${sharedBlockers.length ? 'red' : 'green'}-5)` }}>
        <Stack gap="sm">
          <Group gap="xs"><ThemeIcon size="sm" variant="light" color={sharedBlockers.length ? 'red' : 'green'}><IconAlertTriangle size={12} /></ThemeIcon><Text size="sm" fw={700}>Shared-constraint dependencies</Text></Group>
          <Divider />
          {SHARED.map(s => (
            <Group key={s.label} gap="xs" align="flex-start" wrap="nowrap">
              <ThemeIcon size="xs" radius="xl" variant="light" color={s.ok ? 'green' : 'red'} mt={2}>{s.ok ? <IconCheck size={9} /> : <IconShieldX size={9} />}</ThemeIcon>
              <Box style={{ flex: 1 }}><Text size="xs" fw={600}>{s.label}</Text><Text size="10px" c={s.ok ? 'dimmed' : 'red'}>{s.detail}</Text></Box>
            </Group>
          ))}
          <Alert color={sharedBlockers.length ? 'orange' : 'teal'} variant="light" p="xs">
            <Text size="xs">
              {sharedBlockers.length
                ? <>Full-portfolio launch is blocked until shared constraints clear (e.g. compliance review). Optimizer suggestion: move part of below-match participants from Match Stretch to Education-only to stay within the cost ceiling.</>
                : <>All shared constraints satisfied — full portfolio can launch.</>}
            </Text>
          </Alert>
          <Switch checked={independentLaunch} onChange={e => setIndependentLaunch(e.currentTarget.checked)} label="Allow independent launch of approved, independent cells" color="teal" />
        </Stack>
      </Paper>

      {/* Actions */}
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          {portfolioLaunchOk
            ? 'Portfolio ready to launch.'
            : canLaunchApprovedCells
              ? `${approved.filter(c => c.independent).length} independent cell(s) can launch now; ${blocked.length} awaiting approval.`
              : 'Launch blocked — resolve shared constraints or enable independent launch.'}
        </Text>
        <Group gap="md">
          <Button size="md" variant="light" color="red">Decline</Button>
          <Button
            size="md"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
            styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
            leftSection={<IconCheck size={16} stroke={2} />}
            onClick={() => onApprove('')}
          >
            {portfolioLaunchOk ? 'Approve portfolio & send for clearance' : 'Approve independent cells & continue'}
          </Button>
        </Group>
      </Group>
    </Stack>
  )
}
