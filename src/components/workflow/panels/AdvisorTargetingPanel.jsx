import { useState, useEffect } from 'react'
import {
  Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, Button,
  Alert, NumberInput, Select, Switch, Slider, Modal, ScrollArea, Loader, Progress
} from '@mantine/core'
import {
  IconUsers, IconPhone, IconMail, IconBell, IconShieldCheck, IconChevronRight,
  IconTargetArrow, IconSpeakerphone, IconMessageCircle, IconPencil, IconLock, IconEye, IconCheck
} from '@tabler/icons-react'
import { ArticlePreview, EmailFullPreview, WholesalerPreview, PortalPreview } from './ContentGenerationPanel'
import { useUseCase } from '../../../contexts/UseCaseContext'

// Map tier content type names to preview component IDs
// Map keywords in content type names to preview component IDs
const CONTENT_PREVIEW_RULES = [
  { match: 'wholesaler', preview: 'wholesaler' },
  { match: 'intelligence brief', preview: 'wholesaler' },
  { match: 'article', preview: 'article' },
  { match: 'email', preview: 'email' },
  { match: 'portal', preview: 'portal' },
  { match: 'pdf', preview: 'portal' },
  { match: 'co-brandable', preview: 'portal' },
]

function getPreviewId(contentType) {
  if (!contentType) return null
  const lower = contentType.toLowerCase()
  const rule = CONTENT_PREVIEW_RULES.find(r => lower.includes(r.match))
  return rule?.preview || null
}

const TIER_ICONS = { orange: IconPhone, blue: IconMail, teal: IconBell }

const CHANNEL_OPTIONS = [
  { value: 'Wholesaler call', label: 'Wholesaler call' },
  { value: 'Email + Portal', label: 'Email + Portal' },
  { value: 'Portal notification', label: 'Portal notification' },
  { value: 'Email only', label: 'Email only' },
  { value: 'Push notification', label: 'Push notification' },
]

const CONTENT_TYPE_OPTIONS = [
  { value: 'Intelligence Brief', label: 'Intelligence Brief' },
  { value: 'Article + Email', label: 'Article + Email' },
  { value: 'Portal hub', label: 'Portal hub' },
  { value: 'Co-Brandable PDF', label: 'Co-Brandable PDF' },
  { value: 'Social + Podcast', label: 'Social + Podcast' },
]

