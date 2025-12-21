import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Search,
  Loader2,
  PhilippinePeso,
  ChartColumnStacked,
  LampWallDown,
  Sparkles
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'

// --- REAL-TIME CLOCK COMPONENT ---
function RealTimeClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-right">
      <div className="text-white font-black text-xs tracking-widest">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-indigo-500 text-[9px] font-bold uppercase tracking-tighter">
        {now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </div>
  )
}

// --- ADD PRODUCT FORM COMPONENT ---
function AddProductForm() {
  const { categories, fetchProducts, fetchCategories } = useCartStore()
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    currentStock: '',
    lowStockAlert: 5
  })

  useEffect(() => {
    const sync = async () => {
      if (!user) {
        const result = await window.api.checkSession()
        if (result?.isLoggedIn) setUser(result.user)
      }
      fetchCategories()
      fetchProducts()
    }
    sync()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.category || !formData.price) {
      return toast.error('Please fill in required fields')
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        currentStock: parseInt(formData.currentStock) || 0,
        lowStockAlert: parseInt(formData.lowStockAlert) || 0,
        createdBy: user?.username || 'System'
      }

      const result = await window.api.addProduct(payload)
      if (result.success) {
        toast.success(`${formData.name} added to inventory!`)
        setFormData({ name: '', category: '', price: '', currentStock: '', lowStockAlert: 5 })

        setIsModalOpen(false)
        fetchProducts()
        // Broadcast change to other windows if needed
        const channel = new BroadcastChannel('inventory-sync')
        channel.postMessage('PRODUCT_UPDATED')
        channel.close()

        await fetchProducts() // Refresh the global store
      }
    } catch (err) {
      toast.error('Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-slate-900/20 flex justify-between items-end">
          <div>
            <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm">
              Create New Product
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
              Authorized User:{' '}
              <span className="text-indigo-400">{user?.username || 'Authenticating...'}</span>
            </p>
          </div>
          <div className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            <span className="text-[9px] font-black text-indigo-500 uppercase">Inventory v2.0</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Product Identity
              </label>
              <div className="relative group">
                <Search
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors"
                />
                <input
                  type="text"
                  required
                  placeholder="E.G. PALE PILSEN 330ML"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all uppercase"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Classification
              </label>
              <select
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Unit Price (PHP)
              </label>
              <div className="relative">
                <PhilippinePeso
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500"
                />
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-mono font-bold text-indigo-400 outline-none focus:border-indigo-500 transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Initial Stock
              </label>
              <div className="relative">
                <ChartColumnStacked
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500"
                />
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-mono font-bold text-indigo-400 outline-none focus:border-indigo-500 transition-all"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Low Stock Threshold
              </label>
              <div className="relative">
                <LampWallDown
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500"
                />
                <input
                  type="number"
                  placeholder="5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-mono font-bold text-indigo-400 outline-none focus:border-indigo-500 transition-all"
                  value={formData.lowStockAlert}
                  onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-4 mt-4 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Add to Inventory
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}

// --- MAIN INVENTORY WINDOW ---
export default function InventoryPage() {
  const handleClose = () => window.close()

  return (
    <div className="h-screen bg-slate-950 text-slate-300 flex flex-col overflow-hidden border border-slate-800 rounded-3xl shadow-2xl">
      {/* HEADER BAR */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shrink-0 drag">
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
          <span className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400">
            Inventory Portal
          </span>
        </div>

        <div className="flex items-center gap-8 no-drag">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-500 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-12 bg-linear-to-b from-slate-950 to-slate-900 custom-scrollbar">
        <AddProductForm />
      </div>

      {/* TOASTER OVERLAY */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }
        }}
      />
    </div>
  )
}
