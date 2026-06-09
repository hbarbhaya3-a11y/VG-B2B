import { useState, useRef, useEffect } from 'react'
import { Drawer, Stack, Group, Text, ThemeIcon, Badge, Textarea, ActionIcon, Paper, ScrollArea, Box, Loader } from '@mantine/core'
import {
  IconSend, IconRobot, IconRadar, IconBrain, IconPencil, IconChartBar,
  IconUserCheck, IconShield, IconRoute, IconActivity, IconChevronDown, IconChevronUp
} from '@tabler/icons-react'

const AGENT_ICONS = {
  'market-sentinel': IconRadar,
  'context-decoder': IconBrain,
  'content-architect': IconPencil,
  'quant-bridge': IconChartBar,
  'decision-owner': IconUserCheck,
  'guardrail-guardian': IconShield,
  'journey-executor': IconRoute,
  'learning-system': IconActivity,
}

// ── Specialised system prompts per agent ──
const AGENT_SYSTEM_PROMPTS = {
  'market-sentinel': `You are Market Sentinel, a specialised AI agent within Vanguard's Fiduciary Intelligence Platform (powered by TwinX). Your role is continuous market signal detection and classification.

You monitor Bloomberg MCP feeds, SEC EDGAR filings, and competitive intelligence feeds. You use an LSTM autoencoder for classification and match signals against an episode library of 18+ prior events.

Current context: You detected a VIX spike of +36% intraday (2-sigma from 90-day baseline), 94% confidence, classified as "Market Volatility — Broad Equity". 4 matching precedents found (Mar 2026 Fed rate pivot 92% similarity, Jan 2026 Q4 earnings miss 88%, Nov 2025 post-election 85%, Oct 2025 Middle East 81%). Urgency window: 4 hours. Historical outreach within 72h drives +18% AUM retention.

Style: Data-driven, urgent but measured. Cite specific numbers and precedents. Use markdown with **bold headings** and bullet points. Keep responses concise (2-3 short paragraphs max).`,

  'context-decoder': `You are Context Decoder, a specialised AI agent within Vanguard's Fiduciary Intelligence Platform. Your role is advisor population targeting and segmentation.

You score advisor digital twins using XGBoost (47 features) and Bayesian hierarchical need-state matching.

Current context: Scored 47,000 twins, 7,900 qualified. Tier 1 (150): $50M+ AUM, wholesaler calls. Tier 2 (1,200): active digital users, email + portal. Tier 3 (6,550): moderate engagement, portal notifications. 400 holdout for causal measurement.

Style: Analytical, segmentation-focused. Reference specific features and methodology. Concise markdown (2-3 paragraphs max).`,

  'content-architect': `You are Content Architect, a specialised AI agent within Vanguard's Fiduciary Intelligence Platform. Your role is content generation and personalisation.

You generate content using a model fine-tuned on ~2,000 Capital Ideas articles (LoRA + RLHF). You create multiple asset types from a single insight kernel.

Current context: Generated 54+ variants from VIX volatility kernel. Asset types: article (5 charts), 2 email A/B variants, 150 personalised wholesaler briefs, portal, PDF, LinkedIn, podcast, conversation guide, 30s video. PM attributions: Cheryl Frank, Jared Franz (PhD), Chris Buchbinder (35yr).

Style: Creative yet precise. Explain content strategy and personalisation logic. Concise markdown (2-3 paragraphs max).`,

  'twinx-simulation': `You are TwinX Simulation, a specialised AI agent within Vanguard's Fiduciary Intelligence Platform. Your role is campaign simulation and scenario modelling.

You run TwinX simulations (1,000 iterations) with Bayesian hierarchical response curves.

Current context: Scenario A (Recommended): 20% engagement, $185M AUM, $210K cost, 82% confidence ±2%. Scenario B: 28% engagement, $220M AUM, $380K cost, 79%. Scenario C: 15% engagement, $120M AUM, $90K cost, 85%. Sensitivity: engagement ±5% → AUM ±$22M.

Style: Quantitative, probability-focused. Use precise numbers and trade-off analysis. Concise markdown (2-3 paragraphs max).`,

  'decision-owner': `You are the Decision Owner interface within Vanguard's Fiduciary Intelligence Platform. You support the human decision-maker at the governance approval gate.

Current context: Scenario A selected. +14pp engagement lift vs do-nothing, $185M incremental AUM, 880x ROI on $210K. 7,900 advisors, 400 holdout. Override capability available.

Style: Decision-support focused. Help understand trade-offs. Concise markdown (2-3 paragraphs max).`,

  'guardrail-guardian': `You are Guardrail Guardian, a specialised AI agent within Vanguard's Fiduciary Intelligence Platform. Your role is regulatory compliance and content clearance.

You enforce a five-rail pipeline: FINRA Rule 2210 classification, SEC Rule 482 performance claims, contact frequency, brand voice (97.2% cosine similarity), and regulatory disclosure.

Current context: 93% clearance. 1 FINRA reclassification, 2 SEC auto-corrections, 1 contact frequency hold. All PM attributions verified.

Style: Compliance-first, reference specific regulations. Concise markdown (2-3 paragraphs max).`,

  'journey-executor': `You are Journey Executor, a specialised AI agent within Vanguard's Fiduciary Intelligence Platform. Your role is multi-channel deployment orchestration.

You use a Deep Q-Network for send-time optimisation and manage multi-touch sequencing.

Current context: 7,900 touchpoints deployed. Tier 1 (150): wholesaler calls + briefs. Tier 2 (1,200): email waves + portal. Tier 3 (6,550): portal notifications. DQN-optimised timing per advisor.

Style: Operational, deployment-focused. Reference channel strategy and timing. Concise markdown (2-3 paragraphs max).`,

  'learning-system': `You are the Learning System, a specialised AI agent within Vanguard's Fiduciary Intelligence Platform. Your role is outcome measurement and model improvement.

You measure causal outcomes against holdout control groups over 90-day windows.

Current context: $49M incremental AUM, +90 bps vs holdout, 880x ROI. 24% engagement vs 6% holdout baseline. Episode #19 archived, prior models updated, 7,900 twins enriched.

Style: Reflective, outcome-focused. Emphasise causal methodology. Concise markdown (2-3 paragraphs max).`,
}

