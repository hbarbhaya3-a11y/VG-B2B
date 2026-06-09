import { useMemo, useState } from 'react'
import { Paper, Stack, Group, Text, Badge, ThemeIcon, Button, SimpleGrid, Slider, Box, Divider, Alert } from '@mantine/core'
import { AreaChart } from '@mantine/charts'
import {
  IconChevronRight, IconTrendingUp, IconTrendingDown, IconActivity,
  IconUser, IconInfoCircle, IconSparkles
} from '@tabler/icons-react'

// ── Simple deterministic Monte Carlo projection (client-side, illustrative) ─
// Seeded PRNG so the same participant renders identically across re-mounts.
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function projectRetirement(p, deferralPct, paths = 80) {
  const rng = mulberry32(Math.round((p.balance || 0) + (p.age || 30) * 1e4))
  const mu = 0.065, sigma = 0.14
  const years = Math.max(1, 65 - (p.age || 30))
  const annualContrib = () => (p.salary || 0) * deferralPct + (p.salary || 0) * Math.min(deferralPct, p.matchThreshold || 0.04)

  const trajectories = []
  for (let k = 0; k < paths; k++) {
    let bal = p.balance || 0
    const curve = [{ year: 0, age: p.age, bal }]
    for (let y = 1; y <= years; y++) {
      const r = mu + sigma * (rng() - 0.5) * 2
      bal = bal * (1 + r) + annualContrib()
      curve.push({ year: y, age: p.age + y, bal })
    }
    trajectories.push(curve)
  }
  const fan = []
  for (let y = 0; y <= years; y++) {
    const vals = trajectories.map(t => t[y].bal).sort((a, b) => a - b)
    const q = (pct) => vals[Math.floor(pct * (vals.length - 1))]
    fan.push({
      age: (p.age || 30) + y,
      p50: Math.round(q(0.5)),
      p10: Math.round(q(0.1)),
      p90: Math.round(q(0.9)),
    })
  }
  const finalP50 = fan[fan.length - 1].p50
  return { fan, finalP50, monthlyIncome: Math.round((finalP50 * 0.04) / 12) }
}

// ── Default participant (replaceable via step.panelData.participant) ───────
const DEFAULT_PARTICIPANT = {
  name: 'Maya Okafor',
  age: 34,
  salary: 92_000,
  balance: 112_000,
  employer: 'Aurora Aerospace',
  riskProfile: 'Moderate',
  contributionRate: 0.04,
  matchThreshold: 0.05,
}

export default function FutureSelfAvatarPanel({ step, onContinue, activeUseCase }) {
  const participant = step?.panelData?.participant || DEFAULT_PARTICIPANT
  const [deferral, setDeferral] = useState(Math.round((participant.contributionRate || 0.04) * 100))

  const proj = useMemo(
    () => projectRetirement(participant, deferral / 100),
    [participant, deferral]
  )

  const matchPct = Math.round((participant.matchThreshold || 0.05) * 100)
  const atOrAboveMatch = deferral >= matchPct
  const health = proj.monthlyIncome >= 8500
    ? { label: 'On track', color: 'teal', icon: IconTrendingUp }
    : proj.monthlyIncome >= 5500
      ? { label: 'Monitor', color: 'orange', icon: IconActivity }
      : { label: 'At risk', color: 'red', icon: IconTrendingDown }
  const HealthIcon = health.icon

  return (
    <Stack gap="md">
      <Alert color="teal" variant="light" icon={<IconSparkles size={16} />} radius="md">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Text size="sm" fw={600}>Future Self twin — continuous retirement projection</Text>
          <Badge size="sm" variant="light" color="teal">Monte Carlo projection · continuous</Badge>
        </Group>
      </Alert>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {/* Avatar card */}
        <Paper withBorder p="lg" radius="md"
          style={{ background: `linear-gradient(135deg, var(--mantine-color-${health.color}-light), transparent 80%)` }}>
          <Stack align="center" gap="xs">
            <Box style={{
              width: 84, height: 84, borderRadius: '50%',
              background: `var(--mantine-color-${health.color}-6)`,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700,
              boxShadow: `0 6px 24px var(--mantine-color-${health.color}-3)`,
            }}>
              {(participant.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Box>
            <Text fw={700} size="md">{participant.name} @ 65</Text>
            <Text size="xs" c="dimmed">Age today {participant.age} · {participant.employer}</Text>
            <Group gap={4} mt={4}>
              <HealthIcon size={14} color={`var(--mantine-color-${health.color}-7)`} />
              <Text size="sm" fw={700} c={health.color}>{health.label}</Text>
            </Group>
            <Divider w="100%" my={4} />
            <Stack gap={2} align="center">
              <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>Projected monthly income</Text>
              <Text size="xl" fw={800} c={health.color}>${proj.monthlyIncome.toLocaleString()}/mo</Text>
              <Text size="10px" c="dimmed">P50 balance at 65: ${Math.round(proj.finalP50 / 1000)}k</Text>
            </Stack>
          </Stack>
        </Paper>

        {/* Fan chart */}
        <Paper withBorder p="md" radius="md" style={{ gridColumn: 'span 2' }}>
          <Stack gap={6}>
            <Group justify="space-between" align="center">
              <Text fw={700} size="sm">Trajectory to age 65</Text>
              <Text size="xs" c="dimmed">P10 / P50 / P90 confidence bands</Text>
            </Group>
            <AreaChart
              h={220}
              data={proj.fan}
              dataKey="age"
              withGradient
              withDots={false}
              tickLine="x"
              series={[
                { name: 'p90', label: 'Optimistic (P90)', color: 'teal.4' },
                { name: 'p50', label: 'Median (P50)',    color: 'teal.7' },
                { name: 'p10', label: 'Conservative (P10)', color: 'teal.2' },
              ]}
              curveType="monotone"
              valueFormatter={(v) => `$${Math.round(v / 1000)}k`}
            />
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* Interactive slider */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon size="sm" radius="xl" variant="light" color="teal"><IconUser size={12} /></ThemeIcon>
              <Text fw={700} size="sm">Contribution slider</Text>
              <Badge size="xs" variant="light" color={atOrAboveMatch ? 'teal' : 'orange'}>
                {atOrAboveMatch ? 'Full match captured' : `${matchPct - deferral}pp below match`}
              </Badge>
            </Group>
            <Text size="sm" fw={700} c="teal.7">
              {deferral}% deferral · ${proj.monthlyIncome.toLocaleString()}/mo projected
            </Text>
          </Group>
          <Slider
            value={deferral}
            onChange={setDeferral}
            min={1} max={20} step={0.5}
            marks={[
              { value: 1,  label: '1%' },
              { value: matchPct, label: `Match: ${matchPct}%` },
              { value: 10, label: '10%' },
              { value: 15, label: '15%' },
              { value: 20, label: '20%' },
            ]}
            color={atOrAboveMatch ? 'teal' : 'orange'}
            size="md"
            styles={{ markLabel: { fontSize: 10 } }}
          />
          <Text size="xs" c="dimmed">
            Drag the slider to see how contribution changes affect the projection. One-tap apply is available in the participant app.
          </Text>
        </Stack>
      </Paper>

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          <IconInfoCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Projection based on stochastic modeling across multiple macro scenarios.
        </Text>
        <Button onClick={onContinue} rightSection={<IconChevronRight size={14} />}>Continue</Button>
      </Group>
    </Stack>
  )
}
