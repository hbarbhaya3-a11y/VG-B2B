import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Progress, Button, Alert, Checkbox, Divider, ThemeIcon, Loader, NumberInput, Select, Tabs, Table, Modal } from '@mantine/core'
import { BarChart, DonutChart } from '@mantine/charts'
import { IconChartBar, IconChevronRight, IconAlertTriangle, IconCheck, IconPlayerPlay, IconStars, IconPencil, IconLock, IconUsers, IconAdjustments, IconGift, IconSend, IconSparkles, IconFileText, IconVideo, IconMail, IconDeviceMobile, IconPhone, IconShield } from '@tabler/icons-react'
import { useUseCase } from '../../../contexts/UseCaseContext'

// Content types and their metadata
const CONTENT_TYPES = [
  { id: 'article',   label: 'Plain-language educational article', icon: IconFileText,    color: 'blue'   },
  { id: 'insight',   label: 'Portfolio health insight',           icon: IconChartBar,    color: 'teal'   },
  { id: 'calculator',label: 'Scenario calculator',                icon: IconSparkles,    color: 'violet' },
  { id: 'video',     label: '60-second explainer video',          icon: IconVideo,       color: 'grape'  },
  { id: 'email',     label: 'Advisor invitation email',           icon: IconMail,        color: 'orange' },
  { id: 'cta',       label: 'Secure-site CTA card',               icon: IconDeviceMobile,color: 'cyan'   },
  { id: 'script',    label: 'Call script / advisor brief',        icon: IconPhone,       color: 'green'  },
  { id: 'faq',       label: 'FAQ / disclosure module',            icon: IconShield,      color: 'gray'   },
]

// Map channel keywords → best content type IDs (ordered by variant slot)
const CHANNEL_CONTENT_MAP = {
  'secure-site card': ['cta', 'article'],
  'secure-site insight': ['insight', 'article'],
  'secure site': ['cta', 'faq'],
  'app push': ['video', 'cta'],
  'email + advisor': ['email', 'script'],
  'email + secure': ['article', 'faq'],
  'email': ['email', 'article'],
  'crm': ['script', 'faq'],
}

function getContentTypesForChannel(channel) {
  const lower = channel.toLowerCase()
  for (const [key, types] of Object.entries(CHANNEL_CONTENT_MAP)) {
    if (lower.includes(key)) return types
  }
  return ['article', 'cta']
}

function buildVariants(segments, allSegments) {
  const variants = []
  segments.forEach(seg => {
    const typeIds = getContentTypesForChannel(seg.channel)
    for (let v = 0; v < seg.variants; v++) {
      const typeId = typeIds[v % typeIds.length]
      const ct = CONTENT_TYPES.find(c => c.id === typeId) || CONTENT_TYPES[0]
      variants.push({
        id: `${seg.id}-v${v + 1}`,
        segment: seg.label,
        segColor: seg.color,
        channel: seg.channel,
        variantNum: v + 1,
        contentType: ct,
        headline: generateHeadline(ct.id, seg.label, v),
        body: generateBody(ct.id, seg.label),
      })
    }
  })
  return variants
}

function generateHeadline(typeId, segLabel, v) {
  const headlines = {
    article:    ['Is your portfolio ready for what\'s next?', 'What a Vanguard advisor actually does for you', 'How to know when advice makes sense'],
    insight:    ['Your portfolio: a 3-minute health check', 'Where overlap may be costing you', 'Diversification gaps in your current mix'],
    calculator: ['Retirement income: run your numbers', 'What does advice cost vs. cost you?', 'Cash scenario: what happens if you invest now?'],
    video:      ['60 seconds: the planning-to-advice path', '3 signs it may be time to get advice', 'How Vanguard advisory works'],
    email:      ['Your complimentary portfolio review — book now', 'A quick conversation could change your plan', 'An advisor wants to connect with you'],
    cta:        ['See your personalized advisory fit', 'Ready to take the next step?', 'Explore what advice could look like for you'],
    script:     ['Discovery call guide: planning-intent investors', 'Advisor brief: complexity household outreach', 'Consultation prep: income planning discussion'],
    faq:        ['Common questions about Vanguard advisory', 'How advice and education differ — and why it matters', 'Your rights, our obligations: a plain-language guide'],
  }
  const arr = headlines[typeId] || headlines.article
  return arr[v % arr.length]
}

