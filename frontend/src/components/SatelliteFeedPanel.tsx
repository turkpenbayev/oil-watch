import { useI18n } from '../i18n/context'

export function SatelliteFeedPanel() {
  const { t } = useI18n()
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0d1b2e] to-[#0a1420] p-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,135,229,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,135,229,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            {t('satelliteFeed')}
          </p>
          <p className="mt-1 text-sm text-slate-300">{t('satelliteFeedTagline')}</p>
        </div>
        <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
          {t('roadmap')}
        </span>
      </div>
      <p className="relative mt-4 max-w-md text-sm text-slate-400">
        {t('satelliteFeedDescription')}
      </p>
    </div>
  )
}
