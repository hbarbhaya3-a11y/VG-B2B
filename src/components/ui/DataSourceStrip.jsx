import { useRef, useState } from 'react'
import { Group, Stack, Text, Tooltip, Badge, Paper, ThemeIcon, Button, ActionIcon, Alert } from '@mantine/core'
import {
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconJson,
  IconFile,
  IconDatabase,
  IconUpload,
  IconX,
  IconUserPlus,
  IconRefresh,
  IconAlertCircle,
} from '@tabler/icons-react'

const TYPE_META = {
  xlsx: { Icon: IconFileSpreadsheet, color: 'green', label: 'Spreadsheet' },
  xls:  { Icon: IconFileSpreadsheet, color: 'green', label: 'Spreadsheet' },
  csv:  { Icon: IconFileTypeCsv,     color: 'blue',  label: 'CSV feed' },
  pdf:  { Icon: IconFileTypePdf,     color: 'red',   label: 'PDF document' },
  json: { Icon: IconJson,            color: 'violet',label: 'API / JSON' },
  default: { Icon: IconFile,         color: 'gray',  label: 'File' },
}

const ACCEPT_EXTS = ['.xlsx', '.xls', '.csv', '.pdf', '.json', '.tsv', '.txt']

// Required document types for a prospect (acquisition mode) to run a meaningful
// optimizer pass. Surfaced as a small checklist in the empty state.
const ACQUISITION_REQUIRED_DOCS = [
  { type: 'xlsx', label: 'Census file',         hint: 'Employee demographics, comp, deferral elections' },
  { type: 'csv',  label: 'Payroll feed',        hint: 'Current contributions and match capture' },
  { type: 'pdf',  label: 'Plan document',       hint: 'Current parameters, vesting, eligibility' },
  { type: 'xlsx', label: 'ADP/ACP test workbook', hint: 'Most recent IRS discrimination test' },
]

