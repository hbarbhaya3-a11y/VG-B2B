# UX / UI Standards — Mantine 8 + React

**Scope**: Prescriptive, reusable standards for any application built with Mantine 8 + React 18 + Vite.  
**Status**: Living document — update when new patterns are established or existing patterns are deprecated.

---

## 1. Design System Foundation

### Theme Configuration (`src/theme.js`)
- Configured via `createTheme()` from `@mantine/core`
- **Primary color**: `blue`
- **Default radius**: `md` — applied as component default across buttons, cards, inputs, badges
- **Font family**: System default sans-serif stack (no custom font import unless explicitly required)
- **Heading weight**: `600`
- All component customisation goes in `createTheme()` — no global CSS overrides

### Component Defaults
Set via `createTheme({ components: { ... } })` for:
- `Button`: `radius: "md"`
- `Card`: `radius: "md"`
- `Paper`: `radius: "md"`
- `Input`: `radius: "md"`
- `Badge`: `radius: "sm"`
- `ActionIcon`: `radius: "md"`

### Color Scheme
- Default: **light mode**
- Dark mode: toggled via `useMantineColorScheme()` — add `<ColorSchemeToggle>` in AppShell header
- Never hard-code light/dark conditional colours — use Mantine semantic CSS variables that auto-adapt

### No Custom CSS Files
- **Zero** `.module.css` files
- **Zero** `.css` files imported in components
- **Zero** `sx` prop usage
- All styling via:
  1. Mantine style props (`c`, `bg`, `p`, `m`, `fw`, `fz`, etc.)
  2. Inline `style={{}}` with Mantine CSS variables
  3. `styles` prop on Mantine components (for sub-element targeting)
  4. `classNames` prop (last resort, for Mantine sub-element classes only)

---

## 2. Color System & Semantic Mappings

### CSS Variable Conventions

| Use case | Convention | Example |
|---|---|---|
| Background wash (light tint) | `-light` suffix | `var(--mantine-color-blue-light)` |
| Solid accent | `-6` | `var(--mantine-color-blue-6)` |
| Interactive hover background | `default-hover` | `var(--mantine-color-default-hover)` |
| Border | `default-border` | `var(--mantine-color-default-border)` |
| Secondary / muted text | `c="dimmed"` prop | — |
| Primary text | `c` prop omitted (inherits) | — |

**Never use `-0` or `-1` colour suffixes** — they break in dark mode.  
**Never use hardcoded hex values** (`#1a1a2e`, `rgba(...)`, etc.) — always CSS variables or Mantine colour props.

### Module / Section Colour Mapping
Define in `src/theme.js` as exported constants:

```js
export const SECTION_COLORS = {
  sense: 'teal',
  simulate: 'violet',
  respond: 'orange',
  learn: 'green',
  govern: 'red',
  agents: 'blue',
}

export const MOD_COLORS = {
  // Map each page/module key to a Mantine colour name
  marketSignals: 'teal',
  advisorTwin: 'cyan',
  episodeSimulator: 'violet',
  agentConsole: 'blue',
  content: 'orange',
  campaigns: 'yellow',
  attribution: 'green',
  compliance: 'red',
  operations: 'gray',
}
```

### Status Colour Mapping
```js
// Used in status badges — never hardcode, always derive from this map
export const STATUS_COLORS = {
  active: 'green',
  connected: 'green',
  cleared: 'green',
  pass: 'green',
  idle: 'gray',
  pending: 'orange',
  waiting: 'orange',
  warn: 'yellow',
  failed: 'red',
  blocked: 'red',
  fail: 'red',
  critical: 'red',
  high: 'orange',
  medium: 'yellow',
  low: 'green',
}
```

---

## 3. Layout Architecture

### AppShell Structure
```jsx
<AppShell
  navbar={{ width: collapsed ? 70 : 240, breakpoint: 'sm', collapsed: { mobile: !mobileOpen } }}
  header={{ height: 56 }}
  padding="md"
>
  <AppShell.Header>  {/* 56px — logo, demo badge, user avatar, color scheme toggle */}
  <AppShell.Navbar>  {/* Collapsible: 240px expanded / 70px icon rail */}
  <AppShell.Main>   {/* Page content renders here */}
```

