# Mantine v8 — Complete Component Library Reference

> **Rule for all agents**: Before designing or implementing ANY UI element, check this file first.
> Always prefer a native Mantine v8 component over a custom implementation.
> Only customise if the native component genuinely cannot meet the requirement after exhausting all props.

---

## Installed Packages

| Package | What it provides | Import path |
|---|---|---|
| `@mantine/core` | All core UI components | `@mantine/core` |
| `@mantine/hooks` | Utility hooks | `@mantine/hooks` |
| `@mantine/form` | Form state + validation | `@mantine/form` |
| `@mantine/dates` | Date/time pickers and calendar | `@mantine/dates` |
| `@mantine/charts` | Data visualisation (recharts-based) | `@mantine/charts` |
| `@mantine/notifications` | Toast notification system | `@mantine/notifications` |
| `@mantine/modals` | Modal manager | `@mantine/modals` |
| `@mantine/spotlight` | Search / command palette | `@mantine/spotlight` |
| `@mantine/dropzone` | File upload drop zone | `@mantine/dropzone` |
| `@mantine/carousel` | Embla-based carousel/slider | `@mantine/carousel` |
| `@mantine/tiptap` | Rich text editor | `@mantine/tiptap` |
| `@mantine/code-highlight` | Syntax-highlighted code blocks | `@mantine/code-highlight` |
| `@mantine/nprogress` | Top-of-page navigation progress bar | `@mantine/nprogress` |

---

## Component Directory — by category

### Layout
| Component | Use for |
|---|---|
| `Container` | Max-width page wrapper with responsive padding |
| `Grid` / `Grid.Col` | 12-column responsive grid layout |
| `SimpleGrid` | Equal-width column grid, responsive cols |
| `Stack` | Vertical arrangement with consistent gap |
| `Group` | Horizontal arrangement with consistent gap |
| `Flex` | Flexbox with full control over alignment/direction |
| `Center` | Center child horizontally and vertically |
| `Space` | Blank space between elements |
| `AspectRatio` | Force an element to a specific aspect ratio |
| `Skeleton` | Loading placeholder for any shape/size |
| `Divider` | Horizontal or vertical separator line |

### Typography
| Component | Use for |
|---|---|
| `Title` | Page/section headings (h1–h6) |
| `Text` | Body copy, labels, descriptions — use `c`, `size`, `fw`, `fs` props |
| `Anchor` | Styled link (inline or standalone) |
| `Blockquote` | Pull-quote or highlighted quote |
| `Code` | Inline code snippet |
| `Highlight` | Text with background highlight on search terms |
| `Mark` | HTML `<mark>` wrapper |
| `TypographyStylesProvider` | Apply Mantine typography to raw HTML (markdown output) |

### Input & Forms (`@mantine/core` + `@mantine/form`)
| Component | Use for |
|---|---|
| `TextInput` | Single-line text input |
| `NumberInput` | Numeric input with increment/decrement controls |
| `Textarea` | Multi-line text input |
| `PasswordInput` | Password field with show/hide toggle |
| `Select` | Single-select dropdown |
| `MultiSelect` | Multi-select with chips |
| `Autocomplete` | Free-text with suggestions |
| `Combobox` | Fully controlled custom select/autocomplete |
| `Checkbox` / `CheckboxGroup` | Single or grouped checkboxes |
| `Radio` / `RadioGroup` | Single or grouped radio buttons |
| `Switch` | Toggle on/off control |
| `Slider` | Single value range selector |
| `RangeSlider` | Two-handle range selector |
| `Rating` | Star/icon rating input |
| `ColorInput` | Hex/rgb color picker input |
| `ColorPicker` | Standalone color picker swatch |
| `FileInput` | File selection input |
| `JsonInput` | Multi-line JSON editor with validation |
| `PinInput` | OTP / PIN entry |
| `SegmentedControl` | Button group for mutually exclusive options |
| `Chip` / `ChipGroup` | Toggle chips, single or multi select |
| `useForm` (hook) | Form state, field registration, validation |

### Buttons & Actions
| Component | Use for |
|---|---|
| `Button` | Primary/secondary/ghost/outline action |
| `ActionIcon` | Icon-only button |
| `CopyButton` | Clipboard copy with auto-feedback |
| `FileButton` | Trigger file picker without visible input |
| `UnstyledButton` | Base for custom clickable elements |

