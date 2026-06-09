import { useState, useEffect, useMemo, Suspense } from 'react'
import {
  AppShell, Burger, Group, Text, Badge, ActionIcon, Divider, Box,
  Tooltip, UnstyledButton, Center, Loader, Image, Stack, Alert, Avatar, Paper
} from '@mantine/core'
import {
  IconMenu2, IconSparkles, IconLayoutSidebar, IconRocket, IconHelpCircle,
  IconAlertCircle, IconRadar, IconPlayerPlay, IconTarget, IconTestPipe,
  IconRefresh, IconChevronRight
} from '@tabler/icons-react'

import WorkflowNav from './components/nav/WorkflowNav'
import UseCaseBar from './components/ui/UseCaseBar'
import UseCaseLauncher from './components/ui/UseCaseLauncher'
import ModeChoiceModal from './components/workflow/ModeChoiceModal'
import WorkflowRunner from './components/workflow/WorkflowRunner'

import { useUseCase } from './contexts/UseCaseContext'
import { PAGE_TO_BUCKET, TWINX_GRADIENT } from './theme'

// Pages
import UseCaseCatalog from './pages/UseCaseCatalog'
import MarketSignals from './pages/MarketSignals'
import AdvisorTwinRegistry from './pages/AdvisorTwinRegistry'
import EpisodeSimulator from './pages/EpisodeSimulator'
import QuantBridge from './pages/QuantBridge'
import PlanOptimizer from './pages/PlanOptimizer'
import SimulateDashboard from './pages/SimulateDashboard'
import TrustCompliance from './pages/TrustCompliance'
import GovernDashboard from './pages/GovernDashboard'
import ContentEngine from './pages/ContentEngine'
import CampaignOrchestration from './pages/CampaignOrchestration'
import OutcomeAttribution from './pages/OutcomeAttribution'
import TwinEnrichment from './pages/TwinEnrichment'
import AgentConsole from './pages/AgentConsole'
import Operations from './pages/Operations'

// ── Bucket → default landing page ─────────────────────────────────────────
// When user clicks a bucket in the sidebar (no workflow active), land here.
// Blueprint 6-stage spine: sense → simulate → select → trial → execute → learn
const BUCKET_DEFAULT_PAGE = {
  sense:    'use-case-catalog',     // gallery + live signals = the sensing layer
  simulate: 'simulate-dashboard',   // tabbed landing — Episodes / Quant Bridge / Plan Optimizer
  select:   'use-case-catalog',     // fallback — same as sense
  trial:    'episode-simulator',
  execute:  'content-engine',
  learn:    'outcome-attribution',
  operate:  'agent-console',
}

// ── Page ID → component ──
const PAGE_COMPONENTS = {
  'use-case-catalog':    UseCaseCatalog,
  'market-signals':      MarketSignals,
  'advisor-twin-registry': AdvisorTwinRegistry,
  'twin-registry':       AdvisorTwinRegistry,
  'participant-twin-registry': AdvisorTwinRegistry,
  'sponsor-twin-registry': AdvisorTwinRegistry,
  'episode-simulator':   EpisodeSimulator,
  'quant-bridge':        QuantBridge,
  'plan-optimizer':      PlanOptimizer,
  'simulate-dashboard':  SimulateDashboard,
  'trust-compliance':    TrustCompliance,
  'fiduciary-gate':      TrustCompliance,
  'hypothesis-board':    UseCaseCatalog,
  'content-engine':      ContentEngine,
  'campaign-orchestration': CampaignOrchestration,
  'active-journeys':     CampaignOrchestration,
  'outcome-attribution': OutcomeAttribution,
  'twin-enrichment':     TwinEnrichment,
  'learning-system':     TwinEnrichment,
  'agent-console':       AgentConsole,
  'operations':          Operations,
  'govern-dashboard':    GovernDashboard,
}

