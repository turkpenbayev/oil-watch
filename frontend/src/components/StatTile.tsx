interface StatTileProps {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'critical' | 'good'
}

const TONE_CLASSES: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-slate-100',
  critical: 'text-[#e66767]',
  good: 'text-[#0ca30c]',
}

export function StatTile({ label, value, hint, tone = 'default' }: StatTileProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${TONE_CLASSES[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
