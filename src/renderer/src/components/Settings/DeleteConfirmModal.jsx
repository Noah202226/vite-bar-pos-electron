import React from 'react'
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react'

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  loading
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-red-500/20" />

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              {itemName || 'Confirm Deletion'}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-white font-bold">"{itemName}"</span>? This action cannot be
              undone and may affect associated records.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-[1.5] px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete Permanently
                </>
              )}
            </button>
          </div>
        </div>

        {/* Subtle Footer Tag */}
        <div className="px-8 py-4 bg-slate-950/50 border-t border-slate-800/50 flex justify-center">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
            System Security Protocol Active
          </p>
        </div>
      </div>
    </div>
  )
}