### Navbar Collapse Behaviour
- Toggle button: `<ActionIcon>` in navbar header with `IconChevronsLeft` / `IconChevronsRight`
- Collapsed (70px): icons only, `<Tooltip label={navLabel} position="right">` on each item
- Expanded (240px): icons + labels + section group dividers
- Mobile: burger in AppShell.Header → `Drawer` overlay of full nav
- Section group labels: `<Text size="xs" fw={600} c="dimmed" tt="uppercase">` — hidden when collapsed

### Navigation Pattern
- **State-based routing**: `useState(defaultPage)` in App.jsx — no React Router for MVP
- `activePage` string key drives which page component renders in `<AppShell.Main>`
- Cross-page state (deep links, pre-loaded data): additional `useState` in App.jsx, passed as props

### Layout Primitives
| Purpose | Component |
|---|---|
| Horizontal arrangement | `<Group>` |
| Vertical stack | `<Stack>` |
| Responsive card grid | `<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>` |
| Generic wrapper | `<Box>` |
| Constrained content width | `<Container>` |
| Page-level padding | `<AppShell padding="md">` handles it |

### Breadcrumb Depth
- Maximum 3 levels
- Separator: `<IconChevronRight size={11} stroke={1.5} />`
- Use `<Breadcrumbs>` from Mantine — not custom implementation

---

## 4. Component Usage Standards

### Cards
```jsx
// Standard card
<Card withBorder radius="md" p="lg">...</Card>

// KPI / metric card — use KpiCard wrapper component
<KpiCard label="Total AUM" value="$142M" delta={+0.0234} color="blue" icon={IconBuildingBank} />

// Clickable card (e.g., list items)
<Card withBorder radius="md" p="md"
  style={{ cursor: 'pointer' }}
  styles={{ root: { '&:hover': { backgroundColor: 'var(--mantine-color-default-hover)' } } }}
  onClick={handler}>
```

### Tables
```jsx
<Table fz="xs" withRowBorders>
  <Table.Thead>
    <Table.Tr>
      <Table.Th>Column</Table.Th>
    </Table.Tr>
  </Table.Thead>
  <Table.Tbody>
    <Table.Tr>
      <Table.Td>Value</Table.Td>
    </Table.Tr>
  </Table.Tbody>
</Table>
```

### Badges
```jsx
// Standard badge
<Badge radius="sm" variant="light" color="blue">Label</Badge>

// Status badge — always derive colour from STATUS_COLORS
<Badge radius="sm" variant="light" color={STATUS_COLORS[status]}>{status}</Badge>

// Never hardcode badge colour inline
```

### Buttons
```jsx
// Primary action
<Button radius="md" variant="filled" color="blue">Submit</Button>

// Secondary / tertiary
<Button radius="md" variant="light">Secondary</Button>
<Button radius="md" variant="subtle">Tertiary</Button>

// Icon-only
<ActionIcon radius="md" variant="light" color="blue" size="lg">
  <IconEdit size={16} stroke={1.5} />
</ActionIcon>

// Loading state (never disable without loading indicator)
<Button radius="md" loading={isSubmitting} onClick={handleSubmit}>Save</Button>
```

### Forms
```jsx
const form = useForm({
  initialValues: { email: '', password: '' },
  validate: { email: (v) => !v ? 'Required' : null },
})

<form onSubmit={form.onSubmit(handleSubmit)}>
  <TextInput label="Email" {...form.getInputProps('email')} radius="md" />
  <Button type="submit" loading={isLoading}>Submit</Button>
</form>
```

### Modals
```jsx
// Inline modal — preferred
const [opened, { open, close }] = useDisclosure(false)

<Modal opened={opened} onClose={close} title="Confirm Action" radius="md">
  <Text>Are you sure?</Text>
  <Group justify="flex-end" mt="md">
    <Button variant="light" onClick={close}>Cancel</Button>
    <Button color="red" onClick={handleConfirm}>Delete</Button>
  </Group>
</Modal>

// Do NOT use modals manager (useModals / openModal) for standard flows
```

