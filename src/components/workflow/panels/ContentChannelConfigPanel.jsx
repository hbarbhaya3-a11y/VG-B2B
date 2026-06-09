import { useMemo } from 'react'
import {
  Paper, Stack, Group, Text, Badge, Checkbox, Button, ThemeIcon, Alert,
  Progress, SimpleGrid, Divider, Accordion
} from '@mantine/core'
import {
  IconChevronRight, IconPhone, IconMail, IconWorld, IconInfoCircle,
  IconUsers
} from '@tabler/icons-react'

// Advisor Tier → Channel → Content Type hierarchy
// This mirrors the actual data relationships in the platform
const TIER_CONFIG = [
  {
    tier: 1, label: 'Tier 1 — High Touch', color: 'orange', count: 150,
    icon: IconPhone,
    channel: 'Wholesaler Call + Phone',
    contentTypes: [
      { index: 5, name: 'Wholesaler Intelligence Brief', variants: 150, histOpen: [0.85, 0.93], histClick: [0.62, 0.74] },
      { index: 7, name: 'Analyst Call-In Script', variants: 1, histOpen: [0.68, 0.78], histClick: [0.46, 0.58] },
      { index: 10, name: 'Client Conversation Guide', variants: 1, histOpen: [0.28, 0.40], histClick: [0.22, 0.34] },
    ],
  },
  {
    tier: 2, label: 'Tier 2 — Digital+', color: 'blue', count: 1200,
    icon: IconMail,
    channel: 'Email + Portal',
    contentTypes: [
      { index: 1, name: 'Email — Historical Angle', variants: 1, histOpen: [0.56, 0.68], histClick: [0.22, 0.34] },
      { index: 2, name: 'Email — Allocation Angle', variants: 1, histOpen: [0.52, 0.64], histClick: [0.25, 0.37] },
      { index: 0, name: 'Capital Ideas Article', variants: 1, histOpen: [0.40, 0.52], histClick: [0.16, 0.28] },
      { index: 4, name: 'Marketing Lab Co-Brandable PDF', variants: 54, histOpen: null, histClick: [0.29, 0.41] },
    ],
  },
  {
    tier: 3, label: 'Tier 3 — Portal', color: 'teal', count: 6550,
    icon: IconWorld,
    channel: 'Portal + Push',
    contentTypes: [
      { index: 3, name: 'Portal Deep-Dive Package', variants: 1, histOpen: [0.36, 0.48], histClick: [0.12, 0.24] },
      { index: 6, name: 'Portal Push Notification', variants: 1, histOpen: [0.32, 0.44], histClick: [0.08, 0.20] },
      { index: 0, name: 'Capital Ideas Article', variants: 1, histOpen: [0.40, 0.52], histClick: [0.16, 0.28] },
    ],
  },
  {
    tier: 0, label: 'Cross-Tier — Social & Audio', color: 'grape', count: null,
    icon: IconUsers,
    channel: 'Social + Audio',
    contentTypes: [
      { index: 8, name: 'LinkedIn Social Snippet', variants: 1, histOpen: [0.03, 0.09], histClick: [0.01, 0.04] },
      { index: 9, name: 'Podcast Episode Script', variants: 1, histOpen: [0.07, 0.15], histClick: [0.03, 0.08] },
      { index: 11, name: 'Market Context Video', variants: 1, histOpen: [0.28, 0.36], histClick: [0.14, 0.22] },
    ],
  },
]

function RangeBar({ range, color }) {
  if (!range) return <Text size="xs" c="dimmed">—</Text>
  const low = Math.round(range[0] * 100)
  const high = Math.round(range[1] * 100)
  const mid = (low + high) / 2
  return (
    <Group gap={4} wrap="nowrap">
      <Text size="xs" fw={500} c={mid > 40 ? 'teal' : 'dimmed'}>{low}–{high}%</Text>
      <Progress.Root size="xs" w={40}>
        <Progress.Section value={high} color={color || 'teal'}>
          <Progress.Section value={high - low} color={color ? `${color}.3` : 'teal.3'} />
        </Progress.Section>
      </Progress.Root>
    </Group>
  )
}

