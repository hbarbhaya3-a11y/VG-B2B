import { Paper, Stack, Group, Text, ThemeIcon, Badge } from '@mantine/core'
import { IconBulb, IconInfoCircle } from '@tabler/icons-react'

/**
 * PanelGuide — plain-English explanation card rendered at the top of a panel
 * to help business users understand what the page is showing and what to do.
 *
 * Props:
 *   - title:   short header (e.g. "How to read this page")
 *   - body:    one-paragraph plain-English explanation (string)
 *   - bullets: optional array of strings; each rendered as a labelled bullet
 *   - sections: optional array of { label, body } for structured guides
 *   - color:   accent color (default 'blue')
 *   - icon:    optional Tabler icon component (default IconBulb)
 *   - tag:     optional label (e.g. "What this is")
 */
export default function PanelGuide({
  title = 'How to read this page',
  body,
  bullets,
  sections,
  color = 'blue',
  icon: Icon = IconBulb,
  tag,
}) {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        borderLeft: `4px solid var(--mantine-color-${color}-7)`,
        background: `linear-gradient(135deg, var(--mantine-color-${color}-light), transparent 80%)`,
      }}
    >
      <Stack gap="xs">
        <Group gap={8} wrap="nowrap">
          <ThemeIcon size="md" radius="xl" variant="filled" color={color}>
            <Icon size={14} stroke={1.7} />
          </ThemeIcon>
          <Group gap={6} wrap="nowrap" style={{ flex: 1 }}>
            <Text size="sm" fw={800}>{title}</Text>
            {tag && <Badge size="xs" variant="light" color={color}>{tag}</Badge>}
          </Group>
        </Group>

        {body && (
          <Text size="xs" style={{ lineHeight: 1.55 }}>{body}</Text>
        )}

        {bullets && bullets.length > 0 && (
          <Stack gap={4} mt={2}>
            {bullets.map((b, i) => (
              <Group key={i} gap={6} wrap="nowrap" align="flex-start">
                <ThemeIcon size="xs" radius="xl" variant="light" color={color} mt={2}>
                  <IconInfoCircle size={10} stroke={1.7} />
                </ThemeIcon>
                <Text size="11px" style={{ lineHeight: 1.5 }}>{b}</Text>
              </Group>
            ))}
          </Stack>
        )}

        {sections && sections.length > 0 && (
          <Stack gap="xs" mt={2}>
            {sections.map((s, i) => (
              <Stack key={i} gap={2}>
                <Text size="10px" c="dimmed" tt="uppercase" fw={600}>{s.label}</Text>
                <Text size="11px" style={{ lineHeight: 1.5 }}>{s.body}</Text>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
