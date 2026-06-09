import { useRef, useEffect } from 'react'
import { ScrollArea, Stack, Paper, Group, Text, Avatar, Box } from '@mantine/core'
import { useConversation, MSG } from '../../contexts/ConversationContext'
import AgentMessage from './AgentMessage'
import AgentHandoff from './AgentHandoff'
import ProgressMessage from './ProgressMessage'
import QuickReplyBar from './QuickReplyBar'
import UserInput from './UserInput'

function UserResponseMessage({ message }) {
  return (
    <Box mb="sm" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Paper
        withBorder
        p="sm"
        radius="md"
        style={{ maxWidth: '70%', background: 'var(--mantine-color-blue-light)' }}
      >
        <Group gap="xs" justify="flex-end" mb={4}>
          <Text size="xs" c="dimmed">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Avatar size={20} color="blue" radius="xl">U</Avatar>
        </Group>
        <Text size="sm">{message.text}</Text>
      </Paper>
    </Box>
  )
}

function SystemGateMessage({ message, onAction }) {
  return (
    <Box mb="sm">
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          border: `2px solid var(--mantine-color-${message.color}-6)`,
          background: `var(--mantine-color-${message.color}-light)`,
        }}
      >
        <Group gap="xs" mb="xs">
          <Text size="xs" fw={700} tt="uppercase" c={message.color}>
            Approval Gate — Pipeline Paused
          </Text>
        </Group>
        <Text size="sm" fw={600} mb="xs">{message.agentName}</Text>
        <Text size="sm" mb="md">{message.text}</Text>
        {message.actions && (
          <QuickReplyBar
            replies={message.actions}
            color={message.color}
            onSelect={onAction}
          />
        )}
      </Paper>
    </Box>
  )
}

export default function ConversationThread({ onQuickReply, onGateAction, onUserMessage }) {
  const { messages, pipelineStatus } = useConversation()
  const viewportRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages.length])

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
      <ScrollArea
        viewportRef={viewportRef}
        style={{ flex: 1 }}
        offsetScrollbars
        type="auto"
      >
        <Stack gap={0} p="md">
          {messages.map((msg) => {
            switch (msg.type) {
              case MSG.AGENT_NARRATIVE:
                return <AgentMessage key={msg.id} message={msg} />
              case MSG.AGENT_PROGRESS:
                return <ProgressMessage key={msg.id} message={msg} />
              case MSG.AGENT_QUESTION:
                return (
                  <AgentMessage key={msg.id} message={msg}>
                    <QuickReplyBar
                      replies={msg.quickReplies}
                      color={msg.color}
                      onSelect={onQuickReply}
                    />
                  </AgentMessage>
                )
              case MSG.AGENT_HANDOFF:
                return <AgentHandoff key={msg.id} message={msg} />
              case MSG.USER_RESPONSE:
                return <UserResponseMessage key={msg.id} message={msg} />
              case MSG.SYSTEM_GATE:
                return <SystemGateMessage key={msg.id} message={msg} onAction={onGateAction} />
              default:
                return null
            }
          })}
        </Stack>
      </ScrollArea>

      {/* Input area */}
      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
        <UserInput
          onSend={onUserMessage}
          disabled={pipelineStatus === 'running'}
          placeholder={
            pipelineStatus === 'running' ? 'Type to pause the pipeline...' :
            pipelineStatus === 'gated' ? 'Use the buttons above to proceed...' :
            'Type a message or use the buttons above...'
          }
        />
      </Box>
    </Box>
  )
}
