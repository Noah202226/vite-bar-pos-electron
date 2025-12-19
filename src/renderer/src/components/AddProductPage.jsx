import React, { useState } from 'react'
import { Package, DollarSign, Tag, Image as ImageIcon, Save, X, CheckCircle2 } from 'lucide-react'

export default function AddProduct() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'mains', // Default category
    image: '', // You can add file upload logic later
    status: 'available'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse price to number before sending
      const payload = { ...formData, price: parseFloat(formData.price) }

      const result = await window.api.addProduct(payload)

      if (result.success) {
        setSuccess(true)
        // Reset form after 1.5s
        setTimeout(() => {
          setSuccess(false)
          setFormData({ name: '', price: '', category: 'mains', image: '', status: 'available' })
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to add product', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper to close the window (if opened as a modal)
  const handleClose = () => {
    window.close()
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            Inventory Manager
          </h1>
          <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mt-1">
            Add New Item to Menu
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Package size={18} className="text-indigo-500" />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Product Name
            </label>
            <div className="relative group">
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Truffle Pasta"
                className="w-full bg-slate-900 border border-slate-800 text-white font-bold p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 placeholder:font-medium"
              />
              <Package
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Price (PHP)
              </label>
              <div className="relative group">
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-800 text-white font-bold p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 placeholder:font-medium"
                />
                <DollarSign
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Category
              </label>
              <div className="relative group">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white font-bold p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="mains">Mains</option>
                  <option value="appetizers">Appetizers</option>
                  <option value="beverages">Beverages</option>
                  <option value="desserts">Desserts</option>
                </select>
                <Tag
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-500 transition-colors"
                />
                {/* Custom Chevron */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Image Filename / URL
            </label>
            <div className="relative group">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="assets/products/pasta.png"
                className="w-full bg-slate-900 border border-slate-800 text-white font-bold p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 placeholder:font-medium"
              />
              <ImageIcon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-8 border-t border-slate-800 bg-slate-950 flex gap-4">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className={`
            flex-[2] py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg flex items-center justify-center gap-2 transition-all
            ${
              success
                ? 'bg-emerald-600 shadow-emerald-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
            }
          `}
        >
          {loading ? (
            <span className="animate-pulse">Saving...</span>
          ) : success ? (
            <>
              <CheckCircle2 size={18} /> Added Successfully
            </>
          ) : (
            <>
              <Save size={18} /> Save Item
            </>
          )}
        </button>
      </div>
    </div>
  )
}
