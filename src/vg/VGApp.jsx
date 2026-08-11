import React, { useState, useEffect } from 'react'
import {
  IconHome, IconActivity, IconFlask, IconBrain, IconChevronRight, IconChevronLeft,
  IconArrowRight, IconArrowLeft, IconAlertTriangle, IconSun, IconMoon, IconCheck,
  IconTargetArrow, IconBuilding, IconShieldCheck, IconRocket, IconChecklist,
  IconAdjustments, IconFileText, IconPointFilled, IconTrendingUp, IconTrendingDown,
  IconBolt, IconChartBar,
} from '@tabler/icons-react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts'
import { C, T, FONT, DISP, THEMES, applyTheme } from './theme'
import {
  BOOK, SPONSORS, INSIGHTS, STRATEGY_CELLS, STRATEGY_CONTENT, STRATEGY_PLAYBOOKS, LEVERS, ASSETS, COMPLIANCE,
  MEMORY_DECISIONS, HOLDOUT_OUTCOMES, POLICIES,
  CONTENT_LIBRARY, DECISION_TABS,
  TODAYS_FOCUS, SIGNAL_KPIS, MARKET_SIGNALS,
  OBJECTIVES, CHANNELS, AVG_BALANCE, INDUSTRY_KPI,
} from './data'

/* ───────────────────────── helpers ───────────────────────── */
const money = (m) => `$${m.toLocaleString()}M`
const pct = (n, d = 0) => `${(n * 100).toFixed(d)}%`
const gapPct = (g, d = 1) => `${g >= 0 ? '-' : '+'}${(Math.abs(g) * 100).toFixed(d)}%`
const num = (n) => n.toLocaleString()

/* ───────────────────────── primitives ───────────────────────── */
function Card({ children, style, pad = 20, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C.card, border: T.rule, borderRadius: T.radLg, padding: pad,
      boxShadow: T.shadow1, ...style }}>{children}</div>
  )
}

function Pill({ tone = 'neutral', children }) {
  const map = {
    high: { fg: C.red, bg: C.redBg }, med: { fg: C.amber, bg: C.amberBg },
    low: { fg: C.green, bg: C.greenBg }, gold: { fg: C.goldDk, bg: C.amberBg },
    neutral: { fg: C.muted, bg: C.line },
    ok: { fg: C.green, bg: C.greenBg }, review: { fg: C.amber, bg: C.amberBg }, blocked: { fg: C.red, bg: C.redBg },
  }
  const k = map[tone] || map.neutral
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px',
      borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '.04em',
      color: k.fg, background: k.bg, border: `1px solid ${k.fg}22`, whiteSpace: 'nowrap' }}>{children}</span>
  )
}

function Btn({ children, onClick, kind = 'primary', small, style }) {
  const styles = {
    primary: { background: C.brand, color: '#fff', border: 'none', boxShadow: T.shadow1 },
    gold: { background: C.gold, color: '#fff', border: 'none', fontWeight: 700, boxShadow: T.shadow1 },
    ghost: { background: C.card, color: C.ink, border: `1px solid ${C.line2}`, boxShadow: T.shadow1 },
    quiet: { background: 'transparent', color: C.ink2, border: `1px solid ${C.line}`, boxShadow: 'none' },
  }[kind]
  return (
    <button onClick={onClick} style={{ ...styles, cursor: 'pointer', borderRadius: T.radMd,
      padding: small ? '7px 14px' : '11px 18px', fontSize: small ? 12 : 13, fontFamily: FONT,
      fontWeight: styles.fontWeight || 600, letterSpacing: '.02em', display: 'inline-flex',
      alignItems: 'center', gap: 8, whiteSpace: 'nowrap', transition: `all .15s ${T.ease}`, ...style }}>
      {children}
    </button>
  )
}

function Eyebrow({ children }) {
  return <div style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase',
    color: C.goldDk, fontWeight: 700, marginBottom: 6 }}>{children}</div>
}

function SectionTitle({ kicker, title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
      <div>
        {kicker && <Eyebrow>{kicker}</Eyebrow>}
        <div style={{ fontFamily: DISP, fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: '-.01em', lineHeight: 1.15 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: C.muted, marginTop: 4, maxWidth: 640 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

function Stat({ label, value, sub, tone }) {
  return (
    <Card pad={16} style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: '.02em' }}>{label}</div>
      <div style={{ fontFamily: DISP, fontSize: 26, fontWeight: 700, color: tone || C.ink, marginTop: 6, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </Card>
  )
}

function Spark({ data, up }) {
  const max = Math.max(...data)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 22 }}>
      {data.map((d, i) => (
        <div key={i} style={{ width: 5, height: `${(d / max) * 100}%`, borderRadius: 1,
          background: up ? C.green : C.red, opacity: 0.4 + 0.6 * (i / data.length) }} />
      ))}
    </div>
  )
}

function Th({ children, align }) {
  return <th style={{ textAlign: align || 'left', padding: '10px 14px', fontSize: 10.5, letterSpacing: '.06em',
    textTransform: 'uppercase', color: C.muted, fontWeight: 700, borderBottom: T.ruleStrong, whiteSpace: 'nowrap' }}>{children}</th>
}
function Td({ children, align, bold }) {
  return <td style={{ textAlign: align || 'left', padding: '11px 14px', fontSize: 13,
    color: bold ? C.ink : C.ink2, fontWeight: bold ? 600 : 400, borderBottom: T.rule, verticalAlign: 'top' }}>{children}</td>
}
function Table({ head, children, minWidth = 640 }) {
  return (
    <div style={{ overflowX: 'auto', border: T.rule, borderRadius: T.radLg, background: C.card }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth, fontFamily: FONT }}>
        <thead><tr>{head}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

/* ───────────────────────── sidebar ───────────────────────── */
const MENUS = [
  { id: 'home', label: 'Home', icon: IconHome },
  { id: 'signals', label: 'Signals', icon: IconActivity },
  { id: 'decision', label: 'Decision Lab', icon: IconFlask },
  { id: 'memory', label: 'Memory', icon: IconBrain },
]

function Sidebar({ menu, setMenu, collapsed, setCollapsed, themeName, setThemeName }) {
  const isDark = THEMES[themeName].mode === 'dark'
  return (
    <div style={{ width: collapsed ? 72 : 240, flexShrink: 0, background: T.navGrad, color: '#EADFD3',
      display: 'flex', flexDirection: 'column', padding: collapsed ? '22px 12px' : '24px 16px',
      borderRadius: T.radLg, border: '1px solid rgba(255,255,255,.06)', boxShadow: T.shadow3,
      transition: `width .28s ${T.ease}`, position: 'sticky', top: 16, height: 'calc(100vh - 32px)' }}>
      {/* brand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: 26, gap: 10 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <div style={{ width: 34, height: 28, borderRadius: 6, background: T.goldFoil, flexShrink: 0,
              display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.4)' }}>
              <span style={{ fontFamily: DISP, fontWeight: 700, color: C.navBg, fontSize: 11 }}>VG</span>
            </div>
            <div style={{ lineHeight: 1.15, minWidth: 0 }}>
              <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13.5, color: '#F4F1EA', whiteSpace: 'nowrap' }}>TwinX · Plan Sponsor</div>
              <div style={{ fontSize: 8, color: 'rgba(184,155,94,.85)', letterSpacing: '.16em', marginTop: 3, textTransform: 'uppercase', fontWeight: 600 }}>Powered by TwinX™</div>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} title="Toggle"
          style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 6, width: 28, height: 28, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'rgba(244,241,234,.6)' }}>
          {collapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
        </button>
      </div>
      {/* nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {MENUS.map(({ id, label, icon: Icon }) => {
          const on = menu === id
          return (
            <button key={id} onClick={() => setMenu(id)} title={collapsed ? label : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '11px 0' : '11px 13px',
                justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: T.radMd, cursor: 'pointer',
                background: on ? 'rgba(255,255,255,.06)' : 'transparent', border: 'none', position: 'relative',
                color: on ? '#F4F1EA' : 'rgba(244,241,234,.62)', fontFamily: FONT, fontSize: 13, fontWeight: on ? 600 : 500, width: '100%' }}>
              {on && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: C.gold, borderRadius: 2 }} />}
              <Icon size={17} color={on ? C.gold : 'rgba(244,241,234,.5)'} />
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>
      {/* theme toggle */}
      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <button onClick={() => setThemeName(isDark ? 'wallStreet' : 'onyx')} title="Toggle theme"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
            padding: '9px 10px', borderRadius: T.radMd, cursor: 'pointer', background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.08)', color: 'rgba(244,241,234,.7)', fontFamily: FONT, fontSize: 12 }}>
          {isDark ? <IconSun size={15} /> : <IconMoon size={15} />}
          {!collapsed && <span>{isDark ? 'Light' : 'Dark'}</span>}
        </button>
      </div>
    </div>
  )
}

/* ───────────────────────── HOME ───────────────────────── */
function Home({ onOpenSignals, memoryLog = [] }) {
  const trend = BOOK.participationTrend
  const atRisk = SPONSORS
  // Growth-CXO rollups — opportunity, in-flight, and realized AUM growth.
  const oppValue = SPONSORS.reduce((a, s) => a + s.valueOpp, 0)
  const atRiskCount = SPONSORS.filter(s => s.gap > 0).length
  const completed = MEMORY_DECISIONS
  const realizedAum = completed.reduce((a, d) => a + (d.impact?.aum || 0), 0)
  const avgLift = completed.length ? completed.reduce((a, d) => a + (d.impact?.participationLift || 0), 0) / completed.length : 0
  const liveRuns = memoryLog.filter(r => r.live)
  const liveAum = liveRuns.reduce((a, r) => a + (r.detail?.target?.aum || 0), 0)
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
  const signalCount = SPONSORS.filter(s => s.gap > 0).length + MARKET_SIGNALS.length
  return (
    <div>
      {/* Morning brief header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '.18em', color: C.muted, fontWeight: 600 }}>{dateStr}</div>
          <div style={{ fontFamily: DISP, fontSize: 44, fontWeight: 700, color: C.ink, letterSpacing: '-.02em', lineHeight: 1.05, marginTop: 12 }}>
            Good morning, <span style={{ color: C.goldDk, fontStyle: 'italic' }}>Alex.</span>
          </div>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 10 }}>{signalCount} signals need your attention this morning.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px', background: C.card, borderRadius: T.radPill,
          border: T.rule, boxShadow: T.shadow1, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>NYSEARCA: VTI</span>
          <span style={{ width: 1, height: 14, background: C.line2 }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>$291.40</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.red }}>▼ 0.62%</span>
          <span style={{ fontSize: 12, color: C.faint }}>Closed: last close</span>
        </div>
      </div>

      <SectionTitle kicker="Vanguard · Book Overview" title="How is our book of sponsors doing?"
        sub="Overall participation across the plan-sponsor book, the sponsors to act on first, and the KPIs that matter."
        right={<Btn kind="gold" onClick={onOpenSignals}>Review signals <IconArrowRight size={15} /></Btn>} />

      {/* overall numbers */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="Plan sponsors" value={BOOK.totalSponsors} sub="in book" />
        <Stat label="Eligible participants" value={num(BOOK.totalEligible)} sub={`${num(BOOK.totalParticipants)} enrolled`} />
        <Stat label="Aggregate participation" value={pct(BOOK.aggParticipation)} sub={`vs ${pct(BOOK.benchmark)} benchmark`} tone={C.red} />
        <Stat label="Value at stake" value={money(BOOK.valueAtStake)} sub="AUM exposure, at-risk sponsors" tone={C.goldDk} />
      </div>

      {/* Growth scorecard — CXO growth lens */}
      <Eyebrow>Growth scorecard · net-new AUM engine</Eyebrow>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6, marginBottom: 16 }}>
        <Stat label="Net-new AUM opportunity" value={money(oppValue)} sub={`${atRiskCount} sponsors in play`} tone={C.goldDk} />
        <Stat label="AUM realized to date" value={money(realizedAum)} sub={`${completed.length} campaigns measured`} tone={C.green} />
        <Stat label="Avg participation lift delivered" value={`+${avgLift.toFixed(1)} pts`} sub="vs holdout, across campaigns" tone={C.green} />
        <Stat label="Campaigns live" value={liveRuns.length} sub={liveRuns.length ? `${money(liveAum)} AUM projected` : 'deploy from Decision Lab'} tone={liveRuns.length ? C.brand : C.muted} />
      </div>

      {/* Today's Focus */}
      <Card pad={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '12px 20px', borderBottom: T.rule, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconBolt size={15} color={C.gold} />
          <span style={{ fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: C.goldDk, fontWeight: 700 }}>Today's Focus · Live monitoring</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TODAYS_FOCUS.map((f, i) => {
            const clickable = !!f.sponsor
            return (
              <div key={i} onClick={clickable ? () => onOpenSignals(f.sponsor) : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px',
                  borderTop: i ? T.rule : 'none', cursor: clickable ? 'pointer' : 'default' }}>
                <Pill tone={f.tone === 'urgent' ? 'high' : f.tone === 'amber' ? 'med' : 'neutral'}>{f.tag}</Pill>
                <span style={{ flex: 1, fontSize: 13, color: C.ink2 }}>{f.text}</span>
                {clickable && <IconChevronRight size={15} color={C.faint} />}
              </div>
            )
          })}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }}>
        {/* priority items */}
        <Card pad={0}>
          <div style={{ padding: '16px 20px', borderBottom: T.rule, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconTargetArrow size={17} color={C.gold} />
            <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Priority items</span>
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>Ranked by risk × value</span>
          </div>
          <Table minWidth={520} head={<>
            <Th>Sponsor</Th><Th align="right">Participation</Th><Th align="right">Gap</Th>
            <Th align="right">Value opp.</Th><Th>Renewal risk</Th><Th></Th>
          </>}>
            {atRisk.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => onOpenSignals(s.id)}>
                <Td bold>{s.name}<div style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>{s.industry} · {num(s.employees)} emp.</div></Td>
                <Td align="right">{pct(s.participation)}</Td>
                <Td align="right"><span style={{ color: s.gap >= 0 ? C.red : C.green, fontWeight: 600 }}>{gapPct(s.gap)}</span></Td>
                <Td align="right" bold>{money(s.valueOpp)}</Td>
                <Td><Pill tone={s.renewalRisk === 'High' ? 'high' : s.renewalRisk === 'Medium' ? 'med' : 'low'}>{s.renewalRisk}</Pill></Td>
                <Td align="right"><IconChevronRight size={15} color={C.faint} /></Td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* KPIs */}
        <Card>
          <Eyebrow>Book KPI</Eyebrow>
          <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 4 }}>Aggregate participation trend</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>6-month rolling · vs {pct(BOOK.benchmark)} benchmark</div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 88]} tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="rate" stroke={C.gold} strokeWidth={2.5} dot={{ r: 3, fill: C.gold }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Pill tone="med">Retention health · watch</Pill>
            <Pill tone="ok">Content readiness 82%</Pill>
          </div>
        </Card>
      </div>
    </div>
  )
}

