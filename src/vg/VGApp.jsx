import React, { useState } from 'react'
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
  BOOK, SPONSORS, INSIGHTS, STRATEGY_CELLS, LEVERS, ASSETS, COMPLIANCE,
  MEMORY_DECISIONS, HOLDOUT_OUTCOMES, POLICIES,
  CONTENT_LIBRARY, DECISION_TABS,
  TODAYS_FOCUS, SIGNAL_KPIS, MARKET_SIGNALS,
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
    gold: { background: T.goldFoil, color: C.navBg, border: 'none', fontWeight: 700, boxShadow: T.shadowGoldGlow },
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
              {on && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: T.goldFoil, borderRadius: 2 }} />}
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
function Home({ onOpenSignals }) {
  const trend = BOOK.participationTrend
  const atRisk = SPONSORS
  return (
    <div>
      <SectionTitle kicker="Vanguard · Book Overview" title="How is our book of sponsors doing?"
        sub="Overall participation across the plan-sponsor book, the sponsors to act on first, and the KPIs that matter."
        right={<Btn kind="gold" onClick={onOpenSignals}>Review signals <IconArrowRight size={15} /></Btn>} />

      {/* overall numbers */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat label="Plan sponsors" value={BOOK.totalSponsors} sub="in book" />
        <Stat label="Eligible participants" value={num(BOOK.totalEligible)} sub={`${num(BOOK.totalParticipants)} enrolled`} />
        <Stat label="Aggregate participation" value={pct(BOOK.aggParticipation)} sub={`vs ${pct(BOOK.benchmark)} benchmark`} tone={C.red} />
        <Stat label="Value at stake" value={money(BOOK.valueAtStake)} sub="AUM exposure, at-risk sponsors" tone={C.goldDk} />
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
    const types = ['All', ...Array.from(new Set(MARKET_SIGNALS.map(s => s.type)))]
    const filtered = mktFilter === 'All' ? MARKET_SIGNALS : MARKET_SIGNALS.filter(s => s.type === mktFilter)
    const impactTone = (im) => (im === 'high' ? 'high' : im === 'medium' ? 'med' : 'low')
    return (
      <div>
        <SectionTitle kicker="Signals · Participation intelligence" title="What is TwinX seeing across the book?"
          sub="Market and regulatory intelligence plus the KPIs that move participation. Open a plan event to investigate a company's gap." />

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
              <span style={{ fontSize: 10.5, color: C.faint, letterSpacing: '.14em', fontWeight: 600, textTransform: 'uppercase' }}>{MARKET_SIGNALS.length} active · streaming</span>
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
                      {clickable && <span style={{ fontSize: 10.5, color: C.goldDk, fontWeight: 700 }}>Investigate →</span>}
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
        sub="The company analysis snapshot and the reasons employees are not participating, then the candidate strategies."
        right={<Btn kind="gold" onClick={onSendToLab}>Send to Decision Lab <IconArrowRight size={15} /></Btn>} />

      {/* snapshot */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <Stat label="Total employees" value={num(s.employees)} />
        <Stat label="Eligible" value={num(s.eligible)} />
        <Stat label="Enrolled" value={num(s.participants)} />
        <Stat label="Non-participants" value={num(s.nonParticipants)} tone={C.red} />
        <Stat label="Participation" value={pct(s.participation)} sub={`vs ${pct(s.benchmark)}`} tone={C.red} />
        <Stat label="Value opportunity" value={money(s.valueOpp)} tone={C.goldDk} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
        {/* why */}
        <Card>
          <Eyebrow>Participation insights · why</Eyebrow>
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
        {/* analog */}
        <Card style={{ background: C.amberBg, borderColor: `${C.gold}44` }}>
          <Eyebrow>Analog · what worked in similar sponsors</Eyebrow>
          <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 8 }}>Beacon Freight, FY24</div>
          <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>
            Participation sat at <b>72%</b> vs an <b>82%</b> benchmark with a new-hire enrollment lag.
            TwinX recommended <b>Auto Enrollment at 4% default + 1% escalation, 10% cap</b>.
          </div>
          <div style={{ marginTop: 12, padding: 12, background: C.card, borderRadius: T.radMd, border: T.rule }}>
            <div style={{ fontSize: 11, color: C.muted }}>Realized outcome vs holdout</div>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, color: C.green }}>+8.4% participation</div>
          </div>
        </Card>
      </div>

      {/* candidate cells */}
      <Card pad={0}>
        <div style={{ padding: '16px 20px', borderBottom: T.rule, fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>
          Candidate strategy cells
        </div>
        <Table head={<><Th>Cohort / condition</Th><Th align="right">Population</Th><Th>Strategy</Th><Th>Primary KPI</Th><Th align="center">Holdout</Th></>}>
          {STRATEGY_CELLS.map(c => (
            <tr key={c.id}>
              <Td bold>{c.cohort}</Td>
              <Td align="right">{num(c.population)}</Td>
              <Td><Pill tone="gold">{c.strategy}</Pill></Td>
              <Td>{c.kpi}</Td>
              <Td align="center">{c.holdout ? <IconCheck size={15} color={C.green} /> : <span style={{ color: C.faint }}>—</span>}</Td>
            </tr>
          ))}
        </Table>
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
    d.treatCells.length > 0,               // 0 recommendation
    d.portfolioPop > 0,                    // 1 levers
    d.treatCells.length > 0,               // 2 recommended segments
    lab.content !== 'none',                // 3 content
    lab.simulated,                         // 4 simulation
    d.allApproved,                         // 5 approval
    Object.keys(lab.deployed).length > 0,  // 6 deployment
  ][i]
}

function DecisionLab({ sponsor, tab, setTab, lab, setLab }) {
  if (!sponsor) {
    return <EmptyState icon={IconFlask} title="No sponsor selected"
      body="Open a company from Signals and send it to Decision Lab to configure a portfolio." />
  }
  const d = labDerived(lab)
  const tabIcons = [IconTargetArrow, IconAdjustments, IconChartBar, IconFileText, IconActivity, IconChecklist, IconRocket]
  const done = DECISION_TABS.map((_, i) => stepDone(lab, d, i))

  return (
    <div>
      <SectionTitle kicker="Decision Lab · Portfolio workbench" title={`${sponsor.name} — decision portfolio`}
        sub="A portfolio allocation across cohort strategy cells — recommend, configure, prove, and launch."
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

      {tab === 0 && <TabRecommendation lab={lab} setLab={setLab} d={d} />}
      {tab === 1 && <TabLevers lab={lab} setLab={setLab} d={d} />}
      {tab === 2 && <TabSegments d={d} />}
      {tab === 3 && <TabContent lab={lab} setLab={setLab} d={d} />}
      {tab === 4 && <TabSimulation lab={lab} setLab={setLab} d={d} />}
      {tab === 5 && <TabApproval lab={lab} setLab={setLab} d={d} />}
      {tab === 6 && <TabDeployment lab={lab} setLab={setLab} d={d} />}

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

function TabRecommendation({ lab, setLab, d }) {
  const toggle = (id) => setLab(l => ({ ...l, cells: { ...l.cells, [id]: !l.cells[id] } }))
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <Stat label="Cells in portfolio" value={d.treatCells.length} sub={`of ${STRATEGY_CELLS.length - 1} candidates`} />
        <Stat label="Portfolio population" value={num(d.portfolioPop)} sub="total addressable" />
        <Stat label="Treated" value={num(d.treated)} sub="receive a strategy" />
        <Stat label="Holdout" value={num(d.holdout)} sub={`${lab.levers.holdoutPct}% · causal control`} tone={C.goldDk} />
      </div>
      <Card pad={0}>
        <div style={{ padding: '14px 20px', borderBottom: T.rule }}>
          <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Recommended portfolio by cohort</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Toggle a cell to include or exclude it from the allocation.</div>
        </div>
        <Table minWidth={800} head={<><Th>In</Th><Th>Cohort</Th><Th>Strategy</Th><Th>Why</Th><Th>Primary KPI</Th><Th align="right">Population</Th><Th align="center">Holdout</Th></>}>
          {STRATEGY_CELLS.map(c => {
            const on = lab.cells[c.id]
            return (
              <tr key={c.id} onClick={() => toggle(c.id)} style={{ cursor: 'pointer', opacity: on ? 1 : 0.5 }}>
                <Td><span style={{ width: 18, height: 18, borderRadius: 5, display: 'inline-grid', placeItems: 'center',
                  background: on ? C.green : 'transparent', border: on ? 'none' : `1.5px solid ${C.line2}` }}>
                  {on && <IconCheck size={12} color="#fff" />}</span></Td>
                <Td bold>{c.cohort}</Td>
                <Td><Pill tone="gold">{c.strategy}</Pill></Td>
                <Td>{c.why}</Td><Td>{c.kpi}</Td>
                <Td align="right">{num(c.population)}</Td>
                <Td align="center">{c.holdout ? <IconCheck size={15} color={C.green} /> : <span style={{ color: C.faint }}>—</span>}</Td>
              </tr>
            )
          })}
        </Table>
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
        {LEVERS.filter(l => activeIds.has(l.id) || l.id === 'hold').map(l => {
          const active = activeIds.has(l.id) || l.id === 'hold'
          return (
            <Card key={l.id} style={{ opacity: active ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>{l.name}</div>
                <Pill tone="ok">Ready</Pill>
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
                {l.id === 'hold' && <Stepper label="Holdout" unit="%" value={L.holdoutPct} set={v => setL('holdoutPct', v)} min={5} max={25} step={5} />}
                {['re', 'edu'].includes(l.id) && l.controls.slice(0, 3).map(ctrl => (
                  <div key={ctrl} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: C.paper, borderRadius: T.radSm, border: T.rule }}>
                    <span style={{ fontSize: 12.5, color: C.ink2 }}>{ctrl}</span><span style={{ fontSize: 11, color: C.faint }}>configure</span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Sample draft content per asset + segment (education-framed, no solicitation).
function draftFor(asset, seg) {
  const a = asset.toLowerCase()
  const S = seg.strategy
  if (a.includes('committee deck')) return { kind: 'Committee deck', body:
    `PLAN-DESIGN RECOMMENDATION — ${seg.cohort}\n\n1. Objective: lift participation for this cohort\n2. Recommended lever: ${S}\n3. Population: ${seg.treated.toLocaleString()} treated · ${seg.holdout.toLocaleString()} holdout\n4. Primary KPI: ${seg.kpi}\n5. Rollout: tiered (10% → 40% → 100%) with holdout preserved\n6. Governance: disclosures auto-attached; fiduciary review required` }
  if (a.includes('email') || a.includes('escalation')) return { kind: 'Participant email', body:
    `Subject: A simple step for your retirement savings\n\nHi,\n\nYour plan now offers ${S.toLowerCase()}. This is an educational notice — it explains a change to help you stay on track. No action is required, and you can opt out or adjust anytime in your account.\n\n[View my options]\n\nRequired disclosures apply.` }
  if (a.includes('portal')) return { kind: 'Portal copy', body:
    `PORTAL BANNER — ${seg.cohort}\n\nHeadline: Your plan just got easier\nBody: ${S} is now active for eligible participants. See how it affects your contributions and what you can change.\nCTA: Review my plan\n\n(Education content class · no advice language)` }
  if (a.includes('notice')) return { kind: 'Required notice', body:
    `REQUIRED PARTICIPANT NOTICE\n\nRe: ${S}\n\nThis notice describes an automatic plan feature affecting your account. It includes your default contribution rate, your right to opt out or change your election, the default investment (QDIA), and the effective date. Please review before the effective date.` }
  if (a.includes('faq')) return { kind: 'FAQ', body:
    `FREQUENTLY ASKED QUESTIONS — ${S}\n\nQ: What is changing?\nA: An educational update for ${seg.cohort}.\nQ: Do I have to do anything?\nA: No — this is informational. You can adjust anytime.\nQ: Where can I learn more?\nA: Visit your plan portal.` }
  if (a.includes('match explainer')) return { kind: 'Match explainer', body:
    `MATCH EXPLAINER — ${seg.cohort}\n\nYour employer match may be worth more than you're capturing today. This educational summary shows how the match works and the deferral level needed to receive the full match. Educational only — not advice.` }
  return { kind: asset, body: `Draft ${asset} for ${seg.cohort} (${S}).\n\nEducational content class · disclosures auto-attached.` }
}

function ContentModal({ item, status, onClose }) {
  if (!item) return null
  const draft = draftFor(item.asset, item.seg)
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,25,.55)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(640px,100%)', maxHeight: '84vh', overflow: 'auto',
        background: C.card, border: T.rule, borderRadius: T.radLg, boxShadow: T.shadow3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: T.rule }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDk, fontWeight: 700 }}>{draft.kind}</div>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 16, color: C.ink }}>{item.seg.cohort}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pill tone={status === 'locked' ? 'ok' : status === 'drafted' ? 'review' : 'neutral'}>
              {status === 'locked' ? 'Locked' : status === 'drafted' ? 'Draft' : 'Not generated'}
            </Pill>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted, fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
        </div>
        <pre style={{ margin: 0, padding: 20, whiteSpace: 'pre-wrap', fontFamily: FONT, fontSize: 13, lineHeight: 1.65, color: C.ink2 }}>{draft.body}</pre>
      </div>
    </div>
  )
}

function TabSegments({ d }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12.5, color: C.muted }}>
        <IconChartBar size={15} color={C.gold} /> Recommended audience segments after lever selection — these carry into Content, generated per segment.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {d.perCell.map(seg => (
          <Card key={seg.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Pill tone="gold">{seg.strategy}</Pill>
              <span style={{ fontSize: 11, color: C.muted }}>{seg.kpi}</span>
            </div>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>{seg.cohort}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div><div style={{ fontSize: 10.5, color: C.muted }}>Treated</div><div style={{ fontFamily: DISP, fontWeight: 700, color: C.ink }}>{num(seg.treated)}</div></div>
              <div><div style={{ fontSize: 10.5, color: C.muted }}>Holdout</div><div style={{ fontFamily: DISP, fontWeight: 700, color: C.goldDk }}>{seg.holdout ? num(seg.holdout) : '—'}</div></div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.line}`, fontSize: 12, color: C.muted }}>
              Channels: {seg.content}
            </div>
          </Card>
        ))}
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
  const canLock = lab.simulated && d.complianceOk
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
          {!canLock && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 8 }}>Locking needs a completed simulation and no compliance blockers.</div>}
        </Card>
        {d.perCell.map(seg => {
          const assets = seg.content.split(',').map(x => x.trim())
          return (
            <Card key={seg.id} pad={16}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: DISP, fontWeight: 600, fontSize: 14, color: C.ink }}>{seg.cohort}</span>
                  <Pill tone="gold">{seg.strategy}</Pill>
                </div>
                <span style={{ fontSize: 11, color: C.muted }}>{num(seg.treated)} treated · click to preview</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <AssetChip label="Committee deck" color={assetIcon} onClick={() => setPreview({ asset: 'Committee deck', seg })} />
                {assets.map(a => (
                  <AssetChip key={a} label={a} color={assetIcon} onClick={() => setPreview({ asset: a, seg })} />
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
                  ? <Btn kind="primary" small onClick={() => setLab(l => ({ ...l, compFixed: { ...l.compFixed, [c.label]: true } }))}>Resolve</Btn>
                  : <Pill tone={st}>{st === 'ok' ? 'Approved' : 'In review'}</Pill>}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function TabSimulation({ lab, setLab, d }) {
  const lift = d.lift
  const scen = [
    { name: 'Do-nothing', lift: 0, deferral: 0, cost: 0, confidence: '—' },
    { name: 'Recommended', lift, deferral: +(lift * 0.15).toFixed(1), cost: +(lift * 0.23).toFixed(1), confidence: 'High' },
    { name: 'Cost-aware', lift: +(lift * 0.66).toFixed(1), deferral: +(lift * 0.1).toFixed(1), cost: +(lift * 0.13).toFixed(1), confidence: 'High' },
    { name: 'Readiness-first', lift: +(lift * 0.48).toFixed(1), deferral: +(lift * 0.08).toFixed(1), cost: +(lift * 0.09).toFixed(1), confidence: 'Med' },
    { name: 'Max-lift', lift: +(lift * 1.37).toFixed(1), deferral: +(lift * 0.22).toFixed(1), cost: +(lift * 0.39).toFixed(1), confidence: 'Med' },
  ]
  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <Eyebrow>Portfolio scenario comparison · vs do-nothing baseline</Eyebrow>
            <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Projected participation lift (pts)</div>
          </div>
          <Btn kind={lab.simulated ? 'ghost' : 'gold'} small onClick={() => setLab(l => ({ ...l, simulated: true }))}>
            {lab.simulated ? 'Re-run simulation' : 'Run 1,000-iteration simulation'}
          </Btn>
        </div>
        {lab.simulated ? (
          <>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scen} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                  <Bar dataKey="lift" radius={[4, 4, 0, 0]}>
                    {scen.map((s, i) => <Cell key={i} fill={s.name === 'Recommended' ? C.gold : s.name === 'Do-nothing' ? C.faint : C.brandLt} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
              Recommended: <b style={{ color: C.ink }}>+{lift}% participation</b> (P5 +{(lift * 0.7).toFixed(1)} · P50 +{lift} · P95 +{(lift * 1.3).toFixed(1)}) across {num(d.treated)} treated vs {num(d.holdout)} holdout (portfolio {num(d.portfolioPop)}).
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: 200, color: C.muted, fontSize: 13, textAlign: 'center' }}>
            <div><IconActivity size={30} color={C.faint} /><div style={{ marginTop: 8 }}>Run the simulation to project lift for the selected portfolio.</div></div>
          </div>
        )}
      </Card>
      {lab.simulated && (
        <Table minWidth={560} head={<><Th>Scenario</Th><Th align="right">Participation lift</Th><Th align="right">Deferral lift</Th><Th align="right">Employer cost</Th><Th>Confidence</Th></>}>
          {scen.map(s => (
            <tr key={s.name}>
              <Td bold>{s.name}</Td>
              <Td align="right">{s.lift ? `+${s.lift}%` : '—'}</Td>
              <Td align="right">{s.deferral ? `+${s.deferral}%` : '—'}</Td>
              <Td align="right">{s.cost ? `+${s.cost}%` : '—'}</Td>
              <Td>{s.confidence !== '—' ? <Pill tone={s.confidence === 'High' ? 'ok' : 'review'}>{s.confidence}</Pill> : '—'}</Td>
            </tr>
          ))}
        </Table>
      )}
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
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Eyebrow>Approval · portfolio and each strategy cell</Eyebrow>
        <Pill tone={d.allApproved ? 'ok' : 'review'}>{d.allApproved ? 'Sponsor-ready' : 'In progress'}</Pill>
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

function TabDeployment({ lab, setLab, d }) {
  const ready = d.allApproved
  const launch = (lane) => ready && setLab(l => ({ ...l, deployed: { ...l.deployed, [lane]: true } }))
  return (
    <Card pad={0}>
      <div style={{ padding: '14px 20px', borderBottom: T.rule, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Deployment lanes · holdouts preserved</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>One lane per strategy · tiered rollout with suppression + rollback.</div>
        </div>
        {!ready && <Pill tone="review">Approve all to enable launch</Pill>}
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
    </Card>
  )
}

/* ───────────────────────── MEMORY ───────────────────────── */
function Memory() {
  return (
    <div>
      <SectionTitle kicker="Memory · Institutional learning" title="What have we learned, and what can we reuse?"
        sub="Prior sponsor decisions, how holdout outcomes compared with prediction, and reusable decision policies." />
      <Card pad={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: T.rule, fontFamily: DISP, fontWeight: 600, fontSize: 15, color: C.ink }}>Prior sponsor decisions</div>
        <Table minWidth={720} head={<><Th>Sponsor</Th><Th>Signal</Th><Th>Portfolio</Th><Th>Levers</Th><Th>Status</Th><Th>Outcome</Th></>}>
          {MEMORY_DECISIONS.map(d => (
            <tr key={d.sponsor}>
              <Td bold>{d.sponsor}</Td><Td>{d.signal}</Td><Td>{d.portfolio}</Td><Td>{d.levers}</Td>
              <Td><Pill tone="ok">{d.approval}</Pill></Td>
              <Td><span style={{ color: C.green, fontWeight: 600 }}>{d.outcome}</span></Td>
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
    cells: { ae: true, ms: true, esc: true, re: true, edu: false, hold: true },
    levers: { aeDefault: 4, aeEsc: 1, aeCap: 10, msTarget: 6, escStep: 1, escCap: 12, holdoutPct: 15 },
    content: 'none',   // none | drafted | locked
    simulated: false,
    compFixed: {},     // compliance blockers resolved in-flow
    approvals: { portfolio: false, cell: false, compliance: false, fiduciary: false, payroll: false },
    deployed: {},
  }))

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
        {menu === 'home' && <Home onOpenSignals={openSignals} />}
        {menu === 'signals' && <Signals sponsor={sponsor} onSelect={setSponsorId} onSendToLab={sendToLab} />}
        {menu === 'decision' && <DecisionLab sponsor={sponsor} tab={tab} setTab={setTab} lab={lab} setLab={setLab} />}
        {menu === 'memory' && <Memory />}
      </main>
    </div>
  )
}
