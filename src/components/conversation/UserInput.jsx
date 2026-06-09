import { useState } from 'react'
import { Group, Textarea, ActionIcon } from '@mantine/core'
import { IconSend } from '@tabler/icons-react'

export default function UserInput({ onSend, placeholder, disabled }) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Group gap="xs" align="flex-end">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type a message or use the buttons above...'}
        autosize
        minRows={1}
        maxRows={3}
        disabled={disabled}
        style={{ flex: 1 }}
        radius="md"
      />
      <ActionIcon
        size="lg"
        variant="filled"
        color="blue"
        radius="md"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        <IconSend size={16} stroke={1.5} />
      </ActionIcon>
    </Group>
  )
}
