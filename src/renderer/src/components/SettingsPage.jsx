import React, { useEffect, useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import {
  X,
  FolderPlus,
  Users,
  Monitor,
  ShieldCheck,
  ChevronRight,
  Tag,
  AlertCircle,
  Trash2,
  Loader2
} from 'lucide-react'
import DeleteConfirmModal from './Settings/DeleteConfirmModal'

// --- CATEGORY SETTINGS SUB-COMPONENT ---
import toast, { Toaster } from 'react-hot-toast'
import { Plus } from 'lucide-react' // Add Plus to your imports

function CategorySettings() {
  const { categories, fetchCategories } = useCartStore()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, id: null, name: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // --- ADD CATEGORY LOGIC ---
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setIsAdding(true)
    const addPromise = window.api.addCategory(newCategoryName.trim())

    toast.promise(
      addPromise,
      {
        loading: 'Creating category...',
        success: (result) => {
          if (result.success) {
            setNewCategoryName('')
            fetchCategories()
            return `Category "${result.category.name}" added!`
          }
          throw new Error(result.error || 'Failed to add')
        },
        error: (err) => `${err.message}`
      },
      {
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '900',
          textTransform: 'uppercase',
          padding: '16px'
        },
        success: {
          iconTheme: { primary: '#4f46e5', secondary: '#fff' }
        }
      }
    )

    try {
      await addPromise
    } catch (error) {
      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  const openDeleteModal = (id, name) => {
    setModalConfig({ isOpen: true, id, name })
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    const deletePromise = window.api.deleteCategory(modalConfig.id)

    toast.promise(
      deletePromise,
      {
        loading: 'Deleting...',
        success: (result) => {
          if (result.success) {
            fetchCategories()
            setModalConfig({ ...modalConfig, isOpen: false })
            return `Category removed.`
          }
          throw new Error(result.error || 'Failed to delete')
        },
        error: (err) => `${err.message}`
      },
      {
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '900',
          textTransform: 'uppercase',
          padding: '16px'
        }
      }
    )

    try {
      await deletePromise
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ADD CATEGORY INPUT SECTION */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Tag
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Enter new category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory(e)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600 uppercase tracking-widest"
            />
          </div>
          <button
            onClick={handleAddCategory}
            disabled={isAdding || !newCategoryName.trim()}
            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">Add Category</span>
          </button>
        </div>
      </div>

      {/* CATEGORY LIST SECTION */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Menu Categories
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
              Manage your classification tags
            </p>
          </div>
          <FolderPlus size={18} className="text-indigo-500" />
        </div>

        <div className="p-4 space-y-2 max-h-100 overflow-y-auto custom-scrollbar">
          {categories.length === 0 ? (
            <div className="py-10 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              No categories found
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <span className="text-xs font-black text-indigo-500">
                      {cat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">
                    {cat.name}
                  </span>
                </div>

                <button
                  onClick={() => openDeleteModal(cat._id, cat.name)}
                  className="p-2 rounded-xl text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-amber-500/5 border-t border-slate-800 flex gap-3 items-start">
          <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
            * Warning: Deleting a category does not delete the products inside it.
          </p>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={modalConfig.isOpen}
        loading={isDeleting}
        itemName={modalConfig.name}
        title="Delete Category"
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmDelete}
      />
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
