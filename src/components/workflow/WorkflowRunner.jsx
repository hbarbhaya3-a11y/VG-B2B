import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Paper, Group, Text, Badge, ActionIcon, Divider, ScrollArea, Stack,
  ThemeIcon, Box, Tooltip, Transition
} from '@mantine/core'
import {
  IconX, IconRobot, IconUserCheck, IconChevronLeft, IconChevronRight,
  IconRadar, IconBrain, IconPencil, IconChartBar, IconShield, IconRoute, IconActivity
} from '@tabler/icons-react'
import { useUseCase } from '../../contexts/UseCaseContext'
import { agentScripts } from '../../data/agentScripts'

import AgentChatPanel from './AgentChatPanel'
import SignalDetectionPanel from './panels/SignalDetectionPanel'
import AdvisorTargetingPanel from './panels/AdvisorTargetingPanel'
import ContentChannelConfigPanel from './panels/ContentChannelConfigPanel'
import SimulationPanel from './panels/SimulationPanel'
import DecisionApprovalPanel from './panels/DecisionApprovalPanel'
import ContentGenerationPanel from './panels/ContentGenerationPanel'
import CompliancePanel from './panels/CompliancePanel'
import DeploymentPanel from './panels/DeploymentPanel'
import AttributionPanel from './panels/AttributionPanel'
import PlaceholderPanel from './panels/PlaceholderPanel'
import FutureSelfAvatarPanel from './panels/FutureSelfAvatarPanel'
import RolloverComparePanel from './panels/RolloverComparePanel'
import PlanDesignParetoPanel from './panels/PlanDesignParetoPanel'
import WorkforceStressPanel from './panels/WorkforceStressPanel'
import SimulationCohortPanel from './panels/SimulationCohortPanel'
import DecisionCohortPanel from './panels/DecisionCohortPanel'
import DeploymentCohortPanel from './panels/DeploymentCohortPanel'
import OutcomeCohortPanel from './panels/OutcomeCohortPanel'
import TrialValidationPanel from './panels/TrialValidationPanel'
import ParticipantSegmentationPanel from './panels/ParticipantSegmentationPanel'
import ParticipantChannelConfigPanel from './panels/ParticipantChannelConfigPanel'
import CampaignObjectivePanel from './panels/CampaignObjectivePanel'

const STAGE_COLORS = { SENSE: 'teal', SIMULATE: 'violet', GOVERN: 'red', DEPLOY_LEARN: 'green' }

const AGENT_ICONS = {
  'market-sentinel': IconRadar,
  'context-decoder': IconBrain,
  'content-architect': IconPencil,
  'twinx-simulation': IconChartBar,
  'decision-owner': IconUserCheck,
  'guardrail-guardian': IconShield,
  'journey-executor': IconRoute,
  'learning-system': IconActivity,
}

// Maps a step's `agent` field (string like "Market Sentinel") to a stable
// agent profile so narration works for every scenario — not just the ones
// that have entries in agentScripts.js.
const AGENT_PROFILES_BY_NAME = {
  'Market Sentinel':    { agentId: 'market-sentinel',     color: 'teal'        },
  'Context Decoder':    { agentId: 'context-decoder',     color: 'cyan'        },
  'Content Architect':  { agentId: 'content-architect',   color: 'orange'      },
  'TwinX Simulation':   { agentId: 'twinx-simulation',    color: 'violet'      },
  'Decision Owner':     { agentId: 'decision-owner',      color: 'yellow'      },
  'Guardrail Guardian': { agentId: 'guardrail-guardian',  color: 'red'         },
  'Journey Executor':   { agentId: 'journey-executor',    color: 'green'       },
  'Learning System':    { agentId: 'learning-system',     color: 'grape'       },
  'Participant':        { agentId: 'decision-owner',      color: 'vanguardRed' },
}

