import { useNavigate } from 'react-router-dom'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'

const SUMMARY = [
  { label: 'Total Listings', value: '47', icon: 'inventory_2',    color: 'text-primary',    bg: 'bg-primary/10' },
  { label: 'Avg QA Score',   value: '8.6', icon: 'verified',      color: 'text-primary',    bg: 'bg-primary/10' },
  { label: 'Marketplaces',   value: '5',   icon: 'storefront',    color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  { label: 'This Week',      value: '+7',  icon: 'trending_up',   color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
]

const MARKETPLACE_STATS = [
  { name: 'Amazon',  count: 18, logo: '/marketplaces/amazon.png' },
  { name: 'Etsy',    count: 12, logo: '/marketplaces/etsy.png' },
  { name: 'eBay',    count: 9,  logo: '/marketplaces/ebay.png' },
  { name: 'Walmart', count: 5,  logo: '/marketplaces/walmart.svg' },
  { name: 'Shopify', count: 3,  logo: '/marketplaces/shopify.png' },
]

const MAX_COUNT = Math.max(...MARKETPLACE_STATS.map((m) => m.count))

// QA score trend — 8 weeks of data
const TREND = [6.8, 7.2, 7.5, 7.9, 8.1, 8.3, 8.5, 8.6]
const TREND_MAX = 10
const TREND_MIN = 6

const TOP_LISTINGS = [
  { title: 'Handmade Ceramic Mug Set',        marketplace: 'Etsy',    score: 10, sales: 38 },
  { title: 'Vintage Leather Jacket — Brown',  marketplace: 'Amazon',  score: 9,  sales: 24 },
  { title: 'Levi\'s 501 Dark Wash — 32×30',   marketplace: 'Walmart', score: 9,  sales: 19 },
  { title: 'Minimalist Walnut Desk Organiser', marketplace: 'Shopify', score: 10, sales: 15 },
]

function ScoreBadge({ score }) {
  const color = score >= 9 ? 'text-primary bg-primary/10' : score >= 7 ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400 bg-slate-400/10'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score}/10</span>
}

export default function InsightsPage() {
  const navigate = useNavigate()

  // Build SVG sparkline path
  const W = 280; const H = 60; const PAD = 8
  const pts = TREND.map((v, i) => {
    const x = PAD + (i / (TREND.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((v - TREND_MIN) / (TREND_MAX - TREND_MIN)) * (H - PAD * 2)
    return `${x},${y}`
  })
  const polyline = pts.join(' ')
  const [lastX, lastY] = pts[pts.length - 1].split(',')

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ListMate" className="size-8 rounded-lg" />
          <h1 className="text-xl font-bold tracking-tight">Insights</h1>
        </div>
        <HamburgerMenu />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-6 pb-28">

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {SUMMARY.map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
              <div className={`size-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* QA Score trend */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm">Avg QA Score — Last 8 Weeks</h2>
            <span className="text-primary text-sm font-bold">↑ +1.8</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
            {/* Gradient fill */}
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1ddd33" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#1ddd33" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`${PAD},${H} ${polyline} ${W - PAD},${H}`}
              fill="url(#sparkGrad)"
            />
            <polyline points={polyline} fill="none" stroke="#1ddd33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastX} cy={lastY} r="4" fill="#1ddd33" />
          </svg>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
            {['8w ago','7w','6w','5w','4w','3w','2w','Now'].map((l) => <span key={l}>{l}</span>)}
          </div>
        </div>

        {/* Listings by marketplace */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-bold text-sm mb-4">Listings by Marketplace</h2>
          <div className="space-y-3">
            {MARKETPLACE_STATS.map(({ name, count, logo }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="size-6 bg-white rounded flex items-center justify-center shrink-0">
                  <img src={logo} alt={name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{name}</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(count / MAX_COUNT) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top listings */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-bold text-sm mb-4">Top Performing Listings</h2>
          <div className="space-y-3">
            {TOP_LISTINGS.map(({ title, marketplace, score, sales }, i) => (
              <div key={title} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{title}</p>
                  <p className="text-xs text-slate-400">{marketplace} · {sales} sales</p>
                </div>
                <ScoreBadge score={score} />
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-4 pb-2">
        <BottomNav />
      </div>
    </div>
  )
}
