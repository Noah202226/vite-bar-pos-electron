import React from 'react'
import { Receipt } from 'lucide-react'

export default function OrderSidebar({ selectedTable }) {
  return (
    <aside className="w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col shadow-inner">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="font-black uppercase tracking-widest text-slate-500 text-xs">
          Current Ticket
        </h2>
        {selectedTable && (
          <div className="flex items-center gap-2 bg-indigo-600 px-3 py-1 rounded-full shadow-lg shadow-indigo-600/20">
            <span className="text-[10px] font-black text-white">TABLE {selectedTable}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!selectedTable ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700">
            <Receipt size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-sm font-bold tracking-widest uppercase opacity-40">
              No Table Selected
            </p>
          </div>
        ) : (
          /* Cart items will be mapped here */
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 italic text-slate-500 text-center">
            Order logic goes here...
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-950 border-t border-slate-800 rounded-t-4xl">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Subtotal</span>
            <span>₱0.00</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-white pt-3 border-t border-slate-800">
            <span className="tracking-tighter">TOTAL DUE</span>
            <span className="text-indigo-400">₱0.00</span>
          </div>
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all uppercase tracking-widest text-sm">
          Place & Print Order
        </button>
      </div>
    </aside>
  )
}
