import { Drawer, ScrollArea, Group, Text, CloseButton } from '@mantine/core'

export default function DetailDrawer({ opened, onClose, title, children }) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={420}
      withOverlay={false}
      withinPortal
      title={
        <Group gap="xs">
          <Text fw={600} size="sm">{title || 'Details'}</Text>
        </Group>
      }
      styles={{
        body: { padding: 0, height: 'calc(100vh - 60px)' },
        header: { padding: '8px 16px', borderBottom: '1px solid var(--mantine-color-default-border)' },
      }}
    >
      <ScrollArea h="100%" p="md">
        {children}
      </ScrollArea>
    </Drawer>
  )
}
