# ListMate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully functional ListMate platform — React + Vite frontend and FastAPI backend — that takes product images + seller notes, calls Claude/OpenAI, returns an optimized marketplace listing with QA scoring and a Return Risk Score.

**Architecture:** React (Vite + Tailwind) frontend with 5 pages connected via React Router and Zustand state. FastAPI Python backend with a unified `LLMClient` abstraction that routes to Anthropic or OpenAI. Best-of-N mode runs two prompts against Claude and returns the scored winner.

**Tech Stack:** React 18, Vite, Tailwind CSS, Zustand, React Router v6, Framer Motion, Axios | FastAPI, Anthropic SDK, OpenAI SDK, Python 3.11+, uvicorn, python-dotenv, python-multipart

**Design reference:** `UI Components/` — five HTML prototypes. Port them pixel-for-pixel. Color system: primary `#1ddd33`, bg-dark `#112113`, bg-light `#f6f8f6`, font Inter, icons Material Symbols Outlined.

---

## Task 1: Scaffold the Frontend

**Files:**
- Create: `frontend/` (entire directory)

**Step 1: Scaffold Vite + React project**

```bash
cd /Users/dhaiwatkabaria/Desktop/Kellogg/Quarter_2/MBAi_448-Applied-AI-for-Business/listmate
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

**Step 2: Install dependencies**

```bash
npm install react-router-dom zustand axios react-dropzone framer-motion
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Tailwind — `frontend/tailwind.config.js`**

Replace entire file with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1ddd33',
        'background-light': '#f6f8f6',
        'background-dark': '#112113',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
```

**Step 4: Replace `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

body {
  font-family: 'Inter', sans-serif;
  min-height: 100dvh;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.fill-icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

**Step 5: Replace `frontend/index.html` `<head>` to add dark class**

The `<html>` tag must have `class="dark"`:
```html
<html lang="en" class="dark">
```

**Step 6: Delete boilerplate**

Delete `frontend/src/App.css` and `frontend/src/assets/react.svg`.

**Step 7: Verify dev server starts**

```bash
cd frontend && npm run dev
```
Expected: Server at `http://localhost:5173` with blank dark green page.

**Step 8: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React + Vite + Tailwind frontend"
```

---

## Task 2: Scaffold the Backend

**Files:**
- Create: `backend/` (entire directory)

**Step 1: Create directory structure**

```bash
mkdir -p backend/routes backend/services backend/prompts
touch backend/main.py backend/routes/__init__.py backend/routes/generate.py
touch backend/routes/qa.py backend/services/__init__.py
touch backend/services/llm.py backend/services/scorer.py
touch backend/.env.example backend/requirements.txt
```

**Step 2: Write `backend/requirements.txt`**

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
python-multipart==0.0.12
python-dotenv==1.0.1
anthropic==0.40.0
openai==1.56.0
Pillow==10.4.0
```

**Step 3: Create virtual environment and install**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Step 4: Write `backend/.env.example`**

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
DEFAULT_PROVIDER=anthropic
DEFAULT_MODEL=claude-sonnet-4-6
DEMO_MODE=false
```

**Step 5: Copy to `.env` and fill in your real key**

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

**Step 6: Write `backend/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.generate import router as generate_router
from routes.qa import router as qa_router

load_dotenv()

app = FastAPI(title="ListMate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router, prefix="/api")
app.include_router(qa_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}
```

**Step 7: Verify backend starts**

```bash
cd backend && source venv/bin/activate
uvicorn main:app --reload --port 8000
```
Expected: `Application startup complete` at `http://localhost:8000`. Visit `/api/health` → `{"status":"ok"}`.

**Step 8: Commit**

```bash
git add backend/
git commit -m "feat: scaffold FastAPI backend with CORS and health route"
```

---

## Task 3: Zustand Store + React Router

**Files:**
- Create: `frontend/src/store/useStore.js`
- Create: `frontend/src/router.jsx`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/App.jsx`

**Step 1: Write the Zustand store — `frontend/src/store/useStore.js`**

```js
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
  updateListing: (listing) =>
    set((s) => ({ jobResult: { ...s.jobResult, listing } })),
  reset: () => set({ images: [], notes: '', jobResult: null, qaResult: null }),
}))