### Navigation
| Component | Use for |
|---|---|
| `Tabs` / `Tabs.List` / `Tabs.Tab` / `Tabs.Panel` | Tabbed content |
| `Breadcrumbs` | Hierarchical navigation trail |
| `NavLink` | Sidebar/nav menu item with active state |
| `Stepper` | Multi-step wizard / progress tracker |
| `Pagination` | Page number controls |
| `Burger` | Hamburger menu toggle |
| `AppShell` | Full-page layout with navbar/aside/header/footer |

### Feedback & Status
| Component | Use for |
|---|---|
| `Alert` | Inline contextual message (info/warning/error/success) |
| `Badge` | Status label, count indicator, tag |
| `Progress` | Linear progress bar |
| `RingProgress` | Circular progress / donut percentage |
| `Loader` | Spinner / loading indicator |
| `Notification` | Single notification item |
| `notifications` (from `@mantine/notifications`) | Show/hide/update toast notifications programmatically |
| `NProgress` (from `@mantine/nprogress`) | Top navigation progress bar |
| `Skeleton` | Shimmer loading placeholder |

### Overlays & Floating
| Component | Use for |
|---|---|
| `Modal` | Centered overlay dialog |
| `modals` (from `@mantine/modals`) | Programmatic modal open/confirm/custom |
| `Drawer` | Side-sliding panel overlay |
| `Tooltip` | Hover tooltip on any element |
| `Popover` | Positioned popover with trigger |
| `HoverCard` | Rich hover card with delay |
| `Menu` / `Menu.Item` | Dropdown context menu |
| `Dialog` | Non-blocking floating dialog (corner of screen) |
| `Affix` | Fixed position element (e.g., scroll-to-top button) |
| `Overlay` | Full-area dimming overlay |
| `LoadingOverlay` | Full-area loading overlay with spinner |
| `Transition` | Animated mount/unmount wrapper |

### Data Display
| Component | Use for |
|---|---|
| `Table` | Structured tabular data |
| `List` | Unordered/ordered list |
| `Timeline` | Vertical event timeline |
| `Accordion` | Collapsible content sections |
| `Card` | Content card with optional sections |
| `Paper` | Elevated surface wrapper |
| `Image` | Responsive image with fallback |
| `Avatar` | User or entity avatar |
| `Indicator` | Dot/badge overlay on a child element |
| `ThemeIcon` | Coloured icon container |
| `Kbd` | Keyboard shortcut display |
| `Spoiler` | Expand/collapse long text |
| `ScrollArea` | Custom scrollable container |
| `Collapse` | Animated height expand/collapse |

### Charts (`@mantine/charts` — all recharts-based)
| Component | Use for |
|---|---|
| `BarChart` | Grouped/stacked bar charts |
| `LineChart` | Line/trend over time |
| `AreaChart` | Area/fill under line (stacked too) |
| `DonutChart` | Donut/pie percentage breakdown |
| `PieChart` | Pie chart |
| `BubbleChart` | Bubble/scatter by size |
| `RadarChart` | Radar / spider chart |
| `ScatterChart` | X/Y scatter plot |
| `Sparkline` | Compact inline trend line |
| `CompositeChart` | Mixed chart types on same axes |

**Mandatory chart rules:**
- Every chart must have `xAxisLabel` and `yAxisLabel` (except intentional sparklines)
- Every `series` entry must have a human-readable `label` field
- Every `DonutChart` / `PieChart` data entry must have its own distinct `color`
- Always enable `withTooltip`

### Dates (`@mantine/dates` — requires `dayjs`)
| Component | Use for |
|---|---|
| `DateInput` | Single date text input with picker |
| `DatePickerInput` | Single date picker (compact form input) |
| `DateTimePicker` | Date + time combined picker |
| `TimeInput` | Time-only input |
| `DatePicker` | Inline standalone date picker |
| `MonthPickerInput` | Month selector |
| `YearPickerInput` | Year selector |
| `DateRangePicker` | Two-date range selection |
| `Calendar` | Full calendar display |

### Media & Rich Content
| Component | Use for |
|---|---|
| `Dropzone` (from `@mantine/dropzone`) | Drag-and-drop file upload area |
| `Carousel` / `Carousel.Slide` (from `@mantine/carousel`) | Image/content slideshow |
| `RichTextEditor` (from `@mantine/tiptap`) | WYSIWYG rich text editing |
| `CodeHighlight` (from `@mantine/code-highlight`) | Syntax-highlighted code block |

