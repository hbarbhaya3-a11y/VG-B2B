import { Badge } from '@mantine/core'
import { IconCheck, IconAlertTriangle, IconX } from '@tabler/icons-react'

const STATUS_CONFIG = {
  pass: { color: 'green', label: 'Pass', Icon: IconCheck },
  warn: { color: 'orange', label: 'Warning', Icon: IconAlertTriangle },
  fail: { color: 'red', label: 'Fail', Icon: IconX }
}

// Props: { rail, status } where status = 'pass' | 'warn' | 'fail'
export default function TrustRailBadge({ rail, status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pass
  const { Icon } = config
  return (
    <Badge
      radius="sm"
      variant="light"
      color={config.color}
      leftSection={<Icon size={12} stroke={1.5} />}
    >
      {config.label}
    </Badge>
  )
}