function generateBody(typeId, segLabel) {
  const bodies = {
    article: `Educational content tailored for ${segLabel}. Covers portfolio review fundamentals, the value of goal-based planning, and how to evaluate whether advisory services are a fit — without solicitation language.`,
    insight: `A visual portfolio health summary highlighting concentration risk, overlap, and diversification gaps. Designed to prompt reflection and an optional next step — not a recommendation.`,
    calculator: `An interactive scenario tool that lets the investor model different allocation paths, income drawdown scenarios, or cash deployment timelines. Output is illustrative, not advice.`,
    video: `A 60-second animated explainer covering the planning-to-advice journey. Calm, benefit-led tone. Ends with a soft CTA to explore further — no product mention.`,
    email: `Personalized advisor invitation email. Opens with the investor's stated planning goal, acknowledges their journey so far, and offers a no-obligation conversation. Disclosure-compliant draft.`,
    cta: `Secure-site card surfaced at the right moment in the investor's session. Short headline, 1–2 lines of context, a single action button. Variants test headline framing and CTA copy.`,
    script: `Advisor brief summarising the investor's behavioral signals, planning intent, and suggested conversation opener. Includes education-vs-advice boundary guidance for the advisor.`,
    faq: `A plain-language FAQ covering how Vanguard advisory works, fee structures, suitability, and what happens after a consultation. Disclosure module auto-attaches based on content class.`,
  }
  return bodies[typeId] || bodies.article
}

function ContentVariantTile({ variant, onClick }) {
  const Icon = variant.contentType.icon
  return (
    <Paper
      withBorder p="md" radius="md"
      style={{
        borderTop: `3px solid var(--mantine-color-${variant.contentType.color}-5)`,
        cursor: 'pointer',
        transition: 'box-shadow 150ms ease',
      }}
      onClick={() => onClick(variant)}
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <ThemeIcon size={32} radius="md" variant="light" color={variant.contentType.color}>
            <Icon size={16} stroke={1.5} />
          </ThemeIcon>
          <Badge size="xs" variant="dot" color={variant.segColor}>V{variant.variantNum}</Badge>
        </Group>
        <Stack gap={2}>
          <Text size="xs" fw={700} style={{ lineHeight: 1.3 }}>{variant.headline}</Text>
          <Badge size="xs" variant="light" color={variant.contentType.color} style={{ alignSelf: 'flex-start' }}>{variant.contentType.label}</Badge>
        </Stack>
        <Divider />
        <Text size="xs" c="dimmed" truncate>{variant.segment}</Text>
        <Badge size="xs" variant="outline" color="gray">{variant.channel}</Badge>
      </Stack>
    </Paper>
  )
}

