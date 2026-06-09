import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Progress, Table, ThemeIcon, Divider, Button, Alert, Loader, Center } from '@mantine/core'
import { IconRadar, IconShieldCheck, IconClock, IconDatabase, IconChevronRight, IconBrain, IconUsers, IconSpeakerphone, IconRoute2, IconChartBar, IconCheck, IconSparkles, IconMessageDots } from '@tabler/icons-react'
import DataSourceStrip from '../../ui/DataSourceStrip'

const CLASSIFYING_LINES = [
  'Ingesting behavioral + market signals…',
  'Running classification model…',
  'Matching against episode library…',
  'Calculating confidence intervals…',
  'Signal classified — generating report…',
]

function StatBlock({ label, value, color = 'teal', unit }) {
  return (
    <Stack gap={2}>
      <Group gap={4} align="flex-end">
        <Text size="xl" fw={800} c={color} style={{ lineHeight: 1 }}>{value}</Text>
        {unit && <Text size="xs" c="dimmed" mb={1}>{unit}</Text>}
      </Group>
      <Text size="xs" c="dimmed">{label}</Text>
    </Stack>
  )
}

const CONFIG_ROWS = [
  { key: 'whoTargeted', label: 'Who', icon: IconUsers, color: 'orange' },
  { key: 'whatContent', label: 'What', icon: IconSpeakerphone, color: 'blue' },
  { key: 'contentTone', label: 'Tone', icon: IconBrain, color: 'violet' },
  { key: 'howChannel', label: 'Channel', icon: IconRoute2, color: 'teal' },
  { key: 'outcomes', label: 'Outcomes', icon: IconChartBar, color: 'green' },
  { key: 'keyParams', label: 'Parameters', icon: IconRadar, color: 'gray' },
]