const AGENT_GREETINGS = {
  'market-sentinel': 'I\'m **Market Sentinel**. I classified the current VIX event and matched it against our episode library. What would you like to know?',
  'context-decoder': 'I\'m **Context Decoder**. I scored 47,000 advisor twins and identified 7,900 for targeting. How can I help?',
  'content-architect': 'I\'m **Content Architect**. I generated all content variants for this workflow. What would you like to explore?',
  'twinx-simulation': 'I\'m **TwinX Simulation**. I ran the TwinX simulation and generated scenario recommendations. What would you like to understand?',
  'decision-owner': 'I\'m the **Decision Owner** interface. I support the governance approval gate. What do you need to review?',
  'guardrail-guardian': 'I\'m **Guardrail Guardian**. I ran the five-rail compliance clearance. What would you like to know?',
  'journey-executor': 'I\'m **Journey Executor**. I orchestrated the multi-channel deployment. How can I help?',
  'learning-system': 'I\'m the **Learning System**. I measured causal outcomes over 90 days. What would you like to explore?',
}

async function callLLM(agentId, conversationHistory) {
  const systemPrompt = AGENT_SYSTEM_PROMPTS[agentId] || 'You are a helpful AI agent in a wealth management platform. Use markdown formatting. Keep responses concise.'
  const messages = [
    { role: 'system', content: systemPrompt + '\n\nRespond in well-structured markdown. Use **bold** for key terms, bullet points for lists. Keep responses to 2-3 short paragraphs — be concise and direct.' },
    ...conversationHistory.map(m => ({ role: m.role === 'agent' ? 'assistant' : 'user', content: m.text })),
  ]
  try {
    const response = await fetch('/api/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7, max_tokens: 500 }),
    })
    if (!response.ok) { const err = await response.json(); throw new Error(err.error?.message || 'API failed') }
    const data = await response.json()
    return data.choices[0]?.message?.content || 'I could not generate a response.'
  } catch (error) {
    return `Connection issue: ${error.message}`
  }
}

function renderMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<div style="font-weight:700;font-size:13px;margin:8px 0 2px">$1</div>')
    .replace(/^## (.+)$/gm, '<div style="font-weight:700;font-size:14px;margin:10px 0 2px">$1</div>')
    .replace(/^- (.+)$/gm, '&nbsp;&nbsp;• $1')
    .replace(/\n/g, '<br/>')
}

// ── Collapsed message (one-liner for older messages) ──
function CollapsedMessage({ msg, color, agentName, onExpand }) {
  const Icon = AGENT_ICONS[msg.agentId] || IconRobot
  const isAgent = msg.role === 'agent'
  const preview = msg.text.replace(/\*\*/g, '').replace(/\n/g, ' ').substring(0, 90)

  return (
    <Paper
      withBorder px="sm" py={6} radius="sm"
      style={{
        cursor: 'pointer',
        borderLeft: isAgent ? `3px solid var(--mantine-color-${color}-4)` : undefined,
        opacity: 0.65,
        transition: 'opacity 150ms',
      }}
      onClick={onExpand}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          {isAgent && (
            <ThemeIcon size={16} radius="xl" variant="light" color={color}>
              <Icon size={8} stroke={1.5} />
            </ThemeIcon>
          )}
          <Text size="xs" lineClamp={1} c="dimmed" style={{ flex: 1 }}>{preview}…</Text>
        </Group>
        <IconChevronDown size={10} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
      </Group>
    </Paper>
  )
}

