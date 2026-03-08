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
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Set the same price for all variants at once.</p>
            <div className="flex gap-2">
              <input value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} className="flex-1 bg-background-light dark:bg-slate-800 border border-primary/20 rounded-lg text-sm px-3 py-2 focus:ring-primary" placeholder="$ 0.00" />
              <button onClick={applyBulkPrice} className="px-4 py-2 bg-primary/20 text-primary rounded-lg font-bold text-sm">Apply</button>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-primary/10 bg-primary/5">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span>Bulk Stock Update
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Set global stock level for all variants.</p>
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
