import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  History,
  User,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  FilterX,
  RefreshCw
} from 'lucide-react'
import { useHistoryStore } from '../../store/useHistoryStore'

export default function InventoryLogTable() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const { selectedProductId: filterProductId, clearFilter: onClearFilters } = useHistoryStore()

  const fetchLogs = useCallback(async () => {
    setIsRefreshing(true)
    try {
      console.log('Fetching logs with filterProductId:', filterProductId)
      const allLogs = await window.api.getInventoryLogs()

      // 1. Sort by date: Newest (Recent) first
      // We convert the timestamp to a Date object and subtract them
      const sortedLogs = allLogs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

      // 2. Apply filtering if filterProductId exists
      if (filterProductId) {
        const filtered = sortedLogs.filter((log) => log.productId === filterProductId)
        setLogs(filtered)
      } else {
        setLogs(sortedLogs)
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [filterProductId])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Filter by Type
      const matchesType = typeFilter === 'ALL' || log.type === typeFilter

      // 2. Filter by Date Range
      const logDate = new Date(log.updatedAt).setHours(0, 0, 0, 0)
      const start = dateRange.start ? new Date(dateRange.start).setHours(0, 0, 0, 0) : null
      const end = dateRange.end ? new Date(dateRange.end).setHours(0, 0, 0, 0) : null

      const matchesStart = !start || logDate >= start
      const matchesEnd = !end || logDate <= end

      return matchesType && matchesStart && matchesEnd
    })
  }, [logs, typeFilter, dateRange])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Internal Header/Toolbar */}
      <div className="p-4 border-b border-slate-900 bg-slate-900/30 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xs uppercase tracking-tight">
              {filterProductId ? 'Product History' : 'Global Audit Log'}
            </span>
            {isRefreshing && <RefreshCw size={12} className="text-indigo-500 animate-spin" />}
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-400 focus:border-indigo-500 outline-none"
            >
              <option value="ALL">ALL EVENTS</option>
              <option value="SALE">SALES ONLY</option>
              <option value="VOID_DELETE">VOIDS ONLY</option>
              {/* <option value="RESTOCK">RESTOCK ONLY</option> */}
            </select>

            {/* Date Inputs */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-400 outline-none focus:border-indigo-500"
              />
              <span className="text-slate-700 text-[10px] font-bold">TO</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-400 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Reset Filters */}
            {(typeFilter !== 'ALL' || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setTypeFilter('ALL')
                  setDateRange({ start: '', end: '' })
                }}
                className="text-[10px] font-black text-rose-500 uppercase hover:text-rose-400 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Filter Badge */}
          {filterProductId && logs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Viewing: {logs[0].productName}
              </span>
              <button
                onClick={onClearFilters}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Clear Filter"
              >
                <FilterX size={12} />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={fetchLogs}
          disabled={isRefreshing}
          className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 transition-all border border-slate-800"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-600 text-xs animate-pulse">
            Loading history...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-slate-600 gap-2">
            <History size={32} strokeWidth={1} />
            <p className="text-xs">No logs found for this item.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-950 shadow-sm z-10">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-900">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-900/40 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-tighter ${
                          log.type === 'VOID_DELETE'
                            ? 'text-rose-500'
                            : log.type === 'INITIAL_SETUP'
                              ? 'text-emerald-500'
                              : 'text-indigo-400'
                        }`}
                      >
                        {log.type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500 text-[9px] font-mono">
                        {new Date(log.updatedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <div
                        className={`flex items-center gap-1 text-[11px] font-bold ${
                          log.change?.includes('Added') ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.change?.replace('Added - ', '+').replace('Removed - ', '-')}
                      </div>
                      <span className="text-[9px] text-slate-600">Bal: {log.remainingStock}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5" title={log.performedBy}>
                      <div className="w-5 h-5 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                        <User size={10} />
                      </div>
                      <span className="text-[10px] text-slate-400 truncate w-16">
                        {log.performedBy || 'System'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Internal Footer Note */}
      <div className="p-3 bg-slate-900/20 border-t border-slate-900">
        <p className="text-[9px] text-slate-600 italic">
          * Logs are permanent and cannot be modified by users.
        </p>
      </div>
    </div>
  )
}
