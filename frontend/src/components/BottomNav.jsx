import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/upload',   icon: 'add_photo_alternate', label: 'New' },
  { path: '/history',  icon: 'history',             label: 'Listings' },
  { path: '/insights', icon: 'bar_chart',            label: 'Insights' },
  { path: '/settings', icon: 'manage_accounts',      label: 'Settings' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="flex justify-around items-center pt-2 pb-1">
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const active = pathname === path
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? 'text-primary' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className={`material-symbols-outlined ${active ? 'fill-icon' : ''}`}>{icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
