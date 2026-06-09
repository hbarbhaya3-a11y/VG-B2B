import { useState, useEffect, useMemo } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, Button, Alert, List, Modal, Tabs, Table, Loader, Progress, Pagination } from '@mantine/core'
import { IconCheck, IconChevronRight, IconShieldCheck, IconCertificate, IconBroadcast, IconPackage, IconClock, IconEye } from '@tabler/icons-react'
import PanelGuide from '../../ui/PanelGuide'

const DEFAULT_DEPLOYING_LINES = [
  'Optimizing send times for target segments…',
  'Pushing primary segment (high-priority cohort)…',
  'Triggering secondary channel waves…',
  'Activating remaining notification channels…',
  'Deployment complete — all channels live…',
]

function SegmentCard({ segment }) {
  return (
    <Paper withBorder p="md" radius="md" style={{ borderTop: `3px solid var(--mantine-color-${segment.color}-5)` }}>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap={6} wrap="nowrap" style={{ flex: 1 }}>
            <div style={{ width: 3, height: 32, borderRadius: 2, background: `var(--mantine-color-${segment.color}-5)`, flexShrink: 0 }} />
            <Text size="sm" fw={700} style={{ lineHeight: 1.3 }}>{segment.label}</Text>
          </Group>
          <Stack gap={0} align="flex-end" style={{ flexShrink: 0 }}>
            <Text size="xl" fw={900} c={segment.color} style={{ lineHeight: 1 }}>
              {segment.count.toLocaleString()}
            </Text>
            <Text size="xs" c="dimmed">participants</Text>
          </Stack>
        </Group>

        <Divider />

        <Stack gap={4}>
          <Group gap={4} align="flex-start">
            <IconPackage size={10} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)', flexShrink: 0, marginTop: 2 }} />
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>{segment.content}</Text>
          </Group>
        </Stack>

        <List
          spacing={4}
          size="xs"
          icon={
            <ThemeIcon size="xs" color={segment.color} radius="xl" variant="filled">
              <IconCheck size={8} stroke={2} />
            </ThemeIcon>
          }
        >
          {segment.actions.map((action, i) => (
            <List.Item key={i}><Text size="xs">{action}</Text></List.Item>
          ))}
        </List>

        <Badge size="xs" color="green" variant="light" style={{ alignSelf: 'flex-start' }}>✓ Pushed</Badge>
      </Stack>
    </Paper>
  )
}

