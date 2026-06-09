import { useMemo } from 'react'
import {
  Paper, Stack, Group, Text, Badge, Checkbox, Button, ThemeIcon, Alert,
  Progress, SimpleGrid, Divider, Accordion
} from '@mantine/core'
import {
  IconChevronRight, IconPhone, IconMail, IconWorld, IconInfoCircle,
  IconUsers
} from '@tabler/icons-react'

// Participant Channel Config — reads tier config from panelData
const ICON_MAP = { phone: IconPhone, mail: IconMail, world: IconWorld, users: IconUsers }
function getTierConfig(step) {
  const pd = step?.panelData?.tierConfig
  if (!pd || !Array.isArray(pd)) return []
  return pd.map(t => ({
    ...t,
    icon: ICON_MAP[t.iconKey] || IconUsers,
  }))
}

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

export default function ParticipantChannelConfigPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const TIER_CONFIG = getTierConfig(step)
  const contentMetadata = step.panelData?.contentMetadata || []

  // Deduplicate all content type indices from tier config
  const allIndices = [...new Set(TIER_CONFIG.flatMap(t => (t.contentTypes || []).map(ct => ct.index)))]

  // Initialize from workflowState, or default to ALL indices pre-selected
  const selectedContent = workflowState.selectedContentTypes ?? (contentMetadata.length > 0 ? contentMetadata.map((_, i) => i) : allIndices)
  const setSelected = (indices) => setWorkflowState(s => ({ ...s, selectedContentTypes: indices }))

  // Build a variants lookup from tier config (fallback when contentMetadata is empty)
  const variantsLookup = {}
  TIER_CONFIG.forEach(t => (t.contentTypes || []).forEach(ct => { variantsLookup[ct.index] = ct.variants || 1 }))
  const selectedVariantCount = selectedContent.reduce((sum, i) => sum + (contentMetadata[i]?.variants || variantsLookup[i] || 1), 0)
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
          Configuration flows from participant segment → channel → content type. Historical engagement rates shown as estimated ranges.
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
