import { useState } from 'react'
import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider, Alert } from '@mantine/core'
import {
  IconChevronRight, IconCheck, IconAlertTriangle,
  IconHome, IconBuildingBank, IconRoute2, IconCoin, IconShieldCheck, IconUsers
} from '@tabler/icons-react'

// ── Three tier representatives (one per balance tier) ──────────────────────
const TIER_REPS = [
  {
    tier: 1, label: 'Tier 1 — High ($100K+)', color: 'teal', count: 1800, avgBalance: '$318K',
    angle: 'Detailed comparator + specialist consult',
    rep: { participantName: 'Priya Gupta', age: 58, balance: 318_000, employer: 'Aurora Aerospace', yearsToRetirement: 7 },
  },
  {
    tier: 2, label: 'Tier 2 — Mid ($20–100K)', color: 'blue', count: 4200, avgBalance: '$48K',
    angle: 'Simplified comparator + decision guide',
    rep: { participantName: 'Marcus Chen', age: 44, balance: 48_000, employer: 'Helix Biotech', yearsToRetirement: 21 },
  },
  {
    tier: 3, label: 'Tier 3 — Low (<$20K)', color: 'violet', count: 2400, avgBalance: '$12K',
    angle: 'Anti-cash-out emphasis + rollover path',
    rep: { participantName: 'Nina Okoye', age: 32, balance: 12_000, employer: 'Northstar Retail', yearsToRetirement: 33 },
  },
]

function buildOptions(i) {
  const base = i.balance
  return [
    {
      id: 'stay', label: 'Stay in plan', icon: IconHome, color: 'gray',
      headline: `$${Math.round(base * 0.045 / 12).toLocaleString()}/mo`,
      subline: 'Projected retirement income',
      badge: 'Default', badgeColor: 'gray',
      bullets: [
        { k: 'Fees', v: '0.04% (institutional)' },
        { k: 'Investment menu', v: '24 funds incl. TDFs' },
        { k: 'Advice', v: 'Plan-level only' },
        { k: 'Tax / penalty', v: 'None' },
      ],
      note: 'Continues institutional share-class pricing. No action required.',
    },
    {
      id: 'new', label: 'Roll to new employer', icon: IconBuildingBank, color: 'blue',
      headline: `$${Math.round(base * 0.039 / 12).toLocaleString()}/mo`,
      subline: 'Projected retirement income',
      badge: null,
      bullets: [
        { k: 'Fees', v: '0.22% (typical)' },
        { k: 'Investment menu', v: '12 funds — limited TDFs' },
        { k: 'Advice', v: 'Depends on new plan' },
        { k: 'Tax / penalty', v: 'None if direct' },
      ],
      note: 'Subject to new plan quality. Higher-fee share class typical.',
    },
    {
      id: 'ira', label: 'Roll to IRA', icon: IconRoute2, color: 'teal',
      headline: `$${Math.round(base * 0.048 / 12).toLocaleString()}/mo`,
      subline: 'Projected retirement income',
      badge: null, badgeColor: 'teal',
      bullets: [
        { k: 'Fees', v: '0.06% (full universe)' },
        { k: 'Investment menu', v: 'Full universe + optional advice' },
        { k: 'Advice', v: 'Optional personal advice' },
        { k: 'Tax / penalty', v: 'None if direct' },
      ],
      note: 'Full control, lowest aggregate cost, optional advice relationship.',
    },
    {
      id: 'cash', label: 'Cash out', icon: IconCoin, color: 'red',
      headline: `-$${Math.round(base * 0.32).toLocaleString()}`,
      subline: 'Immediate tax + 10% penalty',
      badge: 'Caution', badgeColor: 'red',
      bullets: [
        { k: 'Immediate hit', v: `$${Math.round(base * 0.32).toLocaleString()}` },
        { k: '30-year income lost', v: `~$${Math.round(base * 4.2).toLocaleString()}` },
        { k: 'Lifestyle cost', v: `$${Math.round(base * 0.013).toLocaleString()}/mo surrendered` },
        { k: 'Recoverable', v: 'No — cannot reverse' },
      ],
      note: 'Education framing only. Participant always decides.',
    },
  ]
}