### Drawers
```jsx
const [opened, { open, close }] = useDisclosure(false)

<Drawer opened={opened} onClose={close} title="Detail View"
  position="right" size={480} radius="md">
  {/* content */}
</Drawer>
```

### Toasts / Notifications
```jsx
// ALWAYS use the project's ToastContext wrapper
const { toast } = useToast()
toast('Operation successful', 'green', 'Success')

// NEVER call notifications directly:
// ❌ notifications.show({ ... })
// ❌ toast.show({ ... })
```

### Accordions
```jsx
<Accordion radius="md">
  <Accordion.Item value="section">
    <Accordion.Control>Section Title</Accordion.Control>
    <Accordion.Panel>Content</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

### Section Headers
```jsx
// Use SectionHeader wrapper component — never ad-hoc title layouts
<SectionHeader
  title="Market Signals"
  description="Continuous signal detection across market, regulatory, and competitive feeds"
  color="teal"
  action={<Button size="xs" variant="light">Refresh</Button>}
/>
```

### Icons
```jsx
// Always Tabler Icons — never mix icon libraries
import { IconRadar, IconBuildingBank } from '@tabler/icons-react'

// Standard sizes:
// 14 — compact / table cells
// 16 — standard inline
// 18 — nav items
// 20 — prominent / hero
// 24 — large display

// Always stroke={1.5}
<IconRadar size={16} stroke={1.5} />

// Icon in coloured container:
<ThemeIcon variant="light" color="teal" radius="md" size="lg">
  <IconRadar size={18} stroke={1.5} />
</ThemeIcon>
```

### Progress Bars
```jsx
// Standard
<Progress value={75} color="blue" radius="xl" />

// Labelled (e.g., need-state vector)
<Group justify="space-between">
  <Text size="sm" w={80}>Evaluate</Text>
  <Progress value={34} color="blue" flex={1} />
  <Text size="xs" w={36} ta="right">34%</Text>
</Group>
```

### Ring Progress (circular indicator)
```jsx
<RingProgress
  size={64} thickness={6}
  value={churnRisk * 100}
  roundCaps
  sections={[{ value: churnRisk * 100, color: churnRisk > 0.6 ? 'red' : churnRisk > 0.3 ? 'orange' : 'green' }]}
/>
```

### Steppers
```jsx
<Stepper active={activeStep} size="sm" color="teal">
  <Stepper.Step label="SENSE" description="Signal detected" />
  <Stepper.Step label="SIMULATE" description="Scenarios modelled" />
  <Stepper.Step label="RESPOND" description="Interventions deployed" />
  <Stepper.Step label="LEARN" description="Outcomes measured" />
</Stepper>
```

### Timelines
```jsx
<Timeline active={2} bulletSize={20} lineWidth={2}>
  <Timeline.Item title="Email sent" bullet={<IconMail size={12} />}>
    <Text size="xs" c="dimmed">Day 1 — 10:00 AM</Text>
  </Timeline.Item>
  <Timeline.Item title="Portal push" bullet={<IconBell size={12} />}>
    <Text size="xs" c="dimmed">Day 3 — 2:00 PM</Text>
  </Timeline.Item>
</Timeline>
```

---

## 5. Chart & Visualisation Standards

### Library Selection
| Scenario | Library |
|---|---|
| Area, Line, Bar, Donut charts | `@mantine/charts` (preferred) |
| Multi-axis composites | Recharts `ComposedChart` |
| Scatter plots | Recharts `ScatterChart` |
| Simple sparklines | `@mantine/charts` `AreaChart` with `withXAxis={false}` |

### Required Props (all charts except sparklines)
```jsx
<AreaChart
  h={240}
  data={data}
  dataKey="x"
  series={[{ name: 'Human-readable label', key: 'y', color: 'blue' }]}
  withTooltip            // always
  xAxisLabel="X Label"  // always
  yAxisLabel="Y Label"  // always
