import { useState, useEffect } from 'react'
import {
  Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, Button,
  Alert, NumberInput, Select, Slider, Modal, ScrollArea, Loader, Progress, Textarea, Card, Checkbox
} from '@mantine/core'
import {
  IconUsers, IconPhone, IconMail, IconBell, IconShieldCheck, IconChevronRight,
  IconTargetArrow, IconSpeakerphone, IconMessageCircle, IconPencil, IconLock, IconEye, IconCheck,
  IconSparkles, IconWand
} from '@tabler/icons-react'
import { ArticlePreview, EmailFullPreview, WholesalerPreview, PortalPreview } from './ContentGenerationPanel'
import { useUseCase } from '../../../contexts/UseCaseContext'

// Map tier content type names to preview component IDs
// Map keywords in content type names to preview component IDs
const CONTENT_PREVIEW_RULES = [
  { match: 'email', preview: 'email' },
  { match: 'reassurance', preview: 'email' },
  { match: 'protection', preview: 'email' },
  { match: 'article', preview: 'article' },
  { match: 'educational', preview: 'article' },
  { match: 'explainer', preview: 'article' },
  { match: 'portal', preview: 'portal' },
  { match: 'push', preview: 'portal' },
  { match: 'video', preview: 'portal' },
  { match: 'advisor', preview: 'portal' },
  { match: 'pdf', preview: 'portal' },
]

function getPreviewId(contentType) {
  if (!contentType) return null
  const lower = contentType.toLowerCase()
  const rule = CONTENT_PREVIEW_RULES.find(r => lower.includes(r.match))
  return rule?.preview || null
}

const TIER_ICONS = { orange: IconPhone, blue: IconMail, teal: IconBell }

const CHANNEL_OPTIONS = [
  { value: 'App push', label: 'App push notification' },
  { value: 'Email + Portal', label: 'Email + in-app' },
  { value: 'Portal only', label: 'Portal only' },
  { value: 'Email only', label: 'Email only' },
  { value: 'SMS', label: 'SMS' },
]

const CONTENT_TYPE_OPTIONS = [
  { value: 'Reassurance email', label: 'Reassurance email' },
  { value: 'Educational article', label: 'Educational article' },
  { value: 'Explainer video', label: 'Explainer video' },
  { value: 'Retirement projection', label: 'Retirement projection tool' },
  { value: 'Advisor consult offer', label: 'Advisor consultation offer' },
]

