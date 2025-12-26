import React, { useState, useMemo, useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'
import { useOrderStore } from '../../store/useOrderStore' // <--- 1. IMPORT ADDED
import {
  Boxes,
  Loader2,
  RefreshCw,
  Search,
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  TriangleAlert,
  History
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'
import { useHistoryStore } from '../../store/useHistoryStore'

export default function ProductInventoryList() {
  const { products, categories, fetchProducts, fetchCategories } = useCartStore()
  const { addToOrder } = useOrderStore() // <--- 2. GET ORDER FUNCTION
  const { user } = useAuthStore((state) => state)
  const { openProductHistory } = useHistoryStore()

  // --- New Modal States ---
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrderProduct, setSelectedOrderProduct] = useState(null)
  const [orderQty, setOrderQty] = useState(1)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false) // <--- Loading state for order

  // --- Local State for UI ---
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const initialFormState = {
    _id: null,
    name: '',
    category: '',
    price: '',
    currentStock: '',
    lowStockAlert: 5,
    createdBy: ''
  }
  const [formData, setFormData] = useState(initialFormState)

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

  const handleAdd = () => {
    setFormData(initialFormState)
    if (categories.length > 0) {
      setFormData((prev) => ({ ...prev, category: categories[0].name }))
    }
    setIsModalOpen(true)
  }

  const handleEdit = (product) => {
    setFormData({
      _id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      currentStock: product.currentStock,
      lowStockAlert: product.lowStockAlert,
      lastModifiedBy: product.lastModifiedBy || 'Unknown'
    })
    setIsModalOpen(true)
  }

  const confirmDelete = (product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleOpenOrder = (product) => {
    if (product.currentStock <= 0) {
      toast.error('Product is out of stock!')
      return
    }
    setSelectedOrderProduct(product)
    setOrderQty(1)
    setIsOrderModalOpen(true)
  }

  // --- UPDATED: Handle Confirm Order ---
  const handleConfirmOrder = async () => {
    if (!selectedOrderProduct) return
    setIsProcessingOrder(true)
    const toastId = toast.loading('Processing order...')

    try {
      // ONLY call the store action.
      // The store will handle the DB update, the logging, and the stock.
      await addToOrder('TAKEOUT', {
        id: selectedOrderProduct._id,
        name: selectedOrderProduct.name,
        price: selectedOrderProduct.price,
        quantity: orderQty
      })

      toast.success(`Added ${orderQty}x ${selectedOrderProduct.name} to Takeout`, { id: toastId })

      // Refresh the list to show new stock (since the store updated it in the DB)
      if (fetchProducts) fetchProducts()

      setIsOrderModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(`Order processing failed`, { id: toastId })
    } finally {
      setIsProcessingOrder(false)
    }
  }

  const handleDelete = async (id) => {
    if (!productToDelete) return
    const toastId = toast.loading('Deleting product...')

    try {
      const logData = {
        type: 'VOID_DELETE',
        user: user?.username || 'Unknown',
        timestamp: new Date().toISOString(),
        note: `Product "${productToDelete.name}" permanently removed.`
      }

      const result = await window.api.deleteProduct(productToDelete._id, logData)

      if (result.success) {
        fetchProducts()
        toast.success('Product and history archived', { id: toastId })
        setIsDeleteModalOpen(false)
      } else {
        toast.error(result.error || 'Delete failed', { id: toastId })
      }
    } catch (err) {
      toast.error('A system error occurred', { id: toastId })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const toastId = toast.loading(formData._id ? 'Updating product...' : 'Creating product...')

    try {
      const currentUser = user?.username || 'Unknown'

      const payload = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        currentStock: parseInt(formData.currentStock),
        lowStockAlert: parseInt(formData.lowStockAlert),
        createdBy: currentUser
      }

      const logData = {
        user: currentUser,
        timestamp: new Date().toISOString(),
        type: formData._id ? 'UPDATE' : 'INITIAL_SETUP',
        stockAtEvent: payload.currentStock,
        note: formData._id ? `Manual update by ${currentUser}` : 'Product first entry'
      }

      let result
      if (formData._id) {
        result = await window.api.updateProduct(formData._id, { ...payload, logData })
      } else {
        result = await window.api.addProduct({ ...payload, logData })
      }

      if (result.success) {
        setIsModalOpen(false)
        fetchProducts()
        toast.success(`Inventory updated and logged`, { id: toastId })
      } else {
        toast.error(result.error || 'Failed', { id: toastId })
      }
    } catch (error) {
      toast.error('Check your connection or data format', { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

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
            title="Refresh List"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add Product</span>
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
                <th className="pb-2 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="bg-slate-900/40 border border-slate-800 group hover:bg-slate-800/60 transition-all"
                >
                  <td
                    className="py-3 pl-4 rounded-l-2xl cursor-pointer group/name"
                    onClick={() => handleOpenOrder(product)}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200 text-sm group-hover/name:text-indigo-400 transition-colors">
                        {product.name}
                      </span>
                      <span className="text-[9px] text-slate-600 uppercase tracking-tighter">
                        Click to Order
                      </span>
                    </div>
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
                      className={`flex items-center justify-center gap-1.5 font-bold ${product.currentStock <= product.lowStockAlert ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}
                    >
                      <Boxes size={12} />
                      {product.currentStock}
                    </div>
                  </td>

                  <td className="py-3 text-right rounded-r-2xl pr-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user?.role == 'Admin' && (
                        <button
                          onClick={() => openProductHistory(product._id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                          title="View Product History"
                        >
                          <History size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => confirmDelete(product)}
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
        <div className="absolute inset-0 z-50 top-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-700"
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
                    {categories.length === 0 && <option>Loading...</option>}
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
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
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
                    value={formData.lowStockAlert}
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: e.target.value })}
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

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
                <TriangleAlert size={32} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                Archive Product?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to delete{' '}
                <span className="text-indigo-400 font-bold">{productToDelete?.name}</span>. This
                will create a <span className="text-rose-500 font-bold uppercase">Void</span> log in
                the monitoring system.
              </p>
            </div>
            <div className="flex border-t border-slate-800">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-600 hover:text-white transition-colors border-l border-slate-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAKE OUT ORDER MODAL --- */}
      {isOrderModalOpen && (
        <div className="absolute inset-0 z-9999 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="p-2 text-center border-b border-slate-800 bg-slate-800/30">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">
                New Takeout Order
              </p>
              <h3 className="text-lg font-bold text-white">{selectedOrderProduct?.name}</h3>
              <p className="text-xs text-slate-500 font-mono">
                ₱{selectedOrderProduct?.price.toFixed(2)} per unit
              </p>
            </div>

            <div className="p-4 flex flex-col items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                  className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 active:scale-90 transition-all border border-slate-700"
                >
                  <span className="text-2xl font-bold">-</span>
                </button>

                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-white">{orderQty}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
                    Quantity
                  </span>
                </div>

                <button
                  onClick={() =>
                    setOrderQty(Math.min(selectedOrderProduct?.currentStock, orderQty + 1))
                  }
                  className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 active:scale-90 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Total Summary */}
              <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Total Amount
                </span>
                <span className="text-xl font-black text-indigo-400">
                  ₱{(selectedOrderProduct?.price * orderQty).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex border-t border-slate-800">
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition-colors"
                disabled={isProcessingOrder}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={isProcessingOrder}
                className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 transition-colors border-l border-slate-800 flex justify-center items-center gap-2"
              >
                {isProcessingOrder && <Loader2 className="animate-spin" size={12} />}
                {isProcessingOrder ? 'PROCESSING...' : 'ADD TO TAKEOUT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