// ── Full message with scroll containment for long responses ──
function FullMessage({ msg, color, isLast }) {
  const Icon = AGENT_ICONS[msg.agentId] || IconRobot
  const isAgent = msg.role === 'agent'
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <Box style={{ display: 'flex', justifyContent: isAgent ? 'flex-start' : 'flex-end' }}>
      <Paper
        withBorder p="sm" radius="md"
        style={{
          maxWidth: '92%',
          borderLeft: isAgent ? `3px solid var(--mantine-color-${color}-5)` : undefined,
          background: !isAgent ? 'var(--mantine-color-blue-light)' : undefined,
        }}
      >
        {isAgent && (
          <Group gap="xs" mb={4}>
            <ThemeIcon size={18} radius="xl" variant="light" color={color}>
              <Icon size={9} stroke={1.5} />
            </ThemeIcon>
            <Text size="xs" fw={600}>{msg.agentName || 'Agent'}</Text>
            <Text size="xs" c="dimmed">{time}</Text>
          </Group>
        )}
        {/* Scroll containment for long agent messages */}
        {isAgent ? (
          <ScrollArea.Autosize mah={260} type="auto" offsetScrollbars>
            <Text size="sm" style={{ lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }}
            />
          </ScrollArea.Autosize>
        ) : (
          <Text size="sm" style={{ lineHeight: 1.5 }}>{msg.text}</Text>
        )}
        {!isAgent && <Text size="xs" c="dimmed" mt={2} ta="right">{time}</Text>}
      </Paper>
    </Box>
  )
}

// ── Main component ──
export default function AgentChatPanel({ opened, onClose, agentId, agentName, color }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [expandedMessages, setExpandedMessages] = useState(new Set())
  const scrollRef = useRef(null)

  const Icon = AGENT_ICONS[agentId] || IconRobot

  useEffect(() => {
    if (opened && agentId) {
      setMessages([{
        role: 'agent', agentId, agentName,
        text: AGENT_GREETINGS[agentId] || `I'm ${agentName}. Ask me anything.`,
        timestamp: Date.now(),
      }])
      setExpandedMessages(new Set())
    }
  }, [opened, agentId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages.length])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isTyping) return

    const userMsg = { role: 'user', text: trimmed, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const history = [...messages, userMsg]
    const response = await callLLM(agentId, history)

    setMessages(prev => [...prev, {
      role: 'agent', agentId, agentName,
      text: response, timestamp: Date.now(),
    }])
    setIsTyping(false)
  }

  // Find indices of latest agent and user messages
  const lastAgentIdx = messages.map((m, i) => m.role === 'agent' ? i : -1).filter(i => i >= 0).pop() ?? -1
  const lastUserIdx = messages.map((m, i) => m.role === 'user' ? i : -1).filter(i => i >= 0).pop() ?? -1

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={540}
      withOverlay={false}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="xl" variant="light" color={color}>
            <Icon size={14} stroke={1.5} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700}>{agentName}</Text>
            <Text size="xs" c="dimmed">Live agent interface</Text>
          </div>
        </Group>
      }
    >
      <Stack style={{ height: 'calc(100vh - 120px)' }} gap={0}>
        <ScrollArea style={{ flex: 1 }} viewportRef={scrollRef} p="sm">
          <Stack gap="xs">
            {messages.map((msg, i) => {
              const isLatest = (msg.role === 'agent' && i === lastAgentIdx) || (msg.role === 'user' && i === lastUserIdx)
              const isManuallyExpanded = expandedMessages.has(i)

              // Auto-collapse older agent messages (not the latest, not manually expanded)
              if (msg.role === 'agent' && !isLatest && !isManuallyExpanded && messages.length > 3) {
                return (
                  <CollapsedMessage
                    key={i}
                    msg={msg}
                    color={color}
                    agentName={agentName}
                    onExpand={() => setExpandedMessages(prev => new Set([...prev, i]))}
                  />
                )
              }

              // Older user messages stay short (they're naturally brief)
              // Latest messages and expanded messages render fully
              return <FullMessage key={i} msg={msg} color={color} isLast={isLatest} />
            })}
            {isTyping && (
              <Group gap="xs" py="xs">
                <ThemeIcon size={18} radius="xl" variant="light" color={color}>
                  <Icon size={9} stroke={1.5} />
                </ThemeIcon>
                <Loader size="xs" color={color} />
                <Text size="xs" c="dimmed">{agentName} is thinking…</Text>
              </Group>
            )}
          </Stack>
        </ScrollArea>

        <Box p="sm" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Group gap="xs" align="flex-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={`Ask ${agentName}...`}
              autosize
              minRows={1}
              maxRows={3}
              style={{ flex: 1 }}
              radius="md"
              disabled={isTyping}
            />
            <ActionIcon size="lg" variant="filled" color={color} radius="md" onClick={handleSend} disabled={!input.trim() || isTyping}>
              <IconSend size={16} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Box>
      </Stack>
    </Drawer>
  )
}
