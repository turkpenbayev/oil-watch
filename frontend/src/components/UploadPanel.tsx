import { useEffect, useId, useState } from 'react'
import { useI18n } from '../i18n/context'

interface UploadPanelProps {
  onSubmit: (file: File) => void
  isLoading: boolean
  resetKey: number
}

export function UploadPanel({ onSubmit, isLoading, resetKey }: UploadPanelProps) {
  const { t } = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputId = useId()

  function handleFile(selected: File | null) {
    setFile(selected)
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const dropped = event.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  useEffect(() => {
    if (resetKey > 0) handleFile(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor={inputId}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition hover:border-blue-400/60 hover:bg-blue-500/5"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Selected preview" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <>
            <p className="font-medium text-slate-200">{t('dragDrop')}</p>
            <p className="text-sm text-slate-500">{t('orClickToBrowse')}</p>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="absolute h-px w-px overflow-hidden opacity-0"
          onChange={(e) => {
            handleFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
      </label>

      <button
        type="button"
        disabled={!file || isLoading}
        onClick={() => file && onSubmit(file)}
        className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500"
      >
        {isLoading ? t('analyzing') : t('detectButton')}
      </button>
    </div>
  )
}
