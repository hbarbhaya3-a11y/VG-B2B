# TwinX for Vanguard — UX Design System & Component Library

## Overview

This document serves as a **reusable UX design guide** for the TwinX for Vanguard platform. It captures the complete design system, including theme definitions, component library, layout patterns, and best practices. Use this as a reference for building consistent interfaces across applications.

---

## 1. Color Palette & Theme

### Primary Brand Colors

**Vanguard Red (Primary)**
- Light (#fdf2f2) — Lightest backgrounds, hover states
- Lighter (#f9d8d9)
- Light (#f2aaac)
- Medium light (#ea797c)
- Medium (#e45055)
- Base (#e03337) — Primary interactive elements
- Dark (#96151D) — Primary color, strong emphasis
- Darker (#7d1119)
- Darkest (#630d14)
- Ultra-dark (#4a0a0f)

**Accent Colors (Semantic by workflow stage)**
- **Sense**: Teal — data exploration, signal discovery
- **Simulate**: Violet — computational/modeling workflows
- **Select**: Vanguard Red — governance, decision-making
- **Trial**: Orange — experimental/A/B testing
- **Execute**: Green — active campaigns, deployment
- **Learn**: Grape — analytics, measurement, feedback loops
- **Operate**: Blue — operational/admin tasks

### Gradient

```javascript
const TWINX_GRADIENT = { 
  deg: 135, 
  from: '#96151D',  // Dark Vanguard Red
  to: '#C0392B'     // Rich Red
}
```
Used for: Logo/badge background, hero sections, accent treatment

### Typography

- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- **Default Radius**: `md` (medium border radius)
- **Primary Color**: `vanguardRed`
- **Color Scheme**: Light mode (default)

---

## 2. Component Library

### 2.1 KpiCard

**Purpose**: Display a key performance indicator with supporting context, delta, and optional icon.

**Key Features**:
- Icon + label + value layout
- Optional sub-value text
- Delta badge (green for +, red for −)
- Tooltip support
- Mantine Card wrapper with border

**Example Props**:
```javascript
{
  label: "Total Participants",
  value: "42.5K",
  subValue: "12 plans",
  delta: 0.08,           // 8% change
  color: "blue",         // Icon + text color
  icon: <IconUsers />,   // Optional Tabler icon
  tooltip: "Across all 401(k) plans"
}
```

**Usage**:
```javascript
import KpiCard from './components/ui/KpiCard'
import { IconUsers } from '@tabler/icons-react'

<KpiCard
  label="Active Participants"
  value="245K"
  delta={0.12}
  color="vanguardRed"
  icon={<IconUsers size={20} />}
/>
```

---

### 2.2 SignalCard

**Purpose**: Display a market signal, behavioral trigger, or system-generated alert with severity, confidence, and source metadata.

**Key Features**:
- Type-based icon and color (volatility, regulatory, product, etc.)
- Severity badge (Critical, High, Medium, Low)
- Confidence bar with adaptive coloring (green ≥85%, blue ≥70%, orange <70%)
- Lifecycle stage badge
- Affected participant count + precedent count
- Source, detected time, trigger agent
- Action window metadata (72h, 14–90d, etc.)
- Click-to-select highlighting
- Left border accent in type color

**Signal Types & Colors**:
- volatility → teal
- regulatory → red
- product → blue
- competitive → grape
- earnings → green
- behavior → teal
- transition → violet
- sponsor → orange

**Severity Levels**:
- Critical → red
- High → orange
- Medium → yellow
- Low → green

**Example Props**:
```javascript
{
  signal: {
    title: "Unexpected withdrawal spike in Tech cohort",
    description: "36% above baseline; correlated with S&P decline",
    type: "behavior",
    severity: "High",
    lifecycleStage: "RESPOND",
    affectedCohortCount: 1200,
    historicalPrecedentCount: 3,
    confidence: 0.88,
    source: "Bloomberg MCP",
    detectedAt: "2025-06-15T14:30:00Z",
    triggerAgent: "market-sentinel"
  },
  isSelected: true,
  onClick: handleSignalSelect
}
```

**Usage**:
```javascript
import SignalCard from './components/ui/SignalCard'

<SignalCard
  signal={marketSignal}
  isSelected={selectedSignalId === signal.id}
  onClick={() => handleSelectSignal(signal.id)}
/>
```

---

### 2.3 AdvisorTwinCard

**Purpose**: Display an individual advisor's "Twin"—a synthetic profile capturing their clients' needs, regulatory posture, and behavioral patterns.

**Key Features**:
- Advisor profile info (name, AUM, client count)
- Need-state archetype classification
- Retirement readiness stage (At-Risk, On-Track, Exceeds-Goal)
- Confidence indicator
- Behavioral metrics (responsiveness, engagement patterns)
- Risk tolerance summary
- Customizable styling per Twin persona

---

### 2.4 InterventionCard

**Purpose**: Show a recommended action, content piece, or campaign targeting a specific cohort or advisor.

**Key Features**:
- Intervention type (content, guidance, offer, escalation)
- Target audience metadata (cohort size, overlap)
- Eligibility & compliance indicators
- Estimated response rate or impact projection
- CTA (Run Scenario, Deploy, Preview)

---

### 2.5 PanelGuide

**Purpose**: Contextual help panel explaining a workflow stage, decision gate, or complex feature.

**Key Features**:
- Step-by-step guidance
- Key decision points highlighted
- Links to related documentation
- Dismissible / collapsible UI

---

### 2.6 SectionHeader

**Purpose**: Section dividers with title, optional description, and icon.

**Example**:
```javascript
<SectionHeader 
  title="Market Signals" 
  subtitle="Real-time alerts powered by market data & cohort behavior"
  icon={<IconRadar />}
/>
```

---

### 2.7 TrustRailBadge

**Purpose**: Compliance & governance status indicator (e.g., fiduciary gate status, disclosure attachment status).

**Key Features**:
- Rail indicator (color: pass = green, fail = red, pending = orange)
- Rail name (fiduciary, disclosure, disclosure, anti-churning, etc.)
- Tooltip with rail criteria
- Used in scenario approval flow

---

### 2.8 UseCaseBar

**Purpose**: Horizontal list of available use cases (workflows) that users can launch.

**Features**:
- Scrollable tab-like interface
- Icons + labels per use case
- Launch on click

---

### 2.9 UseCaseLauncher

**Purpose**: Modal dialog for discovering and launching a use case.

**Features**:
- Search + filter by bucket (Sense, Simulate, Select, Execute, Learn)
- Use case description, difficulty level, estimated duration
- "Launch" button → triggers mode choice modal

---

### 2.10 ModeChoiceModal

**Purpose**: User selection between Guided (step-by-step) vs. Autopilot (autonomous) mode.

**Features**:
- Two-card layout (Guided vs. Autopilot)
- Feature comparison
- Mode restrictions (fiduciary-sensitive workflows disable Autopilot)

---

### 2.11 PovCallout

**Purpose**: Highlight a Point-of-View (POV) principle or key insight.

**Styling**:
- Left border accent in Vanguard Red
- Background: light red
- Used for policy statements, compliance notes, fiduciary reminders

---

### 2.12 DataSourceStrip

**Purpose**: Horizontal metadata bar showing which data sources feed a page or card.

**Example**:
- Bloomberg MCP, SEC EDGAR, Salesforce CRM, ETF.com

---

### 2.13 SimResultPanel

**Purpose**: Display simulation results (Monte Carlo, confidence intervals, response curves).

**Key Features**:
- Baseline (do-nothing) comparison
- Scenario option comparison
- Visual charts (recharts integration)
- Holdout group metadata

---

### 2.14 AgentStatusCard

**Purpose**: Show the status & current task of a background agent (Market Sentinel, Context Decoder, Compliance Auditor, etc.).

**Key Features**:
- Agent name + avatar
- Current task description
- Progress indicator
- Last update timestamp

---

### 2.15 StepInsightCard

**Purpose**: Workflow step-specific insight or hint.

---

## 3. Layout Patterns

### 3.1 AppShell Structure

```
┌─────────────────────────────────────┐
│   TopHeader (h=60px)                │
├─────┬───────────────────────────────┤
│     │                               │
│ Nav │      AppMain (p="md")         │
│(w=  │  - StageBreadcrumb            │
│260/ │  - PageRouter or             │
│ 72  │    WorkflowRunner             │
│px)  │                               │
│     │                               │
└─────┴───────────────────────────────┘
```

- **Header**: 60px tall, branded top bar with logo, user avatar, help icon
- **Navbar**: Collapsible (260px open, 72px collapsed), contains WorkflowNav
- **Main**: Flexible, default background `var(--mantine-color-gray-0)`

---

### 3.2 Bucket Navigation

Six workflow stages, each with a color and landing page:

| Bucket  | Color        | Default Page | Purpose |
|---------|--------------|--------------|---------|
| sense   | teal         | use-case-catalog | Data discovery & signal browsing |
| simulate| violet       | simulate-dashboard | Monte Carlo, Quant Bridge, Plan Optimizer |
| select  | vanguardRed  | use-case-catalog | Governance, hypothesis board |
| trial   | orange       | episode-simulator | A/B testing, holdout groups |
| execute | green        | content-engine | Campaign orchestration, messaging |
| learn   | grape        | outcome-attribution | Analytics, learning loops |
| operate | blue         | agent-console | Admin tasks, operations |

---

### 3.3 StageBreadcrumb

Horizontal pill-style breadcrumb showing workflow progress:
- Current stage: gradient background + bold label
- Completed stages: gray background, reduced opacity
- Future stages: transparent, dimmed text
- Chevron separators between stages

---

### 3.4 Card Layout

All informational cards follow a pattern:
- Border: 1px solid default-border
- Radius: `md` (medium)
- Padding: varies (sm–lg)
- Shadow: optional for depth
- Hover: slight background/shadow shift

---

### 3.5 Badge Conventions

- **Filled**: High-priority information (severity, status)
- **Light**: Secondary metadata (stage, source)
- **Outline**: Tertiary filters or toggles

---

### 3.6 Spacing & Rhythm

- Gap units: `xs` (6px), `sm` (12px), `md` (16px), `lg` (24px)
- Padding: consistent with Mantine scale
- Vertical rhythm: 8px grid

---

## 4. Data Formatting Utilities

Located in `src/utils/format.js`:

```javascript
fmtM(v)       // Format millions: 42000000 → "$42.0M"
fmtB(v)       // Format billions: 1200000000 → "$1.20B"
fmtK(v)       // Format thousands: 5000 → "$5K"
fmtPct(v)     // Format percentage: 0.12 → "12.0%"
fmtConf(v)    // Format confidence: 0.88 → "88%"
fmtRelTime(iso) // Format relative time: "2025-06-15T..." → "2d ago"
```

---

## 5. Icon Library

Uses **Tabler Icons (React)** (`@tabler/icons-react@^3.40.0`):

Common icons by context:

| Context | Icon | Component |
|---------|------|-----------|
| Sense workflows | `IconRadar` | Market signals, discovery |
| Simulate | `IconPlayerPlay` | Simulations, Monte Carlo |
| Select / Governance | `IconTarget` | Decision gates, targeting |
| Trial / Testing | `IconTestPipe` | A/B tests, experiments |
| Execute | `IconRocket` | Deployment, campaigns |
| Learn / Analytics | `IconRefresh` | Measurement, iteration |
| Users/Participants | `IconUsers` | Cohort size, population |
| Compliance | `IconShieldCheck` | Regulatory status, trust rails |
| Menu | `IconMenu2` | Navigation toggle |
| Help | `IconHelpCircle` | Contextual help |

---

## 6. Form & Input Patterns

### Text Input
- Label above input
- Placeholder text for examples
- Error state: red border + error message below

### Select / Dropdown
- Button-style trigger
- Dropdown with checkmark on selected
- Multi-select variant available

### Date Picker
- Modal or inline calendar
- Uses `@mantine/dates`

### Checkbox / Radio
- Label to the right
- Large click target (≥36px)

### Buttons

```javascript
// Primary action
<Button color="vanguardRed">Deploy Campaign</Button>

// Secondary action
<Button variant="light" color="gray">Cancel</Button>

// Tertiary
<ActionIcon variant="subtle" size="lg"><IconHelp /></ActionIcon>
```

---

## 7. Responsive Breakpoints

Mantine breakpoints:
- xs: 576px
- sm: 768px
- md: 992px
- lg: 1200px
- xl: 1408px

Navbar collapses to icons at `sm` breakpoint.

---

## 8. Accessibility (a11y) Considerations

- **Keyboard navigation**: All interactive elements focusable, tab order logical
- **ARIA labels**: Buttons, icons, and icon-only controls labeled
- **Color contrast**: All text meets WCAG AA (4.5:1 for normal text)
- **Focus indicators**: Visible outline on focus
- **Semantic HTML**: Use native `<button>`, `<a>`, `<form>` elements
- **Avoid color alone**: Always pair color with text or icon

---

## 9. Common UI Anti-Patterns (❌ Avoid)

| Pattern | Wrong | Correct |
|---------|-------|---------|
| Background color washes | `var(--mantine-color-X-0)` / `-1` | `var(--mantine-color-X-light)` |
| Neutral hover | `transparent` / hardcoded hex | `var(--mantine-color-default-hover)` |
| Toast notifications | `toast.show({...})` | Use `ToastContext` hook |
| Return percentage | `` `+${ret * 100}%` `` | `` `${ret >= 0 ? "+" : ""}${(ret * 100).toFixed(2)}%` `` |
| Paper radius | `radius="sm"` | `radius="md"` |
| Back button | `variant="subtle"` | `variant="light"` |

---

## 10. Context Providers (State Management)

Wrap the app with these providers (see `src/main.jsx`):

1. **AuthContext** — User authentication, permissions
2. **ToastContext** — Notifications & toast messages
3. **ConversationContext** — Multi-turn LLM conversations
4. **UseCaseContext** — Active workflow, workflow steps, Autopilot mode
5. **MantineProvider** — Theme, color scheme

---

## 11. Component Composition Example

```javascript
import { Stack, Group, Paper } from '@mantine/core'
import KpiCard from './components/ui/KpiCard'
import SignalCard from './components/ui/SignalCard'
import SectionHeader from './components/ui/SectionHeader'
import { IconRadar } from '@tabler/icons-react'

export default function SignalDashboard() {
  return (
    <Stack gap="lg">
      <SectionHeader 
        title="Market Signals"
        subtitle="Real-time alerts"
        icon={<IconRadar />}
      />
      
      <Group grow>
        <KpiCard label="Active Signals" value="14" color="vanguardRed" />
        <KpiCard label="Critical Alerts" value="2" delta={0.15} color="red" />
      </Group>

      <Paper withBorder p="md" radius="md">
        {signals.map(signal => (
          <SignalCard 
            key={signal.id} 
            signal={signal}
            onClick={() => handleSelect(signal.id)}
          />
        ))}
      </Paper>
    </Stack>
  )
}
```

---

## 12. Theme Customization

To extend the theme for a new application, modify `src/theme.js`:

```javascript
import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'vanguardRed',
  colors: {
    vanguardRed: [
      '#fdf2f2', '#f9d8d9', '#f2aaac', '#ea797c', '#e45055',
      '#e03337', '#96151D', '#7d1119', '#630d14', '#4a0a0f',
    ],
    // Add custom colors here
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  // Override other defaults as needed
})
```

---

## 13. Dependencies

**UI Framework & Components**:
- `@mantine/core@^8.3.18` — Component library
- `@mantine/charts@^8.3.18` — Recharts-based visualizations
- `@mantine/form@^8.3.18` — Form handling
- `@mantine/hooks@^8.3.18` — Utility hooks
- `@mantine/dates@^8.3.18` — Date picker
- `@mantine/notifications@^8.3.18` — Toast/notifications
- `@mantine/modals@^8.3.18` — Modal dialogs
- `@tabler/icons-react@^3.40.0` — Icon set
- `recharts@^2.15.4` — Charts (line, bar, area, pie)

**Text Editor** (optional):
- `@tiptap/react@^3.20.4` — Rich text editing

**Carousel** (optional):
- `embla-carousel-react@^8.6.0` — Carousel/slider

---

## 14. Running & Building

```bash
# Development
npm run dev        # Start Vite dev server on http://localhost:5173

# Production build
npm run build      # Minified + optimized bundle → dist/

# Preview production build
npm run preview    # Test dist/ locally before deploy

# Backup platform
npm run backup     # Snapshot all files (for compliance)
```

---

## 15. Deployment

- **Vite build**: Outputs to `dist/`
- **Express server**: Serves `dist/` as static files (see `server.js`)
- **Docker**: Multi-stage Dockerfile for production
- **Cloud Run / Firebase**: Cloud Build integration via `cloudbuild.yaml`

---

## 16. Example: Building a New Page

```javascript
// pages/MyDashboard.jsx
import { Stack, Paper, Title, Text } from '@mantine/core'
import { IconChart } from '@tabler/icons-react'
import SectionHeader from '../components/ui/SectionHeader'
import KpiCard from '../components/ui/KpiCard'

export default function MyDashboard() {
  return (
    <Stack gap="lg">
      <SectionHeader 
        title="My Dashboard"
        subtitle="Overview & metrics"
        icon={<IconChart />}
      />
      
      <Paper withBorder p="lg" radius="md">
        <Title order={3}>Key Metrics</Title>
        <Text c="dimmed" size="sm" mb="md">
          Summary of performance indicators
        </Text>
        
        <KpiCard
          label="Total Value"
          value="$2.4B"
          delta={0.08}
          color="vanguardRed"
        />
      </Paper>
    </Stack>
  )
}
```

---

## 17. Further Customization

To adapt this design system for a different domain:

1. **Replace color palette**: Swap out Vanguard Red for your brand color
2. **Update bucket labels**: Rename "Sense," "Simulate," etc. to match your workflow
3. **Extend component library**: Add domain-specific cards (e.g., AccountCard, OrderCard)
4. **Modify layout**: Adjust navbar width, spacing, or add custom sections
5. **Add domain utilities**: Create format functions for your data types

---

## 18. Resources

- **Mantine UI**: https://mantine.dev
- **Tabler Icons**: https://tabler-icons.io
- **Recharts**: https://recharts.org
- **Vite**: https://vitejs.dev
- **React 18**: https://react.dev
- **PostCSS**: https://postcss.org

---

**Version**: 1.0  
**Last Updated**: 2025-07-08  
**Maintained By**: TwinX Design System Team  
**License**: Internal Use
