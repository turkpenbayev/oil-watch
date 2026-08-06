export interface Prediction {
  id: number
  image: string
  result_mask: string | null
  label: string
  confidence: number
  oil_spill_ratio: number
  model_version: string
  created_at: string
}
