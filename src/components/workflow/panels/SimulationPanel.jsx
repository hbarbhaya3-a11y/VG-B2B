import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Progress, Button, Alert, Divider, ThemeIcon, Loader, NumberInput, Select, Table, Modal, ActionIcon } from '@mantine/core'
import { IconChartBar, IconChevronRight, IconAlertTriangle, IconCheck, IconPlayerPlay, IconPencil, IconLock, IconAdjustments, IconGift, IconSend, IconSparkles, IconFileText, IconVideo, IconMail, IconDeviceMobile, IconPhone, IconShield, IconChevronDown, IconChevronUp, IconEye } from '@tabler/icons-react'
import { useUseCase } from '../../../contexts/UseCaseContext'

// ── Content type registry ──────────────────────────────────────────────────
const CONTENT_TYPES = [
  { id: 'article',    label: 'Plain-language educational article', icon: IconFileText,     color: 'blue'   },
  { id: 'insight',    label: 'Portfolio health insight',           icon: IconChartBar,     color: 'teal'   },
  { id: 'calculator', label: 'Scenario calculator',                icon: IconSparkles,     color: 'violet' },
  { id: 'video',      label: '60-second explainer video',          icon: IconVideo,        color: 'grape'  },
  { id: 'email',      label: 'Advisor invitation email',           icon: IconMail,         color: 'orange' },
  { id: 'cta',        label: 'Secure-site CTA card',               icon: IconDeviceMobile, color: 'cyan'   },
  { id: 'script',     label: 'Call script / advisor brief',        icon: IconPhone,        color: 'green'  },
  { id: 'faq',        label: 'FAQ / disclosure module',            icon: IconShield,       color: 'gray'   },
]

const CHANNEL_CONTENT_MAP = {
  'secure-site card':    ['cta', 'article'],
  'secure-site insight': ['insight', 'article'],
  'secure site':         ['cta', 'faq'],
  'app push':            ['video', 'cta'],
  'email + advisor':     ['email', 'script'],
  'email + secure':      ['article', 'faq'],
  'email':               ['email', 'article'],
  'crm':                 ['script', 'faq'],
}

function getContentTypesForChannel(channel) {
  const lower = channel.toLowerCase()
  for (const [key, types] of Object.entries(CHANNEL_CONTENT_MAP)) {
    if (lower.includes(key)) return types
  }
  return ['article', 'cta']
}

function buildVariants(segments) {
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
        headline: generateHeadline(ct.id, v),
        body: generateBody(ct.id, seg.label),
      })
    }
  })
  return variants
}

function generateHeadline(typeId, v) {
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
    article:    `Educational content tailored for ${segLabel}. Covers portfolio review fundamentals, the value of goal-based planning, and how to evaluate whether advisory services are a fit — without solicitation language.`,
    insight:    `A visual portfolio health summary highlighting concentration risk, overlap, and diversification gaps. Designed to prompt reflection and an optional next step — not a recommendation.`,
    calculator: `An interactive scenario tool that lets the investor model different allocation paths, income drawdown scenarios, or cash deployment timelines. Output is illustrative, not advice.`,
    video:      `A 60-second animated explainer covering the planning-to-advice journey. Calm, benefit-led tone. Ends with a soft CTA to explore further — no product mention.`,
    email:      `Personalized advisor invitation email. Opens with the investor's stated planning goal, acknowledges their journey so far, and offers a no-obligation conversation. Disclosure-compliant draft.`,
    cta:        `Secure-site card surfaced at the right moment in the investor's session. Short headline, 1–2 lines of context, a single action button. Variants test headline framing and CTA copy.`,
    script:     `Advisor brief summarising the investor's behavioral signals, planning intent, and suggested conversation opener. Includes education-vs-advice boundary guidance for the advisor.`,
    faq:        `A plain-language FAQ covering how Vanguard advisory works, fee structures, suitability, and what happens after a consultation. Disclosure module auto-attaches based on content class.`,
  }
  return bodies[typeId] || bodies.article
}