function DeploymentTable({ rows, onPreview }) {
  return (
    <Table striped highlightOnHover withTableBorder fz="xs">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Participant</Table.Th>
          <Table.Th>Channel</Table.Th>
          <Table.Th>Content</Table.Th>
          <Table.Th>Variant</Table.Th>
          <Table.Th>Time</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Preview</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row, i) => (
          <Table.Tr key={i}>
            <Table.Td fw={600}>{row.name}</Table.Td>
            <Table.Td>{row.channel}</Table.Td>
            <Table.Td>{row.content.join(' \u00b7 ')}</Table.Td>
            <Table.Td>
              {row.variant
                ? <Badge size="xs" color={row.variant === 'A' ? 'blue' : 'violet'} variant="light">{row.variant}</Badge>
                : <Text size="xs" c="dimmed">&mdash;</Text>
              }
            </Table.Td>
            <Table.Td c="dimmed">{row.sendTime}</Table.Td>
            <Table.Td>
              <Badge size="xs" color="green" variant="filled">&check; {row.status}</Badge>
            </Table.Td>
            <Table.Td>
              <Button size="xs" variant="subtle" color="gray" onClick={() => onPreview(row)}>
                <IconEye size={12} />
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

function PreviewModalContent({ advisor: participant }) {
  if (!participant) return null

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group gap="xs">
            <Text size="sm" fw={600}>{participant.name}</Text>
            <Text size="xs" c="dimmed">{participant.firm}</Text>
          </Group>
          <Group gap="xs">
            <Badge size="xs" color="gray" variant="outline">{participant.channel}</Badge>
            {participant.variant && (
              <Badge size="xs" color={participant.variant === 'A' ? 'blue' : 'violet'} variant="light">Variant {participant.variant}</Badge>
            )}
          </Group>
          <Divider />
          <Text size="xs" fw={600}>Content deployed</Text>
          <List size="xs" type="ordered" spacing={4}>
            {participant.content.map((item, i) => (
              <List.Item key={i}><Text size="xs">{item}</Text></List.Item>
            ))}
          </List>
          {participant.talkingPoints && (
            <>
              <Divider />
              <Text size="xs" fw={600}>Talking points</Text>
              <List size="xs" type="ordered" spacing={4}>
                {participant.talkingPoints.map((pt, i) => (
                  <List.Item key={i}><Text size="xs">{pt}</Text></List.Item>
                ))}
              </List>
            </>
          )}
          <Divider />
          <Group gap="xs">
            <IconClock size={11} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed">Sent: {participant.sendTime}</Text>
            <Badge size="xs" color="green" variant="filled">✓ {participant.status}</Badge>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  )
}

// ── Synthetic participant name generator for full deployment log ──
const FIRST = ['Maya','Liam','Priya','Diego','Aisha','Jordan','Noah','Sofia','Chen','Ezra','Amara','Ravi','Ingrid','Omar','Lena','Miguel','Yuki','Kofi','Nina','Theo','Zara','Hiro','Iris','Malik','Elena','Arjun','Freya','Dante','Asha','Leo','Sana','Ben','Rosa','Caleb','Ayla','Finn']
const LAST = ['Okafor','Chen','Gupta','Rivera','Ahmed','Sato','Brennan','Park','Kowalski','Singh','Okoye','Diaz','Nguyen','Hall','Morales','Romano','Petrov','Kapoor','Lindqvist','Yamada','Haddad','Obi','Navarro','Patel','Shaw','Reyes','Kim','Tesfaye','Vogel','Iqbal']
const FIRMS = ['Aurora Aerospace','Helix Biotech','Northstar Retail']
const STATUSES = ['Delivered','Delivered','Delivered','Delivered','Delivered','Pending','Delivered','Delivered','Delivered','Delivered']

function generateFullLog(pd) {
  if (!pd?.segments || !pd?.totalProfiles) return pd?.deploymentSample || []
  const rows = []
  let idx = 0
  for (const seg of pd.segments) {
    for (let i = 0; i < seg.count; i++) {
      const name = `${FIRST[(idx * 7 + i * 3) % FIRST.length]} ${LAST[(idx * 11 + i * 5) % LAST.length]}`
      const h = (idx * 13) % 24
      rows.push({
        name, tier: seg.tier,
        channel: seg.actions?.[1] || seg.content || 'Email',
        content: [seg.content || seg.label],
        sendTime: `${String(8 + Math.floor(h / 2)).padStart(2,'0')}:${String((idx * 7) % 60).padStart(2,'0')} ET`,
        status: STATUSES[idx % STATUSES.length],
      })
      idx++
    }
  }
  return rows
}

const PAGE_SIZE = 25

function PaginatedDeploymentLog({ pd, onPreview }) {
  const entity = pd?.entityLabel || 'participants'
  const [page, setPage] = useState(1)
  const fullLog = useMemo(() => generateFullLog(pd), [pd])
  const totalPages = Math.ceil(fullLog.length / PAGE_SIZE)
  const pageRows = fullLog.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Stack gap="sm" mt="md">
      <Group gap="xs">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
          Participant deployment log
        </Text>
        <Badge size="xs" variant="light" color="teal">{fullLog.length.toLocaleString()} {entity}</Badge>
      </Group>

      <DeploymentTable rows={pageRows} onPreview={onPreview} />

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, fullLog.length)} of {fullLog.length.toLocaleString()}
        </Text>
        <Pagination size="xs" total={totalPages} value={page} onChange={setPage} />
      </Group>
    </Stack>
  )
}

