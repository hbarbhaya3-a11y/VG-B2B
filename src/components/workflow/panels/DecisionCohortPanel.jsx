import { Paper, Stack, Group, Text, Badge, SimpleGrid, Button, ThemeIcon, Divider, Alert, Textarea } from '@mantine/core'
import { IconCheck, IconChevronRight, IconShieldCheck, IconUserCheck, IconInfoCircle } from '@tabler/icons-react'
import { getPlanDesign } from '../../../data/planDesign'
import { buildPlanRecommendation } from '../../../utils/planNarrative'

/**
 * DecisionCohortPanel — approval gate, scenario-scoped (no VIX hardcoding).
 * Contract (step.panelData.decision):
 *   {
 *     selectedScenario: { id, name, summary, predictedLabel, confidence },  // optional — falls back to workflowState
 *     doNothingBaseline: { label, value, description },                     // required to show delta
 *     deltaCallouts: [ { label, treatment, baseline, delta } ],             // optional
 *     fiduciaryChecks: [ { label, status: 'pass'|'flag', note? } ],         // optional
 *     rationale: string,                                                    // required — why this scenario was chosen
 *     defaultOverride?: string,
 *   }
 * Also reads workflowState.selectedScenarioId + workflowState.overrideText to stay in sync with SimulationCohortPanel.
 */

function StatusDot({ status }) {
  const color = status === 'pass' ? 'teal' : status === 'flag' ? 'orange' : 'red'
  return (
    <ThemeIcon size="xs" radius="xl" variant="filled" color={color}>
      <IconCheck size={8} stroke={2.4} />
    </ThemeIcon>
  )
}