function OptionCard({ option, isDanger }) {
  const Icon = option.icon
  return (
    <Paper
      withBorder radius="md" p="md"
      style={{
        borderLeft: `3px solid var(--mantine-color-${option.color}-6)`,
        background: isDanger ? 'var(--mantine-color-red-light)' : 'white',
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" wrap="nowrap" align="center">
            <ThemeIcon size={28} radius="md" variant="light" color={option.color}>
              <Icon size={16} stroke={1.6} />
            </ThemeIcon>
            <Text size="sm" fw={700}>{option.label}</Text>
          </Group>
          {option.badge && <Badge size="xs" variant="filled" color={option.badgeColor}>{option.badge}</Badge>}
        </Group>

        <Stack gap={0}>
          <Text size="xl" fw={800} c={option.color}>{option.headline}</Text>
          <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>{option.subline}</Text>
        </Stack>

        <Divider variant="dashed" />

        <Stack gap={4}>
          {option.bullets.map(b => (
            <Group key={b.k} justify="space-between" align="flex-start" wrap="nowrap">
              <Text size="11px" c="dimmed">{b.k}</Text>
              <Text size="11px" fw={600} ta="right" style={{ flex: 1, marginLeft: 8 }}>{b.v}</Text>
            </Group>
          ))}
        </Stack>

        <Text size="10px" c="dimmed" mt={4} lh={1.4}>{option.note}</Text>
      </Stack>
    </Paper>
  )
}

export default function RolloverComparePanel({ step, onContinue, activeUseCase }) {
  // Read tier reps from panelData if provided, else use defaults
  const pdTiers = step?.panelData?.tierRepresentatives || TIER_REPS
  const totalComparators = step?.panelData?.totalComparators || 8400

  const [activeTier, setActiveTier] = useState(0)
  const current = pdTiers[activeTier]
  const inputs = current.rep
  const options = buildOptions(inputs)

  return (
    <Stack gap="md">
      {/* Cohort context strip — tier selector */}
      <Paper withBorder p="sm" radius="md" style={{ background: 'var(--mantine-color-gray-0)' }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <IconUsers size={16} style={{ color: 'var(--mantine-color-gray-6)', flexShrink: 0 }} />
            <Text size="xs" fw={700}>Select a balance tier to preview:</Text>
          </Group>
          <Badge size="sm" variant="light" color="blue">{totalComparators.toLocaleString()} personalized comparators</Badge>
        </Group>
        <SimpleGrid cols={3} spacing="sm" mt="sm">
          {pdTiers.map((t, idx) => (
            <Paper
              key={t.tier}
              withBorder radius="md" p="sm"
              onClick={() => setActiveTier(idx)}
              style={{
                cursor: 'pointer',
                borderLeft: `3px solid var(--mantine-color-${t.color}-6)`,
                background: activeTier === idx
                  ? `linear-gradient(135deg, var(--mantine-color-${t.color}-light), transparent 85%)`
                  : 'white',
                boxShadow: activeTier === idx ? `0 0 0 2px var(--mantine-color-${t.color}-4)` : 'none',
                transition: 'all 200ms ease',
              }}
            >
              <Group justify="space-between" align="center" mb={4}>
                <Badge size="xs" variant={activeTier === idx ? 'filled' : 'light'} color={t.color}>
                  Tier {t.tier}
                </Badge>
                <Text size="xs" fw={700}>{t.count.toLocaleString()}</Text>
              </Group>
              <Text size="xs" fw={600}>{t.label}</Text>
              <Text size="10px" c="dimmed">Avg balance {t.avgBalance} · {t.angle}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Paper>

      {/* Active representative header */}
      <Alert color={current.color} variant="light" icon={<IconShieldCheck size={16} />} radius="md">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Stack gap={0}>
            <Text size="sm" fw={700}>
              Showing: {inputs.participantName} — {current.label}
            </Text>
            <Text size="xs" c="dimmed">
              Age {inputs.age} · {inputs.employer} · balance ${inputs.balance.toLocaleString()} · {inputs.yearsToRetirement} years to retirement
            </Text>
          </Stack>
          <Badge size="sm" variant="light" color={current.color}>
            1 of {current.count.toLocaleString()} in this tier
          </Badge>
        </Group>
      </Alert>

      {/* 4-option comparator */}
      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
        {options.map(o => (
          <OptionCard key={o.id} option={o} isDanger={o.id === 'cash'} />
        ))}
      </SimpleGrid>

      {/* Summary */}
      <Paper withBorder p="md" radius="md" style={{ background: 'var(--mantine-color-gray-0)' }}>
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <ThemeIcon size="sm" radius="xl" variant="light" color="teal"><IconCheck size={12} /></ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={700}>Same structure, different numbers for every participant</Text>
            <Text size="xs" c="dimmed">
              All {totalComparators.toLocaleString()} participants see this same 4-option comparison with their own balance, projected income, fees, and tax impact. Click the tier cards above to see how the numbers change across balance tiers. All options presented equally — no preferred path.
            </Text>
          </Stack>
        </Group>
      </Paper>

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          All options presented equally. No solicitation language. ERISA-compliant education framing.
        </Text>
        <Button onClick={onContinue} rightSection={<IconChevronRight size={14} />}>Continue</Button>
      </Group>
    </Stack>
  )
}
