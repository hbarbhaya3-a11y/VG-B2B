import { useState } from 'react'
import {
  Paper, Stack, Group, Text, Badge, Checkbox, Button, ThemeIcon, Alert,
  Progress, Divider, SimpleGrid, Box
} from '@mantine/core'
import {
  IconChevronRight, IconInfoCircle, IconUsers, IconGift, IconSparkles,
  IconChartBar, IconSend
} from '@tabler/icons-react'

function RangeBar({ range, color }) {
  if (!range) return <Text size="xs" c="dimmed">—</Text>
  const low = Math.round(range[0] * 100)
  const high = Math.round(range[1] * 100)
  return (
    <Group gap={6} wrap="nowrap" align="center">
      <Text size="xs" fw={600} c={`${color}.7`} style={{ minWidth: 52 }}>{low}–{high}%</Text>
      <Progress.Root size={6} w={44} radius="xl">
        <Progress.Section value={high} color={`${color}.3`} />
        <Progress.Section value={low} color={color} />
      </Progress.Root>
    </Group>
  )
}

export default function ParticipantChannelConfigPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const pd = step.panelData
  const offers = pd.offers || []
  const segments = pd.segments || []

  const [selectedOffers, setSelectedOffers] = useState(() => offers.map(o => o.id))
  const [selectedSegs, setSelectedSegs] = useState(() => segments.map(s => s.id))

  const toggleOffer = (id) => setSelectedOffers(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
  const toggleSeg = (id) => setSelectedSegs(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])

  const totalVariants = segments.filter(s => selectedSegs.includes(s.id)).reduce((sum, s) => sum + s.variants, 0)
  const totalReach = segments.filter(s => selectedSegs.includes(s.id)).reduce((sum, s) => sum + s.count, 0)

  const handleContinue = () => {
    setWorkflowState(s => ({ ...s, selectedOffers, selectedSegments: selectedSegs }))
    onContinue()
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb={4}>
          <Text size="lg" fw={700}>Offer & Channel Configuration</Text>
          <Group gap="xs">
            <Badge size="sm" variant="light" color="orange">{selectedOffers.length} offers</Badge>
            <Badge size="sm" variant="light" color="blue">{selectedSegs.length} segments</Badge>
            <Badge size="sm" variant="light" color="green">{totalVariants} variants</Badge>
          </Group>
        </Group>
        <Text size="sm" c="dimmed">
          Select offers and confirm channel configuration per audience segment. Engagement rates are historical estimates.
        </Text>
      </Paper>

      {/* Offer configuration */}
      <Stack gap="xs">
        <Group gap="xs">
          <ThemeIcon size={20} radius="md" variant="light" color="orange">
            <IconGift size={12} stroke={1.5} />
          </ThemeIcon>
          <Text size="sm" fw={700}>Offer Configuration</Text>
          <Badge size="xs" color="orange" variant="light">{selectedOffers.length} of {offers.length} selected</Badge>
        </Group>

        <SimpleGrid cols={2} spacing="sm">
          {offers.map(offer => {
            const isSelected = selectedOffers.includes(offer.id)
            return (
              <Paper
                key={offer.id}
                withBorder p="md" radius="md"
                style={{
                  borderLeft: `3px solid var(--mantine-color-${offer.color}-5)`,
                  opacity: isSelected ? 1 : 0.45,
                  cursor: 'pointer',
                  transition: 'opacity 150ms ease',
                }}
                onClick={() => toggleOffer(offer.id)}
              >
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <Group gap="xs" style={{ flex: 1 }}>
                      <Checkbox
                        size="xs"
                        checked={isSelected}
                        onChange={() => toggleOffer(offer.id)}
                        color={offer.color}
                        onClick={e => e.stopPropagation()}
                      />
                      <Text size="sm" fw={700} style={{ flex: 1 }}>{offer.label}</Text>
                    </Group>
                  </Group>

                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{offer.description}</Text>

                  <Divider label="Best for" labelPosition="left" />
                  <Group gap={4} wrap="wrap">
                    {offer.bestFor.map(seg => (
                      <Badge key={seg} size="xs" variant="light" color={offer.color}>{seg}</Badge>
                    ))}
                  </Group>

                  <Divider label="Primary KPI" labelPosition="left" />
                  <Group gap="xs">
                    <IconChartBar size={11} stroke={1.5} style={{ color: `var(--mantine-color-${offer.color}-6)` }} />
                    <Text size="xs" fw={600}>{offer.primaryKpi}</Text>
                  </Group>
                </Stack>
              </Paper>
            )
          })}
        </SimpleGrid>
      </Stack>

      {/* Segment channel table */}
      <Stack gap="xs">
        <Group gap="xs">
          <ThemeIcon size={20} radius="md" variant="light" color="blue">
            <IconSend size={12} stroke={1.5} />
          </ThemeIcon>
          <Text size="sm" fw={700}>Channel Configuration by Segment</Text>
          <Badge size="xs" color="blue" variant="light">{totalReach.toLocaleString()} participants · {totalVariants} variants</Badge>
        </Group>

        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          {/* Column headers */}
          <Box px="md" py="xs" style={{ background: 'var(--mantine-color-default-hover)', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
            <Group gap={0}>
              <Box style={{ width: 28 }} />
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ flex: 1, letterSpacing: '0.05em' }}>Segment</Text>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ width: 80, textAlign: 'right', letterSpacing: '0.05em' }}>Count</Text>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ width: 180, paddingLeft: 16, letterSpacing: '0.05em' }}>Channel</Text>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ width: 60, textAlign: 'center', letterSpacing: '0.05em' }}>Variants</Text>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ width: 130, textAlign: 'right', letterSpacing: '0.05em' }}>Open rate</Text>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ width: 130, textAlign: 'right', letterSpacing: '0.05em' }}>Click rate</Text>
            </Group>
          </Box>

          {segments.map((seg, idx) => {
            const isSelected = selectedSegs.includes(seg.id)
            return (
              <Box
                key={seg.id}
                px="md" py="sm"
                style={{
                  borderBottom: idx < segments.length - 1 ? '1px solid var(--mantine-color-default-border)' : 'none',
                  opacity: isSelected ? 1 : 0.4,
                  cursor: 'pointer',
                  transition: 'opacity 150ms ease',
                  background: isSelected ? 'transparent' : 'var(--mantine-color-default-hover)',
                }}
                onClick={() => toggleSeg(seg.id)}
              >
                <Group gap={0} align="center">
                  <Box style={{ width: 28 }}>
                    <Checkbox
                      size="xs"
                      checked={isSelected}
                      onChange={() => toggleSeg(seg.id)}
                      color={seg.color}
                      onClick={e => e.stopPropagation()}
                    />
                  </Box>
                  <Group gap={6} style={{ flex: 1 }}>
                    <div style={{ width: 3, height: 28, borderRadius: 2, background: `var(--mantine-color-${seg.color}-5)`, flexShrink: 0 }} />
                    <Text size="sm" fw={600}>{seg.label}</Text>
                  </Group>
                  <Text size="sm" fw={700} c={seg.color} style={{ width: 80, textAlign: 'right' }}>
                    {seg.count.toLocaleString()}
                  </Text>
                  <Box style={{ width: 180, paddingLeft: 16 }}>
                    <Badge size="xs" variant="light" color={seg.color}>{seg.channel}</Badge>
                  </Box>
                  <Text size="sm" fw={600} c="dimmed" style={{ width: 60, textAlign: 'center' }}>{seg.variants}</Text>
                  <Box style={{ width: 130, display: 'flex', justifyContent: 'flex-end' }}>
                    <RangeBar range={seg.openRate} color={seg.color} />
                  </Box>
                  <Box style={{ width: 130, display: 'flex', justifyContent: 'flex-end' }}>
                    <RangeBar range={seg.clickRate} color={seg.color} />
                  </Box>
                </Group>
              </Box>
            )
          })}
        </Paper>
      </Stack>

      {/* Summary */}
      <Alert variant="light" color="orange" icon={<IconInfoCircle size={16} />}>
        <Text size="sm">
          <strong>{selectedOffers.length}</strong> offers across{' '}
          <strong>{selectedSegs.length}</strong> segments reaching{' '}
          <strong>{totalReach.toLocaleString()}</strong> participants.{' '}
          TwinX will generate <strong>{totalVariants}</strong> content variants.
        </Text>
      </Alert>

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        leftSection={<IconSparkles size={16} stroke={1.5} />}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
        onClick={handleContinue}
        disabled={selectedOffers.length === 0 || selectedSegs.length === 0}
      >
        Recommend &amp; Simulate
      </Button>
    </Stack>
  )
}
