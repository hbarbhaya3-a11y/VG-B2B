import { Group, Button } from '@mantine/core'

export default function QuickReplyBar({ replies, color, onSelect }) {
  if (!replies || replies.length === 0) return null

  return (
    <Group gap="xs" mt="sm" mb="xs">
      {replies.map((reply, i) => (
        <Button
          key={i}
          size="xs"
          variant="light"
          color={reply.color || color || 'blue'}
          radius="md"
          onClick={() => onSelect(reply)}
        >
          {reply.label}
        </Button>
      ))}
    </Group>
  )
}
