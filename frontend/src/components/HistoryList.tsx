import type { Prediction } from '../types/prediction'
import { resolveMediaUrl } from '../services/api'
import { useI18n } from '../i18n/context'

interface HistoryListProps {
  predictions: Prediction[]
  selectedId: number | null
  onSelect: (prediction: Prediction) => void
}

export function HistoryList({ predictions, selectedId, onSelect }: HistoryListProps) {
  const { t } = useI18n()

  if (predictions.length === 0) {
    return <p className="text-sm text-slate-500">{t('noPredictions')}</p>
  }

  return (
    <ul className="flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1">
      {predictions.map((prediction) => {
        const isOilSpill = prediction.label === 'oil_spill'
        const isSelected = prediction.id === selectedId
        return (
          <li key={prediction.id}>
            <button
              type="button"
              onClick={() => onSelect(prediction)}
              className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition ${
                isSelected
                  ? 'border-blue-400/50 bg-blue-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <img
                src={resolveMediaUrl(prediction.image)}
                alt=""
                className="h-12 w-12 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1 text-sm">
                <p className="flex items-center gap-1.5 font-medium text-slate-200">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      isOilSpill ? 'bg-[#e66767]' : 'bg-[#0ca30c]'
                    }`}
                  />
                  {isOilSpill ? t('oilSpillLabel') : t('cleanLabel')}
                </p>
                <p className="truncate text-slate-500">
                  {new Date(prediction.created_at).toLocaleString()}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-300">
                {(prediction.confidence * 100).toFixed(0)}%
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