/* ───────────────────────── SIGNALS ───────────────────────── */
function Signals({ sponsor, onSelect, onSendToLab }) {
  const [tab, setTab] = useState('market')
  const [mktFilter, setMktFilter] = useState('All')
  if (!sponsor) {
    // Company signals — one per at-risk sponsor — surface in the feed and open Company Analysis.
    const companySignals = SPONSORS.filter(s => s.gap > 0).map(s => ({
      id: 'co-' + s.id, type: 'Company',
      impact: s.renewalRisk === 'High' ? 'high' : s.renewalRisk === 'Medium' ? 'medium' : 'low',
      title: `${s.name} — participation gap`,
      detail: `${num(s.employees)} employees · participation ${pct(s.participation)} vs ${pct(s.benchmark)} benchmark · ${num(s.nonParticipants)} eligible non-participants.`,
      when: 'live', sponsor: s.id,
    }))
    const feed = [...companySignals, ...MARKET_SIGNALS.filter(m => m.type !== 'Plan Event')]
    const types = ['All', ...Array.from(new Set(feed.map(s => s.type)))]
    const filtered = mktFilter === 'All' ? feed : feed.filter(s => s.type === mktFilter)
    const impactTone = (im) => (im === 'high' ? 'high' : im === 'medium' ? 'med' : 'low')
    return (
      <div>
        <SectionTitle kicker="Signals · Participation intelligence" title="What is TwinX seeing across the book?"
          sub="Company signals plus market and regulatory intelligence. Open a company signal to go into its analysis." />

        {/* tab toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: C.paper, borderRadius: T.radMd, padding: 4, width: 'fit-content', border: T.rule }}>
          {[['market', 'Market Intelligence'], ['kpis', 'KPIs']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ fontSize: 12, fontWeight: 600, padding: '9px 18px', borderRadius: T.radSm,
              cursor: 'pointer', fontFamily: FONT, letterSpacing: '.02em', background: tab === k ? C.card : 'transparent',
              color: tab === k ? C.ink : C.muted, border: 'none', boxShadow: tab === k ? T.shadow1 : 'none' }}>{l}</button>
          ))}
        </div>

        {tab === 'market' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingBottom: 12, borderBottom: T.rule }}>
              <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 20, color: C.ink }}>Market Intelligence</div>
              <span style={{ fontSize: 10.5, color: C.faint, letterSpacing: '.14em', fontWeight: 600, textTransform: 'uppercase' }}>{feed.length} active · streaming</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {types.map(t => (
                <button key={t} onClick={() => setMktFilter(t)} style={{ fontSize: 11.5, fontWeight: mktFilter === t ? 700 : 500,
                  padding: '6px 13px', borderRadius: 999, cursor: 'pointer', fontFamily: FONT, background: mktFilter === t ? C.ink : C.card,
                  color: mktFilter === t ? '#fff' : C.ink2, border: `1px solid ${mktFilter === t ? C.ink : C.line}` }}>{t}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {filtered.map(s => {
                const clickable = !!s.sponsor
                const bar = s.impact === 'high' ? C.red : s.impact === 'medium' ? C.amber : C.green
                return (
                  <Card key={s.id} onClick={clickable ? () => onSelect(s.sponsor) : undefined}
                    style={{ position: 'relative', overflow: 'hidden', cursor: clickable ? 'pointer' : 'default' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: bar, opacity: .65 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Pill tone={impactTone(s.impact)}>{s.type}</Pill>
                        <span style={{ fontSize: 11, color: C.faint }}>{s.when}</span>
                      </div>
                      {clickable && <span style={{ fontSize: 10.5, color: C.goldDk, fontWeight: 700 }}>{s.type === 'Company' ? 'Company analysis →' : 'Investigate →'}</span>}
                    </div>
                    <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 5 }}>{s.title}</div>
                    <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{s.detail}</div>
                  </Card>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingBottom: 12, borderBottom: T.rule }}>
              <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 20, color: C.ink }}>KPI movement · behavior radar</div>
              <span style={{ fontSize: 10.5, color: C.faint, letterSpacing: '.14em', fontWeight: 600, textTransform: 'uppercase' }}>Book-level · QoQ lens</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
              {SIGNAL_KPIS.map(k => (
                <Card key={k.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{k.label}</div>
                      <div style={{ fontFamily: DISP, fontSize: 24, fontWeight: 700, color: C.ink, marginTop: 5, lineHeight: 1 }}>{k.val}</div>
                    </div>
                    <Spark data={k.spark} up={k.up} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                    {k.up ? <IconTrendingUp size={14} color={C.green} /> : <IconTrendingDown size={14} color={C.red} />}
                    <span style={{ fontSize: 12, color: k.up ? C.green : C.red, fontWeight: 600 }}>{k.sub}</span>
                    <span style={{ marginLeft: 'auto' }}><Pill tone="gold">{k.chip}</Pill></span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }
  const s = sponsor
  return (
    <div>
      <button onClick={() => onSelect(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12, marginBottom: 12, fontFamily: FONT }}>
        <IconArrowLeft size={14} /> Back to signals
      </button>
      <SectionTitle kicker={`Signals · ${s.industry}`} title={`${s.name} — participation gap`}
        sub="A deep-dive analysis of the participation gap — the plan snapshot, how it benchmarks, the cohorts driving the shortfall, the root-cause reasons, and the value at stake."
        right={<Btn kind="gold" onClick={onSendToLab}>Send to Decision Lab <IconArrowRight size={15} /></Btn>} />

      {/* snapshot */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Stat label="Total employees" value={num(s.employees)} />
        <Stat label="Eligible" value={num(s.eligible)} sub={`${pct(s.eligible / s.employees)} of workforce`} />
        <Stat label="Enrolled" value={num(s.participants)} />
        <Stat label="Non-participants" value={num(s.nonParticipants)} tone={C.red} />
        <Stat label="Participation" value={pct(s.participation)} sub={`${gapPct(s.gap)} vs benchmark`} tone={C.red} />
        <Stat label="Value opportunity" value={money(s.valueOpp)} tone={C.goldDk} />
      </div>

      {/* benchmarking — where this plan sits */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Eyebrow>Benchmarking · participation vs peers</Eyebrow>
          <span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>
            {Math.round(s.gap * s.eligible).toLocaleString()} participants below benchmark ({gapPct(s.gap)})
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
          {[
            { label: 'This plan', v: s.participation, tone: C.red },
            { label: `${s.industry} benchmark`, v: s.benchmark, tone: C.gold },
            { label: 'Vanguard book average', v: BOOK.aggParticipation, tone: C.muted },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: C.ink2, width: 180, flexShrink: 0 }}>{b.label}</span>
              <div style={{ flex: 1, height: 14, background: C.line, borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: pct(b.v), height: '100%', background: b.tone, borderRadius: 999 }} />
              </div>
              <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14, color: b.tone, width: 52, textAlign: 'right' }}>{pct(b.v)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* cohort composition — analytical breakdown of the gap */}
      <Card pad={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: T.rule }}>
          <Eyebrow>Cohort composition · where the gap lives</Eyebrow>
          <div style={{ fontSize: 12, color: C.muted }}>Addressable population segmented by condition — the analytical basis for later strategy design.</div>
        </div>
        <Table head={<><Th>Cohort / condition</Th><Th align="right">Population</Th><Th align="right">Share of addressable</Th><Th>Primary driver</Th></>} minWidth={560}>
          {(() => {
            const cohorts = STRATEGY_CELLS.filter(c => c.id !== 'hold')
            const total = cohorts.reduce((a, c) => a + c.population, 0)
            return cohorts.map(c => (
              <tr key={c.id}>
                <Td bold>{c.cohort}</Td>
                <Td align="right">{num(c.population)}</Td>
                <Td align="right">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <div style={{ width: 70, height: 6, background: C.line, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${(c.population / total) * 100}%`, height: '100%', background: C.gold }} />
                    </div>
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: C.ink2 }}>{pct(c.population / total)}</span>
                  </div>
                </Td>
                <Td>{c.why}</Td>
              </tr>
            ))
          })()}
        </Table>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
        {/* why */}
        <Card>
          <Eyebrow>Root-cause insights · why</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {INSIGHTS.map(i => (
              <div key={i.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <IconPointFilled size={14} color={C.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{i.label}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{i.detail}</div>
                </div>
                <Pill tone={i.weight === 'High' ? 'high' : i.weight === 'Medium' ? 'med' : 'low'}>{i.weight}</Pill>
              </div>
            ))}
          </div>
        </Card>
        {/* value at stake deep dive */}
        <Card>
          <Eyebrow>Value at stake · deep dive</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {[
              { k: 'AUM opportunity if gap closes', v: money(s.valueOpp), tone: C.goldDk },
              { k: 'Illustrative avg balance / participant', v: `$${(AVG_BALANCE / 1000).toFixed(0)}k`, tone: C.ink },
              { k: 'Participants to reach benchmark', v: num(Math.round(s.gap * s.eligible)), tone: C.green },
              { k: 'Renewal risk', v: s.renewalRisk, tone: s.renewalRisk === 'High' ? C.red : s.renewalRisk === 'Medium' ? C.amber : C.green },
            ].map(r => (
              <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: C.paper, borderRadius: T.radSm, border: T.rule }}>
                <span style={{ fontSize: 12.5, color: C.ink2 }}>{r.k}</span>
                <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15, color: r.tone }}>{r.v}</span>
              </div>
            ))}
          </div>
          {INDUSTRY_KPI[s.industry] && (
            <div style={{ marginTop: 12, fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>
              Industry lens · <b style={{ color: C.ink2 }}>{INDUSTRY_KPI[s.industry].label}</b> is the highest-leverage metric for {s.industry} plans (response factor {INDUSTRY_KPI[s.industry].factor}×).
            </div>
          )}
        </Card>
      </div>

      {/* analog */}
      <Card style={{ background: C.amberBg, borderColor: `${C.gold}44` }}>
        <Eyebrow>Analog · what worked in similar sponsors</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 8 }}>Beacon Freight, FY24</div>
            <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>
              Participation sat at <b>72%</b> vs an <b>82%</b> benchmark with a new-hire enrollment lag —
              a close analog to {s.name}'s profile. TwinX recommended <b>Auto Enrollment at 4% default + 1% escalation, 10% cap</b>.
            </div>
          </div>
          <div style={{ padding: 14, background: C.card, borderRadius: T.radMd, border: T.rule, textAlign: 'center', minWidth: 150 }}>
            <div style={{ fontSize: 11, color: C.muted }}>Realized vs holdout</div>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, color: C.green }}>+8.4%</div>
            <div style={{ fontSize: 11, color: C.muted }}>participation</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ───────────────────────── DECISION LAB ───────────────────────── */
const STRAT_WEIGHT = { ae: 5.2, ms: 1.8, esc: 1.4, re: 0.9, edu: 0.4 }

function labDerived(lab) {
  const included = STRATEGY_CELLS.filter(c => lab.cells[c.id])
  const treatCells = included.filter(c => c.id !== 'hold')     // cells that receive a strategy
  const pct = lab.cells.hold ? lab.levers.holdoutPct / 100 : 0
  // Holdout is carved FROM each holdout-eligible cohort (education-only has none).
  const perCell = treatCells.map(c => {
    const holdout = c.holdout ? Math.round(c.population * pct) : 0
    return { ...c, holdout, treated: c.population - holdout }
  })
  const portfolioPop = perCell.reduce((a, c) => a + c.population, 0)   // total addressable
  const holdout = perCell.reduce((a, c) => a + c.holdout, 0)          // control, not treated
  const treated = portfolioPop - holdout                              // actually receive a strategy
  let lift = treatCells.reduce((a, c) => a + (STRAT_WEIGHT[c.id] || 0), 0)
  if (lab.cells.ae) lift += (lab.levers.aeDefault - 4) * 0.6
  if (lab.cells.esc) lift += (lab.levers.escStep - 1) * 0.4
  lift = Math.max(0, +lift.toFixed(1))
  const compState = (c) => (lab.compFixed[c.label] ? 'ok' : c.state)
  const complianceOk = COMPLIANCE.every(c => compState(c) !== 'blocked')
  const allApproved = Object.values(lab.approvals).every(Boolean)
  return { included, treatCells, perCell, portfolioPop, treated, holdout, lift, complianceOk, allApproved, compState }
}

function stepDone(lab, d, i) {
  return [
    !!lab.objective,                       // 0 objective
    d.portfolioPop > 0,                    // 1 levers
    d.treatCells.length > 0,               // 2 recommended segments
    lab.content !== 'none',                // 3 content
    lab.simulated,                         // 4 simulation
    d.allApproved,                         // 5 approval
    Object.keys(lab.deployed).length > 0,  // 6 deployment
  ][i]
}

function DecisionLab({ sponsor, tab, setTab, lab, setLab, addMemory }) {
  if (!sponsor) {
    return <EmptyState icon={IconFlask} title="No sponsor selected"
      body="Open a company from Signals and send it to Decision Lab to configure a portfolio." />
  }
  const d = labDerived(lab)
  const tabIcons = [IconTargetArrow, IconAdjustments, IconChartBar, IconFileText, IconActivity, IconChecklist, IconRocket]
  // A step is complete only once the user has actually advanced past it (not from preset defaults).
  const maxTab = lab.maxTab || 0
  useEffect(() => { setLab(l => (tab > (l.maxTab || 0) ? { ...l, maxTab: tab } : l)) }, [tab, setLab])
  const done = DECISION_TABS.map((_, i) => i < maxTab && stepDone(lab, d, i))

  return (
    <div>
      <SectionTitle kicker="Decision Lab · Portfolio workbench" title={`${sponsor.name} — decision portfolio`}
        sub="A portfolio allocation across cohort strategy cells — set the objective, configure, simulate, and launch."
        right={<div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.muted }}>In portfolio</div>
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, color: C.ink }}>{num(d.portfolioPop)}</div>
        </div>} />

      {/* step strip */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {DECISION_TABS.map((t, i) => {
          const on = tab === i; const Icon = tabIcons[i]; const complete = done[i]
          return (
            <button key={t} onClick={() => setTab(i)} style={{ display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 13px', borderRadius: 999, cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: on ? 700 : 500,
              background: on ? C.brand : C.card, color: on ? '#fff' : C.ink2, border: on ? 'none' : T.rule, boxShadow: on ? T.shadow1 : 'none' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: complete ? C.green : on ? 'rgba(255,255,255,.18)' : C.line,
                color: complete ? '#fff' : on ? '#fff' : C.muted, fontSize: 11, fontWeight: 700 }}>
                {complete ? <IconCheck size={12} /> : i + 1}
              </span>
              {t}
            </button>
          )
        })}
      </div>

      {tab === 0 && <TabObjective sponsor={sponsor} lab={lab} setLab={setLab} d={d} />}
      {tab === 1 && <TabLevers lab={lab} setLab={setLab} d={d} />}
      {tab === 2 && <TabStrategy sponsor={sponsor} lab={lab} setLab={setLab} d={d} />}
      {tab === 3 && <TabContent lab={lab} setLab={setLab} d={d} />}
      {tab === 4 && <TabSimulation sponsor={sponsor} lab={lab} setLab={setLab} d={d} />}
      {tab === 5 && <TabApproval lab={lab} setLab={setLab} d={d} />}
      {tab === 6 && <TabDeployment sponsor={sponsor} lab={lab} setLab={setLab} d={d} addMemory={addMemory} />}

      {/* footer nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Btn kind="quiet" onClick={() => setTab(Math.max(0, tab - 1))} style={{ visibility: tab === 0 ? 'hidden' : 'visible' }}>
          <IconArrowLeft size={15} /> Back
        </Btn>
        {tab < DECISION_TABS.length - 1 && <Btn kind="primary" onClick={() => setTab(tab + 1)}>Next: {DECISION_TABS[tab + 1]} <IconArrowRight size={15} /></Btn>}
      </div>
    </div>
  )
}

function trackedKpis(sponsor) {
  const ind = INDUSTRY_KPI[sponsor.industry]
  return ['Participation lift', 'AUM retained', 'Deferral lift', 'Hardship leakage', ...(ind ? [ind.label] : [])]
}

function TabObjective({ sponsor, lab, setLab, d }) {
  const setObj = (o) => setLab(l => ({ ...l, objective: o }))
  const toggleCh = (c) => setLab(l => ({ ...l, channels: { ...l.channels, [c]: !l.channels[c] } }))
  const setTl = (k, v) => setLab(l => ({ ...l, timeline: { ...l.timeline, [k]: v } }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* objective */}
      <div>
        <Eyebrow>Objective · what are we optimizing?</Eyebrow>
        <div style={{ display: 'flex', gap: 10, marginTop: 4, overflowX: 'auto' }}>
          {OBJECTIVES.map(o => {
            const on = lab.objective === o.id
            return (
              <Card key={o.id} onClick={() => setObj(o.id)} pad={12}
                style={{ flex: '1 1 0', minWidth: 180, cursor: 'pointer', borderColor: on ? C.gold : undefined, borderWidth: on ? 2 : 1, borderStyle: 'solid',
                  background: on ? C.amberBg : C.card }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13, color: C.ink }}>{o.label}</span>
                  {on ? <IconCheck size={14} color={C.green} style={{ flexShrink: 0 }} /> : o.rec && <Pill tone="gold">Rec</Pill>}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.45 }}>{o.desc}</div>
              </Card>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
        {/* channels */}
        <Card>
          <Eyebrow>Channels</Eyebrow>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {CHANNELS.map(c => {
              const on = lab.channels[c]
              return (
                <button key={c} onClick={() => toggleCh(c)} style={{ display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 13px', borderRadius: 999, cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: on ? 700 : 500,
                  background: on ? C.brand : C.card, color: on ? '#fff' : C.ink2, border: `1px solid ${on ? C.brand : C.line}` }}>
                  {on && <IconCheck size={13} />}{c}
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10 }}>Advisor brief distributes 24h before participant channels.</div>
        </Card>
        {/* timeline */}
        <Card>
          <Eyebrow>Timeline</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <Stepper label="Rollout window (weeks)" unit="" value={lab.timeline.rolloutWeeks} set={v => setTl('rolloutWeeks', v)} min={2} max={16} />
            <Stepper label="Measurement window (weeks)" unit="" value={lab.timeline.measureWeeks} set={v => setTl('measureWeeks', v)} min={4} max={26} />
          </div>
        </Card>
      </div>

      {/* tracked KPIs — industry aware */}
      <Card>
        <Eyebrow>Primary KPIs tracked · {sponsor.industry}</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {trackedKpis(sponsor).map(k => <Pill key={k} tone="gold">{k}</Pill>)}
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10 }}>Projected in Simulation. The last KPI is contextual to this sponsor's industry.</div>
      </Card>
    </div>
  )
}

function Stepper({ label, unit, value, set, min, max, step = 1 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: C.paper, borderRadius: T.radSm, border: T.rule }}>
      <span style={{ fontSize: 12.5, color: C.ink2 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => set(Math.max(min, +(value - step).toFixed(2)))} style={sBtn}>–</button>
        <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 13, color: C.ink, minWidth: 44, textAlign: 'center' }}>{value}{unit}</span>
        <button onClick={() => set(Math.min(max, +(value + step).toFixed(2)))} style={sBtn}>+</button>
      </div>
    </div>
  )
}
const sBtn = { width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(128,128,128,.35)', background: 'transparent', cursor: 'pointer', fontSize: 15, lineHeight: 1, color: '#888', fontWeight: 700 }

function leverSummary(id, L) {
  switch (id) {
    case 'ae': return `${L.aeDefault}% default · +${L.aeEsc}%/yr · cap ${L.aeCap}%`
    case 'ms': return `stretch target ${L.msTarget}%`
    case 'esc': return `+${L.escStep}%/yr · cap ${L.escCap}%`
    case 're': return `sweep every ${L.reFreq} mo · ${L.reNotice}-day notice · QDIA`
    case 'edu': return `every ${L.eduCadence} wk · plan basics`
    default: return '—'
  }
}

function TabLevers({ lab, setLab, d }) {
  const setL = (k, v) => setLab(l => ({ ...l, levers: { ...l.levers, [k]: v } }))
  const L = lab.levers
  const activeIds = new Set(d.treatCells.map(c => c.id))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12.5, color: C.muted }}>
        <IconShieldCheck size={15} color={C.green} /> Levers appear after recommendation. Only strategies in the portfolio are configurable.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
        {LEVERS.filter(l => activeIds.has(l.id)).map(l => {
          return (
            <Card key={l.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>{l.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {l.id === 'ae' && <>
                  <Stepper label="Initial default rate" unit="%" value={L.aeDefault} set={v => setL('aeDefault', v)} min={2} max={10} />
                  <Stepper label="Auto-escalation" unit="%/yr" value={L.aeEsc} set={v => setL('aeEsc', v)} min={0} max={3} />
                  <Stepper label="Escalation cap" unit="%" value={L.aeCap} set={v => setL('aeCap', v)} min={6} max={15} />
                </>}
                {l.id === 'ms' && <Stepper label="Stretch match target" unit="%" value={L.msTarget} set={v => setL('msTarget', v)} min={3} max={8} />}
                {l.id === 'esc' && <>
                  <Stepper label="Annual increase" unit="%" value={L.escStep} set={v => setL('escStep', v)} min={1} max={3} />
                  <Stepper label="Cap" unit="%" value={L.escCap} set={v => setL('escCap', v)} min={8} max={15} />
                </>}
                {l.id === 're' && <>
                  <Stepper label="Sweep frequency (mo)" unit="" value={L.reFreq} set={v => setL('reFreq', v)} min={6} max={24} step={6} />
                  <Stepper label="Notice window (days)" unit="" value={L.reNotice} set={v => setL('reNotice', v)} min={30} max={90} step={15} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: C.paper, borderRadius: T.radSm, border: T.rule }}>
                    <span style={{ fontSize: 12.5, color: C.ink2 }}>Default investment</span><span style={{ fontSize: 12, color: C.faint }}>Plan QDIA</span>
                  </div>
                </>}
                {l.id === 'edu' && <>
                  <Stepper label="Send cadence (wks)" unit="" value={L.eduCadence} set={v => setL('eduCadence', v)} min={1} max={8} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: C.paper, borderRadius: T.radSm, border: T.rule }}>
                    <span style={{ fontSize: 12.5, color: C.ink2 }}>Message theme</span><span style={{ fontSize: 12, color: C.faint }}>Plan basics</span>
                  </div>
                </>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function CtaButton({ label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: T.radMd,
      background: C.brand, color: '#fff', fontSize: 13, fontWeight: 600 }}>{label} <IconArrowRight size={15} /></span>
  )
}

// Renders each content asset in a layout that matches its type: PPT deck, banner, email, notice, or doc.
function ContentRender({ piece, seg }) {
  const a = (piece.asset || '').toLowerCase()
  const isDeck = a.includes('deck')
  const isBanner = a.includes('banner')
  const isEmail = a.includes('email') || a.includes('explainer')
  const isNotice = a.includes('notice')

  // ── PPT-style committee deck ──
  if (isDeck) {
    const slides = piece.sections || piece.body.map((b, i) => ({ heading: `Point ${i + 1}`, body: b }))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* title slide */}
        <div style={{ aspectRatio: '16 / 9', border: T.rule, borderRadius: T.radMd, background: T.navGrad, color: '#EADFD3',
          padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: C.gold }} />
          <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: C.gold, fontWeight: 700 }}>Vanguard · Plan-design committee</div>
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 26, marginTop: 8, lineHeight: 1.15, color: '#fff' }}>{piece.headline}</div>
          {piece.subhead && <div style={{ fontSize: 13.5, color: 'rgba(234,223,211,.85)', marginTop: 8 }}>{piece.subhead}</div>}
          <div style={{ fontSize: 12, color: 'rgba(234,223,211,.6)', marginTop: 14 }}>{seg.cohort} · {seg.strategy}</div>
        </div>
        {/* content slides */}
        {slides.map((s, i) => (
          <div key={i} style={{ aspectRatio: '16 / 9', border: T.rule, borderRadius: T.radMd, background: C.card, padding: 20,
            display: 'flex', flexDirection: 'column', boxShadow: T.shadow1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `2px solid ${C.gold}`, paddingBottom: 8 }}>
              <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: C.brand }}>{s.heading}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: C.faint }}>Slide {i + 2} / {slides.length + 1}</span>
            </div>
            <div style={{ fontSize: 14, color: C.ink2, lineHeight: 1.6, marginTop: 12, flex: 1 }}>{s.body}</div>
            <div style={{ fontSize: 10, color: C.faint, marginTop: 8 }}>Vanguard · Education-classified · not investment advice</div>
          </div>
        ))}
      </div>
    )
  }

  // ── Portal banner ──
  if (isBanner) {
    return (
      <div style={{ borderRadius: T.radLg, overflow: 'hidden', border: T.rule }}>
        <div style={{ background: C.amberBg, padding: '28px 26px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: C.goldDk, fontWeight: 700 }}>Vanguard plan portal</div>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 24, color: C.ink, lineHeight: 1.15, marginTop: 6 }}>{piece.headline}</div>
            {piece.subhead && <div style={{ fontSize: 14, color: C.ink2, marginTop: 6 }}>{piece.subhead}</div>}
          </div>
          <CtaButton label={piece.cta} />
        </div>
        <div style={{ padding: '14px 18px', background: C.card, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {piece.body.map((para, i) => <p key={i} style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: C.muted }}>{para}</p>)}
        </div>
      </div>
    )
  }

  // ── Participant email ──
  if (isEmail) {
    const variants = piece.variants
    return (
      <div>
        <div style={{ border: T.rule, borderRadius: T.radMd, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', background: C.paper, borderBottom: T.rule, fontSize: 12, color: C.muted }}>
            <div><b style={{ color: C.ink2 }}>From:</b> Vanguard Plan Services</div>
            <div><b style={{ color: C.ink2 }}>To:</b> Plan participant</div>
            {piece.subject && <div><b style={{ color: C.ink2 }}>Subject:</b> <span style={{ color: C.ink, fontWeight: 600 }}>{piece.subject}</span></div>}
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17, color: C.ink }}>{piece.headline}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {piece.body.map((para, i) => <p key={i} style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: C.ink2 }}>{para}</p>)}
            </div>
            <div style={{ marginTop: 14 }}><CtaButton label={piece.cta} /></div>
          </div>
        </div>
        {variants && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 700, marginBottom: 8 }}>A/B variants</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10 }}>
              {variants.map(v => (
                <div key={v.letter} style={{ border: T.rule, borderRadius: T.radMd, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.paper, borderBottom: T.rule }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: C.gold, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: DISP, fontWeight: 700, fontSize: 11 }}>{v.letter}</span>
                    <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>{v.label}</span>
                  </div>
                  <div style={{ padding: 12 }}>
                    {v.subject && <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 4 }}><b style={{ color: C.ink2 }}>Subject:</b> {v.subject}</div>}
                    <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13, color: C.ink, lineHeight: 1.3 }}>{v.headline}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                      {v.body.map((para, i) => <p key={i} style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: C.ink2 }}>{para}</p>)}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: C.goldDk, fontWeight: 600 }}>{v.cta} →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Required notice (formal document) ──
  if (isNotice) {
    return (
      <div style={{ border: T.rule, borderRadius: T.radMd, background: C.card, padding: 20 }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: C.ink, textAlign: 'center' }}>{piece.headline}</div>
        <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>ERISA participant notice · effective date [effective date] · 30-day notice</div>
        <div style={{ height: 1, background: C.line, margin: '14px 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(piece.sections || piece.body.map((b, i) => ({ heading: `Section ${i + 1}`, body: b }))).map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: C.muted, letterSpacing: '.04em' }}>{s.heading}</div>
              <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6, marginTop: 3 }}>{s.body}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: C.line, margin: '14px 0' }} />
        <div style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>Provided in compliance with ERISA notice requirements. Retain for your records.</div>
      </div>
    )
  }

  // ── Generic (FAQ, portal confirm, explainer text) ──
  return (
    <div>
      {piece.subject && (
        <div style={{ marginBottom: 12, padding: '10px 12px', background: C.paper, borderRadius: T.radSm, border: T.rule }}>
          <span style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 700 }}>Subject</span>
          <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 600, marginTop: 3 }}>{piece.subject}</div>
        </div>
      )}
      <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 19, color: C.ink, lineHeight: 1.25 }}>{piece.headline}</div>
      {piece.subhead && <div style={{ fontSize: 13.5, color: C.ink2, marginTop: 4 }}>{piece.subhead}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
        {piece.body.map((para, i) => <p key={i} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: C.ink2 }}>{para}</p>)}
      </div>
      {piece.sections && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {piece.sections.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: C.paper, border: T.rule, borderRadius: T.radMd }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: C.brand, color: '#fff', flexShrink: 0, display: 'grid', placeItems: 'center', fontFamily: DISP, fontWeight: 700, fontSize: 12 }}>{i + 1}</span>
              <div>
                <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13.5, color: C.ink }}>{s.heading}</div>
                <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.55, marginTop: 3 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 16 }}><CtaButton label={piece.cta} /></div>
    </div>
  )
}

function ContentModal({ item, status, onClose }) {
  if (!item) return null
  const { piece, seg } = item
  if (!piece) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,25,.55)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(660px,100%)', maxHeight: '86vh', overflow: 'auto',
        background: C.card, border: T.rule, borderRadius: T.radLg, boxShadow: T.shadow3 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '16px 20px', borderBottom: T.rule, position: 'sticky', top: 0, background: C.card }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDk, fontWeight: 700 }}>{piece.asset} · {seg.strategy}</div>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 16, color: C.ink }}>{seg.cohort}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Pill tone={status === 'locked' ? 'ok' : status === 'drafted' ? 'review' : 'neutral'}>
              {status === 'locked' ? 'Locked' : status === 'drafted' ? 'Draft' : 'Not generated'}
            </Pill>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted, fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 14 }}>Format · {piece.format}</div>
          <ContentRender piece={piece} seg={seg} />
          <div style={{ marginTop: 18, padding: '12px 14px', background: C.amberBg, borderRadius: T.radMd, border: `1px solid ${C.gold}44` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: C.goldDk, fontWeight: 700, marginBottom: 5 }}>
              <IconShieldCheck size={13} /> Compliance note
            </div>
            <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.55 }}>{piece.complianceNote}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Posture value derives from the SAME projection the simulation uses, so Balanced matches
// simulation/results/live exactly; Aggressive/Conservative scale the same base by fixed factors.
const POSTURE_FACTOR = { aggressive: { lf: 1.37, cf: 1.5 }, balanced: { lf: 1, cf: 1 }, conservative: { lf: 0.48, cf: 0.35 } }
function postureValue(id, p) {
  const f = POSTURE_FACTOR[id] || POSTURE_FACTOR.balanced
  const aum = p.aum * f.lf, cost = p.cost * f.cf
  return { lift: +(p.lift * f.lf).toFixed(1), enroll: Math.round(p.enroll * f.lf), aum: +aum.toFixed(0), cost: +cost.toFixed(1), roi: cost > 0 ? +(aum / cost).toFixed(1) : 0 }
}
// Balanced/Aggressive act on all configured segments; Conservative on the core subset.
function postureSegments(id, d) {
  return id === 'conservative' ? d.perCell.filter(c => ['ae', 'ms'].includes(c.id)) : d.perCell
}

function TabStrategy({ sponsor, lab, setLab, d }) {
  const selectedId = lab.posture || 'balanced'
  const choose = (id) => setLab(l => ({ ...l, posture: id }))
  const active = STRATEGY_PLAYBOOKS.find(p => p.id === selectedId) || STRATEGY_PLAYBOOKS[1]
  const p = projections(sponsor, d)
  const activeVal = postureValue(active.id, p)
  const activeSegs = postureSegments(active.id, d)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12.5, color: C.muted }}>
        <IconChartBar size={15} color={C.gold} /> Three strategy postures — pick the stance, then see exactly which segment gets which lever, channel, and content, and the value it should create.
      </div>

      {/* 3 posture tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 18 }}>
        {STRATEGY_PLAYBOOKS.map(pb => {
          const on = pb.id === selectedId
          const v = postureValue(pb.id, p)
          return (
            <Card key={pb.id} onClick={() => choose(pb.id)} pad={16}
              style={{ cursor: 'pointer', borderColor: on ? C.gold : undefined, borderWidth: on ? 2 : 1, borderStyle: 'solid',
                background: on ? C.amberBg : C.card }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17, color: C.ink }}>{pb.name}</span>
                {pb.rec ? <Pill tone="gold">Recommended</Pill> : on && <IconCheck size={16} color={C.green} />}
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, minHeight: 52 }}>{pb.tagline}</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.line}` }}>
                <div><div style={{ fontSize: 10, color: C.muted }}>Prob. AUM</div><div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: C.goldDk }}>+${v.aum}M</div></div>
                <div><div style={{ fontSize: 10, color: C.muted }}>Participation</div><div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: C.green }}>+{v.lift} pts</div></div>
                <div><div style={{ fontSize: 10, color: C.muted }}>Cost</div><div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: C.ink }}>+${v.cost}M</div></div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* probable value created for the selected posture */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Eyebrow>Probable value created · {active.name}</Eyebrow>
          <span style={{ fontSize: 12, color: C.muted }}>Estimate — refined in Simulation</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginTop: 6 }}>
          <KpiTile label="Participation lift" value={`+${activeVal.lift} pts`} tone={C.green} />
          <KpiTile label="Incremental enrollments" value={`+${num(activeVal.enroll)}`} tone={C.green} />
          <KpiTile label="Incremental AUM" value={`+$${activeVal.aum}M`} tone={C.goldDk} />
          <KpiTile label="Incremental cost" value={`+$${activeVal.cost}M`} />
          <KpiTile label="AUM-to-cost" value={`${activeVal.roi}×`} tone={C.goldDk} />
        </div>
      </Card>

      {/* segment-by-segment playbook for the selected posture */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 12.5, color: C.muted }}>
        <IconTargetArrow size={15} color={C.gold} /> {active.name} playbook — {activeSegs.length} segments · who gets what
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {activeSegs.map((cell, i) => {
          const seg = { audience: cell.population }
          const pieces = STRATEGY_CONTENT[cell.id] || []
          return (
            <Card key={cell.id} pad={0}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: T.rule }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: C.brand, color: '#fff',
                  display: 'grid', placeItems: 'center', fontFamily: DISP, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: C.ink }}>{cell.strategy}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Why · {cell.why}</div>
                </div>
                <Pill tone="gold">{num(seg.audience)} in audience</Pill>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 0 }}>
                {[
                  { k: 'Segment', v: cell.cohort },
                  { k: 'Audience size', v: `${num(seg.audience)} participants` },
                  { k: 'KPI', v: 'Participation' },
                ].map((f, j) => (
                  <div key={f.k} style={{ padding: '13px 20px', borderTop: T.rule, borderLeft: j === 0 ? 'none' : T.rule }}>
                    <div style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 700 }}>{f.k}</div>
                    <div style={{ fontSize: 13.5, color: C.ink, fontWeight: 600, marginTop: 4 }}>{f.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '14px 20px', borderTop: T.rule, display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 700, marginBottom: 6 }}>Channels</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(cell.channels || []).map(ch => <Pill key={ch} tone="neutral">{ch}</Pill>)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 700, marginBottom: 6 }}>Content types ({pieces.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {pieces.map(p => (
                      <span key={p.asset} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.ink2 }}>
                        <IconFileText size={13} color={C.gold} /> {p.asset}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function AssetChip({ label, color, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 11px',
      background: C.paper, borderRadius: T.radMd, border: T.rule, cursor: 'pointer', transition: `all .15s ${T.ease}` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.amberBg }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = C.paper }}>
      <IconFileText size={14} color={color} />
      <span style={{ fontSize: 12, color: C.ink2, textTransform: 'capitalize' }}>{label}</span>
      <IconChevronRight size={12} color={C.faint} style={{ marginLeft: 2 }} />
    </div>
  )
}