function ContentVariantGrid({ variants }) {
  const [active, setActive] = useState(null)
  return (
    <>
      <Stack gap="sm">
        <Group gap="xs">
          <ThemeIcon size={20} radius="md" variant="light" color="violet">
            <IconSparkles size={12} stroke={1.5} />
          </ThemeIcon>
          <Text size="sm" fw={700}>Generated Content Variants</Text>
          <Badge size="xs" color="violet" variant="light">{variants.length} variants · click to preview</Badge>
        </Group>
        <SimpleGrid cols={4} spacing="sm">
          {variants.map(v => <ContentVariantTile key={v.id} variant={v} onClick={setActive} />)}
        </SimpleGrid>
      </Stack>

      <Modal
        opened={!!active}
        onClose={() => setActive(null)}
        title={
          active && (
            <Group gap="xs">
              <ThemeIcon size={24} radius="md" variant="light" color={active.contentType.color}>
                <active.contentType.icon size={13} stroke={1.5} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text size="sm" fw={700}>{active.contentType.label}</Text>
                <Text size="xs" c="dimmed">Variant {active.variantNum} · {active.segment}</Text>
              </Stack>
            </Group>
          )
        }
        size="lg"
        radius="md"
      >
        {active && (
          <Stack gap="md">
            <Group gap="xs" wrap="wrap">
              <Badge size="sm" variant="light" color={active.segColor}>Audience: {active.segment}</Badge>
              <Badge size="sm" variant="light" color="gray">Channel: {active.channel}</Badge>
            </Group>
            <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${active.contentType.color}-5)` }}>
              <Stack gap="sm">
                <Text size="md" fw={700}>{active.headline}</Text>
                <Divider />
                <Text size="sm" style={{ lineHeight: 1.7 }}>{active.body}</Text>
              </Stack>
            </Paper>
            <Group gap="xs" justify="flex-end">
              <Button size="xs" variant="light" color="gray" onClick={() => setActive(null)}>Close</Button>
              <Button size="xs" variant="light" color={active.contentType.color}>Approve variant</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  )
}

const RUNNING_LINES = [
  'Loading episode priors from TwinX…',
  'Fitting Bayesian hierarchical response curves…',
  'Running 1,000 TwinX Simulation iterations…',
  'Ranking scenarios by cost-efficiency…',
  'Calibrating confidence intervals…',
]

// Sample advisor drill-down (3 per tier, 9 total)
const ADVISOR_SAMPLE = {
  A: [
    { name: 'Jennifer Walsh', firm: 'Merrill Lynch', tier: 1, channel: 'Wholesaler call', content: 'Intelligence Brief + call', eng: '87%' },
    { name: 'Robert Chen', firm: 'Edward Jones', tier: 1, channel: 'Wholesaler call', content: 'Intelligence Brief + call', eng: '78%' },
    { name: 'Sarah Martinez', firm: 'UBS', tier: 1, channel: 'Wholesaler call', content: 'Intelligence Brief + call', eng: '91%' },
    { name: 'David Kim', firm: 'Raymond James', tier: 2, channel: 'Email (Variant B)', content: 'Capital Ideas article', eng: '35%' },
    { name: 'Lisa Thompson', firm: 'LPL Financial', tier: 2, channel: 'Email (Variant A)', content: 'Capital Ideas article', eng: '28%' },
    { name: 'Michael O\'Brien', firm: 'Ameriprise', tier: 2, channel: 'Email (Variant B)', content: 'Capital Ideas article', eng: '38%' },
    { name: 'Amanda Foster', firm: 'Independent RIA', tier: 3, channel: 'Portal notification', content: 'Hub notification', eng: '12%' },
    { name: 'James Wilson', firm: 'TD Ameritrade', tier: 3, channel: 'Portal notification', content: 'Hub notification', eng: '9%' },
    { name: 'Rachel Green', firm: 'Fidelity Wealth', tier: 3, channel: 'Portal notification', content: 'Hub notification', eng: '11%' },
  ],
  B: [
    { name: 'Jennifer Walsh', firm: 'Merrill Lynch', tier: 1, channel: 'Wholesaler call (×2)', content: 'Brief + follow-up call', eng: '94%' },
    { name: 'Robert Chen', firm: 'Edward Jones', tier: 1, channel: 'Wholesaler call (×2)', content: 'Brief + follow-up call', eng: '88%' },
    { name: 'Sarah Martinez', firm: 'UBS', tier: 1, channel: 'Wholesaler call (×2)', content: 'Brief + follow-up call', eng: '96%' },
    { name: 'David Kim', firm: 'Raymond James', tier: 2, channel: 'Email + call', content: 'Article + wholesaler note', eng: '44%' },
    { name: 'Lisa Thompson', firm: 'LPL Financial', tier: 2, channel: 'Email + call', content: 'Article + wholesaler note', eng: '36%' },
    { name: 'Michael O\'Brien', firm: 'Ameriprise', tier: 2, channel: 'Email + call', content: 'Article + wholesaler note', eng: '47%' },
    { name: 'Amanda Foster', firm: 'Independent RIA', tier: 3, channel: 'Portal + email', content: 'Hub + digest', eng: '14%' },
    { name: 'James Wilson', firm: 'TD Ameritrade', tier: 3, channel: 'Portal + email', content: 'Hub + digest', eng: '11%' },
    { name: 'Rachel Green', firm: 'Fidelity Wealth', tier: 3, channel: 'Portal + email', content: 'Hub + digest', eng: '13%' },
  ],
  C: [
    { name: 'Jennifer Walsh', firm: 'Merrill Lynch', tier: 1, channel: 'Email only', content: 'Intelligence Brief (email)', eng: '42%' },
    { name: 'Robert Chen', firm: 'Edward Jones', tier: 1, channel: 'Email only', content: 'Intelligence Brief (email)', eng: '38%' },
    { name: 'Sarah Martinez', firm: 'UBS', tier: 1, channel: 'Email only', content: 'Intelligence Brief (email)', eng: '51%' },
    { name: 'David Kim', firm: 'Raymond James', tier: 2, channel: 'Email', content: 'Capital Ideas article', eng: '28%' },
    { name: 'Lisa Thompson', firm: 'LPL Financial', tier: 2, channel: 'Email', content: 'Capital Ideas article', eng: '22%' },
    { name: 'Michael O\'Brien', firm: 'Ameriprise', tier: 2, channel: 'Email', content: 'Capital Ideas article', eng: '30%' },
    { name: 'Amanda Foster', firm: 'Independent RIA', tier: 3, channel: 'Portal notification', content: 'Hub notification', eng: '9%' },
    { name: 'James Wilson', firm: 'TD Ameritrade', tier: 3, channel: 'Portal notification', content: 'Hub notification', eng: '7%' },
    { name: 'Rachel Green', firm: 'Fidelity Wealth', tier: 3, channel: 'Portal notification', content: 'Hub notification', eng: '8%' },
  ],
}

const TIER_COLORS = { 1: 'orange', 2: 'blue', 3: 'teal' }

function ScenarioCard({ scenario, selected, onSelect }) {
  return (
    <Paper
      withBorder p="md" radius="md"
      style={{
        cursor: 'pointer',
        borderColor: selected ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-default-border)',
        borderWidth: selected ? 2 : 1,
        boxShadow: selected ? '0 0 0 2px var(--mantine-color-blue-2)' : undefined,
        transition: 'all 150ms ease',
      }}
      onClick={onSelect}
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <Badge size="sm" variant="filled" color={selected ? 'blue' : 'gray'}>Scenario {scenario.id}</Badge>
            {scenario.recommended && <Badge size="xs" color="teal" variant="light" leftSection={<IconStars size={10} />}>Recommended</Badge>}
          </Group>
          {selected && <ThemeIcon size="sm" color="blue" radius="xl" variant="filled"><IconCheck size={12} stroke={2} /></ThemeIcon>}
        </Group>

        <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>{scenario.tag}</Text>
        <Divider />

        <Stack gap={6}>
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">Engagement</Text>
            <Group gap="xs">
              <Text size="sm" fw={700} c="teal">{Math.round(scenario.engagement * 100)}%</Text>
              <Progress value={scenario.engagement * 100} color="teal" size="xs" w={48} />
            </Group>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Est. AUM</Text>
            <Text size="sm" fw={800} c="green">${scenario.aum}M</Text>
          </Group>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">Cost</Text>
            <Text size="sm" fw={600}>${scenario.cost}K</Text>
          </Group>
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">Confidence</Text>
            <Group gap="xs">
              <Text size="xs" fw={600}>{Math.round(scenario.confidence * 100)}% ±{Math.round(scenario.ci * 100)}%</Text>
              <Progress value={scenario.confidence * 100} color="blue" size="xs" w={36} />
            </Group>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  )
}

function OfferChannelSummary({ workflowState, activeUseCase }) {
  const channelStep = activeUseCase?.steps.find(s => s.panelType === 'participant_channel_config')
  const channelPd = channelStep?.panelData
  if (!channelPd) return null

  const allOffers = channelPd.offers || []
  const allSegments = channelPd.segments || []

  const selectedOfferIds = workflowState?.selectedOffers
  const selectedSegIds = workflowState?.selectedSegments

  const activeOffers = selectedOfferIds ? allOffers.filter(o => selectedOfferIds.includes(o.id)) : allOffers
  const activeSegs = selectedSegIds ? allSegments.filter(s => selectedSegIds.includes(s.id)) : allSegments
  const totalVariants = activeSegs.reduce((sum, s) => sum + s.variants, 0)
  const totalReach = activeSegs.reduce((sum, s) => sum + s.count, 0)

  return (
    <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
      <Stack gap="sm">
        <Group gap="xs" mb={2}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Step 4 Configuration Summary</Text>
          <Badge size="xs" color="violet" variant="light">{activeOffers.length} offers · {activeSegs.length} segments · {totalVariants} variants · {totalReach.toLocaleString()} reach</Badge>
        </Group>

        {/* Offers */}
        <Stack gap={4}>
          <Group gap={6}>
            <IconGift size={12} stroke={1.5} style={{ color: 'var(--mantine-color-orange-6)' }} />
            <Text size="xs" fw={700} c="orange">Selected Offers</Text>
          </Group>
          <Group gap="xs" wrap="wrap">
            {activeOffers.map(o => (
              <Badge key={o.id} size="xs" variant="light" color={o.color}>{o.label}</Badge>
            ))}
          </Group>
        </Stack>

        <Divider />

        {/* Segments + channels */}
        <Stack gap={4}>
          <Group gap={6}>
            <IconSend size={12} stroke={1.5} style={{ color: 'var(--mantine-color-blue-6)' }} />
            <Text size="xs" fw={700} c="blue">Segments &amp; Channels</Text>
          </Group>
          <Stack gap={4}>
            {activeSegs.map(s => (
              <Group key={s.id} justify="space-between" wrap="nowrap">
                <Group gap={6} wrap="nowrap">
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: `var(--mantine-color-${s.color}-5)`, flexShrink: 0 }} />
                  <Text size="xs" fw={500}>{s.label}</Text>
                </Group>
                <Group gap="xs" wrap="nowrap">
                  <Badge size="xs" variant="light" color={s.color}>{s.channel}</Badge>
                  <Text size="xs" c="dimmed">{s.variants}v</Text>
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default function SimulationPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const { activeUseCase } = useUseCase()
  const pd = step.panelData
  const [phase, setPhase] = useState('config')
  const [runLine, setRunLine] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [params, setParams] = useState({
    confidenceThreshold: 80,
    minEngagement: 15,
    timeHorizon: '30 days',
    tier1Multiplier: 3,
  })
  const selectedId = workflowState.selectedScenarioId

  useEffect(() => {
    if (phase !== 'running') return
    const interval = setInterval(() => {
      setRunLine(l => {
        if (l >= RUNNING_LINES.length - 1) { clearInterval(interval); setTimeout(() => setPhase('results'), 400); return l }
        return l + 1
      })
    }, 350)
    return () => clearInterval(interval)
  }, [phase])

  const selectedScenario = pd.scenarios.find(s => s.id === selectedId) ?? pd.scenarios[0]

  // Comparison chart data
  const comparisonData = pd.scenarios.map(s => ({
    scenario: `Scenario ${s.id}${s.recommended ? ' ★' : ''}`,
    'Engagement (%)': Math.round(s.engagement * 100),
    'AUM ($M ÷10)': Math.round(s.aum / 10),
    'Cost ($K ÷10)': Math.round(s.cost / 10),
  }))

  // Channel breakdown for selected scenario
  const channelData = [
    { channel: 'Tier 1 — Wholesaler', rate: selectedId === 'B' ? 92 : selectedId === 'C' ? 44 : 62 },
    { channel: 'Tier 2 — Email', rate: selectedId === 'B' ? 41 : selectedId === 'C' ? 26 : 28 },
    { channel: 'Tier 3 — Portal', rate: selectedId === 'B' ? 12 : selectedId === 'C' ? 8 : 8 },
  ]

  // Derive values from steps 1–4
  const channelStep = activeUseCase?.steps.find(s => s.panelType === 'participant_channel_config')
  const campaignObjectiveStep = activeUseCase?.steps.find(s => s.panelType === 'campaign_objective')
  const segmentationStep = activeUseCase?.steps.find(s => s.panelType === 'participant_segmentation')

  const allSegments = channelStep?.panelData?.segments || []
  const selectedSegIds = workflowState?.selectedSegments
  const activeSegments = selectedSegIds ? allSegments.filter(s => selectedSegIds.includes(s.id)) : allSegments

  const allOffers = channelStep?.panelData?.offers || []
  const selectedOfferIds = workflowState?.selectedOffers
  const activeOffersCount = selectedOfferIds ? selectedOfferIds.length : allOffers.length

  const totalReachLocked = activeSegments.reduce((sum, s) => sum + s.count, 0) || 42000
  const holdoutLocked = workflowState?.segmentConfig?.holdoutCount ?? segmentationStep?.panelData?.holdout?.count ?? 4200

  const contentVariants = buildVariants(activeSegments, allSegments)

  if (phase === 'config') {
    return (
      <Stack gap="md">
        {/* Header */}
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-violet-5)' }}>
          <Group justify="space-between">
            <Stack gap={4}>
              <Group gap="xs">
                <Badge size="sm" color="violet" variant="filled">SIMULATE</Badge>
                <Badge size="sm" color="violet" variant="light">TwinX Simulation</Badge>
              </Group>
              <Text size="lg" fw={700}>Configure simulation</Text>
              <Text size="xs" c="dimmed">Parameters pre-loaded from signal and targeting data</Text>
            </Stack>
            <Button
              size="xs"
              variant={editMode ? 'filled' : 'light'}
              color="violet"
              leftSection={editMode ? <IconLock size={12} /> : <IconPencil size={12} />}
              onClick={() => setEditMode(e => !e)}
            >
              {editMode ? 'Lock parameters' : 'Edit parameters'}
            </Button>
          </Group>
        </Paper>

        {/* Step 4 summary */}
        <OfferChannelSummary workflowState={workflowState} activeUseCase={activeUseCase} />

        {/* Unified config card */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <SimpleGrid cols={2} spacing="md">
              {/* Locked — derived from steps 1–4 */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconLock size={13} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Locked — from your config</Text>
                </Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Campaign objective</Text><Badge variant="light" color="vanguardRed" size="xs">{campaignObjectiveStep?.panelData?.objectives?.find(o => o.recommended)?.label || 'Cross-sell to advisory'}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Budget</Text><Badge variant="light" color="green" size="xs">${(campaignObjectiveStep?.panelData?.defaultBudget || 150000).toLocaleString()}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Population (reach)</Text><Badge variant="light" color="orange" size="xs">{totalReachLocked.toLocaleString()}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Holdout</Text><Badge variant="light" color="gray" size="xs">{holdoutLocked}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Active segments</Text><Badge variant="light" color="blue" size="xs">{activeSegments.length}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Offers</Text><Badge variant="light" color="grape" size="xs">{activeOffersCount}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Content variants</Text><Badge variant="light" color="violet" size="xs">{contentVariants.length}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Episode baseline</Text><Badge variant="light" color="blue" size="xs">18 prior episodes</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Iterations</Text><Badge variant="light" color="violet" size="xs">1,000</Badge></Group>
              </Stack>

              {/* Tunable */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconAdjustments size={13} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Tunable parameters</Text>
                </Group>
                {editMode ? (
                  <>
                    <NumberInput label="Confidence threshold (%)" value={params.confidenceThreshold} onChange={v => setParams(p => ({ ...p, confidenceThreshold: v }))} min={50} max={99} size="xs" />
                    <NumberInput label="Min engagement (%)" value={params.minEngagement} onChange={v => setParams(p => ({ ...p, minEngagement: v }))} min={5} max={40} size="xs" />
                    <Select label="Time horizon" value={params.timeHorizon} onChange={v => setParams(p => ({ ...p, timeHorizon: v }))} data={['14 days', '30 days', '60 days', '90 days']} size="xs" allowDeselect={false} />
                    <NumberInput label="Response curve sensitivity" value={params.tier1Multiplier} onChange={v => setParams(p => ({ ...p, tier1Multiplier: v }))} min={1} max={5} step={0.5} size="xs" />
                  </>
                ) : (
                  <>
                    <Group justify="space-between"><Text size="xs" c="dimmed">Confidence threshold</Text><Badge variant="outline" color="gray" size="xs">{params.confidenceThreshold}%</Badge></Group>
                    <Group justify="space-between"><Text size="xs" c="dimmed">Min engagement</Text><Badge variant="outline" color="gray" size="xs">{params.minEngagement}%</Badge></Group>
                    <Group justify="space-between"><Text size="xs" c="dimmed">Time horizon</Text><Badge variant="outline" color="gray" size="xs">{params.timeHorizon}</Badge></Group>
                    <Group justify="space-between"><Text size="xs" c="dimmed">Response curve sensitivity</Text><Badge variant="outline" color="gray" size="xs">{params.tier1Multiplier}×</Badge></Group>
                  </>
                )}
              </Stack>
            </SimpleGrid>
          </Stack>
        </Paper>

        <Button size="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 135 }} leftSection={<IconPlayerPlay size={16} stroke={1.5} />} styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
          onClick={() => { setPhase('running'); setRunLine(0) }}>
          Run TwinX Simulation
        </Button>
      </Stack>
    )
  }

  if (phase === 'running') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="xl">
          <Loader size="lg" color="violet" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>TwinX Simulation running…</Text>
            {RUNNING_LINES.slice(0, runLine + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < runLine
                  ? <ThemeIcon size="xs" color="teal" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="violet" />}
                <Text size="xs" c={i < runLine ? 'teal' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(runLine / (RUNNING_LINES.length - 1)) * 100} color="violet" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  // Results phase — allow step.panelData.advisorSample to override the static
  // sample so scenarios without wholesaler/advisor context don't show Merrill
  // Lynch rows. If scenario is explicitly non-advisor-routed, hide the sample.
  const pdSample = pd.advisorSample
  const showAdvisorSample = pd.showAdvisorSample !== false
  const advisorRows = (pdSample && pdSample[selectedId]) || (pdSample && pdSample.A) || ADVISOR_SAMPLE[selectedId] || ADVISOR_SAMPLE.A

  return (
    <Stack gap="md">
      <Paper withBorder p="sm" radius="md" style={{ background: 'var(--mantine-color-violet-light)' }}>
        <Group gap="xs">
          <ThemeIcon size="sm" color="violet" variant="filled" radius="sm"><IconChartBar size={12} stroke={1.5} /></ThemeIcon>
          <Text size="sm" fw={700}>3 scenarios generated</Text>
          <Badge size="xs" color="violet" variant="light">1,000 TwinX Simulation iterations</Badge>
        </Group>
      </Paper>

      {/* Scenario cards */}
      <SimpleGrid cols={3} spacing="md">
        {pd.scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            selected={selectedId === scenario.id}
            onSelect={() => setWorkflowState(s => ({ ...s, selectedScenarioId: scenario.id }))}
          />
        ))}
      </SimpleGrid>

      <Alert icon={<IconAlertTriangle size={16} stroke={1.5} />} color="yellow" variant="light">
        <Text size="xs">{pd.sensitivityNote}</Text>
      </Alert>

      {/* Comparison charts + drill-down */}
      <Paper withBorder p="md" radius="md">
        <Tabs defaultValue="aggregate">
          <Tabs.List>
            <Tabs.Tab value="aggregate" leftSection={<IconChartBar size={14} />}>Scenario comparison</Tabs.Tab>
            <Tabs.Tab value="contentchannel" leftSection={<IconChartBar size={14} />}>Content &times; Channel</Tabs.Tab>
            <Tabs.Tab value="drilldown" leftSection={<IconUsers size={14} />}>Advisor preview</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="aggregate" pt="md">
            <Stack gap="md">
              <Stack gap={4}>
                <Text size="xs" fw={600} c="dimmed">A / B / C — engagement, AUM, and cost tradeoffs</Text>
                <BarChart
                  h={200}
                  data={comparisonData}
                  dataKey="scenario"
                  series={[
                    { name: 'Engagement (%)', color: 'teal' },
                    { name: 'AUM ($M ÷10)', color: 'green' },
                    { name: 'Cost ($K ÷10)', color: 'red' },
                  ]}
                  withTooltip
                  withLegend
                  type="default"
                />
              </Stack>
              <Divider label={`Scenario ${selectedId} — channel engagement`} labelPosition="left" />
              <BarChart
                h={140}
                data={channelData}
                dataKey="channel"
                series={[{ name: 'rate', color: 'violet', label: 'Simulated engagement (%)' }]}
                withTooltip
                withLegend={false}
                yAxisProps={{ tickFormatter: (v) => `${v}%` }}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="contentchannel" pt="md">
            <Stack gap="md">
              <Text size="xs" c="dimmed">Content and channel performance predictions for Scenario {selectedId}</Text>
              {selectedScenario.contentChannelResults && selectedScenario.contentChannelResults.length > 0 && (() => {
                const results = selectedScenario.contentChannelResults
                const DONUT_COLORS = ['teal', 'blue', 'violet', 'orange', 'green', 'red', 'indigo', 'grape', 'cyan', 'yellow', 'pink']
                const contentSplit = results.map((r, i) => ({
                  name: r.content.split(' \u2192 ')[0] || r.content,
                  value: Math.round(r.predAUM * 10) / 10,
                  color: `var(--mantine-color-${DONUT_COLORS[i % DONUT_COLORS.length]}-6)`,
                }))
                const channelAgg = {}
                results.forEach((r) => {
                  const ch = r.content.split(' \u2192 ')[1] || 'Other'
                  channelAgg[ch] = (channelAgg[ch] || 0) + r.predAUM
                })
                const channelSplit = Object.entries(channelAgg).map(([name, value], i) => ({
                  name,
                  value: Math.round(value * 10) / 10,
                  color: `var(--mantine-color-${DONUT_COLORS[i % DONUT_COLORS.length]}-6)`,
                }))
                return (
                  <>
                    {/* Response matrix table */}
                    <Table striped highlightOnHover withTableBorder fz="xs">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Content × Channel</Table.Th>
                          <Table.Th>Pred. Engagement</Table.Th>
                          <Table.Th>95% CI</Table.Th>
                          <Table.Th>Pred. AUM $M</Table.Th>
                          <Table.Th>Sim Confidence</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {results.map((r, i) => (
                          <Table.Tr key={i}>
                            <Table.Td fw={600}>{r.content}</Table.Td>
                            <Table.Td>
                              <Stack gap={2}>
                                <Text size="xs" c="green">{Math.round(r.predEng * 100)}%</Text>
                                <Progress value={r.predEng * 100} color="green" size="xs" w={60} />
                              </Stack>
                            </Table.Td>
                            <Table.Td c="dimmed">{Math.round(r.ciLow * 100)}% – {Math.round(r.ciHigh * 100)}%</Table.Td>
                            <Table.Td c="green" fw={700}>${r.predAUM}M</Table.Td>
                            <Table.Td>
                              <Badge size="xs" color={r.simConf >= 0.85 ? 'green' : r.simConf >= 0.75 ? 'teal' : 'orange'} variant="light">
                                {Math.round(r.simConf * 100)}%
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>

                    {/* Donut charts — content split + channel split */}
                    <SimpleGrid cols={2} spacing="md">
                      <Paper withBorder p="md" radius="md">
                        <Stack gap="sm" align="center">
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>AUM by content type</Text>
                          <DonutChart data={contentSplit} size={160} thickness={28} withTooltip tooltipDataSource="segment" />
                        </Stack>
                      </Paper>
                      <Paper withBorder p="md" radius="md">
                        <Stack gap="sm" align="center">
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>AUM by channel</Text>
                          <DonutChart data={channelSplit} size={160} thickness={28} withTooltip tooltipDataSource="segment" />
                        </Stack>
                      </Paper>
                    </SimpleGrid>

                    {/* AUM bar chart — sorted, truncated labels */}
                    <Divider label="AUM contribution by content type" labelPosition="left" />
                    <BarChart
                      h={300}
                      data={[...results].sort((a, b) => b.predAUM - a.predAUM).map(r => ({
                        content: r.content.split(' \u2192 ')[0] || r.content,
                        aum: r.predAUM,
                      }))}
                      dataKey="content"
                      series={[{ name: 'aum', color: 'teal', label: 'Predicted AUM ($M)' }]}
                      withTooltip
                      withLegend={false}
                      yAxisProps={{ tickFormatter: (v) => `$${v}M` }}
                    />
                  </>
                )
              })()}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="drilldown" pt="md">
            <Stack gap="sm">
              <Text size="xs" c="dimmed">Sample advisors — channel and content recommendation for Scenario {selectedId}</Text>
              <Table striped highlightOnHover withTableBorder fz="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Advisor</Table.Th>
                    <Table.Th>Firm</Table.Th>
                    <Table.Th>Tier</Table.Th>
                    <Table.Th>Channel</Table.Th>
                    <Table.Th>Content</Table.Th>
                    <Table.Th>Simulated eng.</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {advisorRows.map((a, i) => (
                    <Table.Tr key={i}>
                      <Table.Td fw={600}>{a.name}</Table.Td>
                      <Table.Td c="dimmed">{a.firm}</Table.Td>
                      <Table.Td><Badge size="xs" color={TIER_COLORS[a.tier]} variant="light">T{a.tier}</Badge></Table.Td>
                      <Table.Td>{a.channel}</Table.Td>
                      <Table.Td c="dimmed">{a.content}</Table.Td>
                      <Table.Td fw={700} c={parseInt(a.eng) >= 50 ? 'green' : parseInt(a.eng) >= 20 ? 'teal' : 'dimmed'}>{a.eng}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Generated content variants — tiles */}
      {contentVariants.length > 0 && (
        <ContentVariantGrid variants={contentVariants} />
      )}

      <Button
        size="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 135 }} rightSection={<IconChevronRight size={16} stroke={2} />}
        onClick={onContinue} styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }} style={{ alignSelf: 'flex-end' }}
      >
        Submit for Governance
      </Button>
    </Stack>
  )
}
