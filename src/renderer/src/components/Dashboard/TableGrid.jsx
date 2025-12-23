import React, { useEffect } from 'react'
import { useOrderStore } from '../../store/useOrderStore'
import { Crown, User, CalendarCheck, ShoppingBag } from 'lucide-react'

export default function TableGrid() {
  const { loadTableOrder, activeOrder, floorStatus, fetchFloorStatus } = useOrderStore()

  // Fetch status when component mounts
  useEffect(() => {
    fetchFloorStatus()
    const interval = setInterval(fetchFloorStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const zones = [
    { id: 'V1', type: 'vip', label: 'V1' },
    { id: 'V2', type: 'vip', label: 'V2' },
    { id: 'V3', type: 'vip', label: 'V3' },
    { id: 'V4', type: 'vip', label: 'V4' },
    { id: '1', type: 'standard', label: '1' },
    { id: '2', type: 'standard', label: '2' },
    { id: '3', type: 'standard', label: '3' },
    { id: '4', type: 'standard', label: '4' },
    { id: '5', type: 'standard', label: '5' },
    { id: '6', type: 'standard', label: '6' },
    { id: '7', type: 'standard', label: '7' },
    { id: '8', type: 'standard', label: '8' }
    // { id: '9', type: 'standard', label: '9' },
    // { id: '10', type: 'standard', label: '10' }
  ]

  // --- TAKEOUT LOGIC ---
  const takeoutId = 'TAKEOUT'
  const takeoutOrder = floorStatus.find((o) => String(o.tableNumber) === takeoutId)
  const isTakeoutSelected = activeOrder?.tableNumber === takeoutId
  const takeoutHasTotal = takeoutOrder?.total > 0

  return (
    <div className="flex-1 p-8 bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end shrink-0 p-2">
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
          <div className="flex items-center gap-2">
            <CalendarCheck size={14} className="text-amber-500" />
            Reserved
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
        {/* Divider */}
        <div className="h-px bg-slate-800 w-full shrink-0" />

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4 pb-4">
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
                  relative rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 group h-28 hover:border-slate-600 cursor-pointer
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
                  {isReserved && (
                    <CalendarCheck size={14} className="text-amber-500 animate-pulse" />
                  )}
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

        {/* TAKEOUT BUTTON (Added here) */}
        <button
          onClick={() => loadTableOrder(takeoutId)}
          className={`
            w-full relative rounded-3xl border transition-all duration-300 flex items-center justify-between px-4 py-2 group shrink-0
            ${
              isTakeoutSelected
                ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.4)]'
                : takeoutHasTotal
                  ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:cursor-pointer'
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${isTakeoutSelected ? 'bg-white/20' : 'bg-slate-800'}`}
            >
              <ShoppingBag
                size={24}
                className={isTakeoutSelected ? 'text-white' : 'text-slate-400'}
              />
            </div>
            <div className="flex flex-col items-start">
              <span
                className={`text-xl font-black tracking-tighter ${isTakeoutSelected ? 'text-white' : 'text-slate-200'}`}
              >
                TAKEOUT / TO-GO
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-widest ${isTakeoutSelected ? 'text-indigo-200' : 'text-slate-500'}`}
              >
                Walk-in Orders
              </span>
            </div>
          </div>

          <div className="flex items-center">
            {takeoutHasTotal ? (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${isTakeoutSelected ? 'bg-black/20' : 'bg-emerald-500/20'}`}
              >
                <span
                  className={`text-sm font-black ${isTakeoutSelected ? 'text-white' : 'text-emerald-400'}`}
                >
                  ₱{takeoutOrder.total.toLocaleString()}
                </span>
              </div>
            ) : (
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${isTakeoutSelected ? 'text-indigo-200' : 'text-slate-600'}`}
              >
                NO ACTIVE ORDERS
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
