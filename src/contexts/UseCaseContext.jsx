import { createContext, useContext, useState, useCallback } from 'react'

const UseCaseContext = createContext(null)

// Step index threshold: after advancing past this step, earlier steps become locked
const SIMULATION_LOCK_STEP = 6 // After step 5 (simulation) → step 6 (governance), lock steps 0-5

export function UseCaseProvider({ children }) {
  const [activeUseCase, setActiveUseCase] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [lockedBeforeIndex, setLockedBeforeIndex] = useState(null)
  const [autonomyMode, setAutonomyMode] = useState('guided') // 'guided' | 'autonomous'
  const [pipelineStatus, setPipelineStatus] = useState('idle') // 'idle' | 'running' | 'paused' | 'gated'
  // Seed state for cross-page launches (e.g. PlanOptimizer → UC-E with selectedConfig)
  // WorkflowRunner reads this once on mount and clears via consumeSeedState().
  const [pendingSeedState, setPendingSeedState] = useState(null)
  const [seedJumpToStep, setSeedJumpToStep] = useState(null)

  const currentStep = activeUseCase?.steps[stepIndex] ?? null
  const totalSteps = activeUseCase?.steps.length ?? 0
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

  const isHumanGate = currentStep?.actor === 'human'

  const launch = useCallback((uc, opts = {}) => {
    setActiveUseCase(uc)
    setStepIndex(opts.jumpToStep ?? 0)
    setLockedBeforeIndex(null)
    setPipelineStatus('idle')
    setPendingSeedState(opts.seedState ?? null)
    setSeedJumpToStep(opts.jumpToStep ?? null)
  }, [])

  // Called by WorkflowRunner exactly once on mount or when activeUseCase changes.
  // Returns and clears the pending seed (so re-renders don't reapply it).
  const consumeSeedState = useCallback(() => {
    if (pendingSeedState == null && seedJumpToStep == null) return null
    const seed = { state: pendingSeedState, jumpToStep: seedJumpToStep }
    setPendingSeedState(null)
    setSeedJumpToStep(null)
    return seed
  }, [pendingSeedState, seedJumpToStep])

  const exit = useCallback(() => {
    setActiveUseCase(null)
    setStepIndex(0)
    setLockedBeforeIndex(null)
    setPipelineStatus('idle')
  }, [])

  const advance = useCallback(() => {
    setStepIndex(i => {
      const next = i + 1
      if (next >= (activeUseCase?.steps.length ?? 0)) return i
      // Lock previous steps when advancing past simulation
      if (next >= SIMULATION_LOCK_STEP && (lockedBeforeIndex === null || lockedBeforeIndex === undefined)) {
        setLockedBeforeIndex(SIMULATION_LOCK_STEP)
      }
      return next
    })
  }, [activeUseCase, lockedBeforeIndex])

  const retreat = useCallback(() => {
    setStepIndex(i => {
      const prev = i - 1
      if (prev < 0) return i
      // Cannot retreat past locked index
      if (lockedBeforeIndex != null && prev < lockedBeforeIndex) return i
      return prev
    })
  }, [lockedBeforeIndex])

  const goToStep = useCallback((i) => {
    if (i < 0 || i >= (activeUseCase?.steps.length ?? 0)) return
    // Cannot go to locked steps
    if (lockedBeforeIndex != null && i < lockedBeforeIndex) return
    setStepIndex(i)
  }, [activeUseCase, lockedBeforeIndex])

  const approve = useCallback(() => {
    if (isHumanGate && !isLast) {
      setStepIndex(i => {
        const next = i + 1
        if (next >= SIMULATION_LOCK_STEP && (lockedBeforeIndex === null || lockedBeforeIndex === undefined)) {
          setLockedBeforeIndex(SIMULATION_LOCK_STEP)
        }
        return next
      })
    }
  }, [isHumanGate, isLast, lockedBeforeIndex])

  return (
    <UseCaseContext.Provider value={{
      activeUseCase, stepIndex, currentStep, totalSteps,
      isFirst, isLast, isHumanGate,
      lockedBeforeIndex,
      autonomyMode, setAutonomyMode,
      pipelineStatus, setPipelineStatus,
      launch, exit, advance, retreat, goToStep, approve,
      consumeSeedState
    }}>
      {children}
    </UseCaseContext.Provider>
  )
}

const DEFAULT_CTX = {
  activeUseCase: null, stepIndex: 0, currentStep: null, totalSteps: 0,
  isFirst: true, isLast: true, isHumanGate: false, lockedBeforeIndex: null,
  autonomyMode: 'guided', setAutonomyMode: () => {},
  pipelineStatus: 'idle', setPipelineStatus: () => {},
  launch: () => {}, exit: () => {}, advance: () => {}, retreat: () => {},
  goToStep: () => {}, approve: () => {}, consumeSeedState: () => null,
}
export const useUseCase = () => useContext(UseCaseContext) ?? DEFAULT_CTX