// Resolve the agent profile for a step. Prefers an exact name match; falls
// back to agentScripts[panelType]; else returns a generic profile.
function resolveAgentProfile(step) {
  if (!step) return null
  // Some older steps encode multiple agents like "Agent A + Agent B"; pick the first.
  const firstName = (step.agent || '').split(/\s*[+·,]\s*/)[0].trim()
  const profile = AGENT_PROFILES_BY_NAME[firstName]
  if (profile) {
    return {
      agentId: profile.agentId,
      agentName: firstName,
      color: profile.color,
    }
  }
  // Fallback to scripted entry (legacy uc-a / uc-b richness)
  const script = agentScripts[step.panelType]
  if (script) {
    return { agentId: script.agentId, agentName: script.agentName, color: script.color }
  }
  // Generic last-resort profile
  return { agentId: 'market-sentinel', agentName: step.agent || 'Agent', color: 'gray' }
}

// ── Agent Narrator Strip — premium contextual bar above the panel ──
// Reads scenario-scoped narration from the step itself (headline + description)
// so content switches correctly across all 13 scenarios, not just uc-a/uc-b.
// agentScripts[panelType] is used only as an enrichment for the richer uc-a flow.
function AgentNarrator({ step, onAgentClick }) {
  if (!step) return null
  const profile = resolveAgentProfile(step)
  if (!profile) return null

  // Prefer step-level narration (guaranteed scenario-contextual) over the
  // panelType-keyed script (which was hardcoded to uc-a's VIX story).
  const stepNarrative = step.headline || step.description
  const script = agentScripts[step.panelType]
  const scriptNarrative = script
    ? [...(script.messages || [])].reverse().find(m => m.type === 'narrative')?.text
    : null
  // If the step has its own headline/description, that's the source of truth.
  // Only fall back to the script narrative when the step is sparse.
  const narrativeText = stepNarrative || scriptNarrative || step.label || 'Agent working…'

  const Icon = AGENT_ICONS[profile.agentId] || IconRobot

  return (
    <Paper
      radius="md"
      mb="sm"
      p="md"
      onClick={() => onAgentClick?.({ agentId: profile.agentId, agentName: profile.agentName, color: profile.color })}
      style={{
        borderLeft: `4px solid var(--mantine-color-${profile.color}-6)`,
        background: `linear-gradient(135deg, var(--mantine-color-${profile.color}-light), transparent 70%)`,
        boxShadow: `0 2px 12px var(--mantine-color-${profile.color}-1)`,
        border: `1px solid var(--mantine-color-${profile.color}-2)`,
        borderLeftWidth: 4,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Subtle shimmer accent */}
      <Box style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: '100%',
        background: `linear-gradient(90deg, transparent, var(--mantine-color-${profile.color}-1))`,
        opacity: 0.4,
      }} />

      <Group gap="sm" wrap="nowrap" style={{ position: 'relative', zIndex: 1 }}>
        {/* Agent avatar with active ring */}
        <Box style={{ position: 'relative', flexShrink: 0 }}>
          <ThemeIcon
            size={36} radius="xl" variant="gradient"
            gradient={{ from: profile.color, to: profile.color, deg: 135 }}
            style={{ boxShadow: `0 0 0 3px var(--mantine-color-${profile.color}-2), 0 0 12px var(--mantine-color-${profile.color}-3)` }}
          >
            <Icon size={18} stroke={1.5} />
          </ThemeIcon>
          {/* Active pulse dot */}
          <Box style={{
            position: 'absolute', bottom: -1, right: -1, width: 10, height: 10,
            borderRadius: '50%', background: 'var(--mantine-color-green-6)',
            border: '2px solid var(--mantine-color-body)',
          }} />
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap" mb={2}>
            <Text size="sm" fw={700}>{profile.agentName}</Text>
            <Badge size="xs" variant="filled" color={profile.color}>{step.stage}</Badge>
          </Group>
          <Text size="sm" c="dimmed" lineClamp={2} style={{ lineHeight: 1.5 }}>
            {narrativeText}
          </Text>
        </Box>
      </Group>
    </Paper>
  )
}

