import React from 'react'
import { Receipt, Trash2, Plus, Minus } from 'lucide-react'
import { useOrderStore } from '../../store/useOrderStore'

export default function OrderSidebar() {
  const { activeOrder, isLoading, checkout, voidItem, addItem } = useOrderStore()

  return (
    <aside className="w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col shadow-inner">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="font-black uppercase tracking-widest text-slate-500 text-xs">
          Current Ticket
        </h2>
        {activeOrder && (
          <div className="flex items-center gap-2 bg-indigo-600 px-3 py-1 rounded-full shadow-lg shadow-indigo-600/20">
            <span className="text-[10px] font-black text-white">
              TABLE {activeOrder.tableNumber}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-indigo-500 animate-pulse font-black uppercase text-xs tracking-widest">
            Syncing Database...
          </div>
        ) : !activeOrder ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700">
            <Receipt size={64} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-sm font-bold tracking-widest uppercase opacity-40">
              No Table Selected
            </p>
          </div>
        ) : activeOrder.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700">
            <p className="text-[10px] font-black tracking-widest uppercase opacity-40 text-center">
              Table is empty.
              <br />
              Add items to begin.
            </p>
          </div>
        ) : (
          activeOrder.items.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-200 group-hover:text-white transition-colors">
                  {item.name}
                </span>
                <span className="font-black text-white">
                  ₱{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-3 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {/* VOID BUTTON */}
                  <button
                    onClick={() => voidItem(item.productId)}
                    className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-md transition-colors"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>

                  <span className="text-xs font-black text-white min-w-5 text-center">
                    {item.quantity}
                  </span>

                  {/* OPTIONAL ADD BUTTON (Matches the flow) */}
                  <button
                    onClick={() => addItem(item)}
                    className="p-1.5 hover:bg-indigo-500/20 text-indigo-500 rounded-md transition-colors"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded border italic font-medium ${
                    item.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 bg-slate-950 border-t border-slate-800 rounded-t-4xl">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Subtotal</span>
            <span>₱{activeOrder?.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-white pt-3 border-t border-slate-800">
            <span className="tracking-tighter">TOTAL DUE</span>
            <span className="text-indigo-400">₱{activeOrder?.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <button
          onClick={() => checkout()}
          disabled={
            !activeOrder || !activeOrder.items || activeOrder.items.length === 0 || isLoading
          }
          className={`w-full py-4 font-black rounded-xl transition-all shadow-lg 
    ${
      !activeOrder || !activeOrder.items || activeOrder.items.length === 0
        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
    }
  `}
        >
          PLACE & PRINT ORDER
        </button>
      </div>
    </aside>
  )
}
