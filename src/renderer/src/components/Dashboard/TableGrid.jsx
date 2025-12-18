import React, { useEffect } from 'react'
import { useOrderStore } from '../../store/useOrderStore'
import { Crown, User, Receipt } from 'lucide-react'

export default function TableGrid() {
  const { loadTableOrder, activeOrder, floorStatus, fetchFloorStatus } = useOrderStore()

  // Fetch status when component mounts (and optionally set an interval for real-time updates)
  useEffect(() => {
    fetchFloorStatus()
    const interval = setInterval(fetchFloorStatus, 5000) // Poll every 5s for updates from other waiters
    return () => clearInterval(interval)
  }, [])

  // DEBUG LOG: Open "View > Toggle Developer Tools" in your app to see this
  console.log('Current Floor Status:', floorStatus)

  const zones = [
    { id: 'V1', type: 'vip', label: 'V1' },
    { id: 'V2', type: 'vip', label: 'V2' },
    { id: '1', type: 'standard', label: '1' },
    { id: '2', type: 'standard', label: '2' },
    { id: '3', type: 'standard', label: '3' },
    { id: '4', type: 'standard', label: '4' },
    { id: '5', type: 'standard', label: '5' },
    { id: '6', type: 'standard', label: '6' },
    { id: '7', type: 'standard', label: '7' },
    { id: '8', type: 'standard', label: '8' }
  ]

  return (
    <div className="flex-1 p-8 bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Floor Management</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Live Zone Status
          </p>
        </div>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-800" /> Empty
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />{' '}
            Occupied
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" /> VIP
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-5 gap-4">
        {zones.map((zone) => {
          // Find if this table has an open order in our floorStatus array
          const tableOrder = floorStatus.find((o) => o.tableNumber === zone.id)

          // Check if it's the one currently selected by YOU
          const isSelected = activeOrder?.tableNumber === zone.id

          const isOccupied = !!tableOrder
          const isVip = zone.type === 'vip'

          return (
            <button
              key={zone.id}
              onClick={() => loadTableOrder(zone.id)}
              className={`
                relative rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 group
                ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.4)] scale-[1.02] z-10'
                    : isOccupied
                      ? 'bg-slate-900 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]'
                      : isVip
                        ? 'bg-slate-900/40 border-amber-500/20 hover:border-amber-500/50 hover:bg-slate-900'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }
              `}
            >
              {/* Top Icons */}
              <div className="absolute top-4 right-4 flex gap-2">
                {isVip && (
                  <Crown size={14} className={isOccupied ? 'text-amber-400' : 'text-amber-900'} />
                )}
                {isOccupied && <User size={14} className="text-indigo-400" />}
              </div>

              {/* Table Number */}
              <span
                className={`text-3xl font-black tracking-tighter ${isSelected ? 'text-white' : isOccupied ? 'text-indigo-100' : 'text-slate-600'}`}
              >
                {zone.label}
              </span>

              {/* Status / Amount Display */}
              <div className="h-6 flex items-center justify-center">
                {isOccupied ? (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isSelected ? 'bg-black/20' : 'bg-indigo-500/20'}`}
                  >
                    <span
                      className={`text-[10px] font-black ${isSelected ? 'text-indigo-200' : 'text-indigo-400'}`}
                    >
                      ₱{tableOrder.total.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 group-hover:text-slate-600">
                    EMPTY
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
