import { useI18n } from '../i18n/context'

interface StatusBadgeProps {
  isOilSpill: boolean
}

export function StatusBadge({ isOilSpill }: StatusBadgeProps) {
  const { t } = useI18n()
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
        isOilSpill
          ? 'bg-[#d03b3b]/15 text-[#e66767]'
          : 'bg-[#0ca30c]/15 text-[#0ca30c]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isOilSpill ? 'bg-[#e66767]' : 'bg-[#0ca30c]'}`}
      />
      {isOilSpill ? t('oilSpillDetected') : t('noOilSpillDetected')}
    </span>
  )
}
