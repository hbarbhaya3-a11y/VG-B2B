import { Card, Stack, Group, Text, Badge, Progress, ThemeIcon } from '@mantine/core'
import {
  IconRadar, IconShieldCheck, IconPackage, IconSwords, IconChartBar,
  IconClock, IconUsers, IconRobot
} from '@tabler/icons-react'

import { fmtConf, fmtK, fmtRelTime } from '../../utils/format'

const SEVERITY_COLORS = { Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'green' }
const TYPE_COLORS = { volatility: 'teal', regulatory: 'red', product: 'blue', competitive: 'grape', earnings: 'green', behavior: 'teal', transition: 'violet', sponsor: 'orange' }
const TYPE_ICONS = {
  volatility: IconRadar,
  regulatory: IconShieldCheck,
  product: IconPackage,
  competitive: IconSwords,
  earnings: IconChartBar,
  behavior: IconRadar,
  transition: IconUsers,
  sponsor: IconChartBar,
}
const STAGE_COLORS = { SENSE: 'teal', SIMULATE: 'violet', RESPOND: 'orange', LEARN: 'green', SELECT: 'vanguardRed', TRIAL: 'orange', EXECUTE: 'green' }

const ACTION_WINDOWS = {
  volatility: '72h response window',
  behavior: '6h–30d response window',
  transition: '14–90 day window',
  sponsor: '90-day review window',
  regulatory: '30-day compliance window',
  product: 'Ongoing opportunity',
  competitive: 'Awareness response',
  earnings: 'Pre-event staging'
}

const SOURCE_SHORT = {
  'Bloomberg MCP': 'Bloomberg',
  'SEC EDGAR': 'SEC EDGAR',
  'Salesforce CRM': 'CRM',
  'Competitor Feed (ETF.com)': 'ETF.com',
}

// Props: { signal, isSelected, onClick, onRunScenario }
export default function SignalCard({ signal, isSelected, onClick }) {
  const TypeIcon = TYPE_ICONS[signal.type] || IconRadar
  const typeColor = TYPE_COLORS[signal.type] || 'gray'
  const stageColor = STAGE_COLORS[signal.lifecycleStage] || 'gray'
  const sourceShort = SOURCE_SHORT[signal.source] || signal.source

  const agentLabel = signal.triggerAgent === 'market-sentinel' ? 'Market Sentinel'
    : signal.triggerAgent === 'context-decoder' ? 'Context Decoder'
    : signal.triggerAgent

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      mb="xs"
      style={{
        cursor: 'pointer',
        borderColor: isSelected ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-default-border)',
        background: isSelected ? 'var(--mantine-color-blue-light)' : undefined,
        borderLeft: `3px solid var(--mantine-color-${typeColor}-5)`,
      }}
      onClick={onClick}
    >
      <Stack gap={6}>
        {/* Row 1: type icon + title + severity */}
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <ThemeIcon size="sm" variant="light" color={typeColor} radius="sm" style={{ flexShrink: 0, marginTop: 2 }}>
            <TypeIcon size={12} stroke={1.5} />
          </ThemeIcon>
          <Text size="xs" fw={700} flex={1} lineClamp={2} style={{ lineHeight: 1.4 }}>
            {signal.title}
          </Text>
          <Group gap={4} style={{ flexShrink: 0 }}>
            <Badge radius="sm" variant="filled" color={SEVERITY_COLORS[signal.severity] || 'gray'} size="xs">
              {signal.severity}
            </Badge>
          </Group>
        </Group>

        {/* Row 2: description */}
        <Text size="xs" c="dimmed" lineClamp={2} style={{ lineHeight: 1.5 }}>
          {signal.description}
        </Text>

        {/* Row 3: key metrics */}
        <Group gap="md">
          <Group gap={4}>
            <IconUsers size={11} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" fw={600}>{fmtK(signal.affectedCohortCount ?? signal.affectedAdvisorCount ?? 0)}</Text>
            <Text size="xs" c="dimmed">participants</Text>
          </Group>
          <Group gap={4}>
            <IconRadar size={11} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed">{signal.historicalPrecedentCount} precedents</Text>
          </Group>
        </Group>

        {/* Row 4: confidence bar */}
        <Group gap="xs" align="center">
          <Text size="xs" c="dimmed" style={{ minWidth: 62 }}>Confidence</Text>
          <Progress
            value={signal.confidence * 100}
            color={signal.confidence >= 0.85 ? 'green' : signal.confidence >= 0.7 ? 'blue' : 'orange'}
            size="xs"
            flex={1}
          />
          <Text size="xs" fw={600} style={{ minWidth: 30 }}>{fmtConf(signal.confidence)}</Text>
        </Group>

        {/* Row 5: stage + source + action window */}
        <Group justify="space-between" align="center">
          <Group gap={4}>
            <Badge radius="sm" variant="light" color={stageColor} size="xs">
              {signal.lifecycleStage}
            </Badge>
            <Badge radius="sm" variant="outline" color="gray" size="xs">
              {sourceShort}
            </Badge>
          </Group>
          <Group gap={4}>
            <IconClock size={10} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed">{fmtRelTime(signal.detectedAt)}</Text>
          </Group>
        </Group>

        {/* Row 6: agent + action window */}
        <Group justify="space-between" align="center">
          <Group gap={4}>
            <IconRobot size={10} stroke={1.5} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="xs" c="dimmed">{agentLabel}</Text>
          </Group>
          <Text size="xs" c={typeColor === 'red' || signal.severity === 'Critical' ? 'red' : 'dimmed'} fw={500}>
            {ACTION_WINDOWS[signal.type]}
          </Text>
        </Group>
        {/* Scenario entry point — only for the 5 scenario-linked signals */}
      </Stack>
    </Card>
  )
}
