import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'

const USER = {
  name: 'Alex Rivera',
  email: 'alex.rivera@listmate.io',
  plan: 'Pro — Demo',
  joined: 'January 2026',
  listings: 47,
}

function MaskedKey({ value }) {
  if (!value) return <span className="text-slate-400 text-sm">Not set</span>
  const visible = value.slice(-4)
  return <span className="text-sm font-mono text-primary">{'•'.repeat(12)}{visible}</span>
}

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { apiKeys, setApiKeys } = useStore()

  const [anthropicInput, setAnthropicInput] = useState(apiKeys.anthropic)
  const [openaiInput, setOpenaiInput]       = useState(apiKeys.openai)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setApiKeys({ anthropic: anthropicInput.trim(), openai: openaiInput.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold">Account Settings</h1>
        </div>
        <HamburgerMenu />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-6 pb-28">

        {/* Profile card */}
        <section className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-3xl">person</span>
            </div>
            <div>
              <p className="font-bold text-lg">{USER.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{USER.email}</p>
            </div>
            <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{USER.plan}</span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{USER.listings}</p>
              <p className="text-xs text-slate-400 mt-0.5">Listings</p>
            </div>
            <div className="text-center border-x border-slate-100 dark:border-slate-700">
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-slate-400 mt-0.5">Marketplaces</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{USER.joined}</p>
              <p className="text-xs text-slate-400 mt-0.5">Member since</p>
            </div>
          </div>
        </section>

        {/* API Keys section */}
        <section className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-5">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">key</span>
              API Keys
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Keys are stored in-session only — never sent to any server except the LLM providers directly. Clear your browser to remove them.
            </p>
          </div>

          {/* Anthropic */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold" htmlFor="anthropic-key">Anthropic API Key</label>
              <MaskedKey value={apiKeys.anthropic} />
            </div>
            <input
              id="anthropic-key"
              type="password"
              value={anthropicInput}
              onChange={(e) => setAnthropicInput(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-400"
            />
          </div>

          {/* OpenAI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold" htmlFor="openai-key">OpenAI API Key</label>
              <MaskedKey value={apiKeys.openai} />
            </div>
            <input
              id="openai-key"
              type="password"
              value={openaiInput}
              onChange={(e) => setOpenaiInput(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              saved
                ? 'bg-primary/20 text-primary'
                : 'bg-primary text-background-dark hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            {saved ? '✓ Saved for this session' : 'Save API Keys'}
          </button>
        </section>

        {/* Info note */}
        <div className="flex gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">info</span>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            These keys are passed with each generate/QA request and override the server environment. Useful for demos when you don't want to hardcode keys in the repo.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-4 pb-2">
        <BottomNav />
      </div>
    </div>
  )
}
