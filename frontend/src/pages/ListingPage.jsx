import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { runQA } from '../api/qa'

export default function ListingPage() {
  const navigate = useNavigate()
  const { images, jobResult, updateListing, modelConfig, setQaResult } = useStore()
  const listing = jobResult?.listing ?? {
    title: '',
    bullets: ['', '', '', '', ''],
    description: '',
    attributes: { brand: '', material: '', dimensions: '', color: '', closure: '' },
  }
  const [hasVariants, setHasVariants] = useState(false)
  const [qaLoading, setQaLoading] = useState(false)

  const update = (field, value) => {
    updateListing({ [field]: value })
  }

  const updateBullet = (i, value) => {
    const bullets = [...listing.bullets]
    bullets[i] = value
    updateListing({ bullets })
  }

  const updateAttr = (key, value) => {
    updateListing({ attributes: { ...listing.attributes, [key]: value } })
  }

  const handlePreviewQA = async () => {
    setQaLoading(true)
    try {
      const qa = await runQA({ listing, images, modelConfig })
      setQaResult(qa)
    } catch (e) {
      console.error(e)
    } finally {
      setQaLoading(false)
      navigate('/qa')
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
          <button onClick={() => navigate('/upload')} className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold flex-1 text-center">Generated Listing</h2>
          <span className="w-10" />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-32">
        {/* Image carousel */}
        <section className="mt-4">
          <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar">
            {(images.length > 0 ? images : [null, null, null]).map((img, i) => (
              <div key={i} className="flex flex-col gap-2 min-w-[280px]">
                <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden">
                  {img && <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt={`view ${i+1}`} />}
                </div>
                <p className="text-xs font-medium text-slate-500 px-1 uppercase tracking-wider">
                  {['Front View', 'Back View', 'Detail View'][i] ?? `View ${i+1}`}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="px-4 mt-8 space-y-6">
          {/* Title */}
          <Field label="Listing Title" onRegenerate={() => {}}>
            <input
              type="text"
              value={listing.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg p-4 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary"
            />
          </Field>

          {/* Bullets */}
          <Field label="Key Highlights" onRegenerate={() => {}}>
            <div className="space-y-2">
              {listing.bullets.map((b, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-transparent focus-within:border-primary">
                  <span className="material-symbols-outlined text-primary text-sm">fiber_manual_record</span>
                  <input
                    type="text"
                    value={b}
                    onChange={(e) => updateBullet(i, e.target.value)}
                    className="bg-transparent border-none p-0 w-full text-sm focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </Field>

          {/* Description */}
          <Field label="Detailed Description" onRegenerate={() => {}}>
            <textarea
              value={listing.description}
              onChange={(e) => update('description', e.target.value)}
              rows={5}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg p-4 text-sm focus:ring-2 focus:ring-primary leading-relaxed"
            />
          </Field>

          {/* Attributes */}
          <Field label="Key Attributes" onRegenerate={() => {}}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(listing.attributes).map(([key, val]) => (
                <div key={key} className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{key}</p>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateAttr(key, e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </Field>

          {/* Variants toggle */}
          <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">layers</span>
              <div>
                <p className="text-sm font-bold">I have variants</p>
                <p className="text-xs text-slate-500">Add different sizes or colors</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button className="flex-1 bg-slate-200 dark:bg-slate-800 font-bold py-3.5 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            Save Draft
          </button>
          <button
            onClick={hasVariants ? () => navigate('/variants') : handlePreviewQA}
            disabled={qaLoading}
            className="flex-[2] bg-primary text-background-dark font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {qaLoading ? 'Running QA...' : hasVariants ? 'Build Variants' : 'Preview QA'}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, onRegenerate }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</label>
        <button onClick={onRegenerate} className="text-primary hover:bg-primary/10 p-1 rounded transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span className="text-xs">Regenerate</span>
        </button>
      </div>
      {children}
    </div>
  )
}