/>
```

### Chart Heights
| Context | Height |
|---|---|
| Standard | `h={240}` |
| Compact / drawer | `h={160}` |
| Sparkline | `h={80}` |
| Full-bleed hero | `h={320}` |

### Axis Tick Formatting
```jsx
// Counts → K suffix
tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}`}

// Percentages
tickFormatter={(v) => `${v}%`}

// Dollar millions
tickFormatter={(v) => `$${(v/1e6).toFixed(0)}M`}
```

### Series Colours
- Use `var(--mantine-color-X-6)` — reference by Mantine colour name in `series` prop
- Distinct colours per series — never repeat the same colour in one chart
- Area `fillOpacity`: 0.1–0.15 for bands, 0.25–0.3 for main fills

### DonutChart / PieChart
- Every entry must have a distinct colour from the Mantine palette
- Always include `withTooltip`
- Label centred inside donut: use `chartLabel` prop or nested `<Text>` in centre slot

---

## 6. UX State Patterns

### Loading States
```jsx
// Full section loading
<Center py="xl">
  <Stack align="center" gap="xs">
    <Loader size="md" />
    <Text size="sm" c="dimmed">Loading data…</Text>
  </Stack>
</Center>

// Button loading — preserve button width
<Button loading={isSaving} onClick={handleSave}>Save Changes</Button>

// Inline skeleton (while data loads)
<Skeleton height={40} radius="md" />
```

### Error States
```jsx
// Form field error
<TextInput error="This field is required" {...form.getInputProps('field')} />

// Section-level error
<Alert color="red" variant="light" icon={<IconAlertCircle size={16} />} radius="md">
  Failed to load data. Please try again.
</Alert>
```

### Empty States
```jsx
// Standard empty state — always provide a CTA
<Center py="xl">
  <Stack align="center" gap="xs">
    <ThemeIcon size="xl" variant="light" color="gray" radius="md">
      <IconInbox size={20} stroke={1.5} />
    </ThemeIcon>
    <Text size="sm" c="dimmed">No signals detected</Text>
    <Button size="xs" variant="light" onClick={handleRefresh}>
      Refresh
    </Button>
  </Stack>
</Center>

// Never leave an empty section blank — always provide guidance text + next action
```

### Responsive Design
```jsx
// Card grids
<SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md" />

// Show/hide on breakpoint
<Box visibleFrom="md">Desktop only content</Box>
<Box hiddenFrom="md">Mobile only content</Box>

// Responsive padding
<Stack gap={{ base: 'sm', md: 'md', lg: 'lg' }} />
```

### Dark Mode Compatibility
- Use Mantine semantic CSS variables — they auto-adapt: no manual `colorScheme` checks needed
- `var(--mantine-color-default-hover)` works in both modes
- `var(--mantine-color-default-border)` works in both modes
- `c="dimmed"` works in both modes
- `var(--mantine-color-X-light)` works in both modes

---

## 7. Anti-Patterns Registry

These patterns cause bugs and must **never** appear in source code.