// ── Content variant tiles + modal ─────────────────────────────────────────
function ContentVariantTile({ variant, onClick }) {
  const Icon = variant.contentType.icon
  return (
    <Paper
      withBorder p="md" radius="md"
      style={{ borderTop: `3px solid var(--mantine-color-${variant.contentType.color}-5)`, cursor: 'pointer' }}
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
        title={active && (
          <Group gap="xs">
            <ThemeIcon size={24} radius="md" variant="light" color={active.contentType.color}>
              <active.contentType.icon size={13} stroke={1.5} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="sm" fw={700}>{active.contentType.label}</Text>
              <Text size="xs" c="dimmed">Variant {active.variantNum} · {active.segment}</Text>
            </Stack>
          </Group>
        )}
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

// ── Step 5 config summary (previously step 4) ─────────────────────────────
function OfferChannelSummary({ workflowState, activeUseCase }) {
  const channelStep = activeUseCase?.steps.find(s => s.panelType === 'participant_channel_config')
  const channelPd = channelStep?.panelData
  if (!channelPd) return null

  const allOffers = channelPd.offers || []
  const allSegments = channelPd.segments || []
  const activeOffers = workflowState?.selectedOffers ? allOffers.filter(o => workflowState.selectedOffers.includes(o.id)) : allOffers
  const activeSegs = workflowState?.selectedSegments ? allSegments.filter(s => workflowState.selectedSegments.includes(s.id)) : allSegments
  const totalVariants = activeSegs.reduce((sum, s) => sum + s.variants, 0)
  const totalReach = activeSegs.reduce((sum, s) => sum + s.count, 0)

  return (
    <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-default-hover)' }}>
      <Stack gap="sm">
        <Group gap="xs" mb={2}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Step 5 Configuration Summary</Text>
          <Badge size="xs" color="violet" variant="light">{activeOffers.length} offers · {activeSegs.length} segments · {totalVariants} variants · {totalReach.toLocaleString()} reach</Badge>
        </Group>
        <Stack gap={4}>
          <Group gap={6}><IconGift size={12} stroke={1.5} style={{ color: 'var(--mantine-color-orange-6)' }} /><Text size="xs" fw={700} c="orange">Selected Offers</Text></Group>
          <Group gap="xs" wrap="wrap">{activeOffers.map(o => <Badge key={o.id} size="xs" variant="light" color={o.color}>{o.label}</Badge>)}</Group>
        </Stack>
        <Divider />
        <Stack gap={4}>
          <Group gap={6}><IconSend size={12} stroke={1.5} style={{ color: 'var(--mantine-color-blue-6)' }} /><Text size="xs" fw={700} c="blue">Segments &amp; Channels</Text></Group>
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

// ── Variant preview modal ─────────────────────────────────────────────────
function VariantPreviewModal({ variant, seg, onClose }) {
  if (!variant || !seg) return null
  const typeId = variant === 'A'
    ? getContentTypesForChannel(seg.channel)[0]
    : getContentTypesForChannel(seg.channel)[1] || getContentTypesForChannel(seg.channel)[0]
  const ct = CONTENT_TYPES.find(c => c.id === typeId) || CONTENT_TYPES[0]
  const Icon = ct.icon
  const headline = generateHeadline(typeId, variant === 'A' ? 0 : 1)
  const body = generateBody(typeId, seg.label)
  return (
    <Modal
      opened
      onClose={onClose}
      size="lg"
      radius="md"
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" variant="light" color={ct.color}>
            <Icon size={14} stroke={1.5} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={700}>Content Variant {variant} — {ct.label}</Text>
            <Text size="xs" c="dimmed">{seg.label}</Text>
          </Stack>
        </Group>
      }
    >
      <Stack gap="md">
        <Group gap="xs" wrap="wrap">
          <Badge size="sm" variant="light" color={seg.color}>Segment: {seg.label}</Badge>
          <Badge size="sm" variant="light" color="gray">Channel: {seg.channel}</Badge>
          <Badge size="sm" variant="light" color="orange">Offer: {seg.offer}</Badge>
        </Group>
        <Paper withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${ct.color}-5)` }}>
          <Stack gap="sm">
            <Text size="md" fw={700}>{headline}</Text>
            <Divider />
            <Text size="sm" style={{ lineHeight: 1.7 }}>{body}</Text>
          </Stack>
        </Paper>
        <Group gap="xs">
          <Badge size="xs" variant="light" color={ct.color}>{ct.label}</Badge>
          <Badge size="xs" variant="light" color="teal">Education-classified</Badge>
          <Badge size="xs" variant="light" color="gray">Disclosure auto-attaches</Badge>
        </Group>
        <Group gap="xs" justify="flex-end">
          <Button size="xs" variant="light" color="gray" onClick={onClose}>Close</Button>
          <Button size="xs" variant="light" color={ct.color}>Approve variant</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

// ── Simulation loading lines ───────────────────────────────────────────────
const RUNNING_LINES = [
  'Loading episode priors from TwinX…',
  'Fitting Bayesian hierarchical response curves…',
  'Running 1,000 TwinX Simulation iterations…',
  'Ranking scenarios by behavioral segment…',
  'Generating segment-level recommendations…',
]

// ── Recommendation table data ─────────────────────────────────────────────
const SEG_DETAIL = [
  {
    id: 'seg-1', color: 'orange',
    label: 'Planning-active, advice-undecided', count: 11800,
    signal: '3+ planning-tool visits, advice-page repeat visits, no advisor',
    offer: 'Complimentary Portfolio Review',
    channel: 'Secure-site card + email',
    variantA: '"See what your plan may be missing"',
    variantB: '"Get a second look at your portfolio goals"',
    why: 'These investors are already showing intent. The barrier is not awareness; the barrier is clarity on the next step.',
    path: ['Secure-site card', 'Educational email', 'Portfolio review CTA', 'Advisor appointment option if engagement continues'],
    avoid: ['Hard-sell advisory language', 'Product-specific recommendation without eligibility / advice clearance'],
  },
  {
    id: 'seg-2', color: 'orange',
    label: 'High-cash, low-conviction investors', count: 7900,
    signal: 'Rising cash / money-market balances, low investment activity, planning-tool use',
    offer: 'Digital Advisor Assessment + cash scenario tool',
    channel: 'App push + secure site',
    variantA: '"Is your cash working for your goals?"',
    variantB: '"When cash helps — and when it may hold you back"',
    why: 'Idle cash signals hesitation, not apathy. Education that frames the cost of inaction — without urgency — converts at above-average rates in comparable episodes.',
    path: ['App push with cash scenario hook', 'Secure-site education module', 'Digital advisor assessment CTA', 'Optional advisor conversation for high-balance cohort'],
    avoid: ['Urgency or fear-based framing', 'Jumping to product recommendation before education is consumed'],
  },
  {
    id: 'seg-3', color: 'blue',
    label: 'Portfolio complexity builders', count: 6200,
    signal: 'Fund overlap, allocation drift, concentration risk, repeated portfolio views',
    offer: 'Portfolio Health Review',
    channel: 'Secure-site insight + email',
    variantA: '"Simplify your portfolio view"',
    variantB: '"Understand overlap, concentration, and next steps"',
    why: 'Frequent portfolio checking with no action signals anxiety about complexity. A visual health insight lowers the cognitive load and creates a natural advisory on-ramp.',
    path: ['Secure-site portfolio insight card with overlap visualization', 'Follow-up email with health check summary', 'Portfolio review CTA', 'Advisor consult for high-complexity households'],
    avoid: ['Generic diversification advice', 'Fund-specific recommendations without advice clearance'],
  },
  {
    id: 'seg-4', color: 'blue',
    label: 'Volatility-sensitive recheckers', count: 5800,
    signal: 'Repeated logins during volatility, performance-page loops, sell-flow research',
    offer: 'Market reassurance + optional advisor path',
    channel: 'App push + article',
    variantA: '"Before reacting, review your plan"',
    variantB: '"Market movement: what changed and what did not"',
    why: 'Sell-flow research without completion signals a decision in progress. Calm, plan-first content intercepts before regret-inducing action. Timing within 6 hours of the login spike is critical.',
    path: ['Immediate app push (within 6h of spike)', 'Educational article: stay-the-course framing', 'Secure-site banner reinforcement', 'Optional advisor access — not surfaced first'],
    avoid: ['Performance comparisons or market predictions', 'Advisor CTA before reassurance content is consumed'],
  },
  {
    id: 'seg-5', color: 'teal',
    label: 'Retirement income / transition planners', count: 4700,
    signal: 'Retirement income calculator, withdrawal content, rollover / IRA visits',
    offer: 'Personal Advisor Consultation',
    channel: 'Email + advisor task',
    variantA: '"Plan income before the decision point"',
    variantB: '"Explore retirement choices with support"',
    why: 'Income planning decisions are irreversible at the point of retirement. Advisor access positioned as planning support — not product — is appropriate and welcomed by this cohort.',
    path: ['Income projection tool via email', 'Advisor task: income planning conversation offer', 'Call center prompt for inbound callers in this segment', 'IRA / rollover education module as companion content'],
    avoid: ['Rollover or product solicitation before education', 'Reaction-based signals substituting for life-event confirmation'],
  },
  {
    id: 'seg-6', color: 'teal',
    label: 'Tax-efficiency seekers', count: 3400,
    signal: 'Tax content visits, cost-basis pages, taxable account activity',
    offer: 'Tax-Efficient Strategy Education',
    channel: 'Email + secure-site module',
    variantA: '"Make tax-aware choices before you transact"',
    variantB: '"Understand tax trade-offs in your portfolio"',
    why: 'Tax-aware investors are research-led and respond to precision over emotion. Education that frames trade-offs without prescribing action is both compliant and effective.',
    path: ['Year-end triggered email with tax-efficiency insight', 'Secure-site education module: asset location and cost-basis', 'Optional advisor consult framed around tax planning', 'Roth conversion calculator as engagement hook'],
    avoid: ['Tax advice language without compliance clearance', 'Generic "save on taxes" messaging'],
  },
  {
    id: 'seg-7', color: 'grape',
    label: 'Digitally engaged but service-frustrated', count: 2200,
    signal: 'Repeated journey attempts, status checks, support case, abandoned action',
    offer: 'Service callback + guided next step',
    channel: 'Secure site + CRM task',
    variantA: '"We can help complete this step"',
    variantB: '"Here is what happens next"',
    why: 'Repeated failed attempts erode trust rapidly. Proactive status transparency and a human handoff before the next attempt dramatically improve completion and satisfaction.',
    path: ['Proactive secure-site status update', 'CRM task routed to service rep', 'Outbound callback offer (not mandatory)', 'Guided next-step module on secure site'],
    avoid: ['Automated-only resolution for complex service failures', 'Marketing content before service issue is resolved'],
  },
]

function SegmentDetailCard({ seg }) {
  const [open, setOpen] = useState(false)
  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
      <Group
        px="md" py="sm" justify="space-between" wrap="nowrap"
        style={{ cursor: 'pointer', borderLeft: `3px solid var(--mantine-color-${seg.color}-5)` }}
        onClick={() => setOpen(o => !o)}
      >
        <Stack gap={1}>
          <Text size="sm" fw={700}>{seg.label}</Text>
          <Text size="xs" c="dimmed">{seg.count.toLocaleString()} investors · {seg.channel}</Text>
        </Stack>
        <ThemeIcon size={18} variant="subtle" color="gray" radius="sm">
          {open ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
        </ThemeIcon>
      </Group>
      {open && (
        <Stack gap="md" p="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Why this segment matters</Text>
            <Text size="sm" style={{ lineHeight: 1.6 }}>{seg.why}</Text>
          </Stack>
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Recommended path</Text>
            <Stack gap={4}>
              {seg.path.map((step, i) => (
                <Group key={i} gap="xs" align="flex-start">
                  <Badge size="xs" variant="filled" color={seg.color} style={{ minWidth: 20, flexShrink: 0 }}>{i + 1}</Badge>
                  <Text size="xs">{step}</Text>
                </Group>
              ))}
            </Stack>
          </Stack>
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Avoid</Text>
            <Stack gap={4}>
              {seg.avoid.map((a, i) => (
                <Group key={i} gap="xs" align="flex-start">
                  <Text size="xs" c="red" fw={700}>✕</Text>
                  <Text size="xs" c="dimmed">{a}</Text>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Stack>
      )}
    </Paper>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function SimulationPanel({ step, workflowState, setWorkflowState, onContinue }) {
  const { activeUseCase } = useUseCase()
  const pd = step.panelData
  const [phase, setPhase] = useState('config')
  const [runLine, setRunLine] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [variantPreview, setVariantPreview] = useState(null) // { seg, variant: 'A'|'B' }
  const [params, setParams] = useState({
    confidenceThreshold: 80,
    minEngagement: 15,
    timeHorizon: '30 days',
    tier1Multiplier: 3,
  })

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

  // Derive locked values from steps 1–4
  const channelStep = activeUseCase?.steps.find(s => s.panelType === 'participant_channel_config')
  const campaignObjectiveStep = activeUseCase?.steps.find(s => s.panelType === 'campaign_objective')
  const segmentationStep = activeUseCase?.steps.find(s => s.panelType === 'participant_segmentation')

  const allSegments = channelStep?.panelData?.segments || []
  const allOffers = channelStep?.panelData?.offers || []
  const selectedSegIds = workflowState?.selectedSegments
  const activeSegments = selectedSegIds ? allSegments.filter(s => selectedSegIds.includes(s.id)) : allSegments
  const activeOffersCount = workflowState?.selectedOffers ? workflowState.selectedOffers.length : allOffers.length
  const totalReachLocked = activeSegments.reduce((sum, s) => sum + s.count, 0) || 42000
  const holdoutLocked = workflowState?.segmentConfig?.holdoutCount ?? segmentationStep?.panelData?.holdout?.count ?? 4200
  const contentVariants = buildVariants(activeSegments)

  // ── Config phase ──────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <Stack gap="md">
        <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid var(--mantine-color-violet-5)' }}>
          <Group justify="space-between">
            <Stack gap={4}>
              <Group gap="xs">
                <Badge size="sm" color="violet" variant="filled">SIMULATE</Badge>
                <Badge size="sm" color="violet" variant="light">TwinX Simulation</Badge>
              </Group>
              <Text size="lg" fw={700}>Configure simulation</Text>
              <Text size="xs" c="dimmed">Parameters pre-loaded from your configuration in steps 1–4</Text>
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

        {/* Step 5 configuration summary */}
        <OfferChannelSummary workflowState={workflowState} activeUseCase={activeUseCase} />

        {/* Parameters */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <SimpleGrid cols={2} spacing="md">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconLock size={13} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Locked — from your config</Text>
                </Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Campaign objective</Text><Badge variant="light" color="vanguardRed" size="xs">{campaignObjectiveStep?.panelData?.objectives?.find(o => o.recommended)?.label || 'Cross-sell to advisory'}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Budget</Text><Badge variant="light" color="green" size="xs">${(campaignObjectiveStep?.panelData?.defaultBudget || 150000).toLocaleString()}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Population (reach)</Text><Badge variant="light" color="orange" size="xs">{totalReachLocked.toLocaleString()}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Holdout</Text><Badge variant="light" color="gray" size="xs">{holdoutLocked.toLocaleString()}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Active segments</Text><Badge variant="light" color="blue" size="xs">{activeSegments.length}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Offers</Text><Badge variant="light" color="grape" size="xs">{activeOffersCount}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Content variants</Text><Badge variant="light" color="violet" size="xs">{contentVariants.length}</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Episode baseline</Text><Badge variant="light" color="blue" size="xs">18 prior episodes</Badge></Group>
                <Group justify="space-between"><Text size="xs" c="dimmed">Iterations</Text><Badge variant="light" color="violet" size="xs">1,000</Badge></Group>
              </Stack>
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

        <Button
          size="md"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
          leftSection={<IconPlayerPlay size={16} stroke={1.5} />}
          styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
          onClick={() => { setPhase('running'); setRunLine(0) }}
        >
          Run TwinX Simulation
        </Button>
      </Stack>
    )
  }

  // ── Running phase ─────────────────────────────────────────────────────────
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

  // ── Results phase ─────────────────────────────────────────────────────────
  return (
    <Stack gap="md">
      {variantPreview && (
        <VariantPreviewModal
          variant={variantPreview.variant}
          seg={variantPreview.seg}
          onClose={() => setVariantPreview(null)}
        />
      )}
      {/* Header */}
      <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-violet-light)', borderLeft: '3px solid var(--mantine-color-violet-5)' }}>
        <Stack gap="xs">
          <Group gap="xs">
            <ThemeIcon size="sm" color="violet" variant="filled" radius="sm"><IconChartBar size={12} stroke={1.5} /></ThemeIcon>
            <Text size="sm" fw={700}>TwinX Recommendation — 42,000 investors segmented into 7 behavioral need-states</Text>
            <Badge size="xs" color="violet" variant="light">1,000 simulation iterations</Badge>
          </Group>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
            TwinX has divided the eligible population into behavioral segments using planning activity, portfolio behavior, cash allocation, digital engagement, volatility response, advice-content consumption, and service signals. Segments are based on observed behavior and inferred need-state — not only static attributes such as age, asset size, or product count.
          </Text>
        </Stack>
      </Paper>

      {/* Recommendation table */}
      <Paper withBorder radius="md" style={{ overflow: 'auto' }}>
        <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md" style={{ minWidth: 1100 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 28 }}>#</Table.Th>
              <Table.Th>Segment</Table.Th>
              <Table.Th style={{ width: 80, textAlign: 'right' }}>Count</Table.Th>
              <Table.Th>Behavioral signal</Table.Th>
              <Table.Th>Recommended offer</Table.Th>
              <Table.Th>Best channel</Table.Th>
              <Table.Th>Content variant A</Table.Th>
              <Table.Th>Content variant B</Table.Th>
              <Table.Th>Why this segment matters</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {SEG_DETAIL.map((seg, idx) => (
              <Table.Tr key={seg.id}>
                <Table.Td><Text size="xs" c="dimmed" fw={600}>{idx + 1}</Text></Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <div style={{ width: 3, height: 28, borderRadius: 2, background: `var(--mantine-color-${seg.color}-5)`, flexShrink: 0 }} />
                    <Text size="xs" fw={700}>{seg.label}</Text>
                  </Group>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="xs" fw={700} c={seg.color}>{seg.count.toLocaleString()}</Text>
                </Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{seg.signal}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light" color={seg.color}>{seg.offer}</Badge></Table.Td>
                <Table.Td><Text size="xs">{seg.channel}</Text></Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon size="sm" variant="light" color={seg.color} radius="sm" onClick={() => setVariantPreview({ seg, variant: 'A' })}>
                      <IconEye size={12} stroke={1.5} />
                    </ActionIcon>
                    <Text size="xs" fs="italic" c="dimmed" style={{ lineHeight: 1.3 }}>{seg.variantA}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon size="sm" variant="light" color="gray" radius="sm" onClick={() => setVariantPreview({ seg, variant: 'B' })}>
                      <IconEye size={12} stroke={1.5} />
                    </ActionIcon>
                    <Text size="xs" fs="italic" c="dimmed" style={{ lineHeight: 1.3 }}>{seg.variantB}</Text>
                  </Group>
                </Table.Td>
                <Table.Td><Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{seg.why}</Text></Table.Td>
              </Table.Tr>
            ))}
            <Table.Tr>
              <Table.Td colSpan={2}><Text size="xs" fw={700}>Total</Text></Table.Td>
              <Table.Td style={{ textAlign: 'right' }}><Text size="xs" fw={800} c="violet">42,000</Text></Table.Td>
              <Table.Td colSpan={6} />
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>

      <Alert icon={<IconAlertTriangle size={16} stroke={1.5} />} color="yellow" variant="light">
        <Text size="xs">Engagement rates and AUM estimates are simulation outputs based on prior episode data. Actual results depend on population fit, timing, and execution quality. Holdout design ensures causal attribution.</Text>
      </Alert>

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        onClick={onContinue}
        styles={{ root: { boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
      >
        Submit for Governance
      </Button>
    </Stack>
  )
}