function TierCard({ tier, editMode, onUpdate, onSeeSample }) {
  const Icon = TIER_ICONS[tier.color] || IconUsers

  return (
    <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${tier.color}-5)` }}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Badge size="sm" color={tier.color} variant="filled">Tier {tier.tier}</Badge>
          <ThemeIcon size="sm" variant="light" color={tier.color} radius="sm">
            <Icon size={12} stroke={1.5} />
          </ThemeIcon>
        </Group>

        <Stack gap={0}>
          <Text style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: `var(--mantine-color-${tier.color}-7)` }}>
            {tier.count.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed">advisors</Text>
        </Stack>

        <Divider label="Who" labelPosition="left" />
        <Text size="xs" c="dimmed">{tier.criteria}</Text>

        <Divider label="Channel" labelPosition="left" />
        {editMode ? (
          <Select
            size="xs"
            value={tier.channel}
            data={CHANNEL_OPTIONS}
            onChange={(val) => onUpdate({ ...tier, channel: val })}
          />
        ) : (
          <Badge size="xs" variant="light" color={tier.color}>{tier.channel}</Badge>
        )}

        {tier.content && (
          <>
            <Divider label="Content Type" labelPosition="left" />
            {editMode ? (
              <Select
                size="xs"
                value={tier.contentType || tier.content?.type}
                data={CONTENT_TYPE_OPTIONS}
                onChange={(val) => onUpdate({ ...tier, contentType: val })}
              />
            ) : (
              <Stack gap={4}>
                <Group gap="xs">
                  <IconSpeakerphone size={10} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)', flexShrink: 0 }} />
                  <Text size="xs" fw={600}>{tier.content.type}</Text>
                </Group>
                <Group gap="xs">
                  <IconMessageCircle size={10} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)', flexShrink: 0 }} />
                  <Text size="xs" c="dimmed">{tier.content.tone}</Text>
                </Group>
                <Group gap="xs">
                  <Badge size="xs" variant="outline" color="gray">{tier.content.format}</Badge>
                  {tier.content.variants && <Badge size="xs" variant="light" color={tier.color}>{tier.content.variants} variants</Badge>}
                </Group>
                {onSeeSample && (
                  <Button
                    size="xs" variant="subtle" color={tier.color}
                    leftSection={<IconEye size={12} stroke={1.5} />}
                    onClick={(e) => { e.stopPropagation(); onSeeSample(tier) }}
                    style={{ alignSelf: 'flex-start', marginTop: 4 }}
                  >
                    See Sample
                  </Button>
                )}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Paper>
  )
}

const SCORING_LINES = [
  'Loading 47,000 advisor digital twins…',
  'Running XGBoost propensity scorer (47 features)…',
  'Applying Bayesian need-state matching…',
  'Segmenting into tiers by engagement propensity…',
  'Advisor groups ready — 7,900 qualified…',
]

export default function AdvisorTargetingPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const pd = step.panelData
  const [editMode, setEditMode] = useState(false)
  const [phase, setPhase] = useState('scoring')
  const [lineIndex, setLineIndex] = useState(0)
  const [sampleTier, setSampleTier] = useState(null)
  const { activeUseCase } = useUseCase()

  useEffect(() => {
    if (phase !== 'scoring') return
    const interval = setInterval(() => {
      setLineIndex(l => {
        if (l >= SCORING_LINES.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('complete'), 400)
          return l
        }
        return l + 1
      })
    }, 400)
    return () => clearInterval(interval)
  }, [phase])

  if (phase === 'scoring') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="xl">
          <Loader size="lg" color="teal" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Scoring advisor twins…</Text>
            {SCORING_LINES.slice(0, lineIndex + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < lineIndex
                  ? <ThemeIcon size="xs" color="teal" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="teal" />}
                <Text size="xs" c={i < lineIndex ? 'teal' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(lineIndex / (SCORING_LINES.length - 1)) * 100} color="teal" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  // Get content generation step panelData for previews
  const contentGenStep = activeUseCase?.steps.find(s => s.panelType === 'content_generation')
  const contentPanelData = contentGenStep?.panelData

  const handleSeeSample = (tier) => setSampleTier(tier)

  const renderSamplePreview = () => {
    if (!sampleTier) return null
    const contentType = sampleTier.contentType || sampleTier.content?.type
    const previewId = getPreviewId(contentType)
    if (!previewId) return <Text size="sm" c="dimmed">No sample available for this content type.</Text>
    switch (previewId) {
      case 'wholesaler': return <WholesalerPreview overrideText={workflowState?.overrideText} />
      case 'article': return contentPanelData?.articlePreview ? <ArticlePreview data={contentPanelData.articlePreview} /> : <Text size="sm" c="dimmed">Article preview not available.</Text>
      case 'email': return contentPanelData?.emailPreview ? <EmailFullPreview data={contentPanelData.emailPreview} overrideText={workflowState?.overrideText} /> : null
      case 'portal': return <PortalPreview />
      default: return <Text size="sm" c="dimmed">Preview not available.</Text>
    }
  }

  const advisorConfig = workflowState?.advisorConfig || {
    tiers: pd.tiers.map(t => ({ tier: t.tier, count: t.count, channel: t.channel, contentType: t.content?.type })),
    holdoutCount: pd.holdout.count,
    totalAdvisors: pd.totalTargeted,
  }

  const handleTierUpdate = (updatedTier) => {
    const newTiers = advisorConfig.tiers.map(t => t.tier === updatedTier.tier ? updatedTier : t)
    setWorkflowState?.(s => ({
      ...s,
      advisorConfig: { ...advisorConfig, tiers: newTiers },
    }))
  }

  const handleHoldoutChange = (val) => {
    setWorkflowState?.(s => ({
      ...s,
      advisorConfig: { ...advisorConfig, holdoutCount: val || 400 },
    }))
  }

  const handleContinue = () => {
    // Ensure config is persisted
    setWorkflowState?.(s => ({
      ...s,
      advisorConfig: advisorConfig,
    }))
    onContinue()
  }

  const holdoutCount = advisorConfig.holdoutCount || pd.holdout.count

  return (
    <Stack gap="md">
      {/* Hero + edit toggle */}
      <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-teal-light)' }}>
        <Group justify="space-between">
          <Group gap="lg">
            <ThemeIcon size={48} radius="xl" variant="filled" color="teal">
              <IconTargetArrow size={24} stroke={1.5} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: 'var(--mantine-color-teal-7)' }}>
                {pd.totalTargeted.toLocaleString()}
              </Text>
              <Text size="sm" fw={500}>{pd.cohortDescription || 'advisors identified — elevated large-cap exposure'}</Text>
              <Group gap="xs">
                <Badge size="xs" color="teal" variant="light">XGBoost</Badge>
                <Badge size="xs" color="teal" variant="light">47 features</Badge>
                <Badge size="xs" color="teal" variant="light">47,000 twins scored</Badge>
              </Group>
            </Stack>
          </Group>
          <Button
            size="xs"
            variant={editMode ? 'filled' : 'light'}
            color="teal"
            leftSection={editMode ? <IconLock size={12} /> : <IconPencil size={12} />}
            onClick={() => setEditMode(e => !e)}
          >
            {editMode ? 'Lock configuration' : 'Edit configuration'}
          </Button>
        </Group>
      </Paper>

      {/* Tier cards — merge panelData with workflowState overrides */}
      <SimpleGrid cols={3} spacing="md">
        {pd.tiers.map((tier) => {
          const override = advisorConfig.tiers.find(t => t.tier === tier.tier)
          const merged = override ? { ...tier, channel: override.channel || tier.channel, contentType: override.contentType || tier.content?.type } : tier
          return <TierCard key={tier.tier} tier={merged} editMode={editMode} onUpdate={handleTierUpdate} onSeeSample={handleSeeSample} />
        })}
      </SimpleGrid>

      {/* Model insight */}
      <Paper withBorder p="md" radius="md">
        <SimpleGrid cols={2} spacing="xl">
          <Stack gap="sm">
            <Stack gap={0}>
              <Text size="xl" fw={800} c="teal" style={{ lineHeight: 1 }}>47</Text>
              <Text size="xs" c="dimmed">Propensity signals per advisor</Text>
            </Stack>
            <Group gap="xs" wrap="wrap">
              {['Portal activity', 'Email engagement', 'AUM profile', 'Archetype score', 'Contact frequency'].map(f => (
                <Badge key={f} size="xs" variant="light" color="teal">{f}</Badge>
              ))}
            </Group>
          </Stack>
          <Stack gap="sm">
            <Stack gap={0}>
              <Text size="xl" fw={800} c="violet" style={{ lineHeight: 1 }}>47,000</Text>
              <Text size="xs" c="dimmed">Advisor twins scored in this run</Text>
            </Stack>
            <Text size="xs" c="dimmed">Each twin learns from its advisor's unique history — no generic targeting</Text>
          </Stack>
        </SimpleGrid>
      </Paper>

      {/* Holdout */}
      <Alert
        icon={<IconShieldCheck size={16} stroke={1.5} />}
        color="violet"
        variant="light"
        title={
          <Group gap="xs">
            <Text size="sm" fw={700}>Holdout: {holdoutCount} advisors</Text>
            <Badge size="xs" color="violet" variant="filled">Causal design</Badge>
          </Group>
        }
      >
        {editMode ? (
          <Group gap="md" mt="xs">
            <NumberInput
              size="xs"
              label="Holdout size"
              value={holdoutCount}
              onChange={handleHoldoutChange}
              min={100}
              max={1000}
              step={50}
              w={140}
            />
            <Text size="xs" c="dimmed" style={{ flex: 1 }}>
              {pd.holdout.method} · {pd.holdout.power}
            </Text>
          </Group>
        ) : (
          <Text size="xs">
            {pd.holdout.method} · {pd.holdout.power} · Holdout assignment locked in TwinX before deployment — provides the causal baseline for attribution.
          </Text>
        )}
      </Alert>

      {/* Population distribution — editable holdout via slider */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Population distribution</Text>
            <Badge size="xs" variant="light" color="violet">
              Holdout: {holdoutCount} ({Math.round((holdoutCount / pd.totalTargeted) * 100)}%)
            </Badge>
          </Group>

          {/* Visual bar */}
          <Group gap={2} style={{ height: 24, borderRadius: 6, overflow: 'hidden' }}>
            {pd.tiers.map((tier) => {
              const pct = (tier.count / (pd.totalTargeted + holdoutCount)) * 100
              return (
                <div key={tier.tier} style={{ flex: pct, background: `var(--mantine-color-${tier.color}-5)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pct > 5 && <Text size="xs" c="white" fw={700}>{Math.round(pct)}%</Text>}
                </div>
              )
            })}
            <div style={{
              flex: (holdoutCount / (pd.totalTargeted + holdoutCount)) * 100,
              background: 'var(--mantine-color-violet-4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'flex 200ms ease',
            }}>
              <Text size="xs" c="white" fw={700}>{holdoutCount}</Text>
            </div>
          </Group>

          {/* Holdout slider */}
          <Stack gap={4}>
            <Text size="xs" fw={500}>Adjust holdout size</Text>
            <Slider
              value={holdoutCount}
              onChange={handleHoldoutChange}
              min={100}
              max={1500}
              step={50}
              color="violet"
              marks={[
                { value: 200, label: '200' },
                { value: 400, label: '400' },
                { value: 800, label: '800' },
                { value: 1200, label: '1.2K' },
              ]}
              label={(val) => `${val} advisors`}
              styles={{ markLabel: { fontSize: 10 } }}
            />
          </Stack>

          {/* Legend */}
          <Group gap="md" mt={4}>
            {pd.tiers.map((tier) => (
              <Group key={tier.tier} gap={4}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: `var(--mantine-color-${tier.color}-5)` }} />
                <Text size="xs" c="dimmed">T{tier.tier}: {tier.count.toLocaleString()}</Text>
              </Group>
            ))}
            <Group gap={4}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--mantine-color-violet-4)' }} />
              <Text size="xs" c="dimmed">Holdout: {holdoutCount}</Text>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* See Sample modal */}
      <Modal
        opened={!!sampleTier}
        onClose={() => setSampleTier(null)}
        title={
          <Group gap="xs">
            <Text fw={700}>Content Sample</Text>
            {sampleTier && <Badge size="sm" color={sampleTier.color} variant="light">Tier {sampleTier.tier}</Badge>}
            {sampleTier && <Text size="sm" c="dimmed">{sampleTier.contentType || sampleTier.content?.type}</Text>}
          </Group>
        }
        size="xl"
        radius="md"
      >
        <ScrollArea h={500}>
          {renderSamplePreview()}
        </ScrollArea>
      </Modal>

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        onClick={handleContinue}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
      >
        Configure Content & Channels
      </Button>
    </Stack>
  )
}
