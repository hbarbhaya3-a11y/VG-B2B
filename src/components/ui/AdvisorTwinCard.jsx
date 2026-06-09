import { Card, Group, Stack, Text, Badge, RingProgress } from '@mantine/core'
import { fmtB, fmtConf } from '../../utils/format'
import { getDominantJob } from '../../simulation/needState'

const STAGE_COLORS = { Unaware: 'gray', Aware: 'yellow', Trial: 'blue', Committed: 'green' }
const churnColor = (r) => r > 0.6 ? 'red' : r > 0.3 ? 'orange' : 'green'

// Props: { advisor, onClick }
export default function AdvisorTwinCard({ advisor, onClick }) {
  const dominantJob = getDominantJob(advisor.needStateVector)
  const risk = advisor.churnRisk

  return (
    <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }} onClick={onClick}>
      <Group gap="md" wrap="nowrap" align="flex-start">
        <Stack gap="xs" flex={1}>
          <Text fw={600} size="sm" lineClamp={1}>{advisor.name}</Text>
          <Text size="xs" c="dimmed" lineClamp={1}>{advisor.firm} · {advisor.firmType}</Text>
          <Group gap="xs">
            <Badge radius="sm" variant="light" color="gray" size="xs">{advisor.firmType}</Badge>
            <Badge radius="sm" variant="light" color={STAGE_COLORS[advisor.etfAdoptionStage]} size="xs">
              {advisor.etfAdoptionStage}
            </Badge>
          </Group>
          <Text size="sm" fw={600}>${fmtB(advisor.aum)} AUM</Text>
          <Badge radius="sm" variant="light" color="blue" size="xs">
            {dominantJob} (dominant job)
          </Badge>
        </Stack>
        <Stack align="center" gap={4}>
          <RingProgress
            size={64}
            thickness={6}
            sections={[{ value: risk * 100, color: churnColor(risk) }]}
          />
          <Text size="xs" c="dimmed" ta="center">Churn Risk</Text>
          <Text size="xs" fw={600} c={churnColor(risk)}>{fmtConf(risk)}</Text>
        </Stack>
      </Group>
    </Card>
  )
}
