import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api'

export async function runQA({ listing, images, modelConfig, apiKeys = {} }) {
  const imageB64 = await Promise.all(
    images.map((img) =>
      new Promise((res) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result.split(',')[1])
        reader.readAsDataURL(img)
      })
    )
  )
  const { data } = await axios.post(`${BASE}/qa`, {
    listing,
    images: imageB64,
    provider: modelConfig.provider,
    model: modelConfig.model,
    ...(apiKeys.anthropic && { anthropic_api_key: apiKeys.anthropic }),
    ...(apiKeys.openai    && { openai_api_key:    apiKeys.openai }),
  })
  return data
}
