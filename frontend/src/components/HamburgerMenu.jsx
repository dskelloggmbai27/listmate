import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const MENU_ITEMS = [
  { icon: 'add_circle',      label: 'New Listing',      path: '/upload',    iconClass: 'text-primary' },
  { icon: 'history',         label: 'Past Listings',    path: '/history',   iconClass: 'text-slate-400' },
  { icon: 'bar_chart',       label: 'Insights',         path: '/insights',  iconClass: 'text-slate-400' },
  { icon: 'manage_accounts', label: 'Account Settings', path: '/settings',  iconClass: 'text-slate-400' },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const { reset } = useStore()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const go = (path) => {
    setOpen(false)
    if (path === '/upload') reset()   // fresh state for a new listing
    navigate(path)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        className="size-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
          {open ? 'close' : 'menu'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <div className="fixed inset-0 z-40" aria-hidden="true" />
          <div className="absolute right-0 top-12 w-56 bg-background-light dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            {MENU_ITEMS.map(({ icon, label, path, iconClass }, i) => (
              <div key={path}>
                {i > 0 && <div className="border-t border-slate-100 dark:border-slate-800" />}
                <button
                  onClick={() => go(path)}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-primary/5 active:bg-primary/10 transition-colors"
                >
                  <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>{icon}</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