### Utility
| Component | Use for |
|---|---|
| `Spotlight` (from `@mantine/spotlight`) | Command palette / global search |
| `VisuallyHidden` | Screen-reader-only content |
| `Portal` | Render outside component tree |
| `FocusTrap` | Trap keyboard focus in a container |
| `MantineProvider` | Root provider — theme, color scheme |
| `ColorSchemeScript` | SSR color scheme hydration (not needed for Vite SPA) |

---

## Use-Case → Component Mapping

| Design requirement | First choice | Alternative |
|---|---|---|
| Show a KPI number with label | `Card` with `Title` + `Text` | `Paper` + `Stack` |
| Show % or circular progress | `RingProgress` | `Progress` |
| Linear progress/step | `Progress` | `Stepper` |
| Status label/tag | `Badge` | `Indicator` |
| Warning/info message inline | `Alert` | `Notification` |
| Toast notification | `notifications.show()` | — |
| Confirm destructive action | `modals.openConfirmModal()` | `Modal` |
| Multi-step wizard | `Stepper` | `Tabs` |
| Parameter slider | `Slider` | `RangeSlider` |
| Select from fixed options | `SegmentedControl` | `Select` |
| Filter chips | `Chip` / `ChipGroup` | `MultiSelect` |
| Table of records | `Table` | — |
| Collapsible section | `Accordion` | `Collapse` |
| Trend over time | `LineChart` | `AreaChart` |
| Category comparison | `BarChart` | — |
| Part-of-whole breakdown | `DonutChart` | `PieChart` |
| Multi-axis comparison | `RadarChart` | `CompositeChart` |
| Date range input | `DateRangePicker` | two `DateInput` |
| Calendar view | `Calendar` | `DatePicker` |
| File upload | `Dropzone` | `FileInput` |
| Global search | `Spotlight` | — |
| Rich text content | `RichTextEditor` (tiptap) | `TypographyStylesProvider` |
| Code display | `CodeHighlight` | `Code` |
| Page loading bar | `NProgress` | `Loader` |

---

## Customisation Philosophy

**Always follow this order:**

1. **Native first** — use the Mantine component exactly as designed. Check all props before concluding something is impossible natively.
2. **Style props** — use Mantine's built-in `c`, `bg`, `p`, `m`, `fw`, `fz`, `radius`, `variant` etc. before writing any CSS.
3. **`styles` prop** — use the component's `styles` API to target named sub-elements before writing external CSS.
4. **`classNames` prop** — apply scoped CSS classes to sub-elements when `styles` prop isn't enough.
5. **Theme extension** — add new component variants in `src/theme.js` if a pattern repeats 3+ times.
6. **Wrapper component** — build a thin wrapper only when the same combination of Mantine components is repeated 3+ times.
7. **Custom from scratch** — last resort, only when no Mantine component fits the interaction model at all.

**Never customise:**
- Don't override `--mantine-color-*` CSS variables inline — extend the theme instead
- Don't fight Mantine's spacing scale — use `gap`, `p`, `m` props with numeric tokens
- Don't add custom CSS for dark mode — use `var(--mantine-color-X-light)` and `var(--mantine-color-default-hover)`

---

## TwinX Wealth Banking — Component Patterns

```jsx
// Toast notification — always use this wrapper, never notifications.show() directly
toast(message, color, title)

// KPI card
<Card withBorder radius="md" p="md">
  <Text size="xs" c="dimmed">{label}</Text>
  <Title order={3}>{formattedValue}</Title>
  <Badge color={trend > 0 ? 'green' : 'red'} variant="light">{trendLabel}</Badge>
</Card>

// Module-tinted section header
<Paper p="sm" style={{ background: `var(--mantine-color-${moduleColor}-light)` }}>
  <Group gap="xs">
    <ThemeIcon color={moduleColor} variant="light" size="sm"><ModuleIcon /></ThemeIcon>
    <Text fw={600} size="sm">{title}</Text>
  </Group>
</Paper>

// Confirmation modal
modals.openConfirmModal({
  title: 'Confirm action',
  children: <Text size="sm">Are you sure?</Text>,
  labels: { confirm: 'Confirm', cancel: 'Cancel' },
  confirmProps: { color: 'red' },
  onConfirm: () => handleConfirm(),
})
```
