export const fmtM = (v) => v == null ? '—' : `$${(v / 1e6).toFixed(1)}M`
export const fmtB = (v) => v == null ? '—' : `$${(v / 1e9).toFixed(2)}B`
export const fmtK = (v) => v == null ? '—' : `$${(v / 1e3).toFixed(0)}K`
export const fmtPct = (v) => v == null ? '—' : `${(v * 100).toFixed(1)}%`
export const fmtConf = (v) => v == null ? '—' : `${Math.round(v * 100)}%`
export const fmtRelTime = (iso) => {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d}d ago`
}
