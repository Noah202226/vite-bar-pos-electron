import React, { useEffect, useState } from 'react'
import { useOrderStore } from '../../store/useOrderStore'
import { BarChart3, Calendar, FileText, Download, X, ArrowRight } from 'lucide-react' // Added X

export default function SalesReport() {
  const { salesData, fetchSalesReport } = useOrderStore()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // 1. Updated State for Range
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  // 2. Fetch whenever start or end changes
  useEffect(() => {
    fetchSalesReport(dateRange.start, dateRange.end)
  }, [dateRange.start, dateRange.end])

  const totalRevenue = salesData.reduce((acc, order) => acc + order.total, 0)

  // Function to close the current window
  const handleClose = () => {
    window.close()
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-300 flex flex-col overflow-hidden border border-slate-800 rounded-3xl">
      {/* --- CUSTOM TITLE BAR (For Frameless Window) --- */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 drag">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
          <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Sales Analytics Report
          </span>
        </div>
        <button
          onClick={handleClose}
          className="no-drag p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 p-8 overflow-y-auto bg-linear-to-b from-slate-950 to-slate-900">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              Transactions
            </h1>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">
              Terminal Sales Overview
            </p>
          </div>

          <div className="flex gap-4">
            {/* 3. Updated Date Range Pickers */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-inner">
              <div className="flex items-center gap-2 px-3 py-1">
                <Calendar size={14} className="text-indigo-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="bg-transparent text-white font-bold outline-none text-xs"
                />
              </div>

              <ArrowRight size={14} className="text-slate-700" />

              <div className="flex items-center gap-2 px-3 py-1">
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="bg-transparent text-white font-bold outline-none text-xs"
                />
              </div>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <BarChart3 size={80} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Gross Revenue
            </p>
            <h2 className="text-4xl font-black text-white tracking-tighter">
              ₱{totalRevenue.toLocaleString()}
            </h2>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Total Orders
            </p>
            <h2 className="text-4xl font-black text-white tracking-tighter">{salesData.length}</h2>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-4 border-b border-slate-800">Time</th>
                <th className="p-4 border-b border-slate-800">Table</th>
                <th className="p-4 border-b border-slate-800">Items</th>
                <th className="p-4 border-b border-slate-800 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {salesData.map((order) => (
                <tr key={order._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 text-sm font-medium text-slate-400">
                    {new Date(order.closedAt).toLocaleTimeString([], {
                      month: 'short',
                      day: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="p-4">
                    <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      Table {order.tableNumber}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="p-4 text-right font-black text-white">
                    ₱{order.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {salesData.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <FileText size={48} className="text-slate-800" />
              <p className="text-slate-600 font-bold uppercase text-xs tracking-widest">
                No transactions found for this date.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
