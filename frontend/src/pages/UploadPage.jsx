import { useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import ModelSelector from '../components/ModelSelector'
import HamburgerMenu from '../components/HamburgerMenu'
import BottomNav from '../components/BottomNav'

const MARKETPLACES = [
  { id: 'amazon',  label: 'Amazon',  logo: '/marketplaces/amazon.png' },
  { id: 'etsy',    label: 'Etsy',    logo: '/marketplaces/etsy.png' },
  { id: 'ebay',    label: 'eBay',    logo: '/marketplaces/ebay.png' },
  { id: 'walmart', label: 'Walmart', logo: '/marketplaces/walmart.svg' },
  { id: 'shopify', label: 'Shopify', logo: '/marketplaces/shopify.png' },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const { images, notes, marketplace, setImages, setNotes, setMarketplace } = useStore()

  const imageUrls = useMemo(
    () => images.map((img) => URL.createObjectURL(img)),
    [images]
  )

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
          <img src="/logo.png" alt="ListMate" className="size-8 rounded-lg" />
          <h1 className="text-xl font-bold tracking-tight">ListMate</h1>
        </div>
        <HamburgerMenu />
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
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/50 hover:border-primary transition-colors overflow-hidden"
                >
                  {imageUrls[i] ? (
                    <img src={imageUrls[i]} className="w-full h-full object-cover" alt={`upload ${i + 1}`} />
                  ) : i === 0 ? (
                    <>
                      <span className="material-symbols-outlined text-primary">add_a_photo</span>
                      <span className="text-xs font-medium">Main</span>
                    </>
                  ) : (
                    <span className="material-symbols-outlined text-slate-400">add</span>
                  )}
                </div>
              ))}
            </div>
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
            {MARKETPLACES.map(({ id, label, logo }) => (
              <button
                key={id}
                onClick={() => setMarketplace(id)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div className={`size-16 rounded-xl bg-white dark:bg-white border-2 flex items-center justify-center p-2 shadow-sm transition-all active:scale-95 ${
                  marketplace === id ? 'border-primary' : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <img src={logo} alt={label} className="w-full h-full object-contain" />
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
        <BottomNav />
      </div>
    </div>
  )
}
