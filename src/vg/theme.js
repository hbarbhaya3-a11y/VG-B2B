// CXO Companion design system — ported for TwinX for Vanguard (Plan Sponsor)
// Wall Street Executive (light) + Onyx Midnight (dark). Mutable C/T tokens,
// recomputed by applyTheme() before render (matches the base app pattern).

export const THEMES = {
  wallStreet: {
    name: 'Wall Street Executive', mode: 'light',
    swatch: ['#FAF8F3', '#0A1628', '#B89B5E'],
    paper: '#FAF8F3', navBg: '#0A1628', navBg2: '#0F1F36', brand: '#1B3A6B', brandLt: '#34568A',
    gold: '#B89B5E', goldDk: '#7F6938', ink: '#0C1116', ink2: '#2C3540', muted: '#6A7480', faint: '#9DA6B0',
    card: '#FFFFFF', line: '#EAE6DC', line2: '#D9D2C4',
    red: '#A8453B', redBg: '#FBECEA', green: '#2D6B4A', greenBg: '#EAF3EE', amber: '#B5862C', amberBg: '#FAF1DD',
  },
  onyx: {
    name: 'Onyx Midnight', mode: 'dark',
    swatch: ['#0E0F12', '#16181D', '#D4B574'],
    paper: '#0E0F12', navBg: '#050609', navBg2: '#0A0B0E', brand: '#C9A961', brandLt: '#E6C77F',
    gold: '#D4B574', goldDk: '#A38845', ink: '#F0EDE3', ink2: '#C3BDB0', muted: '#7A7468', faint: '#4E4940',
    card: '#16181D', line: '#232529', line2: '#2E3036',
    red: '#D4634D', redBg: '#2A1411', green: '#5DAA85', greenBg: '#0F2218', amber: '#D9B265', amberBg: '#25190A',
  },
}

export const FONT = `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
export const DISP = `'Archivo', 'IBM Plex Sans', -apple-system, sans-serif`

export const C = {}
export const T = {
  radSm: 6, radMd: 10, radLg: 14, radXl: 18, radPill: 999,
  ease: 'cubic-bezier(.22,.61,.36,1)',
  shadow1: '', shadow2: '', shadow3: '', shadowGoldGlow: '',
  goldFoil: '', navGrad: '', paperGrad: '', cardElevated: '', rule: '', ruleStrong: '', hairlineGold: '',
}

function shade(hex, pct) {
  const h = hex.replace('#', ''); const num = parseInt(h, 16)
  let r = (num >> 16) + Math.round(255 * pct / 100)
  let g = ((num >> 8) & 0xff) + Math.round(255 * pct / 100)
  let b = (num & 0xff) + Math.round(255 * pct / 100)
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

export function applyTheme(name) {
  const t = THEMES[name] || THEMES.wallStreet
  Object.keys(C).forEach(k => delete C[k])
  Object.entries(t).forEach(([k, v]) => { if (typeof v === 'string') C[k] = v })
  const isDark = t.mode === 'dark'
  const inkRgb = isDark ? '0,0,0' : '12,17,22'
  const gR = parseInt(t.gold.slice(1, 3), 16), gG = parseInt(t.gold.slice(3, 5), 16), gB = parseInt(t.gold.slice(5, 7), 16)
  T.shadow1 = isDark ? `0 1px 2px rgba(0,0,0,.5), 0 1px 1px rgba(0,0,0,.4)` : `0 1px 2px rgba(${inkRgb},.04), 0 1px 1px rgba(${inkRgb},.03)`
  T.shadow2 = isDark ? `0 6px 18px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.4)` : `0 4px 16px rgba(${inkRgb},.06), 0 2px 4px rgba(${inkRgb},.04)`
  T.shadow3 = isDark ? `0 24px 56px rgba(0,0,0,.7), 0 8px 20px rgba(0,0,0,.5)` : `0 18px 48px rgba(${inkRgb},.10), 0 6px 16px rgba(${inkRgb},.06)`
  T.shadowGoldGlow = `0 0 0 1px rgba(${gR},${gG},${gB},.22), 0 8px 28px rgba(${gR},${gG},${gB},.18)`
  T.goldFoil = `linear-gradient(135deg, ${shade(t.gold, 18)} 0%, ${t.gold} 50%, ${t.goldDk} 100%)`
  T.navGrad = `linear-gradient(180deg, ${t.navBg} 0%, ${t.navBg2} 60%, ${t.navBg} 100%)`
  T.paperGrad = `linear-gradient(180deg, ${t.paper} 0%, ${shade(t.paper, isDark ? -4 : -5)} 100%)`
  T.cardElevated = `linear-gradient(180deg, ${t.card} 0%, ${shade(t.card, isDark ? 3 : -3)} 100%)`
  T.rule = `1px solid ${t.line}`
  T.ruleStrong = `1px solid ${t.line2}`
  T.hairlineGold = `1px solid rgba(${gR},${gG},${gB},.30)`
}

applyTheme('wallStreet')