export default function DeploymentPanel({ step, workflowState, onContinue, activeUseCase }) {
  const DEPLOYING_LINES = step?.panelData?.deployingLines || DEFAULT_DEPLOYING_LINES
  const pd = step.panelData
  const entity = pd.entityLabel || 'participants'
  const [phase, setPhase] = useState('deploying')
  const [lineIndex, setLineIndex] = useState(0)
  const [previewParticipant, setPreviewParticipant] = useState(null)

  useEffect(() => {
    if (phase !== 'deploying') return
    const interval = setInterval(() => {
      setLineIndex(l => {
        if (l >= DEPLOYING_LINES.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('complete'), 400)
          return l
        }
        return l + 1
      })
    }, 500)
    return () => clearInterval(interval)
  }, [phase])

  const ts = new Date(pd.timestamp)
  const tsFormatted = ts.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })

  if (phase === 'deploying') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="xl">
          <Loader size="lg" color="green" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Deploying to {entity}…</Text>
            {DEPLOYING_LINES.slice(0, lineIndex + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < lineIndex
                  ? <ThemeIcon size="xs" color="green" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="green" />}
                <Text size="xs" c={i < lineIndex ? 'green' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(lineIndex / (DEPLOYING_LINES.length - 1)) * 100} color="green" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  const guide = pd.panelGuide

  return (
    <Stack gap="md">
      {guide && <PanelGuide {...guide} />}
      {/* Campaign header */}
      <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-orange-light)', borderLeft: '3px solid var(--mantine-color-orange-5)' }}>
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={48} radius="xl" color="orange" variant="filled">
              <IconBroadcast size={24} stroke={1.5} />
            </ThemeIcon>
            <Stack gap={4}>
              <Group gap="xs">
                <Badge size="sm" color="orange" variant="filled">RESPOND</Badge>
                <Badge size="sm" color="blue" variant="light">{pd.system}</Badge>
              </Group>
              <Text size="lg" fw={800} style={{ lineHeight: 1.2 }}>
                {pd.totalProfiles.toLocaleString()} {entity} profiles pushed
              </Text>
              <Group gap="xs">
                <IconClock size={11} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="xs" c="dimmed">{tsFormatted}</Text>
              </Group>
            </Stack>
          </Group>
          <Stack gap="xs" align="flex-end">
            <Badge size="lg" color="green" variant="filled" style={{ fontSize: 14 }}>✓ PUSHED</Badge>
            <Stack gap={2} align="flex-end">
              <Group gap={4}>
                <Text size="xs" c="dimmed">Campaign</Text>
                <Badge size="xs" variant="outline" color="gray" style={{ fontFamily: 'monospace', fontSize: 10 }}>{pd.campaignId}</Badge>
              </Group>
              <Group gap={4}>
                <Text size="xs" c="dimmed">Batch</Text>
                <Badge size="xs" variant="outline" color="gray" style={{ fontFamily: 'monospace', fontSize: 10 }}>{pd.batchId}</Badge>
              </Group>
            </Stack>
          </Stack>
        </Group>
      </Paper>

      {/* Segment cards */}
      <SimpleGrid cols={3} spacing="md">
        {pd.segments.map((segment) => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            overrideText={workflowState?.overrideText}
          />
        ))}
      </SimpleGrid>

      {/* Compliance footer */}
      <Paper withBorder p="md" radius="md">
        <Group gap="xl">
          <Group gap="xs">
            <ThemeIcon size="sm" color="green" variant="filled" radius="sm">
              <IconShieldCheck size={12} stroke={1.5} />
            </ThemeIcon>
            <Text size="xs" fw={600}>Frequency cap</Text>
            <Text size="xs" c="dimmed">max {pd.frequencyCap} intelligent interventions per {entity.slice(0, -1)} per week — enforced</Text>
            <Badge size="xs" color="green" variant="filled">✓</Badge>
          </Group>
          <Divider orientation="vertical" h={16} style={{ alignSelf: 'center' }} />
          <Group gap="xs">
            <ThemeIcon size="sm" color="blue" variant="filled" radius="sm">
              <IconCertificate size={12} stroke={1.5} />
            </ThemeIcon>
            <Text size="xs" fw={600}>C2PA Content Credentials</Text>
            <Text size="xs" c="dimmed">{pd.contentCredentials}</Text>
            <Badge size="xs" color="green" variant="filled">✓</Badge>
          </Group>
        </Group>
      </Paper>

      {/* Participant deployment detail — paginated full log */}
      <PaginatedDeploymentLog pd={pd} onPreview={setPreviewParticipant} />

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        onClick={onContinue}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
      >
        View Attribution Results
      </Button>

      {/* Preview modal */}
      <Modal
        opened={previewParticipant !== null}
        onClose={() => setPreviewParticipant(null)}
        title={
          previewParticipant ? (
            <Group gap="xs">
              <Text fw={700}>{previewParticipant.name}</Text>
              <Badge size="xs" color="gray" variant="outline">{previewParticipant.channel}</Badge>
            </Group>
          ) : null
        }
        size="lg"
      >
        <PreviewModalContent advisor={previewParticipant} />
      </Modal>
    </Stack>
  )
}