function detectType(name) {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (TYPE_META[ext]) return ext
  return 'default'
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function SourcePill({ name, type, lastSync, purpose, custom, onRemove }) {
  const meta = TYPE_META[type] || TYPE_META.default
  const Icon = meta.Icon
  const tooltipLines = [meta.label]
  if (purpose) tooltipLines.push(purpose)
  if (lastSync) tooltipLines.push(`Synced ${lastSync} ago`)
  if (custom) tooltipLines.push('Uploaded by user · stored client-side only for this session')
  const tooltip = tooltipLines.join(' · ')

  return (
    <Tooltip label={tooltip} withArrow multiline w={280}>
      <Badge
        size="md"
        radius="sm"
        variant={custom ? 'filled' : 'light'}
        color={custom ? 'orange' : meta.color}
        leftSection={<Icon size={12} stroke={1.6} />}
        rightSection={custom && onRemove ? (
          <ActionIcon
            size={14}
            radius="xl"
            variant="transparent"
            color="white"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            aria-label={`Remove ${name}`}
            style={{ marginLeft: 2 }}
          >
            <IconX size={10} stroke={2.5} color="white" />
          </ActionIcon>
        ) : null}
        style={{ textTransform: 'none', cursor: 'help', fontWeight: 500 }}
      >
        {custom ? `Custom · ${name}` : name}
      </Badge>
    </Tooltip>
  )
}

/**
 * Renders a data-source manifest strip.
 *
 * Props:
 *   - sources: [{ name, type, lastSync?, internal?, purpose? }]
 *   - title?: string  (default depends on mode)
 *   - lastSyncLabel?: string  (e.g. "Last sync: 4h ago")
 *   - dense?: boolean  (smaller padding for inline use in deeper panels)
 *   - allowUpload?: boolean  (default true)
 *   - mode?: 'renewal' | 'acquisition'  (default 'renewal')
 *       - 'renewal': pre-connected sponsor data sources are visible; uploads are additive.
 *       - 'acquisition': no pre-connected sources; the strategist uploads everything for
 *         the prospect. An empty-state checklist of required documents is rendered until
 *         at least one upload exists.
 *   - onCustomSourcesChange?: (customSources[]) => void  (parent can react to uploads)
 */
export default function DataSourceStrip({
  sources = [],
  title,
  lastSyncLabel,
  dense = false,
  allowUpload = true,
  mode = 'renewal',
  onCustomSourcesChange,
}) {
  const [customSources, setCustomSources] = useState([])
  const fileInputRef = useRef(null)

  const isAcquisition = mode === 'acquisition'
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const additions = files.map((f) => ({
      name: f.name,
      type: detectType(f.name),
      lastSync: 'just now',
      purpose: `Uploaded by user${f.size ? ` · ${formatSize(f.size)}` : ''}`,
      internal: true,
      custom: true,
      key: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }))
    setCustomSources((prev) => {
      const next = [...prev, ...additions]
      onCustomSourcesChange?.(next)
      return next
    })
    event.target.value = ''
  }

  const removeCustom = (key) => {
    setCustomSources((prev) => {
      const next = prev.filter((c) => c.key !== key)
      onCustomSourcesChange?.(next)
      return next
    })
  }

  // In acquisition mode the pre-connected sources are intentionally hidden —
  // a prospect has no internal feeds yet. External (e.g. peer Form 5500)
  // sources still render because they're public benchmark data.
  const hasFlag = sources.some((s) => 'internal' in s)
  const internal = (isAcquisition || !hasFlag)
    ? (isAcquisition ? [] : sources)
    : sources.filter((s) => s.internal !== false)
  const external = hasFlag ? sources.filter((s) => s.internal === false) : []

  const resolvedTitle = title || (isAcquisition ? 'Prospect data sources' : 'Data sources')

  return (
    <Paper
      withBorder
      radius="md"
      p={dense ? 'xs' : 'sm'}
      style={{
        background: isAcquisition ? 'var(--mantine-color-orange-light)' : 'var(--mantine-color-gray-0)',
        borderLeft: isAcquisition
          ? '3px solid var(--mantine-color-orange-6)'
          : '3px solid var(--mantine-color-blue-5)',
      }}
    >
      <Stack gap={dense ? 4 : 'xs'}>
        {/* Header */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} wrap="nowrap">
            <ThemeIcon
              size="sm" radius="xl" variant="light"
              color={isAcquisition ? 'orange' : 'blue'}
            >
              {isAcquisition
                ? <IconUserPlus size={12} stroke={1.7} />
                : <IconDatabase size={12} stroke={1.7} />}
            </ThemeIcon>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">{resolvedTitle}</Text>
            <Badge
              size="xs"
              variant="light"
              color={isAcquisition ? 'orange' : 'teal'}
              leftSection={isAcquisition
                ? <IconUserPlus size={9} stroke={1.7} />
                : <IconRefresh size={9} stroke={1.7} />}
            >
              {isAcquisition ? 'Acquisition · prospect' : 'Renewal · sponsor connected'}
            </Badge>
          </Group>
          <Group gap={8} wrap="nowrap">
            {!isAcquisition && lastSyncLabel && (
              <Text size="10px" c="dimmed">{lastSyncLabel}</Text>
            )}
            {allowUpload && (
              <Tooltip
                label={isAcquisition
                  ? 'Upload prospect documents to begin — Census, Payroll, Plan document, ADP/ACP workbook'
                  : 'Upload a custom document (Census, Payroll, plan amendment, etc.)'}
                withArrow multiline w={260}
              >
                <Button
                  size="compact-xs"
                  // Acquisition: prominent filled button (uploads are the primary action)
                  // Renewal: light button (uploads are additive)
                  variant={isAcquisition ? 'filled' : 'light'}
                  color={isAcquisition ? 'orange' : 'blue'}
                  leftSection={<IconUpload size={12} stroke={1.7} />}
                  onClick={handleUploadClick}
                >
                  {isAcquisition ? 'Upload prospect data' : 'Upload'}
                </Button>
              </Tooltip>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT_EXTS.join(',')}
              onChange={handleFiles}
              style={{ display: 'none' }}
            />
          </Group>
        </Group>

        {/* Acquisition empty state — required-docs checklist */}
        {isAcquisition && customSources.length === 0 && (
          <Alert color="orange" variant="light" icon={<IconAlertCircle size={14} />} radius="md" p="xs">
            <Stack gap={4}>
              <Text size="xs" fw={700}>No prospect data uploaded yet</Text>
              <Text size="11px" style={{ lineHeight: 1.5 }}>
                Upload the documents below to run the optimizer for this prospect. Connected feeds (Census, Payroll, HRIS) are not available until the sponsor relationship is established — uploads stand in for them.
              </Text>
              <Group gap={6} wrap="wrap" mt={4}>
                {ACQUISITION_REQUIRED_DOCS.map((doc) => {
                  const meta = TYPE_META[doc.type] || TYPE_META.default
                  const Icon = meta.Icon
                  return (
                    <Tooltip key={doc.label} label={doc.hint} withArrow multiline w={220}>
                      <Badge
                        size="md" radius="sm" variant="outline" color="orange"
                        leftSection={<Icon size={12} stroke={1.6} />}
                        style={{ textTransform: 'none', cursor: 'help', fontWeight: 500, opacity: 0.8 }}
                      >
                        {doc.label}
                      </Badge>
                    </Tooltip>
                  )
                })}
              </Group>
            </Stack>
          </Alert>
        )}

        {/* Internal — sponsor-connected sources (renewal only) */}
        {!isAcquisition && internal.length > 0 && (
          <Stack gap={4}>
            {hasFlag && external.length > 0 && (
              <Text size="10px" c="dimmed" tt="uppercase" fw={600}>Internal — sponsor data</Text>
            )}
            <Group gap={6} wrap="wrap">
              {internal.map((s) => <SourcePill key={s.name} {...s} />)}
            </Group>
          </Stack>
        )}

        {/* External — peer benchmarks (always available) */}
        {external.length > 0 && (
          <Stack gap={4}>
            <Text size="10px" c="dimmed" tt="uppercase" fw={600}>External — peer benchmarks</Text>
            <Group gap={6} wrap="wrap">
              {external.map((s) => <SourcePill key={s.name} {...s} />)}
            </Group>
          </Stack>
        )}

        {/* Custom user uploads */}
        {customSources.length > 0 && (
          <Stack gap={4}>
            <Text size="10px" c="dimmed" tt="uppercase" fw={600}>
              {isAcquisition
                ? `Prospect uploads (${customSources.length}) — session only`
                : `Custom uploads (${customSources.length}) — session only`}
            </Text>
            <Group gap={6} wrap="wrap">
              {customSources.map((s) => (
                <SourcePill
                  key={s.key}
                  {...s}
                  onRemove={() => removeCustom(s.key)}
                />
              ))}
            </Group>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