function PrecedentConfigCard({ precedent }) {
  return (
    <Paper withBorder p="sm" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-teal-4)' }}>
      <Stack gap="xs">
        <Group gap="xs">
          <Badge size="xs" color="teal" variant="filled">Configuration used</Badge>
          <Text size="xs" fw={600}>{precedent.date} — {precedent.event}</Text>
        </Group>
        <Divider />
        {CONFIG_ROWS.map(({ key, label, icon: Icon, color }) => (
          <Group key={key} gap="sm" align="flex-start">
            <Badge
              size="xs"
              color={color}
              variant="light"
              leftSection={<Icon size={10} stroke={1.5} />}
              style={{ flexShrink: 0, minWidth: 80 }}
            >
              {label}
            </Badge>
            <Text
              size="xs"
              c={key === 'outcomes' ? 'green' : 'dimmed'}
              fw={key === 'outcomes' ? 600 : 400}
              style={{ flex: 1 }}
            >
              {precedent.config[key]}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  )
}

export default function SignalDetectionPanel({ step, onContinue }) {
  const pd = step.panelData
  const [expandedPrecedent, setExpandedPrecedent] = useState(null)
  const [phase, setPhase] = useState('classifying')
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (phase !== 'classifying') return
    const interval = setInterval(() => {
      setLineIndex(l => {
        if (l >= CLASSIFYING_LINES.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('complete'), 400)
          return l
        }
        return l + 1
      })
    }, 350)
    return () => clearInterval(interval)
  }, [phase])

  if (phase === 'classifying') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="xl">
          <Loader size="lg" color="teal" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Classifying signal…</Text>
            {CLASSIFYING_LINES.slice(0, lineIndex + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < lineIndex
                  ? <ThemeIcon size="xs" color="teal" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="teal" />}
                <Text size="xs" c={i < lineIndex ? 'teal' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(lineIndex / (CLASSIFYING_LINES.length - 1)) * 100} color="teal" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack gap="md">
      {/* Data source manifest — only renders when panelData provides a `dataSources` array */}
      {Array.isArray(pd.dataSources) && pd.dataSources.length > 0 && (
        <DataSourceStrip
          sources={pd.dataSources}
          title="Data sources backing this signal"
          lastSyncLabel={pd.dataSourcesSyncLabel}
        />
      )}

      <SimpleGrid cols={2} spacing="md">
        {/* Left — Signal hero */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-teal-5)' }}>
          <Stack gap="md">
            <Group gap="xs">
              <Badge size="sm" color="teal" variant="filled">SENSE</Badge>
              <Badge size="sm" color="teal" variant="light">CLASSIFIED</Badge>
              <Badge size="sm" color="red" variant="filled">CRITICAL</Badge>
            </Group>

            <Stack gap={4}>
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="teal" radius="sm">
                  <IconRadar size={12} stroke={1.5} />
                </ThemeIcon>
                <Group gap={4}>
                  <Badge size="xs" color="teal" variant="light" leftSection={<IconBrain size={10} />}>Market Sentinel</Badge>
                  <Badge size="xs" color="gray" variant="outline">{pd.sourceLabel || 'Vanguard Behavior Radar'}</Badge>
                </Group>
              </Group>
              <Text size="lg" fw={800} style={{ lineHeight: 1.3 }}>
                {step.headline || 'Signal detected — see details below'}
              </Text>
            </Stack>

            <Divider />

            <SimpleGrid cols={3} spacing="xs">
                  <StatBlock label={pd.primaryMetricLabel || 'Signal metric'} value={pd.primaryMetric || '—'} color="violet" />
                  <StatBlock label="Gap vs benchmark" value={pd.sigmaDeviation?.split(' ')[0] || '—'} color="orange" />
                  <StatBlock label="Detection lag" value={pd.detectionLag || '—'} color="teal" />
                  <StatBlock label="Education window" value={pd.urgencyWindow?.split(' ')[0] || '—'} color="orange" />
                  <StatBlock label="LSTM confidence" value={`${Math.round(pd.lstmConfidence * 100)}%`} color="teal" />
                  <StatBlock label="Signal class" value={pd.episodeClass?.split(' — ')[0] || 'Behavioral'} color="gray" />
            </SimpleGrid>

            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Model confidence</Text>
                <Text size="xs" fw={700} c="teal">{Math.round(pd.lstmConfidence * 100)}%</Text>
              </Group>
              <Progress value={pd.lstmConfidence * 100} color="teal" size="sm" radius="sm" />
            </Stack>

            <Group gap="xs">
              <IconDatabase size={12} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed">{pd.source}</Text>
            </Group>

            <Alert color="teal" variant="light" icon={<IconShieldCheck size={14} />} p="xs">
              <Text size="xs">{pd.episodeNote || 'Signal classified and recorded in TwinX episode library.'}</Text>
            </Alert>
          </Stack>
        </Paper>

        {/* Right — Precedent matches */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Stack gap={2}>
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="violet" radius="sm">
                  <IconBrain size={12} stroke={1.5} />
                </ThemeIcon>
                <Text size="sm" fw={700}>
                  {pd.precedents.length} matched episodes
                </Text>
                <Badge size="xs" color="violet" variant="light">Historical analogs · cosine similarity</Badge>
              </Group>
              <Text size="xs" c="dimmed">Cosine similarity · Pinecone vector DB · click any row for the configuration used</Text>
            </Stack>

            <Table striped highlightOnHover withTableBorder withColumnBorders fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Event</Table.Th>
                  <Table.Th>Similarity</Table.Th>
                  <Table.Th>Outcome</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {pd.precedents.map((p, i) => (
                  <Table.Tr
                    key={i}
                    style={{
                      cursor: 'pointer',
                      background: expandedPrecedent === i ? 'var(--mantine-color-teal-light)' : undefined,
                    }}
                    onClick={() => setExpandedPrecedent(expandedPrecedent === i ? null : i)}
                  >
                    <Table.Td fw={600}>{p.date}</Table.Td>
                    <Table.Td>{p.event}</Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="xs" fw={700} c="teal">{Math.round(p.similarity * 100)}%</Text>
                        <Progress value={p.similarity * 100} color="teal" size="xs" radius="sm" />
                      </Stack>
                    </Table.Td>
                    <Table.Td c="green" fw={500}>{p.outcome}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Group gap="xs">
              <IconClock size={12} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed">Select a row to see the configuration applied in that episode</Text>
            </Group>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Expandable precedent config */}
      {expandedPrecedent !== null && pd.precedents[expandedPrecedent]?.config && (
        <PrecedentConfigCard precedent={pd.precedents[expandedPrecedent]} />
      )}

      {/* Recommended Hypothesis */}
      <Paper withBorder radius="md" p="md" style={{ borderLeft: '3px solid var(--mantine-color-indigo-5)', background: 'var(--mantine-color-indigo-light)' }}>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon size={24} radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}>
              <IconSparkles size={14} color="white" />
            </ThemeIcon>
            <Text fw={700} size="sm">Recommended Hypothesis</Text>
          </Group>
          <Text size="sm" style={{ lineHeight: 1.7 }}>
            If planning-intent, unadvised investors receive behavior-matched education, portfolio review prompts, and appropriate advice pathways within a 30-day window, then Vanguard can increase advisory appointment starts and portfolio review completion versus no action, while preserving education/advice boundaries and brand trust.
          </Text>
        </Stack>
      </Paper>

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        onClick={onContinue}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
      >
        Continue to Simulation
      </Button>
    </Stack>
  )
}