| # | Pattern | Wrong | Correct |
|---|---|---|---|
| 1 | Background wash | `var(--mantine-color-blue-0)` or `var(--mantine-color-blue-1)` | `var(--mantine-color-blue-light)` |
| 2 | Hover background | `background: 'transparent'` or `background: '#f5f5f5'` | `var(--mantine-color-default-hover)` |
| 3 | Toast / notification | `notifications.show({...})` or `toast.show({...})` | `toast(msg, color, title)` via `useToast()` |
| 4 | Return/delta sign | `"+" + value` or `"+${value}%"` hardcoded | `${v >= 0 ? "+" : ""}${(v*100).toFixed(2)}%` |
| 5 | Hardcoded colour | `color: '#1971c2'` or `color: 'rgb(25,113,194)'` | `color: 'var(--mantine-color-blue-6)'` or `color="blue"` prop |
| 6 | Custom CSS file | `import './Component.module.css'` | Remove; use style props |
| 7 | sx prop | `<Box sx={{ ... }}>` | `<Box style={{ ... }}>` or Mantine style props |
| 8 | Hardcoded `+` sign | `<Text>+2.3%</Text>` | Derive from value at runtime |
| 9 | Empty panel | Blank render or "coming soon" text | Empty state component with guidance + CTA |
| 10 | Non-Mantine component | `<input>`, `<button>`, custom `<div>` modal | `<TextInput>`, `<Button>`, `<Modal>` |
| 11 | Color `-0`/`-1` in inline style | `style={{ background: 'var(--mantine-color-blue-0)' }}` | `style={{ background: 'var(--mantine-color-blue-light)' }}` |
| 12 | Missing chart labels | `<AreaChart>` without `xAxisLabel`/`yAxisLabel` | Always include both |

### Anti-Pattern Scan Commands
Run before every commit:
```bash
grep -r "color-[a-z]*-[01]\b" src/          # Must return 0 matches
grep -rE "#[0-9a-fA-F]{3,6}" src/           # Must return 0 matches (in JSX/style)
grep -r "toast\.show\|notifications\.show" src/  # Must return 0 matches
grep -r '"+"' src/                           # Review: ensure not in delta context
grep -r " sx=" src/                         # Must return 0 matches
find src -name "*.module.css"               # Must return 0 files
grep -r "This module will be built" src/    # Must return 0 matches
```

---

## 8. Formatting Utilities (`src/utils/format.js`)

**Single source of truth** — import from here everywhere, never inline.

```js
// Sign-aware percentage (returns, lifts, deltas)
export const fmtPct = (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(2)}%`

// Dollar millions
export const fmtM = (v) => `$${(Math.abs(v) / 1e6).toFixed(1)}M`

// Dollar billions
export const fmtB = (v) => `$${(Math.abs(v) / 1e9).toFixed(1)}B`

// Compact count (47218 → "47K")
export const fmtK = (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`

// Confidence score (0.87 → "87%")
export const fmtConf = (v) => `${(v * 100).toFixed(0)}%`

// Relative time ("2 hours ago")
export const fmtRelTime = (isoString) => { /* ... */ }

// Date display (DD-MMM-YYYY for reports, MMM-YY for charts)
export const fmtDate = (isoString, format = 'report') => { /* ... */ }
```

---

## 9. Reusable Component Reference (`src/components/ui/`)

| Component | Props | Purpose |
|---|---|---|
| `KpiCard` | `{ label, value, subValue, delta, color, icon, tooltip }` | Standard KPI metric card |
| `SectionHeader` | `{ title, description, color, action }` | Module / section title block |
| `PovCallout` | `{ today, withTwinx, metric }` | Capital Group today vs TwinX gap callout |
| `AgentStatusCard` | `{ agent, onClick, isActive }` | Agent registry tile |
| `SignalCard` | `{ signal, isSelected, onClick }` | Market signal event card |
| `AdvisorTwinCard` | `{ advisor, onClick }` | Advisor digital twin summary card |
| `InterventionCard` | `{ intervention, compact }` | Intervention record display |
| `TrustRailBadge` | `{ rail, status }` | Five-rail trust pipeline status indicator |
| `SimResultPanel` | `{ result, isLoading }` | Monte Carlo simulation results display |

---

## 10. Key File Paths

| Purpose | Path |
|---|---|
| Theme config | `src/theme.js` |
| Application entry | `src/main.jsx` |
| App shell + routing | `src/App.jsx` |
| Shared UI components | `src/components/ui/` |
| Pages | `src/pages/` |
| Contexts | `src/contexts/` (`ToastContext`, `AuthContext`) |
| Format utilities | `src/utils/format.js` |
| Mock data | `src/data/` |
| Simulation engines | `src/simulation/` |
| Mantine component reference | `docs/mantine-v8-components.md` |
| This document | `docs/UX_UI_STANDARDS.md` |
