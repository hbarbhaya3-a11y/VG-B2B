import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider, Alert, List } from '@mantine/core'
import { IconChevronRight, IconRoute, IconCheck, IconCalendar, IconHash, IconSend } from '@tabler/icons-react'

/**
 * DeploymentCohortPanel — segment-focused deployment view.
 * Contract (step.panelData.deployment):
 *   {
 *     summary: { label, value, caption }[],      // top KPI strip (reach, channel, holdout)
 *     segments: [{
 *       label: string,
 *       count: number,
 *       framing: string,                         // plain-English message framing
 *       channel: string,                         // App push, email, etc.
 *       content: string,                         // what they receive
 *       color?: string,                          // Mantine color token
 *     }],
 *     schedule: { kickoff: string, cadence: string }, // metadata strip
 *     campaignId?: string,
 *     compliance?: string[],                     // line items of compliance attachments
 *   }
 */

export default function DeploymentCohortPanel({ step, onContinue, activeUseCase }) {
  const pd = step?.panelData?.deployment || {}
  const segments = pd.segments || []
  const summary = pd.summary || []
  const schedule = pd.schedule || { kickoff: 'Within 6 hours', cadence: 'One-wave; 10-day reminder' }
  const compliance = pd.compliance || []
  const campaignId = pd.campaignId || `CAMP-${Math.abs((activeUseCase?.id || 'twinx').split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 773).toString(36).toUpperCase()}`
  const totalReach = segments.reduce((s, x) => s + (x.count || 0), 0)

  return (
    <Stack gap="md">
      <Alert color="green" variant="light" icon={<IconSend size={16} />} radius="md">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Stack gap={0}>
            <Text size="sm" fw={700}>Deployment live</Text>
            <Text size="xs" c="dimmed">
              Campaign <strong>{campaignId}</strong> · kickoff {schedule.kickoff} · cadence: {schedule.cadence}
            </Text>
          </Stack>
          <Badge size="sm" color="green" variant="filled">DEPLOYED</Badge>
        </Group>
      </Alert>

      <SimpleGrid cols={{ base: 2, md: Math.max(3, summary.length || 3) }} spacing="sm">
        {summary.length > 0 ? (
          summary.map(s => (
            <Paper key={s.label} withBorder p="sm" radius="md">
              <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>{s.label}</Text>
              <Text size="lg" fw={800}>{s.value}</Text>
              {s.caption && <Text size="10px" c="dimmed">{s.caption}</Text>}
            </Paper>
          ))
        ) : (
          <>
            <Paper withBorder p="sm" radius="md">
              <Text size="10px" c="dimmed" tt="uppercase">Total reach</Text>
              <Text size="lg" fw={800}>{totalReach.toLocaleString()}</Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="10px" c="dimmed" tt="uppercase">Segments</Text>
              <Text size="lg" fw={800}>{segments.length}</Text>
            </Paper>
            <Paper withBorder p="sm" radius="md">
              <Text size="10px" c="dimmed" tt="uppercase">Status</Text>
              <Text size="lg" fw={800} c="green.7">Live</Text>
            </Paper>
          </>
        )}
      </SimpleGrid>

      <Paper withBorder p="md" radius="md">
        <Group gap="xs" mb="sm">
          <ThemeIcon size="sm" radius="xl" variant="light" color="green"><IconRoute size={12} /></ThemeIcon>
          <Text fw={700} size="sm">Segments targeted</Text>
        </Group>
        {segments.length === 0 ? (
          <Text size="xs" c="dimmed">No segments configured for this deployment step.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, md: Math.min(3, segments.length) }} spacing="md">
            {segments.map((seg, i) => {
              const color = seg.color || ['teal', 'blue', 'violet', 'orange', 'grape'][i % 5]
              return (
                <Paper key={seg.label} withBorder radius="md" p="sm"
                  style={{ borderLeft: `3px solid var(--mantine-color-${color}-6)` }}>
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text size="xs" fw={700}>{seg.label}</Text>
                      <Badge size="xs" color={color} variant="light">{seg.count.toLocaleString()}</Badge>
                    </Group>
                    <Stack gap={2}>
                      <Group gap={4}>
                        <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Framing</Text>
                      </Group>
                      <Text size="xs">{seg.framing}</Text>
                    </Stack>
                    <Stack gap={2}>
                      <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Channel</Text>
                      <Text size="xs">{seg.channel}</Text>
                    </Stack>
                    {seg.content && (
                      <Stack gap={2}>
                        <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Content</Text>
                        <Text size="xs">{seg.content}</Text>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </SimpleGrid>
        )}
      </Paper>

      {compliance.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb="xs">
            <IconCheck size={14} style={{ color: 'var(--mantine-color-teal-7)' }} />
            <Text fw={700} size="sm">Compliance attachments</Text>
          </Group>
          <List size="xs" spacing={4} icon={<ThemeIcon size="xs" color="teal" variant="light"><IconCheck size={9} /></ThemeIcon>}>
            {compliance.map((c, i) => <List.Item key={i}>{c}</List.Item>)}
          </List>
        </Paper>
      )}

      <Group justify="space-between" align="center">
        <Group gap="md">
          <Group gap={4}>
            <IconHash size={12} color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed">Campaign {campaignId}</Text>
          </Group>
          <Group gap={4}>
            <IconCalendar size={12} color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="dimmed">{schedule.kickoff}</Text>
          </Group>
        </Group>
        <Button onClick={onContinue} rightSection={<IconChevronRight size={14} />}>Continue to Learn</Button>
      </Group>
    </Stack>
  )
}
