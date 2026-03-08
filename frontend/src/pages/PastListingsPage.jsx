import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'

// Hardcoded demo history — shows off variety of marketplaces + QA scores
const HARDCODED_HISTORY = [
  {
    id: 'demo-1',
    title: 'Vintage Brown Leather Jacket — Size M',
    marketplace: 'amazon',
    date: '2026-03-07',
    riskScore: 3,
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120&q=60',
  },
  {
    id: 'demo-2',
    title: 'Handmade Ceramic Coffee Mug Set (4-Pack)',
    marketplace: 'etsy',
    date: '2026-03-06',
    riskScore: 1,
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=120&q=60',
  },
  {
    id: 'demo-3',
    title: 'Nike Air Max 270 — Men\'s US 10 — White/Black',
    marketplace: 'ebay',
    date: '2026-03-05',
    riskScore: 5,
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=60',
  },
  {
    id: 'demo-4',
    title: 'Levi\'s 501 Original Fit Jeans — 32×30 — Dark Wash',
    marketplace: 'walmart',
    date: '2026-03-04',
    riskScore: 2,
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=120&q=60',
  },
  {
    id: 'demo-5',
    title: 'Minimalist Desk Organiser — Walnut Wood + Steel',
    marketplace: 'shopify',
    date: '2026-03-03',
    riskScore: 0,
    thumbnail: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=120&q=60',
  },
]

const MARKETPLACE_LOGOS = {
  amazon:  '/marketplaces/amazon.png',
  etsy:    '/marketplaces/etsy.png',
  ebay:    '/marketplaces/ebay.png',
  walmart: '/marketplaces/walmart.svg',
  shopify: '/marketplaces/shopify.png',
}

const MARKETPLACE_LABELS = {
  amazon: 'Amazon', etsy: 'Etsy', ebay: 'eBay', walmart: 'Walmart', shopify: 'Shopify',
}

function RiskBadge({ score }) {
  if (score === 0) return <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Perfect</span>
  if (score <= 3)  return <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{score}/10 Low</span>
  if (score <= 6)  return <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">{score}/10 Med</span>
  return               <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">{score}/10 High</span>
}

export default function PastListingsPage() {
  const navigate = useNavigate()
  const { listingHistory } = useStore()

  // Merge session history (newest first) with hardcoded demos
  const allListings = [...listingHistory, ...HARDCODED_HISTORY]

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold">Past Listings</h1>
        </div>
        <HamburgerMenu />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-3 pb-28">
        {listingHistory.length > 0 && (
          <p className="text-xs font-semibold text-primary uppercase tracking-widest pt-2">This Session</p>
        )}

        {allListings.map((item, idx) => {
          const isSessionBoundary = idx === listingHistory.length && listingHistory.length > 0
          return (
            <div key={item.id}>
              {isSessionBoundary && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-4 pb-1">Previous Listings</p>
              )}
              <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-colors cursor-pointer group">
                {/* Thumbnail */}
                <div className="size-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {/* Marketplace mini logo */}
                    <div className="size-5 bg-white rounded shrink-0 flex items-center justify-center">
                      <img src={MARKETPLACE_LOGOS[item.marketplace]} alt={MARKETPLACE_LABELS[item.marketplace]} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{MARKETPLACE_LABELS[item.marketplace]}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                </div>

                {/* Risk badge */}
                <RiskBadge score={item.riskScore} />
              </div>
            </div>
          )
        })}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-4 pb-2">
        <BottomNav />
      </div>
    </div>
  )
}
