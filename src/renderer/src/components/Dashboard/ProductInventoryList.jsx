import React, { useState, useMemo, useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'
import { Boxes, AlertCircle, Loader2, RefreshCw, Search, X } from 'lucide-react'

export default function ProductInventoryList() {
  const { products, categories, fetchProducts, fetchCategories } = useCartStore()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

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

  // Filter logic: Handles both Category selection AND Search input
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
    <div className="flex flex-col h-full bg-slate-950 select-none">
      {/* Header with Search and Refresh */}
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between gap-6">
        {/* Search Input */}
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

        <button
          onClick={() => fetchProducts()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-indigo-400 hover:bg-slate-900 transition-all"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Category Filter Bar */}
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

      {/* Product Table */}
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
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="bg-slate-900/40 border border-slate-800 group hover:bg-slate-800/60 transition-all cursor-default"
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
                      className={`flex items-center justify-center gap-1.5 font-bold ${
                        product.stock <= product.lowStock ? 'text-amber-500' : 'text-slate-400'
                      }`}
                    >
                      <Boxes size={12} />
                      {product.stock}
                    </div>
                  </td>
                  <td className="py-3 text-center rounded-r-2xl pr-4">
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