export default function ContentChannelConfigPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const contentMetadata = step.panelData?.contentMetadata || []

  // Initialize from workflowState or default to all selected
  const selectedContent = workflowState.selectedContentTypes ?? contentMetadata.map((_, i) => i)
  const setSelected = (indices) => setWorkflowState(s => ({ ...s, selectedContentTypes: indices }))

  // Deduplicate indices (some content types appear in multiple tiers)
  const allIndices = [...new Set(TIER_CONFIG.flatMap(t => t.contentTypes.map(ct => ct.index)))]
  const selectedVariantCount = selectedContent.reduce((sum, i) => sum + (contentMetadata[i]?.variants || 1), 0)
  const activeTierCount = TIER_CONFIG.filter(t =>
    t.contentTypes.some(ct => selectedContent.includes(ct.index))
  ).length

  const handleToggle = (idx) => {
    if (selectedContent.includes(idx)) setSelected(selectedContent.filter(i => i !== idx))
    else setSelected([...selectedContent, idx])
  }

  const handleToggleTier = (tier) => {
    const tierIndices = tier.contentTypes.map(ct => ct.index)
    const allSelected = tierIndices.every(i => selectedContent.includes(i))
    if (allSelected) {
      setSelected(selectedContent.filter(i => !tierIndices.includes(i)))
    } else {
      setSelected([...new Set([...selectedContent, ...tierIndices])])
    }
  }

  const handleContinue = () => {
    setWorkflowState(s => ({ ...s, selectedContentTypes: selectedContent }))
    onContinue()
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="xs">
          <Text size="lg" fw={700}>Content & Channel Configuration</Text>
          <Group gap="xs">
            <Badge size="sm" variant="light" color="orange">{selectedContent.length} types</Badge>
            <Badge size="sm" variant="light" color="blue">{activeTierCount} tiers active</Badge>
            <Badge size="sm" variant="light" color="green">{selectedVariantCount} variants</Badge>
          </Group>
        </Group>
        <Text size="sm" c="dimmed">
          Configuration flows from advisor tier → channel → content type. Historical open and click rates are shown as estimated ranges.
        </Text>
      </Paper>

      {/* Tier-based accordion */}
      <Accordion variant="separated" radius="md" defaultValue={['1', '2', '3', '0']} multiple>
        {TIER_CONFIG.map(tier => {
          const Icon = tier.icon
          const tierIndices = tier.contentTypes.map(ct => ct.index)
          const tierSelectedCount = tierIndices.filter(i => selectedContent.includes(i)).length
          const allTierSelected = tierSelectedCount === tierIndices.length

          return (
            <Accordion.Item key={tier.tier} value={String(tier.tier)}>
              <Accordion.Control>
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={28} radius="xl" variant="light" color={tier.color}>
                    <Icon size={14} stroke={1.5} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text size="sm" fw={700}>{tier.label}</Text>
                      {tier.count && <Badge size="xs" variant="light" color={tier.color}>{tier.count.toLocaleString()} advisors</Badge>}
                    </Group>
                    <Text size="xs" c="dimmed">Channel: {tier.channel}</Text>
                  </div>
                  <Badge size="xs" variant={allTierSelected ? 'filled' : 'light'} color={tier.color}>
                    {tierSelectedCount}/{tierIndices.length}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  <Group justify="flex-end">
                    <Checkbox
                      label="Select all in tier"
                      size="xs"
                      checked={allTierSelected}
                      indeterminate={tierSelectedCount > 0 && !allTierSelected}
                      onChange={() => handleToggleTier(tier)}
                    />
                  </Group>
                  {tier.contentTypes.map(ct => {
                    const isSelected = selectedContent.includes(ct.index)
                    return (
                      <Paper
                        key={ct.index}
                        withBorder
                        p="sm"
                        radius="sm"
                        style={{
                          opacity: isSelected ? 1 : 0.4,
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          borderLeft: isSelected ? `3px solid var(--mantine-color-${tier.color}-5)` : '3px solid transparent',
                        }}
                        onClick={() => handleToggle(ct.index)}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Group gap="sm" wrap="nowrap">
                            <Checkbox checked={isSelected} onChange={() => handleToggle(ct.index)} size="xs" />
                            <div>
                              <Text size="sm" fw={500}>{ct.name}</Text>
                              <Text size="xs" c="dimmed">{ct.variants} variant{ct.variants > 1 ? 's' : ''}</Text>
                            </div>
                          </Group>
                          <Group gap="lg" wrap="nowrap">
                            <Stack gap={0} align="center">
                              <Text size="xs" c="dimmed">Open rate</Text>
                              <RangeBar range={ct.histOpen} color={tier.color} />
                            </Stack>
                            <Stack gap={0} align="center">
                              <Text size="xs" c="dimmed">Click rate</Text>
                              <RangeBar range={ct.histClick} color={tier.color} />
                            </Stack>
                          </Group>
                        </Group>
                      </Paper>
                    )
                  })}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion>

      {/* Summary */}
      <Alert variant="light" color="orange" icon={<IconInfoCircle size={16} />}>
        <Text size="sm">
          <strong>{selectedContent.length}</strong> content types across{' '}
          <strong>{activeTierCount}</strong> advisor tiers.{' '}
          The Content Architect will generate <strong>{selectedVariantCount}</strong> creative variants.
        </Text>
      </Alert>

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
        onClick={handleContinue}
        disabled={selectedContent.length === 0}
      >
        Generate Creative Variants
      </Button>
    </Stack>
  )
}
