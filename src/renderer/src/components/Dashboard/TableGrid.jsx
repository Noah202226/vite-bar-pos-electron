import React, { useEffect } from 'react'
import { useOrderStore } from '../../store/useOrderStore'
import { Crown, User, Receipt, CalendarCheck } from 'lucide-react'

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
          const tableOrder = floorStatus.find((o) => String(o.tableNumber) === String(zone.id))
          const isSelected = activeOrder?.tableNumber === zone.id

          // LOGIC: Occupied if there are items (total > 0)
          const hasTotal = tableOrder?.total > 0
          const isReserved = tableOrder?.isReserved
          const isOccupied = hasTotal || isReserved
          const isVip = zone.type === 'vip'

          return (
            <button
              key={zone.id}
              onClick={() => loadTableOrder(zone.id)}
              onContextMenu={(e) => {
                e.preventDefault() // Right click to reserve
                useOrderStore.getState().toggleReservation(zone.id)
              }}
              className={`
        relative rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 group
        ${
          isSelected
            ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.4)]'
            : isReserved
              ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
              : hasTotal
                ? 'bg-slate-900 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]'
                : 'bg-slate-900/40 border-slate-800'
        }
      `}
            >
              <div className="absolute top-4 right-4 flex gap-2">
                {isReserved && <CalendarCheck size={14} className="text-amber-500 animate-pulse" />}
                {hasTotal && <User size={14} className="text-indigo-400" />}
                {isVip && <Crown size={14} className="text-amber-400/50" />}
              </div>

              <span
                className={`text-3xl font-black tracking-tighter ${isSelected ? 'text-white' : isOccupied ? 'text-indigo-100' : 'text-slate-600'}`}
              >
                {zone.label}
              </span>

              <div className="h-6 flex items-center justify-center">
                {hasTotal ? (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isSelected ? 'bg-black/20' : 'bg-indigo-500/20'}`}
                  >
                    <span
                      className={`text-[10px] font-black ${isSelected ? 'text-indigo-200' : 'text-indigo-400'}`}
                    >
                      ₱{tableOrder.total.toLocaleString()}
                    </span>
                  </div>
                ) : isReserved ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                    RESERVED
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
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