// ── Top header — "Marketing OS · Powered by TwinX" ────────────────────────
function TopHeader({ navCollapsed, onToggleNav, isWorkflowActive, onExitWorkflow }) {
  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <ActionIcon variant="subtle" size="lg" onClick={onToggleNav} aria-label="Toggle navigation">
          <IconMenu2 size={18} stroke={1.5} />
        </ActionIcon>
        <Group gap={10} wrap="nowrap">
          <Box
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: `linear-gradient(${TWINX_GRADIENT.deg}deg, ${TWINX_GRADIENT.from}, ${TWINX_GRADIENT.to})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(150, 21, 29, 0.3)',
            }}
          >
            <IconSparkles size={17} color="white" stroke={1.6} />
          </Box>
          <Stack gap={0}>
            <Text size="md" fw={700} lh={1.1} style={{ letterSpacing: '-0.01em' }}>
              Marketing OS for Vanguard Personal Wealth
            </Text>
            <Text size="10px" c="dimmed" lh={1.2} style={{ letterSpacing: '0.04em' }}>
              From static investor journeys to adaptive decision intelligence · Powered by TwinX™
            </Text>
          </Stack>
        </Group>
      </Group>
      <Group gap="xs">
        {isWorkflowActive && (
          <Tooltip label="Exit workflow" position="bottom" withArrow>
            <ActionIcon variant="light" color="gray" size="lg" onClick={onExitWorkflow}>
              <IconLayoutSidebar size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label="Help & about" position="bottom" withArrow>
          <ActionIcon variant="subtle" size="lg">
            <IconHelpCircle size={18} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
        <Avatar size={30} radius="xl" color="vanguardRed" variant="filled">V</Avatar>
      </Group>
    </Group>
  )
}

// ── Stage breadcrumb strip (shown above the running workflow) ─────────────
const BREADCRUMB_STAGES = [
  { id: 'SENSE',    label: 'Sense',    icon: IconRadar,      color: 'teal'        },
  { id: 'SIMULATE', label: 'Simulate', icon: IconPlayerPlay, color: 'violet'      },
  { id: 'SELECT',   label: 'Select',   icon: IconTarget,     color: 'vanguardRed' },
  { id: 'TRIAL',    label: 'Trial',    icon: IconTestPipe,   color: 'orange'      },
  { id: 'EXECUTE',  label: 'Execute',  icon: IconRocket,     color: 'green'       },
  { id: 'LEARN',    label: 'Learn',    icon: IconRefresh,    color: 'grape'       },
]
const STAGE_LEGACY_MAP = { DECIDE: 'SELECT', GOVERN: 'SELECT', DEPLOY: 'EXECUTE', MEASURE: 'LEARN', RESPOND: 'EXECUTE' }

function StageBreadcrumb({ currentStage }) {
  const normalized = STAGE_LEGACY_MAP[currentStage] || currentStage
  const activeIdx = BREADCRUMB_STAGES.findIndex(s => s.id === normalized)
  return (
    <Paper
      withBorder p="xs" radius="md" mb="sm"
      style={{ overflow: 'hidden' }}
    >
      <Group gap={6} wrap="nowrap" align="center" justify="center">
        {BREADCRUMB_STAGES.map((s, idx) => {
          const Icon = s.icon
          const isActive = idx === activeIdx
          const isDone = idx < activeIdx
          return (
            <Group key={s.id} gap={6} wrap="nowrap" align="center">
              <Group
                gap={6} wrap="nowrap"
                px="sm" py={4}
                style={{
                  borderRadius: 999,
                  background: isActive
                    ? `linear-gradient(135deg, var(--mantine-color-${s.color}-light), transparent 80%)`
                    : isDone ? 'var(--mantine-color-gray-1)' : 'transparent',
                  border: isActive
                    ? `1px solid var(--mantine-color-${s.color}-4)`
                    : '1px solid transparent',
                  transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isActive ? 1 : isDone ? 0.7 : 0.45,
                }}
              >
                <Icon
                  size={13} stroke={1.8}
                  color={isActive ? `var(--mantine-color-${s.color}-7)` : 'var(--mantine-color-gray-6)'}
                />
                <Text
                  size="11px" fw={isActive ? 700 : 500}
                  tt="uppercase" style={{ letterSpacing: '0.08em' }}
                  c={isActive ? `${s.color}.8` : 'dimmed'}
                >
                  {s.label}
                </Text>
              </Group>
              {idx < BREADCRUMB_STAGES.length - 1 && (
                <IconChevronRight size={10} stroke={2} color="var(--mantine-color-gray-4)" />
              )}
            </Group>
          )
        })}
      </Group>
    </Paper>
  )
}

// ── Page router — resolves activeBucket or activePage → component ─────────
function PageRouter({ activePage, activeBucket, setActivePage, onRunScenario }) {
  // Prefer a specific page id; if only a bucket is set, map to its default page.
  const pageId = activePage || BUCKET_DEFAULT_PAGE[activeBucket] || 'use-case-catalog'
  const PageComponent = PAGE_COMPONENTS[pageId] || UseCaseCatalog

  return (
    <Suspense fallback={<Center h={400}><Loader /></Center>}>
      <PageComponent onRunScenario={onRunScenario} />
    </Suspense>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const { activeUseCase, currentStep, exit, launch } = useUseCase()
  const isWorkflowActive = !!activeUseCase

  // Sidebar state
  const [navCollapsed, setNavCollapsed] = useState(false)

  // Active bucket (nav highlight) and active page (content)
  const [activeBucket, setActiveBucket] = useState('sense')
  const [activePage, setActivePage] = useState('use-case-catalog')

  // Launcher + mode modal
  const [launcherOpened, setLauncherOpened] = useState(false)
  const [modeModalOpened, setModeModalOpened] = useState(false)
  const [pendingUseCase, setPendingUseCase] = useState(null)

  // When the workflow step changes, sync activePage + bucket to the step
  useEffect(() => {
    if (!currentStep) return
    const pageId = currentStep.page
    if (pageId && PAGE_COMPONENTS[pageId]) {
      setActivePage(pageId)
      const bucket = PAGE_TO_BUCKET[pageId]
      if (bucket) setActiveBucket(bucket)
    }
  }, [currentStep])

  const handleNavigate = (bucketOrPageId) => {
    if (!bucketOrPageId) return
    // If it looks like a bucket id, swap bucket + load its default page
    if (BUCKET_DEFAULT_PAGE[bucketOrPageId]) {
      setActiveBucket(bucketOrPageId)
      setActivePage(BUCKET_DEFAULT_PAGE[bucketOrPageId])
      return
    }
    // Otherwise treat it as a page id
    setActivePage(bucketOrPageId)
    const bucket = PAGE_TO_BUCKET[bucketOrPageId]
    if (bucket) setActiveBucket(bucket)
  }

  const handleRunScenario = (useCaseOrSignal) => {
    if (!useCaseOrSignal) { setLauncherOpened(true); return }
    setPendingUseCase(useCaseOrSignal)
    setModeModalOpened(true)
  }

  const handleLaunchMode = (mode) => {
    // mode is 'guided' | 'autonomous' — UseCaseContext already tracks autonomyMode.
    // ModeChoiceModal calls onLaunch(mode), then closes itself; we then launch the UC.
    if (pendingUseCase) {
      launch(pendingUseCase)
      if (pendingUseCase.steps?.[0]?.page) {
        setActivePage(pendingUseCase.steps[0].page)
        const bucket = PAGE_TO_BUCKET[pendingUseCase.steps[0].page]
        if (bucket) setActiveBucket(bucket)
      }
    }
    setPendingUseCase(null)
  }

  const handleExitWorkflow = () => {
    exit()
    setActiveBucket('sense')
    setActivePage('use-case-catalog')
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: navCollapsed ? 72 : 260,
        breakpoint: 'sm',
        collapsed: { mobile: false, desktop: false },
      }}
      padding={0}
    >
      <AppShell.Header withBorder>
        <TopHeader
          navCollapsed={navCollapsed}
          onToggleNav={() => setNavCollapsed(c => !c)}
          isWorkflowActive={isWorkflowActive}
          onExitWorkflow={handleExitWorkflow}
        />
      </AppShell.Header>

      <AppShell.Navbar p="xs" withBorder style={{ transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <WorkflowNav
            activePage={isWorkflowActive ? activeBucket : activeBucket}
            onNavigate={handleNavigate}
            collapsed={navCollapsed}
          />
        </div>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'var(--mantine-color-gray-0)' }}>
        <Box p="md">
          {isWorkflowActive && (
            <StageBreadcrumb currentStage={currentStep?.stage} />
          )}

          {isWorkflowActive ? (
            <WorkflowRunner onNavigate={handleNavigate} onExitWorkflow={handleExitWorkflow} />
          ) : (
            <PageRouter
              activePage={activePage}
              activeBucket={activeBucket}
              setActivePage={setActivePage}
              onRunScenario={handleRunScenario}
            />
          )}
        </Box>
      </AppShell.Main>

      <UseCaseLauncher
        opened={launcherOpened}
        onClose={() => setLauncherOpened(false)}
        onNavigate={handleNavigate}
      />

      <ModeChoiceModal
        opened={modeModalOpened}
        onClose={() => setModeModalOpened(false)}
        signal={pendingUseCase}
        onLaunch={handleLaunchMode}
      />
    </AppShell>
  )
}
