import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useUseCase } from './UseCaseContext'
import { STAGE_TO_BUCKET } from '../theme'

const ConversationContext = createContext(null)

// Message types
export const MSG = {
  AGENT_NARRATIVE: 'agent_narrative',
  AGENT_PROGRESS: 'agent_progress',
  AGENT_QUESTION: 'agent_question',
  AGENT_HANDOFF: 'agent_handoff',
  USER_RESPONSE: 'user_response',
  SYSTEM_GATE: 'system_gate',
}

export function ConversationProvider({ children }) {
  const { activeUseCase, stepIndex, currentStep, advance, approve } = useUseCase()

  // Conversation state
  const [messages, setMessages] = useState([])
  const [autonomyMode, setAutonomyMode] = useState('guided') // 'guided' | 'autonomous'
  const [pipelineStatus, setPipelineStatus] = useState('idle') // 'idle' | 'running' | 'paused' | 'gated' | 'waiting'
  const [decisions, setDecisions] = useState({})
  const [agentMemory, setAgentMemory] = useState({})
  const [expandedEmbeds, setExpandedEmbeds] = useState({})
  const [drawerContent, setDrawerContent] = useState(null)
  const messageIdRef = useRef(0)

  const genId = () => `msg-${++messageIdRef.current}`

  // Add a message to the thread
  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: genId(), timestamp: Date.now(), ...msg }])
  }, [])

  // Add agent narrative
  const addAgentNarrative = useCallback((agentId, agentName, color, text, embed = null) => {
    addMessage({
      type: MSG.AGENT_NARRATIVE,
      agentId, agentName, color, text, embed,
      stepIndex,
    })
  }, [addMessage, stepIndex])

  // Add agent progress
  const addAgentProgress = useCallback((agentId, agentName, color, label, progress = 0) => {
    addMessage({
      type: MSG.AGENT_PROGRESS,
      agentId, agentName, color, label, progress,
      stepIndex,
    })
  }, [addMessage, stepIndex])

  // Add agent question with quick replies
  const addAgentQuestion = useCallback((agentId, agentName, color, text, quickReplies = []) => {
    addMessage({
      type: MSG.AGENT_QUESTION,
      agentId, agentName, color, text, quickReplies,
      stepIndex,
    })
    setPipelineStatus('waiting')
  }, [addMessage, stepIndex])

  // Add handoff message
  const addHandoff = useCallback((fromAgent, fromColor, toAgent, toColor, context) => {
    addMessage({
      type: MSG.AGENT_HANDOFF,
      fromAgent, fromColor, toAgent, toColor, context,
      stepIndex,
    })
  }, [addMessage, stepIndex])

  // Add user response
  const addUserResponse = useCallback((text) => {
    addMessage({ type: MSG.USER_RESPONSE, text, stepIndex })
  }, [addMessage, stepIndex])

  // Add system gate (mandatory human decision)
  const addSystemGate = useCallback((agentId, agentName, color, text, actions = []) => {
    addMessage({
      type: MSG.SYSTEM_GATE,
      agentId, agentName, color, text, actions,
      stepIndex,
    })
    setPipelineStatus('gated')
  }, [addMessage, stepIndex])

  // Record a decision for a step
  const recordDecision = useCallback((stepIdx, key, value) => {
    setDecisions(prev => ({ ...prev, [stepIdx]: { ...prev[stepIdx], [key]: value } }))
  }, [])

  // Store agent memory for cross-step reference
  const storeAgentMemory = useCallback((agentId, data) => {
    setAgentMemory(prev => ({ ...prev, [agentId]: { ...prev[agentId], ...data } }))
  }, [])

  // Pipeline controls
  const pausePipeline = useCallback(() => setPipelineStatus('paused'), [])
  const resumePipeline = useCallback(() => setPipelineStatus('running'), [])

  // Toggle embed expansion
  const toggleEmbed = useCallback((embedId) => {
    setExpandedEmbeds(prev => ({ ...prev, [embedId]: !prev[embedId] }))
  }, [])

  // Open detail drawer
  const openDrawer = useCallback((content) => setDrawerContent(content), [])
  const closeDrawer = useCallback(() => setDrawerContent(null), [])

  // Reset conversation when workflow changes
  const resetConversation = useCallback(() => {
    setMessages([])
    setDecisions({})
    setAgentMemory({})
    setPipelineStatus('idle')
    setExpandedEmbeds({})
    setDrawerContent(null)
    messageIdRef.current = 0
  }, [])

  return (
    <ConversationContext.Provider value={{
      // State
      messages,
      autonomyMode,
      pipelineStatus,
      decisions,
      agentMemory,
      expandedEmbeds,
      drawerContent,

      // Actions
      addAgentNarrative,
      addAgentProgress,
      addAgentQuestion,
      addHandoff,
      addUserResponse,
      addSystemGate,
      recordDecision,
      storeAgentMemory,

      // Mode & pipeline
      setAutonomyMode,
      pausePipeline,
      resumePipeline,

      // Embeds & drawer
      toggleEmbed,
      openDrawer,
      closeDrawer,

      // Reset
      resetConversation,
    }}>
      {children}
    </ConversationContext.Provider>
  )
}

export const useConversation = () => useContext(ConversationContext)