function TierCard({ tier, editMode, onUpdate, onSeeSample, isSelected, onToggle }) {
  const Icon = TIER_ICONS[tier.color] || IconUsers

  return (
    <Paper
      withBorder p="md" radius="md"
      style={{
        borderLeft: `3px solid var(--mantine-color-${tier.color}-5)`,
        opacity: isSelected === false ? 0.5 : 1,
        transition: 'opacity 150ms ease',
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <Checkbox
              size="xs"
              checked={isSelected !== false}
              onChange={() => onToggle?.(tier.id)}
              color={tier.color}
            />
            <Badge size="sm" color={tier.color} variant="filled">Tier {tier.tier}</Badge>
          </Group>
          <ThemeIcon size="sm" variant="light" color={tier.color} radius="sm">
            <Icon size={12} stroke={1.5} />
          </ThemeIcon>
        </Group>

        <Stack gap={0}>
          <Text style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: `var(--mantine-color-${tier.color}-7)` }}>
            {tier.count.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed">participants</Text>
        </Stack>

        <Divider label="Who" labelPosition="left" />
        <Text size="xs" c="dimmed">{tier.criteria || tier.description}</Text>

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
  'Loading participant twin cohort…',
  'Running behavioral propensity scorer…',
  'Applying twin need-state matching…',
  'Segmenting into tiers by risk profile and urgency…',
  'Participant segments ready…',
]

const AI_SEGMENTS = [
  { id: 'ai-seg-1', tier: 1, color: 'violet', label: 'High-Net-Worth Planning Actives (55+)', count: 8200, channel: 'Secure site card + email', description: 'Investors aged 55+ with >$250K AUM, 3+ planning-tool uses in 30 days, no advisor relationship in 12 months.', kpi: 'Advisory consultation starts, AUM under advice' },
]

export default function ParticipantSegmentationPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const pd = step.panelData
  const [editMode, setEditMode] = useState(false)
  const [phase, setPhase] = useState('scoring')
  const [lineIndex, setLineIndex] = useState(0)
  const [sampleTier, setSampleTier] = useState(null)
  const { activeUseCase } = useUseCase()
  const [convMode, setConvMode] = useState(false)
  const [convInput, setConvInput] = useState('Find self-directed investors with $250K+ investable assets, 3+ planning-tool visits, no advisor, and rising cash balance.')
  const [convSegments, setConvSegments] = useState(null)
  const [convLoading, setConvLoading] = useState(false)
  const [activeTiers, setActiveTiers] = useState(null)
  const [selectedTierIds, setSelectedTierIds] = useState(() => pd.tiers.map(t => t.id))

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
            <Text size="sm" fw={600}>Segmenting participant cohort…</Text>
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

  const handleGenerateSegments = () => {
    setConvLoading(true)
    setTimeout(() => {
      setConvLoading(false)
      setConvSegments(AI_SEGMENTS)
    }, 1800)
  }

  const handleApplySegments = () => {
    const base = activeTiers || pd.tiers
    const newTiers = [...base, ...AI_SEGMENTS.filter(s => !base.find(t => t.id === s.id))]
    setActiveTiers(newTiers)
    setSelectedTierIds(ids => [...ids, ...AI_SEGMENTS.map(s => s.id).filter(id => !ids.includes(id))])
    setConvSegments(null)
    setConvMode(false)
  }

  const tiersToRender = activeTiers || pd.tiers

  const segmentConfig = workflowState?.segmentConfig || {
    tiers: pd.tiers.map(t => ({ id: t.id, tier: t.tier, count: t.count, channel: t.channel, contentType: t.content?.type })),
    holdoutCount: pd.holdout.count,
    totalTargeted: pd.totalTargeted,
  }

  const handleTierUpdate = (updatedTier) => {
    const newTiers = segmentConfig.tiers.map(t => t.id === updatedTier.id ? updatedTier : t)
    setWorkflowState?.(s => ({
      ...s,
      segmentConfig: { ...segmentConfig, tiers: newTiers },
    }))
  }

  const handleHoldoutChange = (val) => {
    setWorkflowState?.(s => ({
      ...s,
      segmentConfig: { ...segmentConfig, holdoutCount: val || 400 },
    }))
  }

  const handleContinue = () => {
    // Ensure config is persisted
    setWorkflowState?.(s => ({
      ...s,
      segmentConfig: segmentConfig,
    }))
    onContinue()
  }

  const holdoutCount = segmentConfig.holdoutCount || pd.holdout.count

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
              <Text size="sm" fw={500}>{pd.cohortDescription || 'participants identified in this cohort'}</Text>
              <Group gap="xs">
                <Badge size="xs" color="teal" variant="light">Behavioral scoring</Badge>
                <Badge size="xs" color="teal" variant="light">{pd.totalTargeted?.toLocaleString()} twins scored</Badge>
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

      {/* Conversational Segment Builder */}
      <Card withBorder radius="md" p="md" style={{ cursor: 'pointer', borderStyle: convMode ? 'solid' : 'dashed' }} onClick={() => !convMode && setConvMode(true)}>
        <Group gap="sm">
          <ThemeIcon size={36} radius="md" variant="gradient" gradient={{ from: 'violet', to: 'grape', deg: 135 }}>
            <IconSparkles size={20} stroke={1.5} />
          </ThemeIcon>
          <Stack gap={2} style={{ flex: 1 }}>
            <Group gap="xs">
              <Text size="sm" fw={700}>Conversational Segment Builder</Text>
              <Badge size="xs" color="violet" variant="light">AI</Badge>
            </Group>
            <Text size="xs" c="dimmed">Describe your target audience in plain language — TwinX will generate behavioral segments automatically.</Text>
          </Stack>
          {convMode && (
            <Button size="xs" variant="subtle" color="gray" onClick={(e) => { e.stopPropagation(); setConvMode(false); setConvSegments(null) }}>
              Close
            </Button>
          )}
        </Group>

        {convMode && (
          <Stack gap="sm" mt="md" onClick={(e) => e.stopPropagation()}>
            <Textarea
              placeholder="e.g. 'Find me investors over 55 with >$250K in assets who haven't spoken to an advisor in the last 12 months but have been actively using our retirement calculator'"
              minRows={3}
              value={convInput}
              onChange={(e) => setConvInput(e.currentTarget.value)}
              radius="md"
            />
            <Group>
              <Button
                size="sm"
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 135 }}
                leftSection={<IconWand size={14} />}
                onClick={handleGenerateSegments}
                loading={convLoading}
                disabled={convLoading}
              >
                Generate segments
              </Button>
              {convLoading && (
                <Text size="xs" c="dimmed">Analyzing behavioral patterns…</Text>
              )}
            </Group>

            {convSegments && (
              <Stack gap="xs">
                <Text size="xs" fw={600} c="violet">Generated segment:</Text>
                {convSegments.map(seg => (
                  <Paper key={seg.id} withBorder p="sm" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${seg.color}-5)` }}>
                    <Group justify="space-between">
                      <Stack gap={2}>
                        <Text size="sm" fw={700}>{seg.label}</Text>
                        <Text size="xs" c="dimmed">{seg.description}</Text>
                      </Stack>
                      <Text size="lg" fw={800} c={seg.color}>{seg.count.toLocaleString()}</Text>
                    </Group>
                  </Paper>
                ))}
                <Button size="xs" variant="light" color="violet" onClick={handleApplySegments}>
                  Add to audience
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </Card>

      {/* Test Hypothesis */}
      <Paper withBorder radius="md" p="md" style={{ borderLeft: '3px solid var(--mantine-color-indigo-6)' }}>
        <Stack gap="sm">
          <Group gap="xs">
            <ThemeIcon size={22} radius="md" variant="light" color="indigo">
              <IconTargetArrow size={13} stroke={1.8} />
            </ThemeIcon>
            <Text fw={700} size="sm">Test Hypothesis — Advisory Readiness Gap</Text>
          </Group>
          <Stack gap={6}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Objective</Text>
            <Badge size="sm" variant="light" color="vanguardRed" style={{ alignSelf: 'flex-start' }}>
              Cross-sell to advisory
            </Badge>
            <Text size="xs" c="dimmed">Increase advisory journey conversion among planning-intent, unadvised investors.</Text>
          </Stack>
          <Stack gap={6}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Pre-selected Hypothesis</Text>
            <Paper p="sm" radius="sm" style={{ background: 'var(--mantine-color-indigo-light)', borderLeft: '2px solid var(--mantine-color-indigo-4)' }}>
              <Text size="xs" fs="italic" style={{ lineHeight: 1.6 }}>
                "When self-directed investors show repeated planning intent but do not start an advisory relationship, a behavior-matched sequence of education, portfolio review, and optional advice access will increase advisory appointment starts versus no action."
              </Text>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      {/* Audience tiles */}
      <SimpleGrid cols={3} spacing="md">
        {tiersToRender.map((tier) => {
          const isSelected = selectedTierIds.includes(tier.id)
          return (
            <Paper
              key={tier.id}
              withBorder p="md" radius="md"
              style={{
                borderLeft: `3px solid var(--mantine-color-${tier.color}-5)`,
                opacity: isSelected ? 1 : 0.5,
                transition: 'opacity 150ms ease',
              }}
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Checkbox
                    size="xs"
                    checked={isSelected}
                    onChange={() => setSelectedTierIds(ids => ids.includes(tier.id) ? ids.filter(i => i !== tier.id) : [...ids, tier.id])}
                    color={tier.color}
                  />
                  <ThemeIcon size="sm" variant="light" color={tier.color} radius="sm">
                    <IconUsers size={12} stroke={1.5} />
                  </ThemeIcon>
                </Group>

                <Stack gap={0}>
                  <Text style={{ fontSize: 34, fontWeight: 900, lineHeight: 1, color: `var(--mantine-color-${tier.color}-7)` }}>
                    {tier.count.toLocaleString()}
                  </Text>
                  <Text size="xs" c="dimmed">participants</Text>
                </Stack>

                <Text size="sm" fw={700} style={{ lineHeight: 1.3 }}>{tier.label}</Text>

                <Divider label="Behavioral signal" labelPosition="left" />
                <Text size="xs" c="dimmed">{tier.behavioralSignal || tier.description}</Text>

              </Stack>
            </Paper>
          )
        })}
      </SimpleGrid>

      {/* Model insight */}
      <Paper withBorder p="md" radius="md">
        <SimpleGrid cols={2} spacing="xl">
          <Stack gap="sm">
            <Stack gap={0}>
              <Text size="xl" fw={800} c="teal" style={{ lineHeight: 1 }}>{tiersToRender?.length || 7}</Text>
              <Text size="xs" c="dimmed">Audience groups identified</Text>
            </Stack>
            <Group gap="xs" wrap="wrap">
              {['Age cohort', 'Risk profile', 'Behavioral signals', 'Plan type', 'Anxiety score'].map(f => (
                <Badge key={f} size="xs" variant="light" color="teal">{f}</Badge>
              ))}
            </Group>
          </Stack>
          <Stack gap="sm">
            <Stack gap={0}>
              <Text size="xl" fw={800} c="violet" style={{ lineHeight: 1 }}>{pd.totalTargeted?.toLocaleString()}</Text>
              <Text size="xs" c="dimmed">Participant twins scored in this run</Text>
            </Stack>
            <Text size="xs" c="dimmed">Each twin reflects the participant's unique behavioral profile and plan context</Text>
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
            <Text size="sm" fw={700}>Holdout: {holdoutCount} participants</Text>
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
                <div key={tier.id} style={{ flex: pct, background: `var(--mantine-color-${tier.color}-5)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              label={(val) => `${val} participants`}
              styles={{ markLabel: { fontSize: 10 } }}
            />
          </Stack>

          {/* Legend */}
          <Group gap="md" mt={4}>
            {pd.tiers.map((tier, idx) => (
              <Group key={tier.id} gap={4}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: `var(--mantine-color-${tier.color}-5)` }} />
                <Text size="xs" c="dimmed">#{idx + 1}: {tier.count.toLocaleString()}</Text>
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
        Configure Offers & Channels
      </Button>
    </Stack>
  )
}
