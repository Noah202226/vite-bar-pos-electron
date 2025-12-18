import React, { useEffect, useState } from 'react'
import { useCartStore } from '../../store/useCartStore'
import { useOrderStore } from '../../store/useOrderStore'
import { Plus, ArrowLeft, Search, Beer } from 'lucide-react'

export default function ProductGrid() {
  const { categories, products, fetchCategories, fetchProducts } = useCartStore()
  const { addItem, activeOrder, clearActiveOrder } = useOrderStore()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  // Filter Logic: Category + Search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden animate-in fade-in duration-300">
      {/* --- GRID HEADER --- */}
      <div className="bg-slate-900/50 border-b border-slate-900 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={clearActiveOrder}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Floor Map</span>
          </button>

          <div className="h-8 w-[1px] bg-slate-800 mx-2" />

          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-tighter">
              Serving Table {activeOrder?.tableNumber}
            </h3>
            <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest">
              Session ID: {activeOrder?._id?.slice(-6)}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* --- CATEGORY SELECTOR --- */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-slate-950">
        <CategoryTab
          label="All Items"
          active={selectedCategory === 'All'}
          onClick={() => setSelectedCategory('All')}
        />
        {categories.map((cat) => (
          <CategoryTab
            key={cat._id}
            label={cat.name}
            active={selectedCategory === cat.name}
            onClick={() => setSelectedCategory(cat.name)}
          />
        ))}
      </div>

      {/* --- PRODUCT TILES --- */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {filteredProducts.map((product) => (
          <button
            key={product._id}
            onClick={() => addItem(product)}
            className="group bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col justify-between items-start gap-4 transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-95"
          >
            <div className="w-full flex justify-between items-start">
              <div className="p-2 bg-slate-800 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Beer size={20} />
              </div>
              <Plus size={16} className="text-slate-700 group-hover:text-indigo-500" />
            </div>

            <div className="text-left w-full">
              <h3 className="font-bold text-slate-200 text-xs leading-tight h-8 line-clamp-2 uppercase">
                {product.name}
              </h3>
              <div className="mt-2 flex justify-between items-end">
                <span className="text-indigo-400 font-black text-sm">
                  ₱{product.price.toFixed(2)}
                </span>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">
                  In Stock
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function CategoryTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border ${
        active
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
          : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  )
}
