import axios from 'axios'
import type { Prediction } from '../types/prediction'

const client = axios.create({ baseURL: '/api' })

export async function predictImage(file: File): Promise<Prediction> {
  const formData = new FormData()
  formData.append('image', file)
  const response = await client.post<Prediction>('/predict/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function fetchHistory(): Promise<Prediction[]> {
  const response = await client.get<Prediction[]>('/history/')
  return response.data
}

export function resolveMediaUrl(path: string): string {
  return path.startsWith('http') ? new URL(path).pathname : path
}
