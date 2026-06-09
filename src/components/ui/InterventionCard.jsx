import { Card, Group, Stack, Text, Badge } from '@mantine/core'
import { fmtM, fmtConf, fmtRelTime } from '../../utils/format'

const OUTCOME_COLORS = { Converted: 'green', Opened: 'blue', 'No Response': 'gray', Pending: 'orange' }
const COMPLIANCE_COLORS = { Cleared: 'green', Pending: 'orange', Blocked: 'red' }

// Props: { intervention, compact }
export default function InterventionCard({ intervention, compact }) {
  return (
    <Card withBorder radius="md" p={compact ? 'xs' : 'md'} mb="xs">
      <Stack gap="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Badge radius="sm" variant="light" color="blue" size="xs">{intervention.channel}</Badge>
            {intervention.complianceStatus && (
              <Badge radius="sm" variant="outline" color={COMPLIANCE_COLORS[intervention.complianceStatus]} size="xs">
                {intervention.complianceStatus}
              </Badge>
            )}
            {intervention.isHoldout && (
              <Badge radius="sm" variant="outline" color="gray" size="xs">Holdout</Badge>
            )}
          </Group>
          {intervention.outcome && (
            <Badge radius="sm" variant="filled" color={OUTCOME_COLORS[intervention.outcome] || 'gray'} size="xs">
              {intervention.outcome}
            </Badge>
          )}
        </Group>
        {intervention.contentVariant && (
          <Text size="xs" c="dimmed" lineClamp={compact ? 1 : 2}>{intervention.contentVariant}</Text>
        )}
        {!compact && (
          <Group gap="md">
            <Stack gap={0}>
              <Text size="xs" c="dimmed">Predicted Eng.</Text>
              <Text size="xs" fw={600}>{fmtConf(intervention.predictedEngagement)}</Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" c="dimmed">Predicted AUM</Text>
              <Text size="xs" fw={600}>{fmtM(intervention.predictedAUMImpact)}</Text>
            </Stack>
            {intervention.actualEngagement !== undefined && (
              <Stack gap={0}>
                <Text size="xs" c="dimmed">Actual Eng.</Text>
                <Text size="xs" fw={600} c={intervention.actualEngagement >= intervention.predictedEngagement ? 'green' : 'red'}>
                  {fmtConf(intervention.actualEngagement)}
                </Text>
              </Stack>
            )}
            {intervention.actualAUMImpact !== undefined && intervention.actualAUMImpact !== null && (
              <Stack gap={0}>
                <Text size="xs" c="dimmed">Actual AUM</Text>
                <Text size="xs" fw={600} c={intervention.actualAUMImpact >= 0 ? 'green' : 'red'}>
                  {fmtM(intervention.actualAUMImpact)}
                </Text>
              </Stack>
            )}
          </Group>
        )}
        {intervention.sendTime && (
          <Text size="xs" c="dimmed">{fmtRelTime(intervention.sendTime)}</Text>
        )}
      </Stack>
    </Card>
  )
}
