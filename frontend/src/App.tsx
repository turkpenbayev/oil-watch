import { useEffect, useMemo, useState } from 'react'
import { UploadPanel } from './components/UploadPanel'
import { ResultCard } from './components/ResultCard'
import { HistoryList } from './components/HistoryList'
import { StatTile } from './components/StatTile'
import { SatelliteFeedPanel } from './components/SatelliteFeedPanel'
import { LocaleSwitcher } from './components/LocaleSwitcher'
import { predictImage, fetchHistory } from './services/api'
import { useI18n } from './i18n/context'
import type { Prediction } from './types/prediction'

function App() {
  const { t } = useI18n()
  const [selected, setSelected] = useState<Prediction | null>(null)
  const [history, setHistory] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadResetKey, setUploadResetKey] = useState(0)

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => setError('Failed to load history'))
  }, [])

  async function handleSubmit(file: File) {
    setIsLoading(true)
    setError(null)
    try {
      const prediction = await predictImage(file)
      setSelected(prediction)
      setHistory((prev) => [prediction, ...prev])
      setUploadResetKey((prev) => prev + 1)
    } catch {
      setError(t('uploadError'))
    } finally {
      setIsLoading(false)
    }
  }

  const spillCount = useMemo(
    () => history.filter((p) => p.label === 'oil_spill').length,
    [history],
  )

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100">
      <header className="border-b border-white/10 bg-[#0d1220]/80 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#0ca30c]" />
              <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
            </div>
            <p className="text-sm text-slate-400">{t('tagline')}</p>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              {t('systemOnline')}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label={t('totalScans')} value={String(history.length)} />
          <StatTile
            label={t('spillsDetected')}
            value={String(spillCount)}
            tone={spillCount > 0 ? 'critical' : 'good'}
          />
          <StatTile
            label={t('detectionRate')}
            value={history.length ? `${((spillCount / history.length) * 100).toFixed(0)}%` : '—'}
          />
          <StatTile
            label={t('model')}
            value="U-Net"
            hint={history[0]?.model_version ?? 'model.keras'}
          />
        </section>

        <SatelliteFeedPanel />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section className="flex flex-col gap-6 md:col-span-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-3 text-lg font-semibold text-white">{t('uploadImage')}</h2>
              <UploadPanel onSubmit={handleSubmit} isLoading={isLoading} resetKey={uploadResetKey} />
              {error && <p className="mt-3 text-sm text-[#e66767]">{error}</p>}
            </div>

            {selected && <ResultCard prediction={selected} />}
          </section>

          <aside className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-lg font-semibold text-white">{t('history')}</h2>
            <HistoryList
              predictions={history}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
