import { createTheme } from '@mantine/core'

export const TWINX_GRADIENT = { deg: 135, from: '#96151D', to: '#C0392B' }

export const PAGE_TO_BUCKET = {
  'use-case-catalog':       'sense',
  'market-signals':         'sense',
  'advisor-twin-registry':  'sense',
  'twin-registry':          'sense',
  'participant-twin-registry': 'sense',
  'sponsor-twin-registry':  'sense',
  'twin-enrichment':        'sense',
  'episode-simulator':      'simulate',
  'quant-bridge':           'simulate',
  'plan-optimizer':         'simulate',
  'simulate-dashboard':     'simulate',
  'trust-compliance':       'select',
  'fiduciary-gate':         'select',
  'hypothesis-board':       'select',
  'govern-dashboard':       'select',
  'content-engine':         'execute',
  'campaign-orchestration': 'execute',
  'active-journeys':        'execute',
  'outcome-attribution':    'learn',
  'learning-system':        'learn',
  'agent-console':          'operate',
  'operations':             'operate',
}

export const BUCKET_COLORS = {
  sense:    'teal',
  simulate: 'violet',
  select:   'vanguardRed',
  trial:    'orange',
  execute:  'green',
  learn:    'grape',
  operate:  'blue',
}

export const WORKFLOW_BUCKET_ORDER = ['sense', 'simulate', 'select', 'trial', 'execute', 'learn']

export const STAGE_TO_BUCKET = {
  SENSE:    'sense',
  SIMULATE: 'simulate',
  SELECT:   'select',
  DECIDE:   'select',
  GOVERN:   'select',
  TRIAL:    'trial',
  EXECUTE:  'execute',
  DEPLOY:   'execute',
  RESPOND:  'execute',
  LEARN:    'learn',
  MEASURE:  'learn',
}

export const theme = createTheme({
  primaryColor: 'vanguardRed',
  colors: {
    vanguardRed: [
      '#fdf2f2', '#f9d8d9', '#f2aaac', '#ea797c', '#e45055',
      '#e03337', '#96151D', '#7d1119', '#630d14', '#4a0a0f',
    ],
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
})
