import { useState, useEffect } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, ThemeIcon, Divider, Button, Loader, Alert, Progress, Modal, ScrollArea, Tooltip, Table } from '@mantine/core'
import { BarChart, AreaChart } from '@mantine/charts'
import {
  IconCheck, IconChevronRight, IconDownload,
  IconBriefcase, IconMail, IconWorld, IconFile, IconUsers,
  IconBrandLinkedin, IconMicrophone, IconBook, IconArticle, IconAlertTriangle, IconVideo, IconPackage
} from '@tabler/icons-react'
import PanelGuide from '../../ui/PanelGuide'

const DEFAULT_GENERATING_LINES = [
  'Applying education content voice…',
  'Generating personalized content variants…',
  'Personalizing for target cohort…',
  'Running compliance pre-check…',
  'A/B variant generation with Thompson sampling…',
  'Finalizing outputs…',
]

const ICON_MAP = {
  IconArticle, IconMail, IconWorld, IconFile,
  IconBriefcase, IconBrandLinkedin, IconMicrophone, IconBook, IconUsers, IconVideo
}

// ── Asset preview components ────────────────────────────────────────────────

function ArticleChart({ chartKey, charts, caption }) {
  switch (chartKey) {
    case 'recoveryBars':
      return (
        <Stack gap={4}>
          <BarChart
            h={200}
            data={charts.recoveryBars.map(d => ({ label: `${d.event} ${d.label}`, return: d.return12m }))}
            dataKey="label"
            series={[{ name: 'return', color: 'teal', label: '12-month S&P return (%)' }]}
            withTooltip withLegend={false}
            yAxisProps={{ tickFormatter: (v) => `${v}%` }}
            referenceLines={[{ y: 30, label: 'Historical avg recovery', color: 'orange' }]}
          />
          {caption && <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>{caption}</Text>}
        </Stack>
      )
    case 'bearBullDurations':
      return (
        <Stack gap={4}>
          <BarChart
            h={160}
            data={[{ label: 'Bear markets (avg)', months: charts.bearBullDurations.bear }, { label: 'Bull markets (avg)', months: charts.bearBullDurations.bull }]}
            dataKey="label"
            series={[{ name: 'months', color: 'violet', label: 'Average duration (months)' }]}
            withTooltip withLegend={false}
            yAxisProps={{ tickFormatter: (v) => `${v}mo` }}
          />
          {caption && <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>{caption}</Text>}
        </Stack>
      )
    case 'missingBestDays':
      return (
        <Stack gap={4}>
          <BarChart
            h={180}
            data={charts.missingBestDays.map(d => ({ scenario: d.label, value: d.value / 1000 }))}
            dataKey="scenario"
            series={[{ name: 'value', color: 'orange', label: 'Portfolio value ($K, illustrative)' }]}
            withTooltip withLegend={false}
            yAxisProps={{ tickFormatter: (v) => `$${v}K` }}
          />
          {caption && <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>{caption}</Text>}
        </Stack>
      )
    case 'dividendAristocrats':
      return (
        <Paper p="md" radius="md" style={{ background: 'var(--mantine-color-green-light)' }}>
          <Group gap="lg">
            <Stack gap={2}>
              <Text size="3xl" fw={900} c="green">+{charts.dividendAristocratsOutperformance}</Text>
              <Text size="xs" c="dimmed">basis points avg outperformance</Text>
              <Text size="xs" c="dimmed">vs. S&P 500 during drawdown periods</Text>
            </Stack>
            <Stack gap={4}>
              <Badge color="green" variant="light">Vanguard Total Stock Market (VTI)</Badge>
              <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>— Vanguard Investment Strategy Group</Text>
            </Stack>
          </Group>
        </Paper>
      )
    case 'vixHistory':
      return (
        <Stack gap={4}>
          <AreaChart
            h={200}
            data={charts.vixHistory.map(d => ({ date: d.date, vix: d.vix }))}
            dataKey="date"
            series={[{ name: 'vix', color: 'red', label: 'VIX level' }]}
            withTooltip withLegend={false} fillOpacity={0.15}
            referenceLines={[
              { y: 38, label: 'Apr 2026 current (38)', color: 'orange' },
              { y: 20, label: 'Baseline', color: 'gray' },
            ]}
          />
          {caption && <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>{caption}</Text>}
        </Stack>
      )
    // ── Roth 401(k) chart types (UC-B) ─────────────────────────────────────
    case 'rothComparison':
      return (
        <Stack gap={4}>
          <BarChart
            h={200}
            data={charts.rothComparison.map(d => ({ scenario: d.label, Roth: d.roth, Traditional: d.traditional }))}
            dataKey="scenario"
            series={[
              { name: 'Roth', color: 'violet', label: 'Roth 401(k) after-tax value at 65 ($K, illustrative)' },
              { name: 'Traditional', color: 'blue', label: 'Traditional 401(k) after-tax value at 65 ($K, illustrative)' },
            ]}
            withTooltip
            withLegend
            yAxisProps={{ tickFormatter: (v) => `$${v}K` }}
          />
          {caption && <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>{caption}</Text>}
        </Stack>
      )
    case 'rothAdoptionGap':
      return (
        <Stack gap={4}>
          <BarChart
            h={160}
            data={charts.rothAdoptionGap.map(d => ({ plan: d.label, 'Roth election rate (%)': d.value }))}
            dataKey="plan"
            series={[{ name: 'Roth election rate (%)', color: 'violet' }]}
            withTooltip
            withLegend={false}
            yAxisProps={{ tickFormatter: (v) => `${v}%` }}
            referenceLines={[{ y: 18, label: 'Peer benchmark (18%)', color: 'orange' }]}
          />
          {caption && <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>{caption}</Text>}
        </Stack>
      )
    default:
      return null
  }
}

// Vanguard brand palette
const VG = { red: '#96151D', burgundy: '#7a0f16', dark: '#1a0608', light: '#fde8e9', border: '#f79da3' }

function VanguardHeader({ title, subtitle, variant }) {
  const isLight = variant === 'light'
  return (
    <Paper p="md" radius="sm" mb="md" style={{
      background: isLight ? VG.light : VG.dark,
      borderBottom: `3px solid ${VG.red}`,
    }}>
      <Group gap="sm" mb={title ? 'xs' : 0}>
        <img
          src="/vanguard-logo.png"
          alt="Vanguard"
          height={24}
          style={{ display: 'block', objectFit: 'contain' }}
        />
        <Divider orientation="vertical" h={18} style={{ alignSelf: 'center', borderColor: isLight ? VG.border : 'rgba(255,255,255,0.15)' }} />
        <Text size="xs" fw={700} c={isLight ? VG.red : 'rgba(247,157,163,0.8)'} tt="uppercase" style={{ letterSpacing: '0.08em' }}>
          Vanguard Insights
        </Text>
      </Group>
      {title && <Text size="md" fw={700} c={isLight ? VG.dark : 'white'}>{title}</Text>}
      {subtitle && <Text size="xs" c={isLight ? '#555' : 'rgba(247,157,163,0.7)'} mt={2}>{subtitle}</Text>}
    </Paper>
  )
}

