import React, { useState, useMemo, useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'
import {
  Boxes,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  X,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react'

export default function ProductInventoryList() {
  const { products, categories, fetchProducts, fetchCategories } = useCartStore()

  // --- Local State for UI ---
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // --- CRUD State ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form State (empty for new, populated for edit)
  const [formData, setFormData] = useState({
    _id: null,
    name: '',
    category: '',
    price: '',
    stock: '',
    lowStock: 5
  })

  // --- Initial Data Load ---
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()])
      } catch (error) {
        console.error('Failed to load inventory:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadData()
  }, [fetchProducts, fetchCategories])

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    const baseProducts = products || []
    return baseProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  // --- Handlers ---

  const handleAddNew = () => {
    setFormData({
      _id: null,
      name: '',
      category: categories[0]?.name || '',
      price: '',
      stock: '',
      lowStock: 5
    })
    setIsModalOpen(true)
  }

  const handleEdit = (product) => {
    setFormData({
      _id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      lowStock: product.lowStock
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    try {
      const result = await window.api.deleteProduct(id)
      if (result.success) {
        fetchProducts() // Refresh list
      } else {
        alert('Failed to delete: ' + result.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Format data for DB (convert strings to numbers)
      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStock: parseInt(formData.lowStock)
      }

      let result
      if (formData._id) {
        // UPDATE
        result = await window.api.updateProduct(formData._id, payload)
      } else {
        // CREATE
        result = await window.api.addProduct(payload)
      }

      if (result.success) {
        setIsModalOpen(false)
        fetchProducts() // Refresh List
      } else {
        alert('Operation failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // --- Loading View ---
  if (isInitialLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/50 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          Syncing Inventory...
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 select-none relative">
      {/* --- HEADER --- */}
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between gap-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProducts()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-indigo-400 hover:bg-slate-900 transition-all"
          >
            <RefreshCw size={14} />
          </button>

          {/* Add New Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Add Product</span>
          </button>
        </div>
      </div>

      {/* --- CATEGORY TABS --- */}
      <div className="px-6 py-3 border-b border-slate-900 bg-slate-900/20 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            selectedCategory === 'All'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              selectedCategory === cat.name
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* --- PRODUCT TABLE --- */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
            <Search size={32} className="opacity-20" />
            <span className="text-[10px] uppercase font-bold tracking-widest">
              No matching items found
            </span>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4">
                <th className="pb-2 pl-4">Product Name</th>
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Unit Price</th>
                <th className="pb-2 text-center">In Stock</th>
                <th className="pb-2 text-center">Status</th>
                <th className="pb-2 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="bg-slate-900/40 border border-slate-800 group hover:bg-slate-800/60 transition-all"
                >
                  <td className="py-3 pl-4 rounded-l-2xl">
                    <span className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-indigo-400">
                    ₱{product.price?.toFixed(2)}
                  </td>
                  <td className="py-3 text-center">
                    <div
                      className={`flex items-center justify-center gap-1.5 font-bold ${product.stock <= product.lowStock ? 'text-amber-500' : 'text-slate-400'}`}
                    >
                      <Boxes size={12} />
                      {product.stock}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {product.stock <= product.lowStock ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[8px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <AlertCircle size={10} /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Stable
                      </span>
                    )}
                  </td>
                  {/* Action Buttons */}
                  <td className="py-3 text-right rounded-r-2xl pr-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- CRUD MODAL --- */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                {formData._id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Product Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                    placeholder="e.g. Iced Vanilla Latte"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Price (₱)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Current Stock
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Low Stock Alert
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.lowStock}
                    onChange={(e) => setFormData({ ...formData, lowStock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {formData._id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
