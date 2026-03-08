import { create } from 'zustand'

const useStore = create((set) => ({
  // Upload inputs
  images: [],
  notes: '',
  marketplace: 'amazon',
  modelConfig: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    bestOfN: false,
  },

  // Results
  jobResult: null,   // { listing, variants }
  qaResult: null,    // { risk_score, issues }

  // API keys (user-supplied via Settings screen; override backend env vars)
  apiKeys: { anthropic: '', openai: '' },

  // Session listing history (accumulated during demo session)
  listingHistory: [],

  // Setters
  setImages: (images) => set({ images }),
  setNotes: (notes) => set({ notes }),
  setMarketplace: (marketplace) => set({ marketplace }),
  setModelConfig: (config) => set((s) => ({ modelConfig: { ...s.modelConfig, ...config } })),
  setJobResult: (jobResult) => set({ jobResult }),
  setQaResult: (qaResult) => set({ qaResult }),
  setApiKeys: (keys) => set((s) => ({ apiKeys: { ...s.apiKeys, ...keys } })),
  addToHistory: (entry) => set((s) => ({
    listingHistory: [entry, ...s.listingHistory],
  })),
  updateListing: (patch) =>
    set((s) => ({
      jobResult: {
        ...(s.jobResult ?? {}),
        listing: { ...(s.jobResult?.listing ?? {}), ...patch },
      },
    })),
  reset: () => set({ images: [], notes: '', jobResult: null, qaResult: null }),
}))

export default useStore
