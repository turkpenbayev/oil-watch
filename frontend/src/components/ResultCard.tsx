import type { Prediction } from '../types/prediction'
import { resolveMediaUrl } from '../services/api'
import { useI18n } from '../i18n/context'
import { StatusBadge } from './StatusBadge'
import { StatTile } from './StatTile'
import { MaskLegend } from './MaskLegend'

export function ResultCard({ prediction }: { prediction: Prediction }) {
  const { t } = useI18n()
  const isOilSpill = prediction.label === 'oil_spill'
  const confidencePct = (prediction.confidence * 100).toFixed(1)
  const ratioPct = (prediction.oil_spill_ratio * 100).toFixed(1)

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <StatusBadge isOilSpill={isOilSpill} />
        <span className="text-sm text-slate-500">{prediction.model_version}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-slate-500">{t('original')}</p>
          <img
            src={resolveMediaUrl(prediction.image)}
            alt="Uploaded"
            className="aspect-square w-full rounded-lg border border-white/10 object-cover"
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-slate-500">
            {t('segmentationMask')}
          </p>
          {prediction.result_mask ? (
            <img
              src={resolveMediaUrl(prediction.result_mask)}
              alt="Segmentation mask"
              className="aspect-square w-full rounded-lg border border-white/10 object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-white/10 text-sm text-slate-500">
              {t('notAvailable')}
            </div>
          )}
        </div>
      </div>

      {prediction.result_mask && (
        <div>
          <p className="mt-3 text-xs font-medium uppercase text-slate-500">{t('maskLegend')}</p>
          <MaskLegend />
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label={t('confidence')} value={`${confidencePct}%`} />
        <StatTile
          label={t('oilSpillArea')}
          value={`${ratioPct}%`}
          tone={isOilSpill ? 'critical' : 'default'}
        />
      </div>
    </div>
  )
}
