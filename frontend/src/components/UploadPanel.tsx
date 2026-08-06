import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
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

  const onDrop = useCallback((accepted: File[]) => {
    const selected = accepted[0] ?? null
    setFile(selected)
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  useEffect(() => {
    if (resetKey > 0) {
      setFile(null)
      setPreviewUrl(null)
    }
  }, [resetKey])

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
          isDragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/15 bg-white/[0.02] hover:border-blue-400/60 hover:bg-blue-500/5'
        }`}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          <img src={previewUrl} alt="Selected preview" className="max-h-40 rounded-lg object-contain" />
        ) : (
          <>
            <p className="font-medium text-slate-200">{t('dragDrop')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('orClickToBrowse')}</p>
          </>
        )}
      </div>

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