// ── Handoff Banner — shown briefly when transitioning between agents ──
// Driven by step.agent so it works for every scenario, not just scripted ones.
function HandoffBanner({ fromStep, toStep }) {
  const fromProfile = resolveAgentProfile(fromStep)
  const toProfile = resolveAgentProfile(toStep)
  if (!fromProfile || !toProfile) return null
  if (fromProfile.agentId === toProfile.agentId) return null

  const FromIcon = AGENT_ICONS[fromProfile.agentId] || IconRobot
  const ToIcon = AGENT_ICONS[toProfile.agentId] || IconRobot
  const handoffContext = agentScripts[fromStep?.panelType]?.handoff?.context || fromStep?.label

  return (
    <Paper
      radius="md"
      mb="sm"
      px="md"
      py="xs"
      style={{
        background: `linear-gradient(90deg, var(--mantine-color-${fromProfile.color}-light) 0%, var(--mantine-color-body) 40%, var(--mantine-color-body) 60%, var(--mantine-color-${toProfile.color}-light) 100%)`,
        border: '1px solid var(--mantine-color-default-border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Group gap="md" justify="center">
        <Group gap="xs">
          <ThemeIcon size={20} radius="xl" variant="light" color={fromProfile.color}>
            <FromIcon size={10} stroke={1.5} />
          </ThemeIcon>
          <Text size="xs" fw={700} c={fromProfile.color}>{fromProfile.agentName}</Text>
        </Group>
        <Group gap={2}>
          <Box style={{ width: 16, height: 2, borderRadius: 1, background: `var(--mantine-color-${fromProfile.color}-4)` }} />
          <IconChevronRight size={12} stroke={2} style={{ opacity: 0.5 }} />
          <Box style={{ width: 16, height: 2, borderRadius: 1, background: `var(--mantine-color-${toProfile.color}-4)` }} />
        </Group>
        <Group gap="xs">
          <ThemeIcon size={20} radius="xl" variant="filled" color={toProfile.color}>
            <ToIcon size={10} stroke={1.5} />
          </ThemeIcon>
          <Text size="xs" fw={700} c={toProfile.color}>{toProfile.agentName}</Text>
        </Group>
        {handoffContext && (
          <>
            <Divider orientation="vertical" h={12} style={{ alignSelf: 'center' }} />
            <Text size="xs" c="dimmed" lineClamp={1} style={{ maxWidth: 400 }}>
              {handoffContext}
            </Text>
          </>
        )}
      </Group>
    </Paper>
  )
}

export default function WorkflowRunner({ onExitWorkflow }) {
  const {
    activeUseCase, stepIndex, currentStep, totalSteps,
    isFirst, isLast, isHumanGate, advance, retreat, goToStep, exit, approve,
    autonomyMode, setAutonomyMode, consumeSeedState,
  } = useUseCase()

  const scrollRef = useRef(null)
  const [visitedAgents, setVisitedAgents] = useState([])
  const [panelVisible, setPanelVisible] = useState(true)
  const [chatAgent, setChatAgent] = useState(null) // { agentId, agentName, color }

  // Session state for user choices that thread across panels
  const approvalStep = activeUseCase?.steps.find(s => s.panelType === 'human_approval')
  const defaultOverride = approvalStep?.panelData?.defaultOverride ?? ''
  const [workflowState, setWorkflowState] = useState({
    selectedScenarioId: 'A',
    overrideText: defaultOverride,
    approvalDone: false,
    // Advisor configuration (from step 1)
    advisorConfig: {
      tiers: [
        { tier: 1, count: 150, channel: 'Wholesaler call', contentType: 'Intelligence Brief' },
        { tier: 2, count: 1200, channel: 'Email + Portal', contentType: 'Article + Email' },
        { tier: 3, count: 6550, channel: 'Portal notification', contentType: 'Portal hub' },
      ],
      holdoutCount: 400,
      totalAdvisors: 7900,
    },
    // Content/channel config (from step 2)
    selectedContentTypes: null, // null = all selected (initialized by ContentChannelConfigPanel)
    enabledChannels: { wholesaler: true, email: true, portal: true },
    enabledAngles: { historical: true, allocation: true },
    // Plan-design (UC-E) state — populated as the user moves through the workflow
    selectedConfig: null,  // { params, outcomes, label?, rationale? } from PlanDesignParetoPanel
    rail6Output: null,     // { checks: [...], actionRequired: [...] } from CompliancePanel
    package: null,         // { slides, assets, checklist } from ContentGenerationPanel
  })

  // Apply seed state once when entering UC from a cross-page launch
  // (e.g. PlanOptimizer page → "Open in UC-E").
  useEffect(() => {
    if (!consumeSeedState) return
    const seed = consumeSeedState()
    if (seed?.state) {
      setWorkflowState((prev) => ({ ...prev, ...seed.state }))
    }
    // jumpToStep is handled by UseCaseContext.launch directly.
  }, [activeUseCase?.id, consumeSeedState])

  // Step transition animation — brief fade on step change
  useEffect(() => {
    setPanelVisible(false)
    const timer = setTimeout(() => setPanelVisible(true), 80)
    return () => clearTimeout(timer)
  }, [stepIndex])

  // Accumulate visited agents as user progresses
  useEffect(() => {
    if (!currentStep) return
    const script = agentScripts[currentStep.panelType]
    if (!script) return
    setVisitedAgents(prev => {
      if (prev.find(a => a.agentId === script.agentId && a.stepIndex === stepIndex)) return prev
      return [...prev, { agentId: script.agentId, agentName: script.agentName, color: script.color, context: script.handoff?.context, stepIndex }]
    })
  }, [stepIndex, currentStep])

  // Auto-advance in autonomous mode (non-gate steps only)
  useEffect(() => {
    if (autonomyMode !== 'autonomous') return
    if (!currentStep) return

    const script = agentScripts[currentStep.panelType]
    if (script?.isGate) return // Never auto-advance past gates

    // Calculate total display time from script
    let totalDelay = 0
    script?.messages?.forEach(msg => {
      totalDelay += msg.type === 'progress' ? (msg.duration || 800) : 400
    })
    totalDelay = Math.max(totalDelay, 2000) // minimum 2s per step

    const timer = setTimeout(() => {
      if (!isLast) advance()
    }, totalDelay)

    return () => clearTimeout(timer)
  }, [stepIndex, autonomyMode, currentStep, isLast, advance])

  const scrollToTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinue = () => { advance(); scrollToTop() }
  const handleApprove = (overrideText) => {
    setWorkflowState(s => ({ ...s, overrideText, approvalDone: true }))
    approve()
    scrollToTop()
  }
  const handleJump = (i) => { goToStep(i); scrollToTop() }

  if (!activeUseCase || !currentStep) return null

  const stageColor = currentStep.actor === 'human' ? 'yellow' : (STAGE_COLORS[currentStep.stage] || 'blue')

  const commonProps = {
    step: currentStep,
    activeUseCase,
    workflowState,
    setWorkflowState,
    onContinue: handleContinue,
    onApprove: handleApprove,
  }

  const renderPanel = () => {
    switch (currentStep.panelType) {
      case 'signal_detection':   return <SignalDetectionPanel {...commonProps} />
      case 'advisor_targeting':  return <AdvisorTargetingPanel {...commonProps} />
      case 'content_channel_config': return <ContentChannelConfigPanel {...commonProps} />
      case 'simulation':         return <SimulationPanel {...commonProps} />
      case 'human_approval':     return <DecisionApprovalPanel {...commonProps} />
      case 'content_generation': return <ContentGenerationPanel {...commonProps} />
      case 'compliance':         return <CompliancePanel {...commonProps} />
      case 'deployment':         return <DeploymentPanel {...commonProps} />
      case 'attribution':        return <AttributionPanel {...commonProps} onExit={onExitWorkflow || exit} />
      case 'future_self':        return <FutureSelfAvatarPanel {...commonProps} />
      case 'rollover_compare':   return <RolloverComparePanel {...commonProps} />
      case 'plan_design_pareto': return <PlanDesignParetoPanel {...commonProps} />
      case 'workforce_stress':   return <WorkforceStressPanel {...commonProps} />
      case 'cohort_simulation':  return <SimulationCohortPanel {...commonProps} />
      case 'cohort_decision':    return <DecisionCohortPanel {...commonProps} />
      case 'cohort_deployment':  return <DeploymentCohortPanel {...commonProps} />
      case 'cohort_outcome':     return <OutcomeCohortPanel {...commonProps} onExit={onExitWorkflow || exit} />
      case 'trial_validation':          return <TrialValidationPanel {...commonProps} />
      case 'participant_segmentation':  return <ParticipantSegmentationPanel {...commonProps} />
      case 'participant_channel_config': return <ParticipantChannelConfigPanel {...commonProps} />
      case 'campaign_objective': return <CampaignObjectivePanel panelData={currentStep.panelData} onContinue={handleContinue} />
      default:                           return <PlaceholderPanel {...commonProps} />
    }
  }

  return (
    <Stack gap={0} style={{ height: 'calc(100vh - 56px - 32px)', display: 'flex', flexDirection: 'column' }}>
      {/* Workflow top bar */}
      <Paper
        radius="md"
        px="md"
        py="xs"
        mb="sm"
        style={{
          borderLeft: `4px solid var(--mantine-color-${stageColor}-6)`,
          border: '1px solid var(--mantine-color-default-border)',
          borderLeftWidth: 4,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          flexShrink: 0,
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Badge size="sm" color={stageColor} variant="filled">{currentStep.stage}</Badge>
            <Text size="sm" fw={700}>{activeUseCase.title}</Text>
            <Divider orientation="vertical" h={14} style={{ alignSelf: 'center' }} />
            <Text size="xs" c="dimmed">Step {stepIndex + 1} of {totalSteps}</Text>
            <Divider orientation="vertical" h={14} style={{ alignSelf: 'center' }} />
            {/* Agent chain — shows progression of agents visited */}
            <Group gap={4} wrap="nowrap">
              {visitedAgents.slice(0, -1).map((agent, i) => {
                const AgentIcon = AGENT_ICONS[agent.agentId] || IconRobot
                return (
                  <Group key={`${agent.agentId}-${i}`} gap={3} wrap="nowrap">
                    <Tooltip label={`${agent.agentName}${agent.context ? ' — ' + agent.context : ''}`} position="bottom" withArrow>
                      <ThemeIcon size={18} radius="xl" variant="light" color={agent.color}>
                        <AgentIcon size={10} stroke={1.5} />
                      </ThemeIcon>
                    </Tooltip>
                    <IconChevronRight size={8} stroke={1.5} style={{ opacity: 0.3 }} />
                  </Group>
                )
              })}
              {/* Current agent — full badge */}
              {currentStep.actor === 'human' ? (
                <Badge size="sm" color="yellow" variant="filled" leftSection={<IconUserCheck size={12} stroke={1.5} />}>
                  {currentStep.agent}
                </Badge>
              ) : (
                <Badge size="sm" color={stageColor} variant="light" leftSection={<IconRobot size={12} stroke={1.5} />}>
                  {currentStep.agent}
                </Badge>
              )}
            </Group>
            {currentStep.actor === 'human' && (
              <Badge size="xs" color="yellow" variant="dot">Action required</Badge>
            )}
          </Group>
          <Group gap="sm">
            <ActionIcon size="md" variant="subtle" color="gray" disabled={isFirst} onClick={() => { retreat(); scrollToTop() }}>
              <IconChevronLeft size={16} stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="md" variant="light" color={stageColor} disabled={isLast} onClick={handleContinue}>
              <IconChevronRight size={16} stroke={1.5} />
            </ActionIcon>
            <Divider orientation="vertical" h={16} style={{ alignSelf: 'center' }} />
            <ActionIcon variant="subtle" color="gray" size="md" radius="md" onClick={exit}>
              <IconX size={16} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>

      {/* Agent narrator strip — compact agent context above the panel */}
      <AgentNarrator step={currentStep} stageColor={stageColor} onAgentClick={setChatAgent} />

      {/* Rich dashboard panel — the PRIMARY content with step transition */}
      <Transition mounted={panelVisible} transition="fade" duration={200}>
        {(styles) => (
          <ScrollArea style={{ flex: 1, ...styles }} viewportRef={scrollRef}>
            <Stack gap="md" pr="xs">
              {renderPanel()}
            </Stack>
          </ScrollArea>
        )}
      </Transition>

      {/* Agent chatbot panel */}
      <AgentChatPanel
        opened={!!chatAgent}
        onClose={() => setChatAgent(null)}
        agentId={chatAgent?.agentId}
        agentName={chatAgent?.agentName}
        color={chatAgent?.color}
      />
    </Stack>
  )
}