// Build live deltas (treatment vs baseline) from the selectedConfig outcomes
// applied in step 2 against the baseline plan KPIs from data/planDesign.
function buildLiveDeltas(out, base) {
  if (!out || !base) return null
  const dPart = (out.participationRate - base.participationRate) * 100
  const dDef = (out.avgDeferralRate - base.avgDeferralRate) * 100
  const dCost = (out.annualSponsorCost - base.annualSponsorCost) / 1_000_000
  const fmtSign = (v, suffix) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}${suffix}`
  const fmtCostDelta = (v) => `${v >= 0 ? '+' : '−'}$${Math.abs(v).toFixed(1)}M`
  const adpDelta = base.adpTestStatus !== 'pass' && out.adpTestStatus === 'pass'
    ? 'resolved'
    : (out.adpTestStatus === base.adpTestStatus ? '— unchanged' : `${base.adpTestStatus} → ${out.adpTestStatus}`)
  const tierDelta = out.competitiveTier === base.competitiveTier
    ? '— unchanged'
    : `${base.competitiveTier} → ${out.competitiveTier}`
  return [
    { label: 'Participation rate', treatment: `${Math.round(out.participationRate * 100)}%`, baseline: `${Math.round(base.participationRate * 100)}%`, delta: fmtSign(dPart, 'pp') },
    { label: 'Avg deferral',       treatment: `${(out.avgDeferralRate * 100).toFixed(1)}%`,    baseline: `${(base.avgDeferralRate * 100).toFixed(1)}%`,    delta: fmtSign(dDef, 'pp') },
    { label: 'Annual sponsor cost', treatment: `$${(out.annualSponsorCost / 1_000_000).toFixed(1)}M`, baseline: `$${(base.annualSponsorCost / 1_000_000).toFixed(1)}M`, delta: fmtCostDelta(dCost) },
    { label: 'ADP test status',     treatment: out.adpTestStatus.toUpperCase(),     baseline: base.adpTestStatus.toUpperCase(),     delta: adpDelta },
    { label: 'Competitive tier',    treatment: out.competitiveTier,                 baseline: base.competitiveTier,                 delta: tierDelta },
    { label: 'Fiduciary risk',      treatment: `${out.fiduciaryLiabilityScore}/100`, baseline: `${base.fiduciaryLiabilityScore}/100`, delta: fmtSign(out.fiduciaryLiabilityScore - base.fiduciaryLiabilityScore, ' pts') },
  ]
}

export default function DecisionCohortPanel({ step, onApprove, workflowState, setWorkflowState, activeUseCase }) {
  const pd = step?.panelData?.decision || {}
  const selSim = step?.panelData?.simulation?.scenarios
  const workflowSelId = workflowState?.selectedScenarioId

  // ── Plan-design live path: when step 2 produced a selectedConfig, derive the
  //    selected scenario and delta callouts from it so the Committee Gate
  //    actually reflects what the user applied. Falls back to panelData
  //    otherwise (preserves UC-A / UC-B etc).
  const liveConfig = workflowState?.selectedConfig
  const planDesignId = step?.panelData?.planDesignId
    || activeUseCase?.steps?.find?.((s) => s?.panelData?.planDesignId)?.panelData?.planDesignId
  const baseline = planDesignId ? getPlanDesign(planDesignId) : null
  const isLivePlanDesign = !!(liveConfig && baseline)

  let liveSelected = null
  let liveDeltas = null
  let liveDoNothing = null
  let liveRecommendation = null

  if (isLivePlanDesign) {
    const o = liveConfig.outcomes
    liveSelected = {
      id: 'live',
      name: liveConfig.label || 'Selected configuration',
      description: liveConfig.rationale || 'Configuration selected from step 2 (Plan Design Optimizer).',
      predictedLabel: `${Math.round(o.participationRate * 100)}% participation`,
      predictedValue: o.participationRate,
      // High canonical confidence — the deterministic optimizer is fully scored.
      confidence: 0.93,
    }
    liveDeltas = buildLiveDeltas(o, baseline.currentKpis)
    liveDoNothing = {
      label: 'Keep current plan design',
      value: `${Math.round(baseline.currentKpis.participationRate * 100)}% participation`,
      description: `Current ${baseline.planName} retained as-is. Participation ${Math.round(baseline.currentKpis.participationRate * 100)}%, avg deferral ${(baseline.currentKpis.avgDeferralRate * 100).toFixed(1)}%, annual sponsor cost $${(baseline.currentKpis.annualSponsorCost / 1_000_000).toFixed(1)}M, ADP ${baseline.currentKpis.adpTestStatus}, competitive tier ${baseline.currentKpis.competitiveTier}.`,
    }
    liveRecommendation = buildPlanRecommendation({ baseline, selected: liveConfig })
  }

  const selected = liveSelected
    || pd.selectedScenario
    || (selSim && (selSim.find(s => s.id === workflowSelId) || selSim.find(s => s.recommended) || selSim[0]))
    || null

  const doNothing = liveDoNothing
    || pd.doNothingBaseline
    || { label: 'Do nothing', value: '—', description: 'Counterfactual baseline against which the selected scenario is measured.' }

  const deltas = liveDeltas || pd.deltaCallouts || []
  const checks = pd.fiduciaryChecks || []
  const rationale = liveRecommendation?.summary
    || pd.rationale
    || 'Decision Owner approves the selected scenario based on the simulation output and compliance pre-check.'

  // Auto-fill the override textarea from the live recommendation summary so
  // the committee sees the rationale that matches the applied configuration.
  const overrideText = workflowState?.overrideText
    || (isLivePlanDesign ? (liveRecommendation?.summary || pd.defaultOverride || '') : (pd.defaultOverride ?? ''))

  return (
    <Stack gap="md">
      <Alert color="yellow" variant="light" icon={<IconUserCheck size={16} />} radius="md">
        <Group justify="space-between" wrap="nowrap" align="center">
          <Stack gap={0}>
            <Text size="sm" fw={700}>Human approval required</Text>
            <Text size="xs" c="dimmed">
              Decision Owner reviews the selected scenario against the do-nothing baseline. Compliance checks are applied per the platform's fiduciary framework.
            </Text>
          </Stack>
          <Badge size="sm" color="yellow" variant="filled">Gate</Badge>
        </Group>
      </Alert>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Selected scenario */}
        <Paper withBorder p="md" radius="md"
          style={{ borderLeft: '3px solid var(--mantine-color-teal-6)', background: 'linear-gradient(135deg, var(--mantine-color-teal-light), transparent 85%)' }}>
          <Stack gap="xs">
            <Group justify="space-between">
              <Badge size="sm" variant="filled" color="teal">
                {selected ? `Scenario ${selected.id}` : 'Selected'}
              </Badge>
              <Badge size="xs" variant="light" color="teal">Recommended</Badge>
            </Group>
            <Text fw={700} size="sm">{selected?.name || 'Selected scenario'}</Text>
            <Text size="xs" c="dimmed" lineClamp={4}>
              {selected?.description || selected?.summary || 'The simulation-recommended response for this signal.'}
            </Text>
            <Divider variant="dashed" />
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Predicted</Text>
                <Text size="xl" fw={800} c="teal.7" lh={1}>
                  {selected?.predictedLabel || (selected?.predictedValue ? `${Math.round(selected.predictedValue * 100)}%` : '—')}
                </Text>
              </Stack>
              <Stack gap={0} align="flex-end">
                <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Confidence</Text>
                <Text size="sm" fw={700}>{selected?.confidence ? `${Math.round(selected.confidence * 100)}%` : '—'}</Text>
              </Stack>
            </Group>
          </Stack>
        </Paper>

        {/* Do-nothing baseline */}
        <Paper withBorder p="md" radius="md"
          style={{ borderLeft: '3px solid var(--mantine-color-gray-5)', background: 'var(--mantine-color-gray-0)' }}>
          <Stack gap="xs">
            <Badge size="sm" variant="light" color="gray">Counterfactual</Badge>
            <Text fw={700} size="sm">{doNothing.label}</Text>
            <Text size="xs" c="dimmed" lineClamp={4}>{doNothing.description}</Text>
            <Divider variant="dashed" />
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>Baseline</Text>
                <Text size="xl" fw={800} c="dark.5" lh={1}>{doNothing.value}</Text>
              </Stack>
              <Text size="xs" c="dimmed">Holdout-anchored</Text>
            </Group>
          </Stack>
        </Paper>
      </SimpleGrid>

      {/* What changed — only renders for the plan-design live path */}
      {isLivePlanDesign && liveRecommendation?.changedParameters?.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb="xs">
            <ThemeIcon size="sm" radius="xl" variant="light" color="vanguardRed"><IconCheck size={12} /></ThemeIcon>
            <Text fw={700} size="sm">Applied configuration — parameter changes</Text>
          </Group>
          <Stack gap={4}>
            {liveRecommendation.changedParameters.map((c, i) => (
              <Group key={i} gap={6} wrap="nowrap" align="baseline">
                <Text size="11px" fw={700} w={150}>{c.parameter}</Text>
                <Text size="11px" c="dimmed">{c.from}</Text>
                <IconChevronRight size={10} stroke={1.5} style={{ opacity: 0.5 }} />
                <Text size="11px" fw={600} c="vanguardRed">{c.to}</Text>
              </Group>
            ))}
          </Stack>
        </Paper>
      )}

      {deltas.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Text fw={700} size="sm" mb="xs">{isLivePlanDesign ? 'Projected outcomes vs current plan' : 'Key deltas vs. baseline'}</Text>
          <SimpleGrid cols={{ base: 2, md: deltas.length >= 6 ? 3 : 4 }} spacing="sm">
            {deltas.map(d => {
              const negative = typeof d.delta === 'string' && (d.delta.startsWith('-') || d.delta.startsWith('−') || d.delta.includes('worse'))
              const neutral = typeof d.delta === 'string' && (d.delta.includes('unchanged') || d.delta === '— unchanged')
              return (
                <Stack key={d.label} gap={0}>
                  <Text size="10px" c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>{d.label}</Text>
                  <Group gap={6} align="baseline">
                    <Text size="md" fw={700}>{d.treatment}</Text>
                    <Text size="xs" c="dimmed">vs {d.baseline}</Text>
                  </Group>
                  <Text size="xs" fw={700} c={neutral ? 'dimmed' : negative ? 'orange.7' : 'teal.7'}>{d.delta}</Text>
                </Stack>
              )
            })}
          </SimpleGrid>
        </Paper>
      )}

      {checks.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Group gap="xs" mb="xs">
            <ThemeIcon size="sm" radius="xl" variant="light" color="teal"><IconShieldCheck size={12} /></ThemeIcon>
            <Text fw={700} size="sm">Fiduciary pre-check</Text>
          </Group>
          <Stack gap={4}>
            {checks.map(c => (
              <Group key={c.label} gap="sm" wrap="nowrap">
                <StatusDot status={c.status} />
                <Text size="xs" fw={600}>{c.label}</Text>
                {c.note && <Text size="xs" c="dimmed">· {c.note}</Text>}
              </Group>
            ))}
          </Stack>
        </Paper>
      )}

      <Paper withBorder p="md" radius="md">
        <Stack gap="xs">
          <Group gap="xs">
            <IconInfoCircle size={14} style={{ color: 'var(--mantine-color-gray-6)' }} />
            <Text size="xs" c="dimmed">Rationale (editable before deployment)</Text>
          </Group>
          <Textarea
            minRows={3} autosize
            value={overrideText}
            onChange={(e) => setWorkflowState?.(s => ({ ...s, overrideText: e.currentTarget.value }))}
            placeholder={rationale}
            styles={{ input: { fontSize: 12 } }}
          />
        </Stack>
      </Paper>

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">{rationale}</Text>
        <Button
          color="teal"
          leftSection={<IconCheck size={14} />}
          rightSection={<IconChevronRight size={14} />}
          onClick={() => onApprove?.(overrideText)}
        >
          Approve &amp; continue
        </Button>
      </Group>
    </Stack>
  )
}
