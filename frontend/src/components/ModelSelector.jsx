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
