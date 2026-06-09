import { Stack, SimpleGrid, Text, Center, Loader } from '@mantine/core'
import { AreaChart } from '@mantine/charts'
import { fmtM } from '../../utils/format'
import KpiCard from './KpiCard'
import { IconTrendingDown, IconTarget, IconTrendingUp } from '@tabler/icons-react'

// Props: { result, isLoading }
export default function SimResultPanel({ result, isLoading }) {
  if (isLoading) {
    return (
      <Center h={400}>
        <Stack align="center">
          <Loader size="md" />
          <Text c="dimmed" size="sm">Running simulation…</Text>
        </Stack>
      </Center>
    )
  }

  if (!result) return null

  return (
    <Stack gap="md">
      <SimpleGrid cols={3}>
        <KpiCard label="P5 AUM Lift (Pessimistic)" value={fmtM(result.p5)} color="red" icon={<IconTrendingDown size={16} stroke={1.5} />} />
        <KpiCard label="P50 AUM Lift (Expected)" value={fmtM(result.p50)} color="violet" icon={<IconTarget size={16} stroke={1.5} />} />
        <KpiCard label="P95 AUM Lift (Optimistic)" value={fmtM(result.p95)} color="green" icon={<IconTrendingUp size={16} stroke={1.5} />} />
      </SimpleGrid>

      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
        AUM Lift Distribution ({result.distributionData?.length * 20 || 1000} iterations)
      </Text>
      <AreaChart
        h={240}
        data={result.distributionData || []}
        dataKey="bucket"
        series={[{ name: 'probability', color: 'violet' }]}
        withTooltip
        xAxisLabel="AUM Lift"
        yAxisLabel="Probability Density"
        tickFormatter={(v) => fmtM(v)}
        fillOpacity={0.3}
      />
    </Stack>
  )
}