export default useStore
```

**Step 2: Create placeholder page files**

```bash
mkdir -p frontend/src/pages frontend/src/components
touch frontend/src/pages/UploadPage.jsx
touch frontend/src/pages/ProcessingPage.jsx
touch frontend/src/pages/ListingPage.jsx
touch frontend/src/pages/VariantsPage.jsx
touch frontend/src/pages/QAPage.jsx
```

Add this placeholder to each page file (replace `UploadPage` with the correct name):
```jsx
export default function UploadPage() {
  return <div className="text-white p-8">UploadPage</div>
}
```

**Step 3: Write `frontend/src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ListingPage from './pages/ListingPage'
import VariantsPage from './pages/VariantsPage'
import QAPage from './pages/QAPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/processing" element={<ProcessingPage />} />
        <Route path="/listing" element={<ListingPage />} />
        <Route path="/variants" element={<VariantsPage />} />
        <Route path="/qa" element={<QAPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

**Step 4: Verify routing works**

```bash
cd frontend && npm run dev
```
Visit `http://localhost:5173/upload` — should show "UploadPage" in white text.

**Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: add Zustand store and React Router with 5 page stubs"
```

---

## Task 4: UploadPage

**Files:**
- Modify: `frontend/src/pages/UploadPage.jsx`
- Create: `frontend/src/components/ModelSelector.jsx`

**Step 1: Write the ModelSelector component — `frontend/src/components/ModelSelector.jsx`**

```jsx
import useStore from '../store/useStore'

const MODELS = {
  anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  openai: ['gpt-4.1', 'gpt-4.1-mini', 'o3', 'o4-mini'],
}

export default function ModelSelector() {
  const { modelConfig, setModelConfig } = useStore()

  const switchProvider = (provider) => {
    setModelConfig({ provider, model: MODELS[provider][0] })
  }

  return (
    <div className="space-y-3">
      {/* Provider toggle */}
      <div className="flex gap-2">
        {['anthropic', 'openai'].map((p) => (
          <button
            key={p}
            onClick={() => switchProvider(p)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              modelConfig.provider === p
                ? 'bg-primary text-background-dark'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {p === 'anthropic' ? 'Anthropic' : 'OpenAI'}
          </button>
        ))}
        <button
          disabled
          className="flex-1 py-2 rounded-lg text-sm font-bold bg-slate-800/50 text-slate-600 cursor-not-allowed"
          title="Fine-tuned models — launching Q3"
        >
          Custom 🔒
        </button>
      </div>

      {/* Model dropdown */}
      <select
        value={modelConfig.model}
        onChange={(e) => setModelConfig({ model: e.target.value })}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        {MODELS[modelConfig.provider].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* Best-of-N toggle */}
      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-3">
        <div>
          <p className="text-sm font-bold text-white">⚡ Best-of-N</p>
          <p className="text-xs text-slate-400">Run multiple prompts, return best output</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={modelConfig.bestOfN}
            onChange={(e) => setModelConfig({ bestOfN: e.target.checked })}
          />
          <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>
    </div>
  )
}
```

**Step 2: Write `frontend/src/pages/UploadPage.jsx`**

Port the `upload_configure/code.html` prototype. Key structure: sticky header, step indicator, photo upload grid (3 slots), seller notes textarea, marketplace selector (horizontal scroll), model selector section, fixed bottom with Generate button + bottom nav.

```jsx
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ModelSelector from '../components/ModelSelector'

const MARKETPLACES = [
  { id: 'amazon', label: 'Amazon' },
  { id: 'etsy', label: 'Etsy' },
  { id: 'ebay', label: 'eBay' },
  { id: 'walmart', label: 'Walmart' },
  { id: 'shopify', label: 'Shopify' },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const { images, notes, marketplace, setImages, setNotes, setMarketplace } = useStore()

  const onDrop = useCallback((accepted) => {
    setImages([...images, ...accepted].slice(0, 5))
  }, [images, setImages])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 5,
  })

  const handleGenerate = () => {
    if (images.length === 0) return alert('Please upload at least one image.')
    navigate('/processing')
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-background-dark">bolt</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">ListMate</h1>
        </div>
        <button className="size-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 pb-48">
        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Step 1 of 2</span>
          <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary" />
          </div>
        </div>

        {/* Photo upload */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Upload Photos</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Add 3-5 clear photos for best AI results.</p>
          <div className="grid grid-cols-3 gap-3">
            {/* First slot — dropzone */}
            <div
              {...getRootProps()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/50 hover:border-primary transition-colors cursor-pointer"
            >
              <input {...getInputProps()} />
              {images[0] ? (
                <img src={URL.createObjectURL(images[0])} className="w-full h-full object-cover rounded-xl" alt="upload 1" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-primary">add_a_photo</span>
                  <span className="text-xs font-medium">Main</span>
                </>
              )}
            </div>
            {/* Slots 2-3 */}
            {[1, 2].map((i) => (
              <div
                key={i}
                {...getRootProps()}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:border-primary transition-colors cursor-pointer text-slate-400"
              >
                <input {...getInputProps()} />
                {images[i] ? (
                  <img src={URL.createObjectURL(images[i])} className="w-full h-full object-cover rounded-xl" alt={`upload ${i+1}`} />
                ) : (
                  <span className="material-symbols-outlined">add</span>
                )}
              </div>
            ))}
          </div>
          {images.length > 0 && (
            <p className="text-xs text-primary mt-2">{images.length} photo{images.length > 1 ? 's' : ''} selected</p>
          )}
        </section>

        {/* Seller notes */}
        <section className="mb-8">
          <label className="text-lg font-semibold flex items-center gap-2 mb-2" htmlFor="seller-notes">
            Raw Seller Notes
            <span className="material-symbols-outlined text-sm text-slate-400">info</span>
          </label>
          <textarea
            id="seller-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[160px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4 text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-400"
            placeholder="e.g., blue denim jacket, size S-XL, machine washable, slightly worn collar..."
          />
        </section>

        {/* Marketplace selector */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Marketplace</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {MARKETPLACES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setMarketplace(id)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className={`size-16 rounded-xl bg-white dark:bg-slate-800 border-2 flex items-center justify-center p-2 shadow-sm transition-all active:scale-95 ${
                  marketplace === id ? 'border-primary' : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{label.slice(0,2)}</span>
                </div>
                <span className={`text-xs font-medium ${marketplace === id ? 'text-primary' : 'opacity-60'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Model selector */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">AI Model</h2>
          <ModelSelector />
        </section>
      </main>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        <button
          onClick={handleGenerate}
          className="w-full bg-primary text-background-dark py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          Generate Listing
        </button>
        <nav className="flex justify-around items-center pt-2">
          {[['upload','Upload'],['list_alt','Listings'],['bar_chart','Insights'],['settings','Settings']].map(([icon, label]) => (
            <a key={icon} className={`flex flex-col items-center gap-1 ${icon === 'upload' ? 'text-primary' : 'text-slate-400'}`} href="#">
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
```

**Step 3: Verify UploadPage in browser**

```bash
cd frontend && npm run dev
```
Visit `http://localhost:5173/upload`. Should look identical to `UI Components/upload_configure/screen.png`. Check: dark background, green accent, marketplace buttons, photo grid, model selector.

**Step 4: Commit**

```bash
git add frontend/src/pages/UploadPage.jsx frontend/src/components/ModelSelector.jsx
git commit -m "feat: implement UploadPage with image dropzone, model selector"
```

---

## Task 5: ProcessingPage

**Files:**
- Modify: `frontend/src/pages/ProcessingPage.jsx`
- Create: `frontend/src/api/generate.js`

**Step 1: Write the API call — `frontend/src/api/generate.js`**

```js
import axios from 'axios'

const BASE = 'http://localhost:8000/api'

export async function generateListing({ images, notes, marketplace, modelConfig }) {
  const form = new FormData()
  images.forEach((img) => form.append('images', img))
  form.append('notes', notes)
  form.append('marketplace', marketplace)
  form.append('provider', modelConfig.provider)
  form.append('model', modelConfig.model)
  form.append('best_of_n', String(modelConfig.bestOfN))

  const { data } = await axios.post(`${BASE}/generate`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
```

**Step 2: Write `frontend/src/pages/ProcessingPage.jsx`**

Port `processing.../code.html`. The spinner is a CSS ring; steps animate sequentially with a 3s total delay per step.

```jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import { generateListing } from '../api/generate'

const STEPS = [
  'Analyzing images',
  'Extracting details',
  'Generating listing',
  'Running QA scan',
]

export default function ProcessingPage() {
  const navigate = useNavigate()
  const { images, notes, marketplace, modelConfig, setJobResult } = useStore()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Animate steps while API call runs
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setActiveStep(i), i * 3500)
    )

    generateListing({ images, notes, marketplace, modelConfig })
      .then((data) => {
        setJobResult(data)
        navigate('/listing')
      })
      .catch((err) => {
        console.error(err)
        setError('Something went wrong. Please try again.')
      })

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">bolt</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ListMate</span>
        </div>
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
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
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
```

**Step 3: Verify ProcessingPage renders**

Navigate to `/upload`, upload an image, click Generate. Should navigate to `/processing` and show animated steps. (Will error since backend isn't wired yet — that's fine.)

**Step 4: Commit**

```bash
git add frontend/src/pages/ProcessingPage.jsx frontend/src/api/generate.js
git commit -m "feat: implement ProcessingPage with animated steps and API call"
```

---

## Task 6: ListingPage

**Files:**
- Modify: `frontend/src/pages/ListingPage.jsx`

**Step 1: Write `frontend/src/pages/ListingPage.jsx`**

Port `review_listing/code.html`. Editable fields, image carousel from uploaded images, regenerate buttons (stub for now), variants toggle.

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function ListingPage() {
  const navigate = useNavigate()
  const { images, jobResult, updateListing } = useStore()
  const listing = jobResult?.listing ?? {
    title: '',
    bullets: ['', '', '', '', ''],
    description: '',
    attributes: { brand: '', material: '', closure: '' },
  }
  const [hasVariants, setHasVariants] = useState(false)

  const update = (field, value) => {
    updateListing({ ...listing, [field]: value })
  }

  const updateBullet = (i, value) => {
    const bullets = [...listing.bullets]
    bullets[i] = value
    update('bullets', bullets)
  }

  const updateAttr = (key, value) => {
    update('attributes', { ...listing.attributes, [key]: value })
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
            onClick={() => navigate(hasVariants ? '/variants' : '/qa')}
            className="flex-[2] bg-primary text-background-dark font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
          >
            {hasVariants ? 'Build Variants' : 'Preview QA'}
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
```

**Step 2: Commit**

```bash
git add frontend/src/pages/ListingPage.jsx
git commit -m "feat: implement ListingPage with editable fields and image carousel"
```

---

## Task 7: VariantsPage

**Files:**
- Modify: `frontend/src/pages/VariantsPage.jsx`

**Step 1: Write `frontend/src/pages/VariantsPage.jsx`**

Port `variant_builder/code.html`. Table with size/color/price/stock rows, add row, bulk price/stock update.

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const DEFAULT_VARIANTS = [
  { size: 'S', color: 'Blue', price: '129.99', stock: 24 },
  { size: 'M', color: 'Black', price: '129.99', stock: 18 },
  { size: 'L', color: 'Blue', price: '134.99', stock: 42 },
  { size: 'XL', color: 'Blue', price: '139.99', stock: 12 },
]

export default function VariantsPage() {
  const navigate = useNavigate()
  const { jobResult } = useStore()
  const [variants, setVariants] = useState(jobResult?.variants?.length ? jobResult.variants : DEFAULT_VARIANTS)
  const [visible, setVisible] = useState(true)
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState('')

  const update = (i, field, value) => {
    const v = [...variants]
    v[i] = { ...v[i], [field]: value }
    setVariants(v)
  }

  const addRow = () => setVariants([...variants, { size: '', color: 'Blue', price: '0.00', stock: 0 }])
  const removeRow = (i) => setVariants(variants.filter((_, idx) => idx !== i))
  const applyBulkPrice = () => { if (bulkPrice) setVariants(variants.map(v => ({ ...v, price: bulkPrice }))) }
  const applyBulkStock = () => { if (bulkStock) setVariants(variants.map(v => ({ ...v, stock: parseInt(bulkStock) || 0 }))) }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      <header className="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-primary/20 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/listing')} className="p-2 rounded-lg hover:bg-primary/10">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">Manage Variants</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/listing')} className="px-4 py-2 rounded-lg border border-primary text-primary font-medium hover:bg-primary/5">
              Back to Listing
            </button>
            <button onClick={() => navigate('/qa')} className="px-4 py-2 rounded-lg bg-primary text-background-dark font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">check</span>
              Save & Continue
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Toggle */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">Show/Hide Variants</p>
            <p className="text-sm text-slate-500">Toggle visibility in store</p>
          </div>
          <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full bg-slate-300 dark:bg-slate-700 p-0.5 has-[:checked]:bg-primary">
            <div className="h-full w-[27px] rounded-full bg-white shadow-md" />
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} className="invisible absolute" />
          </label>
        </section>

        {/* Table */}
        <div className="overflow-x-auto bg-background-light dark:bg-background-dark border border-primary/10 rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary/5 border-b border-primary/20 text-left">
                {['Size', 'Color', 'Price ($)', 'Stock (Units)', 'Action'].map(h => (
                  <th key={h} className="p-4 font-semibold text-sm uppercase tracking-wider text-primary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {variants.map((v, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors">
                  <td className="p-4">
                    <input value={v.size} onChange={e => update(i, 'size', e.target.value)} className="w-16 bg-background-light dark:bg-slate-800 border border-primary/20 rounded-lg text-sm px-2 py-1 focus:ring-primary" />
                  </td>
                  <td className="p-4">
                    <select value={v.color} onChange={e => update(i, 'color', e.target.value)} className="bg-background-light dark:bg-slate-800 border border-primary/20 rounded-lg text-sm focus:ring-primary">
                      {['Blue', 'Black', 'Red', 'White', 'Green'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <input type="number" value={v.price} onChange={e => update(i, 'price', e.target.value)} className="w-24 bg-background-light dark:bg-slate-800 border border-primary/20 rounded-lg text-sm focus:ring-primary" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => update(i, 'stock', Math.max(0, v.stock - 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary">-</button>
                      <input type="number" value={v.stock} onChange={e => update(i, 'stock', parseInt(e.target.value)||0)} className="bg-transparent border-none text-center w-12 font-medium focus:ring-0" />
                      <button onClick={() => update(i, 'stock', v.stock + 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 hover:bg-primary/30 text-primary">+</button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => removeRow(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center pt-2">
          <button onClick={addRow} className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-dashed border-primary/40 text-primary font-bold hover:bg-primary/5 hover:border-primary transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            Add Variant Row
          </button>
        </div>

        {/* Bulk ops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-4 rounded-xl border border-primary/10 bg-primary/5">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_fix_high</span>Bulk Price Update
            </h3>
            <div className="flex gap-2">
              <input value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} className="flex-1 bg-background-light dark:bg-slate-800 border border-primary/20 rounded-lg text-sm px-3 py-2 focus:ring-primary" placeholder="$ 0.00" />
              <button onClick={applyBulkPrice} className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-bold text-sm">Apply</button>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-primary/10 bg-primary/5">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span>Bulk Stock Update
            </h3>
            <div className="flex gap-2">
              <input value={bulkStock} onChange={e => setBulkStock(e.target.value)} className="flex-1 bg-background-light dark:bg-slate-800 border border-primary/20 rounded-lg text-sm px-3 py-2 focus:ring-primary" placeholder="Quantity" />
              <button onClick={applyBulkStock} className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-bold text-sm">Apply</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add frontend/src/pages/VariantsPage.jsx
git commit -m "feat: implement VariantsPage with editable matrix and bulk operations"
```

---

## Task 8: QAPage

**Files:**
- Modify: `frontend/src/pages/QAPage.jsx`
- Create: `frontend/src/api/qa.js`

**Step 1: Write `frontend/src/api/qa.js`**

```js
import axios from 'axios'

const BASE = 'http://localhost:8000/api'

export async function runQA({ listing, images, modelConfig }) {
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
  })
  return data
}
```

**Step 2: Wire QA call into ListingPage "Preview QA" button**

In `frontend/src/pages/ListingPage.jsx`, update the Preview QA button:

```jsx
// Add to imports at top of ListingPage.jsx
import { runQA } from '../api/qa'

// Replace the Preview QA button onClick:
const handlePreviewQA = async () => {
  try {
    const qa = await runQA({ listing, images, modelConfig })
    setQaResult(qa)  // add setQaResult to useStore() destructure
  } catch (e) {
    console.error(e)
  } finally {
    navigate('/qa')
  }
}
// Then: onClick={handlePreviewQA}
```

Also add `setQaResult` to the destructure in ListingPage:
```jsx
const { images, jobResult, updateListing, modelConfig, setQaResult } = useStore()
```

**Step 3: Write `frontend/src/pages/QAPage.jsx`**

Port `qa_report/code.html`. SVG gauge ring, issue cards with Fix It buttons that navigate back to listing.

```jsx
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const ISSUE_ICONS = {
  missing: { icon: 'flag', color: 'text-primary', bg: 'bg-primary/20' },
  ambiguous: { icon: 'warning', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  mismatch: { icon: 'image_not_supported', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
}

export default function QAPage() {
  const navigate = useNavigate()
  const { qaResult } = useStore()

  const score = qaResult?.risk_score ?? 0
  const issues = qaResult?.issues ?? []

  // SVG gauge: circumference = 2π * 88 ≈ 552.92
  const circ = 552.92
  const offset = circ - (score / 10) * circ

  const riskLabel = score <= 3 ? 'Low Risk' : score <= 6 ? 'Medium Risk' : 'High Risk'
  const riskColor = score <= 3 ? 'text-primary' : score <= 6 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col border-x border-primary/10">
        {/* Header */}
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 sticky top-0 z-10 border-b border-primary/10">
          <button onClick={() => navigate('/listing')} className="flex size-10 items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold flex-1 text-center pr-10">QA Report & Return Risk</h2>
        </div>

        <div className="flex flex-col flex-1 pb-24">
          {/* Gauge */}
          <div className="flex flex-col items-center justify-center p-8 gap-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle className="text-primary/10" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12" />
                <circle
                  className={score <= 3 ? 'text-primary' : score <= 6 ? 'text-yellow-400' : 'text-red-400'}
                  cx="96" cy="96" fill="transparent" r="88"
                  stroke="currentColor" strokeDasharray={circ} strokeDashoffset={offset} strokeWidth="12"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                <span className="text-4xl font-bold">{score}/10</span>
                <span className={`text-xs font-medium uppercase tracking-widest ${riskColor}`}>{riskLabel}</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm text-center max-w-xs">
              {score <= 3
                ? 'Your listing has a high probability of success. Fixing the issues below will further reduce return risk.'
                : score <= 6
                ? 'Moderate return risk. Address the flagged issues before publishing.'
                : 'High return risk. Multiple issues need attention before this listing goes live.'}
            </p>
          </div>

          {/* Checklist */}
          <div className="px-4">
            <h3 className="text-lg font-bold mb-4">QA Checklist</h3>
            {issues.length === 0 ? (
              <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                <p className="text-sm font-semibold">No issues found — listing looks great!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {issues.map((issue, i) => {
                  const style = ISSUE_ICONS[issue.type] ?? ISSUE_ICONS.missing
                  return (
                    <div key={i} className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <div className={`flex items-center justify-center rounded-lg ${style.bg} ${style.color} shrink-0 size-12`}>
                        <span className="material-symbols-outlined">{style.icon}</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <p className="text-sm font-semibold">{issue.message}</p>
                        <p className="text-slate-500 text-xs">{issue.field}</p>
                      </div>
                      <button
                        onClick={() => navigate('/listing')}
                        className="flex px-3 py-1.5 items-center justify-center rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold transition-colors"
                      >
                        Fix it
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Publish (disabled) */}
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4">
          <button disabled className="w-full flex items-center justify-center gap-2 h-14 bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed border border-slate-300 dark:border-slate-700">
            <span>Publish</span>
            <span className="text-[10px] bg-slate-300 dark:bg-slate-700 px-2 py-0.5 rounded-full">COMING SOON</span>
          </button>
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex gap-2 border-t border-primary/10 bg-background-light dark:bg-background-dark px-4 pb-3 pt-2 z-20">
          {[['home','Home'],['list_alt','Listings'],['verified_user','QA Report'],['person','Profile']].map(([icon, label], i) => (
            <a key={icon} className={`flex flex-1 flex-col items-center gap-1 ${i === 2 ? 'text-primary' : 'text-slate-400'}`} href="#">
              <span className={`material-symbols-outlined ${i === 2 ? 'fill-icon' : ''}`}>{icon}</span>
              <p className="text-xs font-medium">{label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add frontend/src/pages/QAPage.jsx frontend/src/api/qa.js frontend/src/pages/ListingPage.jsx
git commit -m "feat: implement QAPage with SVG gauge and issue checklist"
```

---

## Task 9: Backend — LLM Abstraction Layer

**Files:**
- Modify: `backend/services/llm.py`

**Step 1: Write `backend/services/llm.py`**

```python
import base64
import json
import os
from typing import Optional

import anthropic
import openai


ANTHROPIC_MODELS = ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5']
OPENAI_MODELS = ['gpt-4.1', 'gpt-4.1-mini', 'o3', 'o4-mini']


class LLMClient:
    def __init__(self, provider: str, model: str):
        self.provider = provider
        self.model = model
        if provider == 'anthropic':
            self.client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
        elif provider == 'openai':
            self.client = openai.OpenAI(api_key=os.environ.get('OPENAI_API_KEY', ''))
        else:
            raise ValueError(f'Unknown provider: {provider}')

    def generate(
        self,
        system: str,
        user_text: str,
        images_b64: Optional[list[str]] = None,
    ) -> str:
        """Returns raw text response from the model."""
        images_b64 = images_b64 or []
        if self.provider == 'anthropic':
            return self._anthropic_call(system, user_text, images_b64)
        return self._openai_call(system, user_text, images_b64)

    def _anthropic_call(self, system: str, user_text: str, images_b64: list[str]) -> str:
        content = []
        for b64 in images_b64:
            content.append({
                'type': 'image',
                'source': {'type': 'base64', 'media_type': 'image/jpeg', 'data': b64},
            })
        content.append({'type': 'text', 'text': user_text})

        msg = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system,
            messages=[{'role': 'user', 'content': content}],
        )
        return msg.content[0].text

    def _openai_call(self, system: str, user_text: str, images_b64: list[str]) -> str:
        content = []
        for b64 in images_b64:
            content.append({
                'type': 'image_url',
                'image_url': {'url': f'data:image/jpeg;base64,{b64}'},
            })
        content.append({'type': 'text', 'text': user_text})

        resp = self.client.chat.completions.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': content},
            ],
        )
        return resp.choices[0].message.content


def parse_json_response(text: str) -> dict:
    """Strip markdown fences and parse JSON. Raises ValueError on failure."""
    text = text.strip()
    if text.startswith('```'):
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    return json.loads(text.strip())
```

**Step 2: Commit**

```bash
git add backend/services/llm.py
git commit -m "feat: add LLMClient abstraction for Anthropic and OpenAI"
```

---

## Task 10: Backend — Prompts

**Files:**
- Create: `backend/prompts/listing_system.txt`
- Create: `backend/prompts/listing_user.txt`
- Create: `backend/prompts/listing_system_conversion.txt`
- Create: `backend/prompts/qa_system.txt`
- Create: `backend/prompts/qa_user.txt`

**Step 1: Write `backend/prompts/listing_system.txt`**

```
You are an expert marketplace listing copywriter. Your job is to create optimized, high-converting product listings.

Return ONLY valid JSON — no markdown, no explanation, no code fences.

Marketplace-specific guidelines:
- amazon: Keyword-rich title (max 200 chars), spec-heavy bullets, SEO-optimized. Include dimensions, materials, compatibility if relevant.
- etsy: Conversational and story-driven. Shorter title, benefit-focused bullets, warm brand voice.
- ebay: Concise, factual, condition-focused. Include item specifics.
- walmart: Clear and direct. Focus on value proposition and specifications.
- shopify: Brand-forward, lifestyle-focused copy.

JSON schema to return:
{
  "listing": {
    "title": "string",
    "bullets": ["string", "string", "string", "string", "string"],
    "description": "string (2-3 paragraphs)",
    "attributes": {
      "brand": "string",
      "material": "string",
      "dimensions": "string",
      "color": "string",
      "closure": "string"
    }
  },
  "variants": [
    {"size": "string", "color": "string", "sku": "string", "price": "string", "stock": 0}
  ]
}
```

**Step 2: Write `backend/prompts/listing_user.txt`**

```
Marketplace: {marketplace}

Seller notes:
{notes}

Please analyze the product images and seller notes above. Generate a complete, optimized listing for the {marketplace} marketplace.
```

**Step 3: Write `backend/prompts/listing_system_conversion.txt`** (Best-of-N variant B)

```
You are a conversion-rate optimization specialist for e-commerce listings. Your focus is on buyer psychology and reducing purchase hesitation.

Return ONLY valid JSON — no markdown, no explanation, no code fences.

Focus on:
- Leading with the primary benefit, not features
- Addressing common buyer objections in bullets
- Using sensory and emotional language in description
- Clear size/fit guidance to reduce returns

Use the same JSON schema as the standard listing prompt.
```

**Step 4: Write `backend/prompts/qa_system.txt`**

```
You are a product listing quality assurance specialist. Your job is to identify issues that could lead to customer returns or negative reviews.

Return ONLY valid JSON — no markdown, no explanation, no code fences.

Scoring: Start at 10, subtract:
- Missing required field (dimensions, material, size guide): -1 each
- Ambiguous phrase ("standard size", "fits most", "approximately", "about", "roughly", "one size", "similar to"): -0.5 each
- Image-text mismatch (color, style, or feature visible in image but not matching text): -2 each
- Floor: 0

JSON schema:
{
  "risk_score": integer,
  "issues": [
    {"field": "string", "type": "missing|ambiguous|mismatch", "message": "string"}
  ]
}
```

**Step 5: Write `backend/prompts/qa_user.txt`**

```
Please review this product listing for quality issues:

Title: {title}
Bullets:
{bullets}
Description: {description}
Attributes: {attributes}

Analyze the listing text and product images above. Identify any issues that could lead to customer returns.
```

**Step 6: Commit**

```bash
git add backend/prompts/
git commit -m "feat: add listing generation and QA prompt templates"
```

---

## Task 11: Backend — QA Scorer (Rule Layer)

**Files:**
- Modify: `backend/services/scorer.py`

**Step 1: Write `backend/services/scorer.py`**

```python
import re

AMBIGUOUS_PHRASES = [
    r'\bstandard size\b', r'\bfits most\b', r'\bapproximately\b',
    r'\babout\b', r'\broughly\b', r'\bone size\b', r'\bsimilar to\b',
    r'\baround\b', r'\bgeneral(ly)?\b',
]

REQUIRED_FIELDS = ['dimensions', 'material']


def rule_based_qa(listing: dict) -> tuple[list[dict], float]:
    """Returns (issues, deduction). Issues found by deterministic rules only."""
    issues = []
    deduction = 0.0
    attrs = listing.get('attributes', {})
    full_text = ' '.join([
        listing.get('title', ''),
        listing.get('description', ''),
        *listing.get('bullets', []),
    ]).lower()

    # Missing required fields
    for field in REQUIRED_FIELDS:
        val = attrs.get(field, '').strip()
        if not val or val.lower() in ('', 'n/a', 'unknown'):
            issues.append({
                'field': f'attributes.{field}',
                'type': 'missing',
                'message': f'Missing: {field} — add exact {field} to reduce returns',
            })
            deduction += 1.0

    # Ambiguous phrases
    for pattern in AMBIGUOUS_PHRASES:
        matches = re.findall(pattern, full_text, re.IGNORECASE)
        if matches:
            phrase = matches[0]
            issues.append({
                'field': 'listing text',
                'type': 'ambiguous',
                'message': f'Ambiguous: "{phrase}" — replace with specific measurements or values',
            })
            deduction += 0.5

    return issues, deduction
```

**Step 2: Commit**

```bash
git add backend/services/scorer.py
git commit -m "feat: add rule-based QA scorer for missing fields and ambiguous phrases"
```

---

## Task 12: Backend — /api/generate Route

**Files:**
- Modify: `backend/routes/generate.py`

**Step 1: Write `backend/routes/generate.py`**

```python
import base64
import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile
from services.llm import LLMClient, parse_json_response

router = APIRouter()

PROMPTS_DIR = Path(__file__).parent.parent / 'prompts'

FALLBACK_RESPONSE = {
    'listing': {
        'title': 'Premium Product — Demo Mode',
        'bullets': [
            'High-quality construction',
            'Versatile design for multiple occasions',
            'Available in multiple sizes',
            'Easy care instructions',
            'Satisfaction guaranteed',
        ],
        'description': 'This is a demo listing generated in fallback mode.',
        'attributes': {'brand': 'Demo', 'material': 'Mixed', 'dimensions': 'N/A', 'color': 'Varies', 'closure': 'N/A'},
    },
    'variants': [
        {'size': 'S', 'color': 'Blue', 'sku': 'DEMO-S', 'price': '29.99', 'stock': 10},
        {'size': 'M', 'color': 'Blue', 'sku': 'DEMO-M', 'price': '29.99', 'stock': 10},
        {'size': 'L', 'color': 'Blue', 'sku': 'DEMO-L', 'price': '29.99', 'stock': 10},
    ],
    'model_used': 'fallback',
    'best_of_n_comparison': None,
}


@router.post('/generate')
async def generate_listing(
    images: list[UploadFile] = File(...),
    notes: str = Form(''),
    marketplace: str = Form('amazon'),
    provider: str = Form('anthropic'),
    model: str = Form('claude-sonnet-4-6'),
    best_of_n: str = Form('false'),
):
    if os.environ.get('DEMO_MODE', 'false').lower() == 'true':
        return FALLBACK_RESPONSE

    # Read and encode images
    images_b64 = []
    for img in images[:5]:
        raw = await img.read()
        images_b64.append(base64.b64encode(raw).decode())

    system_a = (PROMPTS_DIR / 'listing_system.txt').read_text()
    user_tmpl = (PROMPTS_DIR / 'listing_user.txt').read_text()
    user_text = user_tmpl.replace('{marketplace}', marketplace).replace('{notes}', notes)

    client = LLMClient(provider=provider, model=model)

    # Best-of-N: two prompts, pick winner
    if best_of_n.lower() == 'true':
        system_b = (PROMPTS_DIR / 'listing_system_conversion.txt').read_text()
        text_a = client.generate(system_a, user_text, images_b64)
        text_b = client.generate(system_b, user_text, images_b64)
        try:
            result_a = parse_json_response(text_a)
            result_b = parse_json_response(text_b)
        except Exception:
            result_a = FALLBACK_RESPONSE
            result_b = FALLBACK_RESPONSE

        # Score: count non-empty fields + bullet count
        def score(r):
            l = r.get('listing', {})
            return (
                int(bool(l.get('title'))) +
                len([b for b in l.get('bullets', []) if b]) +
                int(len(l.get('description', '')) > 100)
            )

        winner, loser = (result_a, result_b) if score(result_a) >= score(result_b) else (result_b, result_a)
        return {
            **winner,
            'model_used': f'{provider}/{model}',
            'best_of_n_comparison': {
                'winner_score': score(winner),
                'loser_score': score(loser),
                'prompt_a': 'keyword-optimized',
                'prompt_b': 'conversion-focused',
            },
        }

    # Single model call
    try:
        text = client.generate(system_a, user_text, images_b64)
        result = parse_json_response(text)
    except Exception as e:
        print(f'LLM error: {e}')
        return FALLBACK_RESPONSE

    return {**result, 'model_used': f'{provider}/{model}', 'best_of_n_comparison': None}
```

**Step 2: Verify the endpoint manually**

```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

In a second terminal:
```bash
curl -X POST http://localhost:8000/api/generate \
  -F "notes=blue denim jacket size S-XL" \
  -F "marketplace=amazon" \
  -F "provider=anthropic" \
  -F "model=claude-sonnet-4-6"
```
Expected: JSON with `listing.title`, `listing.bullets`, etc. (no images — that's fine for this test).

**Step 3: Commit**

```bash
git add backend/routes/generate.py
git commit -m "feat: implement /api/generate with Best-of-N and fallback mode"
```

---

## Task 13: Backend — /api/qa Route

**Files:**
- Modify: `backend/routes/qa.py`

**Step 1: Write `backend/routes/qa.py`**

```python
import os
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel
from services.llm import LLMClient, parse_json_response
from services.scorer import rule_based_qa

router = APIRouter()
PROMPTS_DIR = Path(__file__).parent.parent / 'prompts'


class QARequest(BaseModel):
    listing: dict
    images: list[str] = []
    provider: str = 'anthropic'
    model: str = 'claude-sonnet-4-6'


@router.post('/qa')
async def run_qa(req: QARequest):
    listing = req.listing

    # Rule-based layer first (fast, deterministic)
    rule_issues, rule_deduction = rule_based_qa(listing)

    if os.environ.get('DEMO_MODE', 'false').lower() == 'true':
        score = max(0, round(10 - rule_deduction))
        return {'risk_score': score, 'issues': rule_issues}

    # LLM layer
    system = (PROMPTS_DIR / 'qa_system.txt').read_text()
    user_tmpl = (PROMPTS_DIR / 'qa_user.txt').read_text()
    bullets_str = '\n'.join(f'- {b}' for b in listing.get('bullets', []))
    user_text = (
        user_tmpl
        .replace('{title}', listing.get('title', ''))
        .replace('{bullets}', bullets_str)
        .replace('{description}', listing.get('description', ''))
        .replace('{attributes}', str(listing.get('attributes', {})))
    )

    try:
        client = LLMClient(provider=req.provider, model=req.model)
        text = client.generate(system, user_text, req.images[:3])
        llm_result = parse_json_response(text)
        llm_issues = llm_result.get('issues', [])
        llm_score = llm_result.get('risk_score', 10)

        # Merge rule issues (dedup by field)
        existing_fields = {i['field'] for i in llm_issues}
        for ri in rule_issues:
            if ri['field'] not in existing_fields:
                llm_issues.append(ri)

        # Final score: take LLM score but apply rule deductions too
        final_score = max(0, min(10, llm_score - rule_deduction))
        return {'risk_score': round(final_score), 'issues': llm_issues}

    except Exception as e:
        print(f'QA LLM error: {e}')
        score = max(0, round(10 - rule_deduction))
        return {'risk_score': score, 'issues': rule_issues}
```

**Step 2: Commit**

```bash
git add backend/routes/qa.py
git commit -m "feat: implement /api/qa with rule-based + LLM hybrid scoring"
```

---

## Task 14: End-to-End Integration Test

**Step 1: Start both servers**

Terminal 1 (backend):
```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

Terminal 2 (frontend):
```bash
cd frontend && npm run dev
```

**Step 2: Run full flow**

1. Go to `http://localhost:5173/upload`
2. Drop a product image into the upload zone
3. Type seller notes in the textarea
4. Select a marketplace
5. Leave model as `claude-sonnet-4-6`
6. Click "Generate Listing"
7. Watch the animated processing steps
8. On the listing page, verify: title, bullets, description, attributes are populated from Claude
9. Click "Preview QA"
10. Verify the QA page shows a risk score and issues

**Step 3: Check Best-of-N**

1. Go back to Upload
2. Toggle "Best-of-N" on
3. Click Generate
4. Verify the listing loads (same UI — comparison data is in the API response, not shown in UI yet)

**Step 4: Fix any issues found, commit**

```bash
git add -A
git commit -m "fix: integration issues found during end-to-end test"
```

---

## Task 15: Demo Prep

**Step 1: Set up golden demo product**

In `backend/.env`, set `DEMO_MODE=false` (real mode for demo day). Also prepare a fallback:
```bash
DEMO_MODE=false
```

**Step 2: Prepare demo images**

- Use 3 photos of a clear product (phone case, jacket, sneaker)
- Save to `backend/demo_assets/` for quick access
- Optional: pre-stage them in the upload zone via code (hardcode in UploadPage for demo if needed)

**Step 3: Add DEMO_MODE toggle to UploadPage (optional safety net)**

Add a hidden keyboard shortcut: pressing `D` 3 times toggles demo mode via a backend env call. This is optional — only needed if API latency is a concern on demo day.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: demo prep — assets, env config, final polish"
```

---

## Running the App

```bash
# Terminal 1
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
# Open http://localhost:5173
```

**Environment required:**
- `ANTHROPIC_API_KEY` in `backend/.env`
- `OPENAI_API_KEY` in `backend/.env` (optional — OpenAI toggle disabled if absent)
