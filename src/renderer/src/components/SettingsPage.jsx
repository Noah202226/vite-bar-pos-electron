import React, { useEffect, useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { X, FolderPlus, Users, Monitor, ShieldCheck, ChevronRight } from 'lucide-react'

// --- CATEGORY SETTINGS SUB-COMPONENT ---
function CategorySettings() {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const { categories, setCategories, fetchCategories } = useCartStore()

  useEffect(() => {
    if (categories.length === 0) fetchCategories()
  }, [fetchCategories, categories.length])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setLoading(true)
    const result = await window.api.addCategory(newCategoryName.trim())

    if (result.success) {
      setCategories([...categories, result.category])
      setNewCategoryName('')
    } else {
      alert('Error: ' + result.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="text-xl font-black text-white tracking-tight mb-1">Product Categories</h3>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">
          Organize your menu structure
        </p>
      </div>

      <form onSubmit={handleAddCategory} className="flex gap-3">
        <input
          type="text"
          placeholder="New Category Name..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700 font-bold"
          required
        />
        <button
          type="submit"
          disabled={loading || !newCategoryName.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black px-6 rounded-xl transition-all flex items-center gap-2"
        >
          {loading ? '...' : <FolderPlus size={18} />}
          ADD
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group hover:border-indigo-500/50 transition-all"
          >
            <span className="text-slate-200 font-bold tracking-tight">{cat.name}</span>
            <ChevronRight
              size={14}
              className="text-slate-600 group-hover:text-indigo-400 transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// --- MAIN SETTINGS PAGE ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('categories')

  const tabs = [
    { id: 'categories', name: 'Categories', icon: <FolderPlus size={18} /> },
    { id: 'users', name: 'Users', icon: <Users size={18} /> },
    { id: 'system', name: 'System', icon: <Monitor size={18} /> },
    { id: 'security', name: 'Security', icon: <ShieldCheck size={18} /> }
  ]

  const handleClose = () => {
    window.close() // Close the electron window
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-300 flex flex-col overflow-hidden border border-slate-800 rounded-3xl">
      {/* CUSTOM TITLE BAR (For Frameless Window) */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 drag">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
          <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Terminal Admin v1.0
          </span>
        </div>
        <button
          onClick={handleClose}
          className="no-drag p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT NAV BAR */}
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-10 bg-linear-to-b from-slate-950 to-slate-900">
          {activeTab === 'categories' && <CategorySettings />}
          {activeTab === 'users' && (
            <div className="text-slate-600 italic">User Management Module...</div>
          )}
          {activeTab === 'system' && (
            <div className="text-slate-600 italic">System Preference Module...</div>
          )}
          {activeTab === 'security' && (
            <div className="text-slate-600 italic">Access Control Module...</div>
          )}
        </main>
      </div>
    </div>
  )
}
