import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import HamburgerMenu from '../components/HamburgerMenu'

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
          <h2 className="text-lg font-bold flex-1 text-center">QA Report & Return Risk</h2>
          <HamburgerMenu />
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
