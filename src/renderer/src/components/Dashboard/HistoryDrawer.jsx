import React from 'react'
import { X, History, LayoutDashboard } from 'lucide-react'
import InventoryLogTable from './InventoryLogTable'
import { useHistoryStore } from '../../store/useHistoryStore'

export default function HistoryDrawer() {
  const { isOpen, selectedProductId, closeHistory, clearFilter } = useHistoryStore()

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-998 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeHistory}
      />

      {/* 2. Side Drawer Panel */}
      <aside
        className={`
        fixed top-0 right-0 h-full z-999
        w-80 bg-slate-950 border-l border-slate-900
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        shadow-[-20px_0_50px_rgba(0,0,0,0.7)]
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
              <History size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-tight">Audit Trail</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Log Monitoring
              </p>
            </div>
          </div>
          <button
            onClick={closeHistory}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3. Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <InventoryLogTable />
        </div>

        {/* 4. Promos & Marketing (Saved Preference) */}
        {/* <div className="p-5 bg-slate-900/50 border-t border-slate-900">
          <div className="relative overflow-hidden group p-4 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-600/10">
            <LayoutDashboard className="absolute -right-2 -bottom-2 w-16 h-16 text-white/10 group-hover:rotate-12 transition-transform" />
            <p className="text-white text-[11px] font-black uppercase tracking-widest mb-1">
              Promos & Marketing
            </p>
            <p className="text-indigo-100 text-[10px] leading-relaxed">
              Unlock advanced reporting and multi-branch sync with VHYPE Pro.
            </p>
            <button className="mt-3 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors border border-white/10">
              Learn More
            </button>
          </div>
        </div> */}
      </aside>
    </>
  )
}