function TabContent({ lab, setLab, d }) {
  const [preview, setPreview] = useState(null)
  const status = lab.content
  const canLock = lab.content === 'drafted' || lab.content === 'locked'
  const assetIcon = status === 'locked' ? C.green : C.gold
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 16 }}>
      <ContentModal item={preview} status={status} onClose={() => setPreview(null)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Eyebrow>Content · generated per segment · draft before sim, lock after</Eyebrow>
            <Pill tone={status === 'locked' ? 'ok' : status === 'drafted' ? 'review' : 'neutral'}>
              {status === 'locked' ? 'Locked' : status === 'drafted' ? 'Draft' : 'Not started'}
            </Pill>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Btn kind="gold" small onClick={() => setLab(l => ({ ...l, content: 'drafted' }))}>Generate per-segment drafts</Btn>
            <Btn kind={canLock ? 'primary' : 'quiet'} small onClick={() => canLock && setLab(l => ({ ...l, content: 'locked' }))}
              style={{ opacity: canLock ? 1 : 0.5, cursor: canLock ? 'pointer' : 'not-allowed' }}>Lock content</Btn>
          </div>
          {!canLock && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 8 }}>Generate per-segment drafts to enable locking.</div>}
        </Card>
        {d.perCell.map(seg => {
          const pieces = STRATEGY_CONTENT[seg.id] || []
          return (
            <Card key={seg.id} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 14, color: C.ink }}>{seg.cohort}</span>
                  <Pill tone="gold">{seg.strategy}</Pill>
                </div>
                <span style={{ fontSize: 11, color: C.muted }}>{num(seg.treated)} treated · {pieces.length} assets · click to preview</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {pieces.map(p => (
                  <AssetChip key={p.asset} label={p.asset} color={assetIcon} onClick={() => setPreview({ piece: p, seg })} />
                ))}
              </div>
            </Card>
          )
        })}
      </div>
      <Card style={{ alignSelf: 'flex-start' }}>
        <Eyebrow>Compliance checks · blockers surface here</Eyebrow>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          {COMPLIANCE.map(c => {
            const st = d.compState(c)
            return (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: C.ink2 }}>{c.label}</span>
                {st === 'blocked'
                  ? <Btn kind="primary" small onClick={() => setLab(l => ({ ...l, compFixed: { ...l.compFixed, [c.label]: true } }))}>Run</Btn>
                  : <Pill tone={st}>{st === 'ok' ? 'Approved' : 'In review'}</Pill>}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function projections(sponsor, d) {
  const lift = d.lift
  const base = sponsor.participation
  const projected = Math.min(0.99, base + lift / 100)
  const enroll = Math.round((lift / 100) * d.treated)
  const aum = (lift / 100) * d.treated * AVG_BALANCE / 1e6
  const cost = (lift / 100) * d.treated * 900 / 1e6
  const roi = cost > 0 ? aum / cost : 0
  const stress = sponsor.employees / 50000 * 14.2
  const payback = cost > 0 ? stress / cost : 0
  const deferralLift = +(lift * 0.15).toFixed(1)
  const fidNew = Math.max(12, Math.round(38 - lift * 1.4))
  const adp = lift >= 5 ? 'Resolved' : 'At-risk'
  const ind = INDUSTRY_KPI[sponsor.industry]
  return { lift, base, projected, enroll, aum, cost, roi, stress, payback, deferralLift, fidNew, adp, ind }
}

function KpiTile({ label, value, sub, tone }) {
  return (
    <div style={{ background: C.paper, border: T.rule, borderRadius: T.radMd, padding: '13px 15px' }}>
      <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: DISP, fontSize: 21, fontWeight: 700, color: tone || C.ink, marginTop: 5, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10.5, color: C.muted, marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

const SIM_STEPS = [
  'Loading baseline population & plan rules…',
  'Applying lever parameters to each cohort…',
  'Running 1,000 Monte-Carlo iterations…',
  'Scoring ADP margin & fiduciary risk…',
  'Aggregating outcomes vs holdout…',
]

function SimRunning({ d, progress }) {
  const stepIdx = Math.min(SIM_STEPS.length - 1, Math.floor(progress / 100 * SIM_STEPS.length))
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <IconActivity size={16} color={C.gold} />
        <Eyebrow>Simulation running · live</Eyebrow>
        <span style={{ marginLeft: 'auto', fontFamily: DISP, fontWeight: 700, fontSize: 15, color: C.ink }}>{Math.round(progress)}%</span>
      </div>
      <div style={{ height: 10, background: C.line, borderRadius: 5, overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: T.goldFoil, borderRadius: 5, transition: 'width .1s linear' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SIM_STEPS.map((s, i) => {
          const done = i < stepIdx; const active = i === stepIdx
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: done || active ? 1 : 0.4 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
                background: done ? C.green : active ? C.gold : C.line, color: done || active ? '#fff' : C.muted, fontSize: 11, fontWeight: 700 }}>
                {done ? <IconCheck size={12} /> : i + 1}
              </span>
              <span style={{ fontSize: 13, color: C.ink2, fontWeight: active ? 600 : 400 }}>{s}</span>
              {active && <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>{num(d.treated)} treated · {num(d.holdout)} holdout</span>}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function TabSimulation({ sponsor, lab, setLab, d }) {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!running) return
    const t0 = Date.now()
    const iv = setInterval(() => {
      const e = Math.min(100, ((Date.now() - t0) / 5000) * 100)
      setProgress(e)
      if (e >= 100) { clearInterval(iv); setRunning(false); setLab(l => ({ ...l, simulated: true })) }
    }, 50)
    return () => clearInterval(iv)
  }, [running, setLab])
  const startRun = () => { setProgress(0); setRunning(true) }

  const p = projections(sponsor, d)
  const attrib = d.treatCells.map(c => ({ name: c.strategy, w: STRAT_WEIGHT[c.id] || 0 })).sort((a, b) => b.w - a.w)
  const attTot = attrib.reduce((a, c) => a + c.w, 0) || 1
  const mkScen = (name, lf, cf, conf) => ({
    name, conf,
    part: Math.min(0.99, p.base + p.lift * lf / 100),
    lift: +(p.lift * lf).toFixed(1),
    enroll: Math.round(p.enroll * lf),
    aum: +(p.aum * lf).toFixed(0),
    cost: +(p.cost * cf).toFixed(1),
    roi: cf > 0 ? +((p.aum * lf) / (p.cost * cf)).toFixed(1) : 0,
    deferral: +(p.deferralLift * lf).toFixed(1),
  })
  const scen = [
    { name: 'Do-nothing', part: p.base, lift: 0, enroll: 0, aum: 0, cost: 0, roi: 0, deferral: 0, conf: '—' },
    mkScen('Balanced', 1, 1, 'High'),
  ]
  const bench = [
    { k: 'Current', v: p.base }, { k: 'Projected', v: p.projected }, { k: 'Sector benchmark', v: sponsor.benchmark },
  ]

  if (running) return <SimRunning d={d} progress={progress} />

  if (!lab.simulated) {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <Eyebrow>Simulation · plan-design outcomes</Eyebrow>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Project the portfolio against the sponsor's plan</div>
          </div>
          <Btn kind="gold" small onClick={startRun}>Run 1,000-iteration simulation</Btn>
        </div>
        <div style={{ display: 'grid', placeItems: 'center', height: 220, color: C.muted, fontSize: 13, textAlign: 'center' }}>
          <div><IconActivity size={30} color={C.faint} /><div style={{ marginTop: 8 }}>Runs baseline load → parameter application → outcome computation → ADP-margin & fiduciary scoring for {num(d.treated)} treated vs {num(d.holdout)} holdout.</div></div>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* winner callout */}
      <Card style={{ background: C.amberBg, borderColor: `${C.gold}55` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <Eyebrow>Balanced portfolio · why it wins</Eyebrow>
            <div style={{ fontSize: 14, color: C.ink2, lineHeight: 1.6, maxWidth: 640 }}>
              Projected participation rises to <b style={{ color: C.ink }}>{pct(p.projected)}</b> (from {pct(p.base)}),
              adding <b style={{ color: C.ink }}>{num(p.enroll)}</b> participants and <b style={{ color: C.goldDk }}>+${p.aum.toFixed(0)}M</b> in AUM
              for <b style={{ color: C.ink }}>+${p.cost.toFixed(1)}M</b> incremental cost ({p.roi.toFixed(1)}× AUM-to-cost). The ADP test is
              <b style={{ color: p.adp === 'Resolved' ? C.green : C.red }}> {p.adp.toLowerCase()}</b>; <b style={{ color: C.ink }}>{attrib[0]?.name}</b> is
              the dominant driver{attrib[1] ? `, ${attrib[1].name.toLowerCase()} compounds it` : ''}.
            </div>
          </div>
          <Btn kind="ghost" small onClick={startRun}>Re-run</Btn>
        </div>
      </Card>

      {/* Primary KPI — participation */}
      <Card>
        <Eyebrow>Participation · P50 · {sponsor.industry}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
          <div>
            <div style={{ fontFamily: DISP, fontSize: 48, fontWeight: 700, color: C.green, lineHeight: 1 }}>{pct(p.projected)}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6 }}>from {pct(p.base)} · <b style={{ color: C.green }}>+{p.lift} pts</b> vs holdout · target {pct(sponsor.benchmark)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Confidence band</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: C.ink2 }}>
              <span>P5 {pct(Math.max(0, p.base + p.lift * 0.7 / 100))}</span>
              <span>P50 {pct(p.projected)}</span>
              <span>P95 {pct(Math.min(0.99, p.base + p.lift * 1.3 / 100))}</span>
            </div>
            <div style={{ height: 8, background: C.line, borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
              <div style={{ width: pct(p.projected), height: '100%', background: C.green, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>over {num(d.treated)} treated vs {num(d.holdout)} holdout</div>
          </div>
        </div>
      </Card>

      {/* Secondary KPIs */}
      <Card>
        <Eyebrow>Other projected KPIs</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginTop: 4 }}>
          <KpiTile label="Incremental enrollments" value={`+${num(p.enroll)}`} sub="newly participating" tone={C.green} />
          <KpiTile label="Incremental AUM" value={`+$${p.aum.toFixed(0)}M`} sub="new assets added" tone={C.goldDk} />
          <KpiTile label="Incremental cost" value={`+$${p.cost.toFixed(1)}M`} sub="employer match" />
          <KpiTile label="AUM-to-cost ratio" value={`${p.roi.toFixed(1)}×`} sub="incremental AUM ÷ cost" tone={C.goldDk} />
          <KpiTile label="ADP test" value={p.adp} tone={p.adp === 'Resolved' ? C.green : C.red} sub="HCE–NHCE spread" />
          <KpiTile label="Deferral lift" value={`+${p.deferralLift} pts`} />
          <KpiTile label="Fiduciary risk" value={`${p.fidNew}/100`} sub="from 38" tone={C.green} />
          <KpiTile label="Payback" value={`${p.payback.toFixed(1)}×`} sub="on incremental cost" tone={C.goldDk} />
          {p.ind && <KpiTile label={p.ind.label} value={`+${(p.lift * p.ind.factor).toFixed(1)} ${p.ind.unit}`} sub="industry context" />}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
        {/* parameter-impact attribution */}
        <Card>
          <Eyebrow>Parameter-impact attribution</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            {attrib.map((a, i) => (
              <div key={a.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: C.ink2, fontWeight: 500 }}>{a.name}</span>
                  <span style={{ color: C.muted }}>{Math.round(a.w / attTot * 100)}%</span>
                </div>
                <div style={{ height: 8, background: C.line, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${a.w / attTot * 100}%`, height: '100%', background: i === 0 ? C.gold : C.brandLt, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* benchmark */}
        <Card>
          <Eyebrow>Participation vs sector benchmark</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {bench.map(b => (
              <div key={b.k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: C.ink2 }}>{b.k}</span>
                  <span style={{ fontFamily: DISP, fontWeight: 700, color: C.ink }}>{pct(b.v)}</span>
                </div>
                <div style={{ height: 10, background: C.line, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${b.v * 100}%`, height: '100%', borderRadius: 5,
                    background: b.k === 'Projected' ? C.green : b.k === 'Sector benchmark' ? C.goldDk : C.faint }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* scenario comparison */}
      <Table minWidth={860} head={<><Th>Scenario</Th><Th align="right">Participation</Th><Th align="right">Lift</Th><Th align="right">Enrollments</Th><Th align="right">Incr. AUM</Th><Th align="right">Incr. cost</Th><Th align="right">AUM-to-cost</Th><Th align="right">Deferral lift</Th><Th>Confidence</Th></>}>
        {scen.map(s => (
          <tr key={s.name}>
            <Td bold>{s.name}</Td>
            <Td align="right">{pct(s.part)}</Td>
            <Td align="right">{s.lift ? `+${s.lift} pts` : '—'}</Td>
            <Td align="right">{s.enroll ? `+${num(s.enroll)}` : '—'}</Td>
            <Td align="right">{s.aum ? `+$${s.aum}M` : '—'}</Td>
            <Td align="right">{s.cost ? `+$${s.cost}M` : '—'}</Td>
            <Td align="right">{s.roi ? `${s.roi}×` : '—'}</Td>
            <Td align="right">{s.deferral ? `+${s.deferral} pts` : '—'}</Td>
            <Td>{s.conf !== '—' ? <Pill tone={s.conf === 'High' ? 'ok' : 'review'}>{s.conf}</Pill> : '—'}</Td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

function TabApproval({ lab, setLab, d }) {
  const items = [
    { key: 'portfolio', label: 'Portfolio approval' },
    { key: 'cell', label: 'Strategy-cell approval' },
    { key: 'compliance', label: 'Compliance approval' },
    { key: 'fiduciary', label: 'Fiduciary review' },
    { key: 'payroll', label: 'Payroll / recordkeeping readiness' },
  ]
  const gated = lab.content !== 'locked'
  const toggle = (k) => !gated && setLab(l => ({ ...l, approvals: { ...l.approvals, [k]: !l.approvals[k] } }))
  const approveAll = () => !gated && setLab(l => ({ ...l, approvals: Object.fromEntries(items.map(it => [it.key, true])) }))
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <Eyebrow>Approval · portfolio and each strategy cell</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill tone={d.allApproved ? 'ok' : 'review'}>{d.allApproved ? 'Sponsor-ready' : 'In progress'}</Pill>
          <Btn kind={gated || d.allApproved ? 'quiet' : 'gold'} small onClick={approveAll}
            style={{ opacity: gated || d.allApproved ? 0.5 : 1, cursor: gated || d.allApproved ? 'not-allowed' : 'pointer' }}>
            <IconChecklist size={14} /> Approve all
          </Btn>
        </div>
      </div>
      {gated && <div style={{ fontSize: 12, color: C.amber, marginBottom: 10 }}>Lock content before approvals can be granted.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(it => {
          const on = lab.approvals[it.key]
          return (
            <div key={it.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: C.paper, borderRadius: T.radMd, border: T.rule, opacity: gated ? 0.55 : 1 }}>
              <span style={{ fontSize: 13, color: C.ink2 }}>{it.label}</span>
              <Btn kind={on ? 'ghost' : 'primary'} small onClick={() => toggle(it.key)}
                style={{ cursor: gated ? 'not-allowed' : 'pointer' }}>
                {on ? <><IconCheck size={14} /> Approved</> : 'Approve'}
              </Btn>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function TabDeployment({ sponsor, lab, setLab, d, addMemory }) {
  const ready = d.allApproved
  const allLive = d.perCell.length > 0 && d.perCell.every(l => lab.deployed[l.strategy])
  const launch = (lane) => ready && setLab(l => ({ ...l, deployed: { ...l.deployed, [lane]: true } }))
  const runFull = () => {
    if (!ready || allLive) return
    const p = projections(sponsor, d)
    setLab(l => ({ ...l, deployed: Object.fromEntries(d.perCell.map(c => [c.strategy, true])) }))
    addMemory({
      id: `${sponsor.id}-${Date.now()}`,
      sponsor: sponsor.name,
      signal: 'Participation gap',
      portfolio: d.treatCells.map(c => c.strategy).join(' + '),
      levers: `AE ${lab.levers.aeDefault}% +${lab.levers.aeEsc}%/yr · Stretch ${lab.levers.msTarget}% · Esc +${lab.levers.escStep}%/yr`,
      approval: 'Deployed',
      status: 'Live',
      live: true,
      isNew: true,
      deployedAt: Date.now(),
      outcome: `Projected +${p.lift} pts participation · +$${p.aum.toFixed(0)}M AUM`,
      detail: {
        industry: sponsor.industry,
        treated: d.treated,
        holdout: d.holdout,
        target: {
          lift: p.lift, base: p.base, projected: p.projected, enroll: p.enroll,
          aum: +p.aum.toFixed(0), cost: +p.cost.toFixed(1), roi: +p.roi.toFixed(1),
          deferralLift: p.deferralLift, benchmark: sponsor.benchmark,
        },
        lanes: d.perCell.map(c => ({ strategy: c.strategy, treated: c.treated, holdout: c.holdout, channel: c.content })),
        window: `${lab.timeline.measureWeeks}-week measurement window`,
      },
    })
  }
  return (
    <Card pad={0}>
      <div style={{ padding: '14px 20px', borderBottom: T.rule, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Deployment lanes · holdouts preserved</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>One lane per strategy · staged rollout with suppression + rollback.</div>
        </div>
        {!ready ? <Pill tone="review">Approve all to enable launch</Pill>
          : allLive ? <Pill tone="ok"><IconCheck size={12} /> Full strategy live · logged to Memory</Pill>
          : <Btn kind="gold" small onClick={runFull}><IconRocket size={14} /> Run full strategy</Btn>}
      </div>
      <Table minWidth={720} head={<><Th>Lane</Th><Th align="right">Treated</Th><Th align="right">Holdout</Th><Th>Channel</Th><Th align="right">Action</Th></>}>
        {d.perCell.map(l => {
          const live = lab.deployed[l.strategy]
          return (
            <tr key={l.id}>
              <Td bold>{l.strategy}</Td>
              <Td align="right">{num(l.treated)}</Td>
              <Td align="right">{l.holdout ? num(l.holdout) : '—'}</Td>
              <Td>{l.content}</Td>
              <Td align="right">
                {live ? <Pill tone="ok"><IconRocket size={12} /> Launched</Pill>
                  : <Btn kind={ready ? 'gold' : 'quiet'} small onClick={() => launch(l.strategy)}
                      style={{ opacity: ready ? 1 : 0.5, cursor: ready ? 'pointer' : 'not-allowed' }}>Launch</Btn>}
              </Td>
            </tr>
          )
        })}
      </Table>
      {allLive && (
        <div style={{ padding: '14px 20px', borderTop: T.rule, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.ink2 }}>
          <IconBrain size={15} color={C.gold} /> This deployment has been recorded in the <b>Memory</b> tab as a prior sponsor decision for future reuse.
        </div>
      )}
    </Card>
  )
}

/* ───────────────────────── MEMORY ───────────────────────── */
function LiveDot() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <style>{`@keyframes vgpulse{0%{box-shadow:0 0 0 0 rgba(168,69,59,.5)}70%{box-shadow:0 0 0 6px rgba(168,69,59,0)}100%{box-shadow:0 0 0 0 rgba(168,69,59,0)}}`}</style>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, animation: 'vgpulse 1.5s infinite' }} />
    </span>
  )
}

function StatusPill({ record }) {
  if (record.live) return <Pill tone="high"><LiveDot /> Live</Pill>
  return <Pill tone="ok"><IconCheck size={12} /> Completed</Pill>
}

// Live campaign detail — ramps to-date metrics from the deploy timestamp.
function LiveCampaignDetail({ record }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])
  const dt = record.detail
  const elapsed = (Date.now() - record.deployedAt) / 1000
  const frac = Math.min(0.42, elapsed / 20)         // in-flight; caps at 42%
  const tgt = dt.target
  const soFar = {
    lift: +(tgt.lift * frac).toFixed(2),
    part: tgt.base + (tgt.projected - tgt.base) * frac,
    enroll: Math.round(tgt.enroll * frac),
    aum: tgt.aum * frac,
    cost: tgt.cost * frac,
  }
  const weekOf = Math.max(1, Math.round(frac / 0.42 * 4))   // ~week 1–4 of measurement
  const totalWeeks = parseInt(dt.window) || 12
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ background: C.amberBg, borderColor: `${C.gold}55` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LiveDot />
          <Eyebrow>Campaign live · updating in real time</Eyebrow>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>Week {weekOf} of {totalWeeks} · {dt.window}</span>
        </div>
        <div style={{ fontSize: 14, color: C.ink2, lineHeight: 1.6, marginTop: 6, maxWidth: 680 }}>
          Rolling out across <b style={{ color: C.ink }}>{num(dt.treated)}</b> treated participants ({num(dt.holdout)} held out for causal measurement).
          Results below are to-date and will continue to accrue toward the projection.
        </div>
        <div style={{ marginTop: 12, height: 10, background: C.line, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${frac / 0.42 * 100}%`, height: '100%', background: T.goldFoil, borderRadius: 5, transition: 'width 1s linear' }} />
        </div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{Math.round(frac / 0.42 * 100)}% through the current rollout stage.</div>
      </Card>

      <Card>
        <Eyebrow>Live results to-date · vs projection</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginTop: 4 }}>
          <KpiTile label="Participation so far" value={pct(soFar.part)} sub={`toward ${pct(tgt.projected)} projected`} tone={C.green} />
          <KpiTile label="Lift so far" value={`+${soFar.lift} pts`} sub={`of +${tgt.lift} projected`} tone={C.green} />
          <KpiTile label="Enrollments so far" value={`+${num(soFar.enroll)}`} sub={`of +${num(tgt.enroll)} projected`} tone={C.green} />
          <KpiTile label="AUM added so far" value={`+$${soFar.aum.toFixed(1)}M`} sub={`of +$${tgt.aum}M projected`} tone={C.goldDk} />
          <KpiTile label="Cost incurred" value={`+$${soFar.cost.toFixed(2)}M`} sub={`of +$${tgt.cost}M projected`} />
          <KpiTile label="AUM-to-cost" value={`${tgt.roi}×`} sub="projected at full run" tone={C.goldDk} />
        </div>
      </Card>

      <Card>
        <Eyebrow>Enrollment ramp · to-date vs projected</Eyebrow>
        <div style={{ height: 200, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={Array.from({ length: totalWeeks + 1 }, (_, i) => {
              const f = i / totalWeeks; const proj = Math.round(tgt.enroll * (1 - Math.pow(1 - f, 2)))
              return { wk: `W${i}`, Projected: proj, 'To-date': i <= weekOf ? Math.round(proj * 0.97) : null }
            })} margin={{ top: 6, right: 10, bottom: 0, left: -6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
              <XAxis dataKey="wk" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <Line type="monotone" dataKey="Projected" stroke={C.goldDk} strokeWidth={2} strokeDasharray="4 3" dot={false} />
              <Line type="monotone" dataKey="To-date" stroke={C.green} strokeWidth={2.5} dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: C.muted, marginTop: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: C.green, borderRadius: 2 }} /> To-date (actual)</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: C.goldDk, borderRadius: 2 }} /> Projected</span>
        </div>
      </Card>

      <Card pad={0}>
        <div style={{ padding: '14px 20px', borderBottom: T.rule, fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Deployment lanes · live</div>
        <Table minWidth={640} head={<><Th>Lane</Th><Th align="right">Treated</Th><Th align="right">Holdout</Th><Th>Channel</Th><Th align="center">Status</Th></>}>
          {dt.lanes.map(l => (
            <tr key={l.strategy}>
              <Td bold>{l.strategy}</Td>
              <Td align="right">{num(l.treated)}</Td>
              <Td align="right">{l.holdout ? num(l.holdout) : '—'}</Td>
              <Td>{l.channel}</Td>
              <Td align="center"><Pill tone="high"><LiveDot /> Rolling out</Pill></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}

// Completed campaign detail — realized impact vs holdout.
function CompletedCampaignDetail({ record }) {
  const im = record.impact
  if (!im) return <div style={{ fontSize: 13, color: C.muted }}>{record.outcome}</div>
  const bars = [
    { k: 'Treatment', v: im.treatmentPart, tone: C.green },
    { k: 'Holdout', v: im.holdoutPart, tone: C.goldDk },
    { k: 'Baseline', v: im.baseline, tone: C.faint },
  ]
  const weeks = parseInt(im.window) || parseInt(record.window) || 12
  const trajectory = Array.from({ length: weeks + 1 }, (_, i) => {
    const f = i / weeks; const ease = 1 - Math.pow(1 - f, 2)
    return {
      wk: `W${i}`,
      Treatment: +((im.baseline + (im.treatmentPart - im.baseline) * ease) * 100).toFixed(1),
      Holdout: +((im.baseline + (im.holdoutPart - im.baseline) * ease * 0.6) * 100).toFixed(1),
    }
  })
  const laneAum = (() => {
    const tot = im.lanes.reduce((a, l) => a + l.treated, 0) || 1
    return im.lanes.map(l => ({ name: l.strategy, AUM: +(im.aum * l.treated / tot).toFixed(0) }))
  })()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Eyebrow>Impact created · realized vs holdout</Eyebrow>
          <span style={{ fontSize: 12, color: C.muted }}>{record.window}</span>
        </div>
        <div style={{ fontSize: 14, color: C.ink2, lineHeight: 1.65, marginTop: 6, maxWidth: 700 }}>{im.summary}</div>
      </Card>

      {/* graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
        <Card>
          <Eyebrow>Participation trajectory · treatment vs holdout</Eyebrow>
          <div style={{ height: 200, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectory} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="wk" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Line type="monotone" dataKey="Treatment" stroke={C.green} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Holdout" stroke={C.goldDk} strokeWidth={2} strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: C.muted, marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: C.green, borderRadius: 2 }} /> Treatment</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 12, height: 3, background: C.goldDk, borderRadius: 2 }} /> Holdout</span>
          </div>
        </Card>
        <Card>
          <Eyebrow>AUM contribution by lane</Eyebrow>
          <div style={{ height: 200, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={laneAum} margin={{ top: 6, right: 10, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
                <Bar dataKey="AUM" fill={C.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>Incremental AUM ($M) attributed by treated population.</div>
        </Card>
      </div>

      <Card>
        <Eyebrow>Realized KPIs</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10, marginTop: 4 }}>
          <KpiTile label="Participation lift" value={`+${im.participationLift} pts`} sub="vs holdout" tone={C.green} />
          <KpiTile label="Incremental enrollments" value={`+${num(im.enrollments)}`} sub="newly participating" tone={C.green} />
          <KpiTile label="Incremental AUM" value={`+$${im.aum}M`} sub="assets added" tone={C.goldDk} />
          <KpiTile label="Incremental cost" value={im.cost ? `+$${im.cost}M` : 'Cost-neutral'} sub="employer match" />
          <KpiTile label="AUM-to-cost" value={im.cost ? `${im.roi}×` : '∞'} sub="return on cost" tone={C.goldDk} />
          <KpiTile label="Deferral lift" value={`+${im.deferralLift} pts`} />
          <KpiTile label="Opt-out rate" value={pct(im.optOut / 100)} sub="below plan assumption" tone={C.green} />
          <KpiTile label="Predicted vs realized" value={`${im.predictedLift} → ${im.participationLift}`} sub="pts participation" />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
        <Card>
          <Eyebrow>Treatment vs holdout · participation</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {bars.map(b => (
              <div key={b.k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: C.ink2 }}>{b.k}</span>
                  <span style={{ fontFamily: DISP, fontWeight: 700, color: C.ink }}>{pct(b.v)}</span>
                </div>
                <div style={{ height: 10, background: C.line, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: pct(b.v), height: '100%', background: b.tone, borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card pad={0}>
          <div style={{ padding: '16px 20px', borderBottom: T.rule, fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Lane-level realized impact</div>
          <Table minWidth={360} head={<><Th>Lane</Th><Th align="right">Treated</Th><Th>Realized</Th></>}>
            {im.lanes.map(l => (
              <tr key={l.strategy}>
                <Td bold>{l.strategy}</Td>
                <Td align="right">{num(l.treated)}</Td>
                <Td><span style={{ color: C.green, fontWeight: 600 }}>{l.realized}</span></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  )
}

function MemoryDetail({ record, onBack }) {
  return (
    <div>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12, marginBottom: 12, fontFamily: FONT }}>
        <IconArrowLeft size={14} /> Back to Memory
      </button>
      <SectionTitle kicker={`Memory · ${record.live ? 'Live campaign' : 'Completed campaign'} · ${record.signal}`}
        title={`${record.sponsor} — ${record.portfolio}`}
        sub={record.live
          ? 'This experiment is deployed and running. Results below update live as the rollout progresses.'
          : `Deployed ${record.completedOn || ''} — here is the impact this campaign created, measured against the preserved holdout.`}
        right={<StatusPill record={record} />} />
      {record.live ? <LiveCampaignDetail record={record} /> : <CompletedCampaignDetail record={record} />}
    </div>
  )
}

function Memory({ memoryLog = [] }) {
  const [selected, setSelected] = useState(null)
  const rows = [...memoryLog, ...MEMORY_DECISIONS]
  const active = rows.find(r => (r.id || r.sponsor) === selected)
  if (active) return <MemoryDetail record={active} onBack={() => setSelected(null)} />
  return (
    <div>
      <SectionTitle kicker="Memory · Institutional learning" title="What have we learned, and what can we reuse?"
        sub="Prior sponsor decisions, how holdout outcomes compared with prediction, and reusable decision policies. Select any decision to open its live or completed results." />
      <Card pad={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: T.rule, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Prior sponsor decisions</span>
          {memoryLog.length > 0 && <Pill tone="gold">{memoryLog.length} deployed this session</Pill>}
        </div>
        <Table minWidth={760} head={<><Th>Sponsor</Th><Th>Signal</Th><Th>Portfolio</Th><Th>Status</Th><Th>Outcome</Th><Th></Th></>}>
          {rows.map((d, i) => (
            <tr key={d.id || d.sponsor + i} onClick={() => setSelected(d.id || d.sponsor)}
              style={{ cursor: 'pointer', background: d.isNew ? C.amberBg : undefined }}
              onMouseEnter={e => { e.currentTarget.style.background = C.paper }}
              onMouseLeave={e => { e.currentTarget.style.background = d.isNew ? C.amberBg : '' }}>
              <Td bold>{d.sponsor} {d.isNew && <Pill tone="gold">New</Pill>}</Td><Td>{d.signal}</Td><Td>{d.portfolio}</Td>
              <Td><StatusPill record={d} /></Td>
              <Td><span style={{ color: C.green, fontWeight: 600 }}>{d.outcome}</span></Td>
              <Td align="right"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.goldDk, fontWeight: 700 }}>{d.live ? 'Live results' : 'View impact'} <IconChevronRight size={13} /></span></Td>
            </tr>
          ))}
        </Table>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
        <Card pad={0}>
          <div style={{ padding: '16px 20px', borderBottom: T.rule, fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Holdout outcomes</div>
          <Table minWidth={420} head={<><Th>Metric</Th><Th align="right">Predicted</Th><Th align="right">Treatment</Th><Th align="right">Holdout</Th><Th align="right">Incremental</Th></>}>
            {HOLDOUT_OUTCOMES.map(h => (
              <tr key={h.metric}>
                <Td bold>{h.metric}</Td><Td align="right">{h.predicted}</Td><Td align="right">{h.treatment}</Td>
                <Td align="right">{h.holdout}</Td><Td align="right"><span style={{ color: C.green, fontWeight: 600 }}>{h.incremental}</span></Td>
              </tr>
            ))}
          </Table>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <Eyebrow>Reusable decision policies</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {POLICIES.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 9, fontSize: 12.5, color: C.ink2, lineHeight: 1.5 }}>
                  <IconBrain size={15} color={C.gold} style={{ flexShrink: 0, marginTop: 1 }} /> {p}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <Eyebrow>Approved content library</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {CONTENT_LIBRARY.map(c => <Pill key={c} tone="gold">{c}</Pill>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: 400, textAlign: 'center' }}>
      <div>
        <Icon size={40} color={C.faint} />
        <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 18, color: C.ink, marginTop: 12 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 6, maxWidth: 360 }}>{body}</div>
      </div>
    </div>
  )
}

/* ───────────────────────── APP SHELL ───────────────────────── */
export default function VGApp() {
  const [themeName, setThemeNameRaw] = useState('wallStreet')
  const [menu, setMenu] = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const [sponsorId, setSponsorId] = useState(null)
  const [tab, setTab] = useState(0)
  const [lab, setLab] = useState(() => ({
    objective: 'participation',
    channels: { Email: true, Portal: true, Notices: true, 'Advisor brief': false, 'In-app nudge': false },
    timeline: { rolloutWeeks: 6, measureWeeks: 12 },
    posture: 'balanced',
    maxTab: 0,
    cells: { ae: true, ms: true, esc: true, re: true, edu: false, hold: true },
    levers: { aeDefault: 4, aeEsc: 1, aeCap: 10, msTarget: 6, escStep: 1, escCap: 12, holdoutPct: 15, reFreq: 12, reNotice: 45, eduCadence: 2 },
    content: 'none',   // none | drafted | locked
    simulated: false,
    compFixed: {},     // compliance blockers resolved in-flow
    approvals: { portfolio: false, cell: false, compliance: false, fiduciary: false, payroll: false },
    deployed: {},
  }))
  const [memoryLog, setMemoryLog] = useState([])
  const addMemory = (record) => setMemoryLog(log => log.some(r => r.id === record.id) ? log : [record, ...log])

  const setThemeName = (n) => { applyTheme(n); setThemeNameRaw(n) }
  const sponsor = SPONSORS.find(s => s.id === sponsorId) || null

  const openSignals = (id) => {
    if (typeof id === 'string') setSponsorId(id)
    setMenu('signals')
  }
  const sendToLab = () => { setTab(0); setMenu('decision') }

  return (
    <div style={{ minHeight: '100vh', background: T.paperGrad, fontFamily: FONT,
      display: 'flex', gap: 16, padding: 16, color: C.ink }}>
      <Sidebar {...{ menu, setMenu, collapsed, setCollapsed, themeName, setThemeName }} />
      <main style={{ flex: 1, minWidth: 0, maxWidth: 1180 }}>
        {menu === 'home' && <Home onOpenSignals={openSignals} memoryLog={memoryLog} />}
        {menu === 'signals' && <Signals sponsor={sponsor} onSelect={setSponsorId} onSendToLab={sendToLab} />}
        {menu === 'decision' && <DecisionLab sponsor={sponsor} tab={tab} setTab={setTab} lab={lab} setLab={setLab} addMemory={addMemory} />}
        {menu === 'memory' && <Memory memoryLog={memoryLog} />}
      </main>
    </div>
  )
}
