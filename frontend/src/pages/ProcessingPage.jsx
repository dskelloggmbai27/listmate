import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import { generateListing } from '../api/generate'
import HamburgerMenu from '../components/HamburgerMenu'

const STEPS = [
  'Analyzing images',
  'Extracting details',
  'Generating listing',
  'Running QA scan',
]

export default function ProcessingPage() {
  const navigate = useNavigate()
  const { images, notes, marketplace, modelConfig, setJobResult, apiKeys, addToHistory } = useStore()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState(null)
  const timerRefs = useRef([])

  useEffect(() => {
    timerRefs.current = STEPS.map((_, i) =>
      setTimeout(() => setActiveStep(i + 1), (i + 1) * 3500)
    )

    generateListing({ images, notes, marketplace, modelConfig, apiKeys })
      .then((data) => {
        setJobResult(data)
        // Add to session history
        addToHistory({
          id: `session-${Date.now()}`,
          title: data.listing?.title ?? 'Untitled Listing',
          marketplace,
          date: new Date().toISOString().slice(0, 10),
          riskScore: null,   // filled in after QA
          thumbnail: images[0] ? URL.createObjectURL(images[0]) : null,
        })
        navigate('/listing')
      })
      .catch((err) => {
        console.error(err)
        timerRefs.current.forEach(clearTimeout)  // stop the animation
        setError('Something went wrong. Please try again.')
      })

    return () => timerRefs.current.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ListMate" className="size-10 rounded-lg" />
          <span className="text-xl font-bold tracking-tight">ListMate</span>
        </div>
        <HamburgerMenu />
      </nav>

      <main className="max-w-lg mx-auto px-6 py-12 flex flex-col items-center flex-1">
        {/* Spinner */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
            <motion.div
              className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
            <div className="bg-primary/10 size-32 rounded-full flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary text-6xl">auto_awesome</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Processing your items</h1>
          <p className="text-slate-400 max-w-xs mx-auto">
            ListMate is crafting your perfect listing. This usually takes 15-30 seconds.
          </p>
          {error && (
            <div className="text-center mt-4">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-2 bg-primary text-background-dark rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="w-full max-w-sm space-y-0">
          {STEPS.map((label, i) => {
            const done = i < activeStep
            const active = i === activeStep
            const waiting = i > activeStep
            return (
              <div key={label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`z-10 flex size-8 items-center justify-center rounded-full ${
                    done ? 'bg-primary text-background-dark' :
                    active ? 'bg-primary/20 border-2 border-primary text-primary' :
                    'bg-slate-800 border-2 border-transparent text-slate-600'
                  }`}>
                    {done ? (
                      <span className="material-symbols-outlined text-lg">check</span>
                    ) : active ? (
                      <span className="material-symbols-outlined text-lg fill-icon">pending</span>
                    ) : (
                      <span className="material-symbols-outlined text-lg">circle</span>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-12 w-0.5 ${done ? 'bg-primary' : 'bg-slate-800'}`} />
                  )}
                </div>
                <div className="pt-1 pb-6">
                  <h3 className={`text-base font-semibold ${waiting ? 'text-slate-500' : 'text-white'}`}>{label}</h3>
                  <p className={`text-sm font-medium ${
                    done ? 'text-primary' : active ? 'text-primary' : 'text-slate-600'
                  }`}>
                    {done ? 'Completed' : active ? 'In progress...' : 'Waiting'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
