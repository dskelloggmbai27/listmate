import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api'

export async function generateListing({ images, notes, marketplace, modelConfig, apiKeys = {} }) {
  const form = new FormData()
  images.forEach((img) => form.append('images', img))
  form.append('notes', notes)
  form.append('marketplace', marketplace)
  form.append('provider', modelConfig.provider)
  form.append('model', modelConfig.model)
  form.append('best_of_n', String(modelConfig.bestOfN))
  if (apiKeys.anthropic) form.append('anthropic_api_key', apiKeys.anthropic)
  if (apiKeys.openai)    form.append('openai_api_key', apiKeys.openai)

  const { data } = await axios.post(`${BASE}/generate`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