function ArticlePreview({ data }) {
  const sections = data.sections || []
  const [style, setStyle] = useState('young')

  const STYLES = {
    young: {
      label: 'Style A — Young (vibrant)',
      headerBg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
      accent: '#0d9488',
      accentLight: '#ccfbf1',
      font: 16,
      tone: 'Opportunity framing · bold, modern',
    },
    preretiree: {
      label: 'Style B — Pre-retiree (calm)',
      headerBg: 'linear-gradient(135deg, #1a0608 0%, #3a0a10 50%, #96151D 100%)',
      accent: '#96151D',
      accentLight: '#fde8e9',
      font: 17,
      tone: 'Protection framing · warm, simple, larger text',
    },
  }
  const s = STYLES[style]

  return (
    <Stack gap="sm">
      <Group gap="xs">
        {Object.entries(STYLES).map(([key, val]) => (
          <Badge key={key} size="sm" variant={style === key ? 'filled' : 'light'}
            color={key === 'young' ? 'teal' : 'vanguardRed'}
            style={{ cursor: 'pointer' }} onClick={() => setStyle(key)}>
            {val.label}
          </Badge>
        ))}
      </Group>

      <Stack gap={0} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <Paper p="xl" radius={0} style={{ background: s.headerBg, minHeight: 140 }}>
          <Stack gap="sm" justify="flex-end" h="100%">
            <Group gap="sm" align="center">
              <img src="/vanguard-logo.png" alt="Vanguard" height={20} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <Divider orientation="vertical" h={16} style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
              <Text size="10px" c="rgba(255,255,255,0.8)" tt="uppercase" fw={600} style={{ letterSpacing: '0.1em' }}>Participant Education</Text>
            </Group>
            <Text size="xl" fw={800} c="white" lh={1.2}>
              {style === 'young' ? 'Your plan just got stronger — here is why' : data.title || 'Your retirement plan is built for exactly this'}
            </Text>
            <Group gap="md">
              <Text size="xs" c="rgba(255,255,255,0.6)">Vanguard Retirement Research · April 2026</Text>
              <Badge size="xs" variant="light" color="gray" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>
                {style === 'young' ? '2 min read' : '4 min read'}
              </Badge>
              <Badge size="xs" variant="outline" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>{s.tone}</Badge>
            </Group>
          </Stack>
        </Paper>

        <Paper p="xl" radius={0} style={{ background: 'white' }}>
          <Stack gap="lg" maw={640} mx="auto">
            {style === 'young' ? (
              <>
                <Text size="md" c="dark.7" lh={1.9} style={{ fontSize: s.font }}>
                  Markets dipped. Your social feed is full of panic. But here is the thing most people miss: if you are under 40 and investing in a target-date fund, a market downturn is not a threat to your retirement — it is an accelerator.
                </Text>
                <Divider my="xs" />
                <Group gap="xs" align="center"><div style={{ width: 4, height: 20, borderRadius: 2, background: s.accent }} /><Text size="md" fw={700} c="dark.9">Dollar-cost averaging is your superpower</Text></Group>
                <Text size="sm" c="dark.6" lh={1.8} pl={12}>
                  Every paycheck, your 401(k) contribution buys shares. When prices drop, you buy more shares for the same dollar amount. Over 25+ years, these "discount purchases" compound significantly. Historical data shows that participants who maintained contributions through the 2008 crisis, the 2020 COVID crash, and the 2022 rate shock saw their balances recover to new highs within 12–18 months — and the shares they bought during the dip became some of their most valuable holdings.
                </Text>
                <Group gap="xs" align="center"><div style={{ width: 4, height: 20, borderRadius: 2, background: s.accent }} /><Text size="md" fw={700} c="dark.9">Your target-date fund already adjusts for you</Text></Group>
                <Text size="sm" c="dark.6" lh={1.8} pl={12}>
                  If you are invested in a Vanguard Target Retirement Fund, your allocation is already calibrated for your timeline. At age 30, you hold roughly 90% equities — because you have 30+ years of growth ahead. The fund automatically shifts toward bonds as you approach retirement. You do not need to rebalance manually. The fund does it for you, every quarter, based on decades of research.
                </Text>
                <Group gap="xs" align="center"><div style={{ width: 4, height: 20, borderRadius: 2, background: s.accent }} /><Text size="md" fw={700} c="dark.9">What the data actually shows</Text></Group>
                <Text size="sm" c="dark.6" lh={1.8} pl={12}>
                  Since 1980, there have been 12 bear markets (declines of 20% or more). In every single case, the S&P 500 recovered to a new high — the median recovery time was 13 months. Participants who stayed invested through all 12 bear markets saw their balances grow an average of 10.2% annually. Those who moved to cash during downturns and re-entered later earned an average of 6.1% — a gap of over 4 percentage points per year, compounding over decades.
                </Text>
                <Paper p="md" radius="md" style={{ background: s.accentLight, borderLeft: `4px solid ${s.accent}` }}>
                  <Text size="sm" fw={600} c={s.accent}>Bottom line</Text>
                  <Text size="xs" c="dark.6" mt={4}>Market dips feel uncomfortable. But for young investors, they are statistically the best thing that can happen to a long-term retirement plan. Keep contributing. Keep your target-date fund. Time is on your side.</Text>
                </Paper>
              </>
            ) : (
              <>
                <Text size="md" c="dark.7" lh={1.9} style={{ fontSize: s.font }}>
                  We are writing to you because markets have experienced a significant movement. As someone within 10 years of retirement, we understand this can feel concerning. We want to share some important context about what this means — and does not mean — for your retirement plan.
                </Text>
                <Divider my="xs" />
                <Group gap="xs" align="center"><div style={{ width: 4, height: 20, borderRadius: 2, background: s.accent }} /><Text size="md" fw={700} c="dark.9">Your allocation is already defensive</Text></Group>
                <Text size="sm" c="dark.6" lh={1.8} pl={12}>
                  If you are invested in a Vanguard Target Retirement Fund appropriate for your age, your allocation has already shifted significantly toward bonds, stable-value holdings, and inflation-protected securities. At age 60, a typical target-date fund holds approximately 55% bonds and 45% equities — a much more conservative position than a younger participant. This means your portfolio is already designed to weather short-term market volatility. The equity portion is smaller than it was 10 or 15 years ago, and the fixed-income holdings provide stability during periods of uncertainty.
                </Text>
                <Group gap="xs" align="center"><div style={{ width: 4, height: 20, borderRadius: 2, background: s.accent }} /><Text size="md" fw={700} c="dark.9">Your projected retirement income has not materially changed</Text></Group>
                <Text size="sm" c="dark.6" lh={1.8} pl={12}>
                  While your account balance may show a temporary decline, your projected monthly retirement income — the number that actually matters — is likely within a few percentage points of where it was before this event. Retirement projections account for market variability; they are not recalculated on a single day's movement. If you would like to see your current projection, you can access it instantly through the retirement projection tool in your account. It takes less than 30 seconds.
                </Text>
                <Group gap="xs" align="center"><div style={{ width: 4, height: 20, borderRadius: 2, background: s.accent }} /><Text size="md" fw={700} c="dark.9">Before making any changes</Text></Group>
                <Text size="sm" c="dark.6" lh={1.8} pl={12}>
                  If you are considering stopping your contributions, taking a withdrawal, or changing your investment mix, we encourage you to view your personalized projection first. Historically, participants who made reactive changes during market stress — stopping contributions, moving to cash, or taking early withdrawals — ended up with significantly lower retirement income than those who stayed the course. A brief pause to review your projection can help you make an informed decision rather than an emotional one.
                </Text>
                <Group gap="xs" align="center"><div style={{ width: 4, height: 20, borderRadius: 2, background: s.accent }} /><Text size="md" fw={700} c="dark.9">Talk to someone if you need to</Text></Group>
                <Text size="sm" c="dark.6" lh={1.8} pl={12}>
                  If you would like to discuss your situation with a professional, you can schedule a consultation with Vanguard Participant Services at no additional cost. A specialist can walk you through your projection, answer questions about your allocation, and help you think through your options — without any obligation to make changes.
                </Text>
                <Paper p="md" radius="md" style={{ background: s.accentLight, borderLeft: `4px solid ${s.accent}` }}>
                  <Text size="sm" fw={600} c={s.accent}>Key takeaway</Text>
                  <Text size="xs" c="dark.6" mt={4}>Your retirement plan is diversified and rebalances automatically. Your allocation is already age-appropriate and defensive. In most cases, the best action during market movements is no action. View your projection before making any changes.</Text>
                </Paper>
              </>
            )}

            <Divider />
            <Text size="10px" c="dimmed" style={{ fontStyle: 'italic' }}>
              For educational purposes only. Not intended as investment advice. Investments are subject to risk, including the possible loss of principal. Past performance is no guarantee of future results. © 2026 The Vanguard Group, Inc. All rights reserved.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

function EmailFullPreview({ data, overrideText }) {
  const [tierView, setTierView] = useState('all')

  const TIERS = {
    all: { label: 'All variants', variants: [
      { key: 'variantA', variant: data.variantA, color: 'teal', letter: 'A', tierLabel: 'Tier 1 — Young' },
      { key: 'variantB', variant: data.variantB, color: 'violet', letter: 'B', tierLabel: 'Tier 3 — Pre-retiree' },
    ]},
    young: { label: 'Tier 1 — Young (under 40)', color: 'teal', variants: [
      { key: 'variantA', variant: data.variantA, color: 'teal', letter: 'A', tierLabel: 'Opportunity framing' },
    ]},
    mid: { label: 'Tier 2 — Mid-career (40–55)', color: 'blue', variants: [
      { key: 'variantMid', variant: {
        subject: data.variantA?.subject || 'Your retirement plan in context',
        preview: 'A balanced view of what this means for your timeline.',
        chars: 1080, angle: 'Balance framing for 40–55',
        body: [
          'We are reaching out because markets experienced a notable move. For participants in the middle of their career, the key question is: does this change my long-term picture?',
          'The short answer: very little. Your target-date fund is diversified across equity and fixed income in a proportion designed for your retirement timeline. Market movements are factored into the long-term projections.',
          'If you would like to see exactly what your retirement projection looks like today, it takes 30 seconds to check.',
        ],
        cta: 'Check your projection →',
      }, color: 'blue', letter: 'M', tierLabel: 'Balance framing' },
    ]},
    preretiree: { label: 'Tier 3 — Pre-retiree (55+)', color: 'violet', variants: [
      { key: 'variantB', variant: data.variantB, color: 'violet', letter: 'B', tierLabel: 'Protection framing' },
    ]},
  }

  const active = TIERS[tierView]
  const variants = active.variants

  return (
    <Stack gap="md">
      <VanguardHeader title="Email Campaign Variants" subtitle="Participant Education — A/B Sampling" />

      {/* Tier pills */}
      <Group gap="xs">
        {Object.entries(TIERS).map(([key, val]) => (
          <Badge key={key} size="sm" variant={tierView === key ? 'filled' : 'light'}
            color={val.color || 'gray'} style={{ cursor: 'pointer' }}
            onClick={() => setTierView(key)}>
            {val.label}
          </Badge>
        ))}
      </Group>

      <SimpleGrid cols={Math.min(2, variants.length)} spacing="md">
        {variants.map(({ key, variant, color, letter, tierLabel }) => (
          <Paper key={key} withBorder p="md" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${color}-5)` }}>
            <Stack gap="sm">
              <Group justify="space-between">
                <Badge size="xs" color={color} variant="filled">Variant {letter}</Badge>
                <Badge size="xs" color="gray" variant="outline">{variant.chars} chars · {variant.angle}</Badge>
              </Group>
              <Paper p="xs" radius="sm" style={{ background: 'var(--mantine-color-default-hover)' }}>
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed" fw={600}>From:</Text>
                    <Text size="xs">Vanguard &lt;noreply@vanguard.com&gt;</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed" fw={600}>Subject:</Text>
                    <Text size="xs" fw={700}>{variant.subject}</Text>
                  </Group>
                </Stack>
              </Paper>
              <Divider />
              <Stack gap="xs">
                <Text size="xs">Dear [First Name],</Text>
                <Text size="xs">{variant.preview}</Text>
                {variant.body ? (
                  variant.body.map((para, pi) => <Text key={pi} size="xs">{para}</Text>)
                ) : (
                  <>
                    <Text size="xs">
                      We are reaching out because this moment is relevant to your retirement plan. Based on your current plan and savings trajectory, we have prepared personalized guidance to help you make informed decisions.
                    </Text>
                    <Text size="xs">
                      No immediate action is required — but if you would like to explore your options, tap the button below to see your personalized scenario.
                    </Text>
                  </>
                )}
                <Button size="xs" variant="filled" style={{ background: '#96151D', alignSelf: 'flex-start' }}>
                  {variant.cta || 'View your personalized scenario →'}
                </Button>
                <Text size="xs">
                  Questions? Log in to your Vanguard account or contact Participant Services at 800-523-1036.
                </Text>
                <Divider variant="dashed" />
                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic', fontSize: 10 }}>
                  This material is for educational purposes only. It is not intended as investment advice. Investments are subject to risk, including the possible loss of principal. Past performance is no guarantee of future results. © 2026 The Vanguard Group, Inc. All rights reserved.
                </Text>
              </Stack>
              {overrideText && letter === 'A' && (
                <Alert color="yellow" variant="light" icon={<IconAlertTriangle size={12} />} p="xs">
                  <Text size="xs">Override applied: <strong>{overrideText}</strong></Text>
                </Alert>
              )}
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
      <Text size="xs" c="dimmed" ta="center">Thompson sampling determines winning variant after 2 weeks — converts to single send for remaining population</Text>
    </Stack>
  )
}

function PortalPreview() {
  return (
    <Stack gap="md">
      {/* Phone mockup frame for push notification */}
      <Text size="xs" fw={600} c="dimmed" tt="uppercase" ta="center" style={{ letterSpacing: '0.08em' }}>
        App Push Notification Preview
      </Text>
      <Paper mx="auto" w={340} radius="xl" p={0} style={{ background: '#1a1a2e', overflow: 'hidden', border: '3px solid #333' }}>
        {/* Status bar */}
        <Group justify="space-between" px="md" py={6} style={{ background: '#111' }}>
          <Text size="10px" c="gray.5">9:41 AM</Text>
          <Group gap={4}>
            <div style={{ width: 14, height: 8, borderRadius: 2, border: '1px solid #666', position: 'relative' }}>
              <div style={{ width: 10, height: 5, borderRadius: 1, background: '#4ade80', position: 'absolute', top: 1, left: 1 }} />
            </div>
          </Group>
        </Group>
        {/* Notification card */}
        <Paper m="sm" p="md" radius="lg" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
          <Group gap="sm" wrap="nowrap" mb="xs">
            <img src="/vanguard-logo.png" alt="Vanguard" height={16} style={{ objectFit: 'contain' }} />
            <Text size="10px" c="dimmed">now</Text>
          </Group>
          <Text size="sm" fw={700} c="dark" lh={1.3}>Your retirement plan is built for this</Text>
          <Text size="xs" c="gray.7" mt={4} lh={1.4}>
            Markets moved — but your plan hasn't changed. Your target-date fund is already positioned for your timeline. Tap to see your projection.
          </Text>
          <Group mt="sm" gap="xs">
            <Paper px="sm" py={4} radius="xl" style={{ background: '#96151D' }}>
              <Text size="10px" c="white" fw={600}>View projection</Text>
            </Paper>
            <Paper px="sm" py={4} radius="xl" style={{ background: '#f0f0f0' }}>
              <Text size="10px" c="dark" fw={500}>Dismiss</Text>
            </Paper>
          </Group>
        </Paper>
        {/* Home bar */}
        <Group justify="center" py={8}>
          <div style={{ width: 100, height: 4, borderRadius: 2, background: '#444' }} />
        </Group>
      </Paper>
      <Text size="xs" c="dimmed" ta="center">Tier 1 (young participants) — opportunity framing · bold, modern design</Text>
    </Stack>
  )
}

function PDFPreview() {
  return (
    <Stack gap="md">
      <VanguardHeader title="Participant Education Summary" subtitle="Vanguard Insights — Single-Page Visual Summary" variant="light" />
      <Paper withBorder p="md" radius="md" style={{ border: '2px dashed var(--mantine-color-orange-3)' }}>
        <Stack gap="sm" align="center">
          <img src="/vanguard-logo.png" alt="Vanguard" height={20} style={{ display: 'block', objectFit: 'contain' }} />
          <Divider w="100%" label="Vanguard Participant Education" />
        </Stack>
      </Paper>

      <SimpleGrid cols={2} spacing="xs">
        {[
          { n: '01', title: 'Your Plan in Context', desc: 'How your current retirement plan is positioned for this moment — personalized for your timeline.' },
          { n: '02', title: 'Historical Perspective', desc: 'How similar moments have played out historically — and what long-term investors experienced.' },
          { n: '03', title: 'Staying the Course', desc: 'Why long-term plans are built to weather short-term movements. Time in market vs. timing the market.' },
          { n: '04', title: 'Your Next Steps', desc: 'One-tap actions available to you — or confirmation that no action is needed right now.' },
          { n: '05', title: 'Talk to Someone', desc: 'Optional: connect with Vanguard Participant Services or explore your personalized Future Self projection.' },
        ].map((s) => (
          <Paper key={s.n} withBorder p="sm" radius="md">
            <Group gap="xs" align="flex-start">
              <Badge size="xs" variant="filled" style={{ background: "#96151D" }}>{s.n}</Badge>
              <Stack gap={2} style={{ flex: 1 }}>
                <Text size="xs" fw={700}>{s.title}</Text>
                <Text size="xs" c="dimmed">{s.desc}</Text>
              </Stack>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
        For plan sponsor distribution: Sponsors may distribute to plan participants. Vanguard attribution and disclosure required. Education-classified content — not investment advice.
      </Text>
    </Stack>
  )
}

function WholesalerPreview({ overrideText }) {
  return (
    <Stack gap="md">
      <VanguardHeader title="Personalized Message Preview" subtitle="Participant Education — Contextual Outreach" />
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid #96151D' }}>
        <Stack gap="sm">
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="sm" fw={800}>[Participant Name]</Text>
              <Text size="xs" c="dimmed">Personalized based on twin profile · plan · timeline</Text>
            </Stack>
          </Group>
          <Divider />
          <Stack gap={2}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Message context</Text>
            <Text size="xs">
              This message is personalized using the participant's twin profile — including their age, plan type, contribution rate, and proximity to retirement. The tone and framing are selected by the Content Architect based on the participant's psychographic profile and the specific signal that triggered this scenario.
            </Text>
          </Stack>
          <Divider variant="dashed" />
          <Stack gap={2}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Sample opening</Text>
            <Text size="xs" style={{ fontStyle: 'italic' }}>
              "Hi [First Name], we are reaching out because this moment is relevant to your retirement plan. Based on your current savings trajectory, here is what we think you should know — and a one-tap action you can take if it makes sense for you."
            </Text>
          </Stack>
        </Stack>
      </Paper>

      <Text size="xs" fw={600} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>Talking points</Text>
      {[
        { n: 1, point: 'Acknowledge the spike — VIX at 38 is the highest since Apr 2025 tariff event (52). Significant, but not unprecedented. Intraday VIX spikes of this magnitude are noise; the risk for retirement participants is overreaction and hardship withdrawals.', attribution: 'Vanguard Economics & Capital Markets Research' },
        { n: 2, point: "Share recovery data — in 4 of the last 5 comparable events, S&P returned 12–73% within 12 months. Vanguard's 5-Charts analysis shows current levels in bottom quartile of 26-year distribution. Does the plan's participant cohort show signs of reactive trading? If so, education outreach now can reduce leakage.", attribution: 'Vanguard Research / FactSet' },
        { n: 3, point: "Highlight low-cost stability — Vanguard index funds (VTI, VTSAX) have outperformed active peers by 67bps on average during drawdowns. For participants in target-date funds, the automatic rebalancing handles this — emphasize staying the course and avoiding hardship withdrawals.", attribution: 'Vanguard Investment Strategy Group' },
      ].map((tp) => (
        <Paper key={tp.n} withBorder p="sm" radius="md">
          <Group gap="xs" align="flex-start">
            <Badge size="sm" variant="filled" style={{ background: '#96151D', flexShrink: 0 }}>{tp.n}</Badge>
            <Stack gap={4} style={{ flex: 1 }}>
              <Text size="xs">{tp.point}</Text>
              <Badge size="xs" variant="outline" color="gray">{tp.attribution}</Badge>
            </Stack>
          </Group>
        </Paper>
      ))}

      {overrideText && (
        <Alert color="yellow" variant="light" icon={<IconAlertTriangle size={14} />} title="Override — Next step">
          <Text size="xs">{overrideText}</Text>
        </Alert>
      )}

      {/* Follow-up actions */}
      <Paper withBorder p="sm" radius="md">
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Follow-up actions</Text>
          {[
            'Send co-brandable PDF within 24 hours of call',
            'Log call outcome and next steps in CRM',
            'Schedule portfolio review if rebalancing discussed',
          ].map((action, i) => (
            <Group key={i} gap="xs">
              <Badge size="xs" variant="filled" style={{ background: '#96151D', width: 18, height: 18, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</Badge>
              <Text size="xs">{action}</Text>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  )
}

function LinkedInPreview() {
  return (
    <Stack gap="md">
      <VanguardHeader title="LinkedIn Social Snippet" subtitle="Vanguard Plan Sponsor Education Template" />
      <Paper withBorder p="md" radius="md" style={{ borderLeft: '3px solid #96151D' }}>
        <Stack gap="sm">
          <Group gap="xs">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#96151D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text size="xs" fw={700} c="white">V</Text>
            </div>
            <Stack gap={0}>
              <Text size="xs" fw={700}>[Advisor Name] · [Firm Name]</Text>
              <Text size="xs" c="dimmed">Financial Advisor · 1st</Text>
            </Stack>
          </Group>
          <Divider />
          <Stack gap="xs">
            <Text size="xs">
              Markets are volatile. That's always uncomfortable — but it's rarely the end of the story.
            </Text>
            <Text size="xs">
              Vanguard's research shows that in the vast majority of comparable episodes over the past four decades, equity markets recovered within 12 months. VIX spikes feel alarming in the moment; they've historically been poor timing signals for portfolio exits — especially for long-horizon retirement savers.
            </Text>
            <Text size="xs">
              Three things worth remembering right now:
            </Text>
            <Text size="xs">📊 Bull markets last 5.6× longer than bear markets on average</Text>
            <Text size="xs">📉 Missing just 10 of the best market days over 20 years dramatically reduces long-term returns</Text>
            <Text size="xs">🛡️ Quality dividend payers have historically provided a buffer in drawdowns</Text>
            <Text size="xs">
              If you'd like to see the full research — 5 charts from Vanguard's Investment Strategy Group — it's on the participant portal or reach out to your plan administrator.
            </Text>
          </Stack>
          <Group gap="xs" wrap="wrap">
            {['#Investing', '#Vanguard', '#MarketVolatility', '#RetirementSaving', '#LongTermInvesting'].map(h => (
              <Badge key={h} size="xs" color="blue" variant="light">{h}</Badge>
            ))}
          </Group>
          <Text size="xs" c="dimmed">~150 words · Marketing Lab co-brandable · Compliance pre-cleared</Text>
        </Stack>
      </Paper>
    </Stack>
  )
}

function PodcastPreview() {
  return (
    <Stack gap="md">
      <VanguardHeader title="Vanguard Retirement Insights Podcast" subtitle="Episode Script Brief — 30-Minute Interview" />

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Episode title</Text>
            <Text size="sm" fw={700}>"Staying the Course: What 35 Years of Markets Teaches Us About Volatility"</Text>
          </Stack>
          <Group gap="xs">
            <Badge size="xs" variant="light" color="blue">Fran Kinniry, CFA, Vanguard Investment Strategy Group</Badge>
            <Badge size="xs" color="gray" variant="outline">30 minutes</Badge>
          </Group>
          <Text size="xs" c="dimmed">
            <strong>Speaker bio:</strong> Fran Kinniry is a Principal in Vanguard's Investment Strategy Group with 25 years of experience in the firm's Capital Markets Model research. He has guided participants and advisors through multiple major market cycles including the dot-com correction, 2008 financial crisis, COVID-19, and the 2022 rate shock.
          </Text>
        </Stack>
      </Paper>

      {[
        { n: 'Segment 1', title: "What's different this time — and what isn't (0–10 min)", desc: "Open with listener acknowledgment of the VIX spike. Historical framing: what's unique about today vs. 2008, 2020, Apr 2025 tariff shock. Key message: volatility is normal; exits are costly." },
        { n: 'Segment 2', title: 'What the data actually shows (10–22 min)', desc: 'Walk through the 5-chart framework: S&P recovery data, bear/bull duration ratios, missing best days, dividend buffer. Attribution: each data point sourced and dated. Tone: calm authority, evidence-based.' },
        { n: 'Segment 3', title: 'Guidance for participant conversations (22–30 min)', desc: 'Practical toolkit for plan sponsors and advisors: acknowledge, contextualise, redirect. 3 sample Q&A pairs. Vanguard Investment Strategy Group sourcing. Compliance note: all language education-classified and pre-cleared.' },
      ].map((s) => (
        <Paper key={s.n} withBorder p="sm" radius="md" style={{ borderLeft: '3px solid #96151D' }}>
          <Stack gap={4}>
            <Group gap="xs">
              <Badge size="xs" color="red" variant="light">{s.n}</Badge>
              <Text size="xs" fw={700}>{s.title}</Text>
            </Group>
            <Text size="xs" c="dimmed">{s.desc}</Text>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

// ── Plan-Design Quote Package previews (used in UC-E only) ──
function ROISheetPreview({ data }) {
  const d = data || {}
  return (
    <Stack gap="md">
      <VanguardHeader title="CFO ROI One-Pager" subtitle={d.subtitle || 'Plan-design redesign · Sponsor cost vs workforce-stress savings'} variant="light" />
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.06em' }}>Executive summary</Text>
          <Text size="sm" style={{ lineHeight: 1.55 }}>
            {d.summary || 'The recommended plan-design change reduces annual workforce-stress cost while modestly increasing employer match expense. Net economic impact is a multi-million-dollar improvement at single-digit-month breakeven.'}
          </Text>
        </Stack>
      </Paper>

      <SimpleGrid cols={3} spacing="xs">
        {(d.kpis || [
          { label: 'Annual stress cost (current)', value: '$96.0M' },
          { label: 'Projected savings (Y1)', value: '$14.2M' },
          { label: 'Breakeven', value: '11 months' },
        ]).map((k, i) => (
          <Paper key={i} withBorder p="sm" radius="md">
            <Text size="10px" c="dimmed" tt="uppercase" fw={600}>{k.label}</Text>
            <Text size="lg" fw={800} c="vanguardRed">{k.value}</Text>
          </Paper>
        ))}
      </SimpleGrid>

      {d.lineItems && d.lineItems.length > 0 && (
        <Paper withBorder p="sm" radius="md">
          <Stack gap={6}>
            <Text size="11px" fw={700} c="dimmed" tt="uppercase">Cost / benefit detail</Text>
            <Table fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Driver</Table.Th>
                  <Table.Th>Year-1 impact</Table.Th>
                  <Table.Th>Notes</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {d.lineItems.map((row, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{row.driver}</Table.Td>
                    <Table.Td c={row.impact?.toString().startsWith('-') ? 'red' : 'teal'} fw={600}>{row.impact}</Table.Td>
                    <Table.Td c="dimmed">{row.note}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      )}

      <Text size="10px" c="dimmed" ta="center">CFO ROI one-pager · Generated from step 3 (Sponsor ROI) and the configuration applied in step 2.</Text>
    </Stack>
  )
}

function ERISANoticePreview({ data }) {
  const d = data || {}
  return (
    <Stack gap="md">
      <VanguardHeader title={d.title || 'Required Notice — 401(k) Plan Auto-Enrollment'} subtitle={d.subtitle || 'ERISA 30-Day Advance Notice'} variant="light" />
      <Paper withBorder p="lg" radius="md" style={{ background: 'white' }}>
        <Stack gap="md">
          <Text size="11px" c="dimmed" tt="uppercase" fw={600}>Effective date: {d.effectiveDate || '[effective date]'} · Notice period: 30 days</Text>
          <Text size="sm" style={{ lineHeight: 1.6 }}>
            {d.openingPara || 'This notice describes upcoming changes to the 401(k) Plan that take effect on the date shown above. The changes apply automatically — no action is required from you unless you choose to opt out or change your contribution rate.'}
          </Text>
          {(d.sections || [
            { heading: 'What is changing', body: 'Auto-enrollment will be activated. Eligible employees not currently contributing will be automatically enrolled at 6% of pay, with a 1% annual increase up to a 12% ceiling.' },
            { heading: 'Who is affected', body: 'All eligible employees not already contributing at or above 6% of pay. Employees currently contributing at or above 6% are unaffected.' },
            { heading: 'What you need to do', body: 'Nothing, in most cases. To opt out, change your contribution rate, or update your investment elections, log in to your plan portal at any time before the effective date.' },
            { heading: 'Where to get help', body: 'Visit the plan portal or contact your benefits team using the email distribution provided in your onboarding materials.' },
          ]).map((s, i) => (
            <Stack key={i} gap={4}>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">{s.heading}</Text>
              <Text size="sm" style={{ lineHeight: 1.55 }}>{s.body}</Text>
            </Stack>
          ))}
          <Divider variant="dashed" />
          <Text size="10px" c="dimmed" style={{ fontStyle: 'italic' }}>
            This notice is provided in compliance with ERISA notice requirements. It is the single mandatory communication for this plan-design change; no personalized variants are issued.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  )
}

function GuidePreview() {
  return (
    <Stack gap="md">
      <VanguardHeader title="Client Conversation Guide" subtitle="Acknowledge → Contextualise → Redirect Framework" variant="light" />

      {[
        {
          q: '"Should I reduce my 401(k) contributions or move to cash right now?"',
          pm: 'Vanguard Investment Strategy Group',
          a: "\"It's understandable that today's market volatility raises that question. What Vanguard's research shows across four decades is that reductions in retirement contributions during volatility spikes have consistently been costly — not because markets always recover immediately, but because the best days tend to cluster around the worst ones. Missing 10 of the best trading days over 20 years reduces a $10,000 investment to $28,600 from $62,900. Staying the course — keeping contributions steady and remaining diversified — is what the data supports for long-horizon retirement savers.\""
        },
        {
          q: '"My participants are worried. What should I tell them?"',
          pm: 'Vanguard Economics & Capital Markets Research',
          a: '"Start with acknowledgment — a VIX of 38 is significant and it makes sense that participants are anxious. Then contextualise: this is the highest reading since April 2025 (52) and the October 2025 geopolitical spike (31). In both of those episodes, equity markets recovered to new highs within 8 months. The historical base rate for recovery within 12 months of comparable events is very high. Redirect to what participants control: their contribution rate, their time horizon, and whether their fund selection is aligned with retirement date — which target-date funds handle automatically."'
        },
        {
          q: '"Is this the start of a bear market? Should participants de-risk?"',
          pm: 'Fran Kinniry, CFA, Vanguard Investment Strategy Group',
          a: "\"That's the question many plan sponsors are fielding right now, and the honest answer is: we don't know with certainty — no one does. What we do know is that bear markets have historically lasted an average of 12 months, while bull markets have lasted over 67 months on average. For participants in Vanguard Target Retirement funds, automatic rebalancing handles de-risking as they age — no action needed. For self-directed participants, the key message is: focus on your time horizon, not the headline VIX number.\""
        },
      ].map((qa, i) => (
        <Paper key={i} withBorder p="md" radius="md">
          <Stack gap="sm">
            <Group gap="xs">
              <Badge size="xs" color="violet" variant="light">Q{i + 1}</Badge>
              <Text size="xs" fw={700} style={{ flex: 1 }}>{qa.q}</Text>
            </Group>
            <Divider />
            <Stack gap={4}>
              <Group gap="xs">
                <Badge size="xs" variant="filled" style={{ background: "#96151D" }}>{qa.pm}</Badge>
              </Group>
              <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>{qa.a}</Text>
            </Stack>
          </Stack>
        </Paper>
      ))}

      <Text size="xs" c="dimmed" ta="center" style={{ fontStyle: 'italic' }}>
        All language compliance pre-cleared. For professional use in client conversations only.
      </Text>
    </Stack>
  )
}

function VideoPreview() {
  const [frame, setFrame] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(true)

  const FRAMES = [
    { bg: 'linear-gradient(135deg, #1a0608 0%, #96151D 100%)', content: (
      <Stack align="center" justify="center" gap="md">
        <img src="/vanguard-logo.png" alt="Vanguard" height={36} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <Text size="xl" fw={800} c="white" ta="center" lh={1.2}>What this means for<br/>your retirement plan</Text>
        <Badge size="sm" variant="light" style={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}>60-second explainer</Badge>
      </Stack>
    )},
    { bg: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)', content: (
      <Stack align="center" justify="center" gap="sm" px="xl">
        <Text size="xs" c="rgba(255,255,255,0.5)" tt="uppercase" style={{ letterSpacing: '0.1em' }}>Markets moved</Text>
        <Text size="lg" fw={700} c="white" ta="center" lh={1.3}>Your plan accounts for<br/>moments like this</Text>
        <Text size="xs" c="rgba(255,255,255,0.7)" ta="center" maw={400}>
          Market movements are a normal part of long-term investing. Your target-date fund is designed to handle exactly these conditions — automatically.
        </Text>
      </Stack>
    )},
    { bg: 'linear-gradient(135deg, #064e3b 0%, #0d9488 100%)', content: (
      <Stack align="center" justify="center" gap="sm" px="xl">
        <Text size="xs" c="rgba(255,255,255,0.5)" tt="uppercase" style={{ letterSpacing: '0.1em' }}>Your allocation</Text>
        <Text size="lg" fw={700} c="white" ta="center" lh={1.3}>Already positioned<br/>for your timeline</Text>
        <Group gap="xl" mt="sm">
          <Stack align="center" gap={2}><Text size="xl" fw={800} c="white">90%</Text><Text size="10px" c="rgba(255,255,255,0.6)">Equities (age 30)</Text></Stack>
          <Stack align="center" gap={2}><Text size="xl" fw={800} c="white">55%</Text><Text size="10px" c="rgba(255,255,255,0.6)">Equities (age 60)</Text></Stack>
        </Group>
      </Stack>
    )},
    { bg: 'linear-gradient(135deg, #312e81 0%, #6366f1 100%)', content: (
      <Stack align="center" justify="center" gap="sm" px="xl">
        <Text size="xs" c="rgba(255,255,255,0.5)" tt="uppercase" style={{ letterSpacing: '0.1em' }}>Historical perspective</Text>
        <Text size="lg" fw={700} c="white" ta="center" lh={1.3}>12 bear markets since 1980<br/>12 full recoveries</Text>
        <Text size="xs" c="rgba(255,255,255,0.7)" ta="center">Median recovery time: 13 months. Participants who stayed invested earned 10.2% annually vs 6.1% for those who moved to cash.</Text>
      </Stack>
    )},
    { bg: 'linear-gradient(135deg, #1a0608 0%, #96151D 100%)', content: (
      <Stack align="center" justify="center" gap="md">
        <img src="/vanguard-logo.png" alt="Vanguard" height={24} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <Text size="lg" fw={700} c="white" ta="center" lh={1.3}>The best action is usually<br/>no action</Text>
        <Paper px="lg" py={8} radius="xl" style={{ background: 'white' }}>
          <Text size="sm" fw={700} c="#96151D">View your retirement projection →</Text>
        </Paper>
      </Stack>
    )},
  ]

  useEffect(() => {
    if (!playing) return
    const frameTimer = setInterval(() => setFrame(f => (f + 1) % FRAMES.length), 5000)
    const clockTimer = setInterval(() => setElapsed(t => { if (t >= 60) { setPlaying(false); return 60 } return t + 1 }), 1000)
    return () => { clearInterval(frameTimer); clearInterval(clockTimer) }
  }, [playing])

  return (
    <Stack gap="md">
      <VanguardHeader title="60-Second Explainer Video" subtitle="Vanguard — Participant Education · Tier 1 (Young)" />
      <Paper radius="md" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', cursor: 'pointer' }}
        onClick={() => { if (elapsed >= 60) setElapsed(0); setPlaying(p => !p) }}>
        {FRAMES.map((f, i) => (
          <div key={i} style={{
            position: i === 0 ? 'relative' : 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: f.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: frame === i ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}>
            {f.content}
          </div>
        ))}
        {!playing && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
            <ThemeIcon size={64} radius="xl" variant="filled" color="vanguardRed" style={{ opacity: 0.9 }}><IconVideo size={32} /></ThemeIcon>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.15)' }}>
          <div style={{ height: '100%', width: `${(elapsed / 60) * 100}%`, background: '#96151D', transition: 'width 1s linear' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 8, right: 12 }}>
          <Badge size="xs" variant="filled" color="dark" style={{ opacity: 0.8 }}>0:{elapsed.toString().padStart(2,'0')} / 1:00</Badge>
        </div>
      </Paper>
      <Group gap="xs">
        <Badge size="xs" variant="outline" color="gray">1080p</Badge>
        <Badge size="xs" variant="outline" color="gray">Auto-captioned</Badge>
        <Badge size="xs" variant="outline" color="gray">Education-classified</Badge>
        <Badge size="xs" variant="outline" color="gray">Vanguard brand</Badge>
      </Group>
    </Stack>
  )
}

// ── Asset card ────────────────────────────────────────────────────────────────

const HOVER_PREVIEWS = {
  article: 'Educational article with Vanguard branding — personalized for participant context',
  email: 'A/B email variants with segment-appropriate framing and one-tap CTA',
  portal: 'App push notification or in-app card — personalized based on participant twin profile',
  pdf: 'Board-ready deck or participant education summary in Vanguard brand guidelines',
  video: '60-second explainer video — Vanguard-branded, education-classified, auto-captioned',
}

function AssetCard({ asset, onPreview, onExport }) {
  const Icon = ICON_MAP[asset.icon] ?? IconFile
  const hoverPreview = HOVER_PREVIEWS[asset.id] || asset.detail
  return (
    <Tooltip label={hoverPreview} position="bottom" withArrow multiline w={280} openDelay={400}>
      <Paper
        withBorder p="sm" radius="md"
        style={{ transition: 'all 150ms ease' }}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <ThemeIcon size="md" variant="light" color="blue" radius="sm">
              <Icon size={16} stroke={1.5} />
            </ThemeIcon>
            <Badge size="xs" variant="filled" style={{ background: '#96151D' }}>{asset.count}</Badge>
          </Group>
          <Text size="xs" fw={700} lineClamp={2}>{asset.name}</Text>
          <Text size="xs" c="dimmed" lineClamp={2}>{asset.detail}</Text>
          {asset.overrideApplied && (
            <Badge size="xs" color="yellow" variant="light">Override applied</Badge>
          )}
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={() => onPreview(asset.id)}
              style={{ height: 24, padding: '0 8px', fontSize: 11 }}
            >
              Preview
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconDownload size={11} stroke={1.5} />}
              onClick={() => onExport(asset.id)}
              style={{ marginLeft: 'auto', height: 24, padding: '0 8px', fontSize: 11 }}
            >
              Export
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Tooltip>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

// Map content metadata indices to asset type IDs
const CONTENT_META_TO_ASSET = {
  0: 'article',      // Vanguard Insights Article
  1: 'email',        // Email — Historical Angle
  2: 'email',        // Email — Allocation Angle
  3: 'portal',       // Portal Deep-Dive Package
  4: 'pdf',          // Marketing Lab Co-Brandable PDF
  5: 'wholesaler',   // Wholesaler Intelligence Brief
  6: 'portal',       // Portal Push Notification
  7: 'wholesaler',   // Analyst Call-In Script (Tier 1, goes with wholesaler)
  8: 'linkedin',     // LinkedIn Social Snippet
  9: 'podcast',      // Podcast Episode Script
  10: 'guide',       // Client Conversation Guide
  11: 'video',       // Market Context Video
}

export default function ContentGenerationPanel({ step, workflowState, onContinue, activeUseCase }) {
  const pd = step.panelData || {}
  const GENERATING_LINES = pd.generatingLines || DEFAULT_GENERATING_LINES
  const [phase, setPhase] = useState('generating')
  const [lineIndex, setLineIndex] = useState(0)
  const [expandedAsset, setExpandedAsset] = useState(null)
  const [exportAsset, setExportAsset] = useState(null)

  // Show all asset types from panelData — upstream channel config is context, not a filter
  const filteredAssets = pd.assetTypes || []
  const filteredVariantCount = filteredAssets.reduce((sum, a) => sum + (a.count || 0), 0)

  useEffect(() => {
    if (phase !== 'generating') return
    const interval = setInterval(() => {
      setLineIndex(l => {
        if (l >= GENERATING_LINES.length - 1) {
          clearInterval(interval)
          setTimeout(() => setPhase('complete'), 400)
          return l
        }
        return l + 1
      })
    }, 350)
    return () => clearInterval(interval)
  }, [phase])

  const handleExport = (assetId) => {
    setExportAsset(assetId)
  }

  // Print helper — hides everything except the target content, prints the current page
  // This preserves all Mantine styles, CSS variables, and loaded images
  const printContent = (selector) => {
    const style = document.createElement('style')
    style.id = 'print-isolation'
    style.textContent = `
      @media print {
        body > *, body > * > *, header, nav, [class*="AppShell"] > *:not(main),
        [class*="mantine-AppShell-navbar"], [class*="mantine-AppShell-header"] { display: none !important; }
        [data-print-target] { display: block !important; position: fixed !important; top: 0; left: 0; width: 100%; z-index: 99999; background: white; padding: 24px; }
        [data-print-target] * { overflow: visible !important; max-height: none !important; }
      }
    `
    const el = document.querySelector(selector)
    if (!el) { window.print(); return }
    el.setAttribute('data-print-target', '')
    document.head.appendChild(style)
    window.print()
    // Cleanup after print dialog closes
    setTimeout(() => {
      el.removeAttribute('data-print-target')
      style.remove()
    }, 500)
  }

  const handleDirectExport = (assetId) => {
    // Open the preview modal briefly so content renders, then print
    setExportAsset(assetId)
    setTimeout(() => printContent('[data-export-content]'), 400)
  }

  const handlePrint = () => {
    printContent('[data-export-content]')
  }

  if (phase === 'generating') {
    return (
      <Paper withBorder p="xl" radius="md">
        <Stack align="center" gap="lg" py="xl">
          <Loader size="lg" color="blue" />
          <Stack gap="xs" align="center">
            <Text size="sm" fw={600}>Content Architect generating {pd.totalOutputs || filteredVariantCount || '…'} outputs for this scenario…</Text>
            {GENERATING_LINES.slice(0, lineIndex + 1).map((line, i) => (
              <Group key={i} gap="xs">
                {i < lineIndex
                  ? <ThemeIcon size="xs" color="green" radius="xl" variant="filled"><IconCheck size={8} /></ThemeIcon>
                  : <Loader size="xs" color="blue" />
                }
                <Text size="xs" c={i < lineIndex ? 'teal' : 'dimmed'}>{line}</Text>
              </Group>
            ))}
          </Stack>
          <Progress value={(lineIndex / (GENERATING_LINES.length - 1)) * 100} color="blue" size="sm" w={300} animated />
        </Stack>
      </Paper>
    )
  }

  const previewFallback = (title) => (
    <Paper p="xl" withBorder radius="md">
      <Stack align="center" gap="sm">
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <IconPackage size={22} stroke={1.5} />
        </ThemeIcon>
        <Text size="sm" fw={600}>{title}</Text>
        <Text size="xs" c="dimmed" ta="center" maw={420}>
          Preview rendering for this asset is generated from the produced asset record. Use Export to retrieve the file.
        </Text>
      </Stack>
    </Paper>
  )

  const renderPreview = (assetId) => {
    switch (assetId) {
      case 'article':       return pd.articlePreview ? <ArticlePreview data={pd.articlePreview} /> : previewFallback('Article preview')
      case 'email':         return pd.emailPreview ? <EmailFullPreview data={pd.emailPreview} overrideText={workflowState.overrideText} /> : previewFallback('Email preview')
      case 'portal':        return <PortalPreview />
      case 'pdf':           return <PDFPreview />
      case 'wholesaler':    return <WholesalerPreview overrideText={workflowState.overrideText} />
      case 'linkedin':      return <LinkedInPreview />
      case 'podcast':       return <PodcastPreview />
      case 'guide':         return <GuidePreview />
      case 'video':         return <VideoPreview />
      case 'roi-sheet':     return <ROISheetPreview data={pd.roiSheetPreview} />
      case 'erisa-notice':  return <ERISANoticePreview data={pd.erisaNoticePreview} />
      default:              return previewFallback('Asset preview')
    }
  }

  const assetName = pd.assetTypes.find(a => a.id === exportAsset)?.name
  const guide = pd.panelGuide

  return (
    <Stack gap="md">
      {guide && <PanelGuide {...guide} />}
      {/* Export modal */}
      <Modal
        opened={exportAsset !== null}
        onClose={() => setExportAsset(null)}
        title={
          <Group gap="xs">
            <Text fw={700}>{assetName}</Text>
            <Badge size="xs" variant="light" color="vanguardRed">Export</Badge>
          </Group>
        }
        size="xl"
      >
        <ScrollArea h="70vh" type="auto">
          <Stack gap="md" pr="xs">
            <div data-export-content>
              {exportAsset && renderPreview(exportAsset)}
            </div>
            <Divider />
            <Group justify="flex-end" gap="xs">
              <Button variant="subtle" color="gray" onClick={() => setExportAsset(null)}>Close</Button>
              <Button
                variant="filled"
                color="vanguardRed"
                leftSection={<IconDownload size={14} stroke={1.5} />}
                onClick={handlePrint}
              >
                Print / Save as PDF
              </Button>
            </Group>
          </Stack>
        </ScrollArea>
      </Modal>

      {/* Header */}
      <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-green-light)' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon size={40} radius="xl" color="green" variant="filled">
              <IconCheck size={20} stroke={2} />
            </ThemeIcon>
            <Stack gap={2}>
              <Group gap="xs">
                <Text size="2xl" fw={900} c="orange">{filteredVariantCount}</Text>
                <Text size="sm" fw={600} style={{ alignSelf: 'center' }}>variants generated</Text>
              </Group>
              <Text size="xs" c="dimmed">{pd.model}</Text>
            </Stack>
          </Group>
          <Stack gap={4} align="flex-end">
            <Badge size="sm" color="green" variant="filled">Approved</Badge>
            {workflowState.overrideText && (
              <Badge size="xs" color="yellow" variant="light">
                Override: {workflowState.overrideText.slice(0, 40)}{workflowState.overrideText.length > 40 ? '…' : ''}
              </Badge>
            )}
          </Stack>
        </Group>
      </Paper>

      {/* Asset tile grid */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPreview={(id) => handleExport(id)}
            onExport={(id) => handleDirectExport(id)}
          />
        ))}
      </SimpleGrid>

      {/* Content variants by segment */}
      {pd.segmentVariants && (
        <Paper withBorder p="md" radius="md">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: '0.05em' }}>Content variants by audience segment</Text>
          <Table striped highlightOnHover fz="xs" verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Segment</Table.Th>
                <Table.Th>Channel</Table.Th>
                <Table.Th>Variant A</Table.Th>
                <Table.Th>Variant B</Table.Th>
                <Table.Th style={{ width: 70, textAlign: 'center' }}>Count</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pd.segmentVariants.map((sv) => (
                <Table.Tr key={sv.id}>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <div style={{ width: 3, height: 24, borderRadius: 2, background: `var(--mantine-color-${sv.color}-5)`, flexShrink: 0 }} />
                      <Text size="xs" fw={600}>{sv.label}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td><Badge size="xs" variant="light" color={sv.color}>{sv.channel}</Badge></Table.Td>
                  <Table.Td><Text size="xs" fs="italic">{sv.variantA}</Text></Table.Td>
                  <Table.Td><Text size="xs" fs="italic">{sv.variantB}</Text></Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}><Badge size="xs" variant="outline" color="gray">{sv.variants}</Badge></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      {/* Tier-specific content breakdown */}
      {pd.tierBreakdown && (
        <Paper withBorder p="md" radius="md">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="sm" style={{ letterSpacing: '0.05em' }}>Content by participant tier</Text>
          <SimpleGrid cols={{ base: 1, md: pd.tierBreakdown.length }} spacing="sm">
            {pd.tierBreakdown.map((tier, i) => (
              <Paper key={i} withBorder p="sm" radius="md" style={{ borderLeft: `3px solid var(--mantine-color-${tier.color || 'gray'}-5)` }}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Badge size="xs" color={tier.color || 'gray'} variant="filled">{tier.label}</Badge>
                    <Text size="xs" c="dimmed">{tier.count?.toLocaleString()} participants</Text>
                  </Group>
                  <Text size="xs" fw={600}>{tier.tone}</Text>
                  <Stack gap={4}>
                    {(tier.contentTypes || []).map((ct, j) => (
                      <Group key={j} gap={4} wrap="nowrap">
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: `var(--mantine-color-${tier.color || 'gray'}-5)`, flexShrink: 0, marginTop: 6 }} />
                        <Text size="xs" c="dimmed">{ct}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      )}

      <Button
        size="md"
        variant="gradient"
        gradient={{ from: '#96151D', to: '#D92B36', deg: 135 }}
        rightSection={<IconChevronRight size={16} stroke={2} />}
        onClick={onContinue}
        styles={{ root: { boxShadow: '0 4px 14px rgba(150, 21, 29, 0.35)' } }}
        style={{ alignSelf: 'flex-end' }}
      >
        Run Clearance
      </Button>
    </Stack>
  )
}

// Named exports for reuse in other panels (e.g., See Sample modal)
export { ArticlePreview, EmailFullPreview, WholesalerPreview, PortalPreview, PDFPreview, LinkedInPreview, PodcastPreview, GuidePreview }
