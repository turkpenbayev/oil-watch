import { useI18n } from '../i18n/context'

// Must match backend/predictions/services/prediction_service.py MASK_COLORS order.
const LEGEND_ITEMS = [
  { color: 'rgb(30, 60, 114)', labelKey: 'classBackground' as const },
  { color: 'rgb(220, 38, 38)', labelKey: 'classOilSpill' as const },
  { color: 'rgb(156, 163, 175)', labelKey: 'classShips' as const },
  { color: 'rgb(234, 179, 8)', labelKey: 'classLookAlike' as const },
  { color: 'rgb(124, 58, 237)', labelKey: 'classWakes' as const },
]

export function MaskLegend() {
  const { t } = useI18n()

  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.labelKey} className="flex items-center gap-1.5 text-xs text-slate-400">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          {t(item.labelKey)}
        </div>
      ))}
    </div>
  )
}
