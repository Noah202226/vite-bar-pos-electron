import React, { useEffect, useState } from 'react'
import { useOrderStore } from '../../store/useOrderStore'
import { BarChart3, Calendar, FileText, Download } from 'lucide-react'

export default function SalesReport() {
  const { salesData, fetchSalesReport } = useOrderStore()

  // Initialize with today's date string YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (selectedDate) {
      fetchSalesReport(selectedDate)
    }
  }, [selectedDate])

  const totalRevenue = salesData.reduce((acc, order) => acc + order.total, 0)

  return (
    <div className="flex-1 p-8 bg-slate-950 text-slate-200 overflow-y-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Daily Analytics
          </h1>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">
            Terminal Sales Overview
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <Calendar size={18} className="text-indigo-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-bold outline-none text-sm"
            />
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
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
  )
}
