import React, { useEffect, useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { Package, Save, CheckCircle2, Layers, AlertTriangle } from 'lucide-react'

export default function AddProduct() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { categories, fetchCategories } = useCartStore()

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    currentStock: 0,
    lowStockAlert: 5,
    status: 'available'
  })

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categories[0].name }))
    }
  }, [categories])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        currentStock: parseInt(formData.currentStock),
        lowStockAlert: parseInt(formData.lowStockAlert)
      }

      const result = await window.api.addProduct(payload)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          setFormData({
            name: '',
            price: '',
            category: categories[0]?.name || '',
            currentStock: 0,
            lowStockAlert: 5,
            status: 'available'
          })
        }, 1500)
      }
    } catch (err) {
      console.error('Failed to add product', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#020617] text-slate-200 overflow-hidden select-none">
      {/* ---------- HEADER ---------- */}
      <div className="px-10 pt-10 pb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-white uppercase leading-none tracking-tight">
            Inventory Manager
          </h1>
          <p className="text-indigo-500/60 text-[10px] font-black tracking-[0.18em] uppercase mt-2">
            Add New Item & Set Alerts
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center shadow-2xl">
          <Package size={22} className="text-indigo-500" />
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-slate-800 to-transparent mb-8" />

      {/* ---------- FORM CONTENT ---------- */}
      <div className="flex-1 overflow-y-auto px-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-14 pb-16">
            {/* ---------- PRODUCT INFO ---------- */}
            <div className="space-y-8">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                  Product Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product title..."
                  className="w-full bg-slate-900/40 border border-slate-800/60 text-white font-bold px-5 py-4 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    Price (PHP)
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-900/40 border border-slate-800/60 text-white font-bold px-5 py-4 rounded-2xl outline-none focus:border-emerald-500/50 focus:bg-slate-900 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900/40 border border-slate-800/60 text-white font-bold px-5 py-4 rounded-2xl outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name} className="bg-slate-950">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ---------- STOCK CONTROL ---------- */}
            <div className="mt-14 p-7 bg-indigo-500/3 border border-indigo-500/10 rounded-[2.5rem] space-y-5">
              <div className="flex items-center gap-3">
                <Layers size={16} className="text-indigo-400" />
                <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.18em]">
                  Stock Control
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Current Stock
                  </label>
                  <div className="relative">
                    <Layers
                      size={16}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"
                    />
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800/60 text-white font-bold px-5 py-4 pl-14 rounded-2xl outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    Low Stock Alert At
                  </label>
                  <div className="relative">
                    <AlertTriangle
                      size={16}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600"
                    />
                    <input
                      type="number"
                      value={formData.lowStockAlert}
                      onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800/60 text-white font-bold px-5 py-4 pl-14 rounded-2xl outline-none focus:border-amber-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-600 italic px-1">
                * The system will highlight this item when quantity drops below the alert threshold.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="px-10 py-8 border-t border-slate-800/60 flex gap-6 items-center">
        <button
          type="button"
          onClick={() => window.close()}
          className="px-8 py-4 font-black text-[11px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className={`flex-1 py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95
            ${success ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40'}
          `}
        >
          {loading ? (
            <span className="animate-pulse">Processing...</span>
          ) : success ? (
            <>
              <CheckCircle2 size={18} /> Product Saved
            </>
          ) : (
            <>
              <Save size={18} /> Save Product
            </>
          )}
        </button>
      </div>
    </div>
  )
}
