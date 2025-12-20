import React, { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import OrderSidebar from './OrderSidebar'
import ProductGrid from './ProductGrid'
import TableGrid from './TableGrid'
import ProductInventoryList from './ProductInventoryList' // <--- New Component
import OperationsSidebar from './OperationsSidebar'
import { Megaphone } from 'lucide-react'
import { useOrderStore } from '../../store/useOrderStore'

export default function Dashboard({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { activeOrder } = useOrderStore()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <DashboardHeader user={user} currentTime={currentTime} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden">
        <OrderSidebar />

        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 border-r border-slate-900">
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* 1. TOP SECTION: Tables or Active Order Grid */}
            <div
              className={
                !activeOrder ? 'h-[60%] border-b border-slate-900 overflow-hidden' : 'flex-1'
              }
            >
              {!activeOrder ? <TableGrid /> : <ProductGrid />}
            </div>

            {/* 2. BOTTOM SECTION: Product Inventory Listing (Only shows when no active order) */}
            {!activeOrder && (
              <div className="h-[40%] flex flex-col bg-slate-950/50">
                <ProductInventoryList />
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="h-16 bg-slate-900/50 border-t border-slate-900 flex items-center px-6 gap-4 shrink-0">
            <div className="flex items-center gap-2 shrink-0">
              <Megaphone size={14} className="text-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Promos:
              </span>
            </div>
            <div className="flex gap-3 overflow-hidden text-[10px] font-bold uppercase tracking-tight text-indigo-400">
              <span className="bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Happy Hour 2-for-1
              </span>
              <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-400">
                VIP Table 10% Off
              </span>
            </div>
          </footer>
        </main>

        <OperationsSidebar />
      </div>
    </div>
  )
}
