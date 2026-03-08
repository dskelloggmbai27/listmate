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

  // Setters
  setImages: (images) => set({ images }),
  setNotes: (notes) => set({ notes }),
  setMarketplace: (marketplace) => set({ marketplace }),
  setModelConfig: (config) => set((s) => ({ modelConfig: { ...s.modelConfig, ...config } })),
  setJobResult: (jobResult) => set({ jobResult }),
  setQaResult: (qaResult) => set({ qaResult }),
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
