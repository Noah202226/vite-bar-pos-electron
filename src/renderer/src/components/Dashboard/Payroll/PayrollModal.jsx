import React, { act, useEffect, useState } from 'react'
import { Users, UserPlus, Search, FileText, ArrowRight, Clock, Wallet, X } from 'lucide-react'
import { usePayrollStore } from '../../../store/usePayrollStore'
import AddEmployeeModal from './AddEmployeeModal'

export default function PayrollModal() {
  // 1. Hook into the visibility state from your store
  const {
    isPayrollOpen,
    setPayrollOpen,
    employees,
    fetchEmployees,
    selectedEmp,
    setSelectedEmp,
    dtrLogs,
    fetchDTR,
    dateRange,
    setDateRange,
    isLoading,
    activeEmployeeIds
  } = usePayrollStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [activeIds, setActiveIds] = useState([])

  // 2. Fetch data only when the modal is triggered to open
  useEffect(() => {
    if (isPayrollOpen) {
      fetchEmployees()
    }

    // Also fetch active shifts to highlight currently working employees
    const fetchActive = async () => {
      await usePayrollStore.getState().fetchActiveShifts()
    }
    const fetchActiveShifts = async () => {
      await fetchActive()
      setActiveIds(usePayrollStore.getState().activeEmployeeIds)
    }
    fetchActiveShifts()
    console.log('Active Employee IDs on Modal Open:', activeEmployeeIds)
  }, [isPayrollOpen, fetchEmployees])

  // 3. Conditional rendering: If store says closed, render nothing
  if (!isPayrollOpen) return null

  const totalEarnings = dtrLogs.reduce((sum, log) => sum + (log.totalEarnings || 0), 0)
  const totalHours = dtrLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0)

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-6xl h-[85vh] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black overflow-hidden flex flex-col">
        {/* HEADER / TOOLBAR */}
        <div className="h-20 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Personnel & Payroll
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                Management Terminal
              </p>
            </div>
          </div>

          {/* Close button updates the store state */}
          <button
            onClick={() => setPayrollOpen(false)}
            className="p-3 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* PERSONNEL SIDEBAR */}
          <aside className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Staff Directory
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all active:scale-90"
                >
                  <UserPlus size={16} />
                </button>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search personnel..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:border-indigo-600 outline-none transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {employees.map((emp) => {
                const isCurrentlyWorking = activeIds.includes(emp.employeeId)

                return (
                  <button
                    key={emp._id}
                    onClick={() => setSelectedEmp(emp)}
                    className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all ${
                      selectedEmp?._id === emp._id
                        ? 'bg-indigo-600/10 border-indigo-600/40 text-white'
                        : 'bg-transparent border-transparent hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="relative">
                      {/* Fixed Avatar UI */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${
                          selectedEmp?._id === emp._id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {emp.fullName.charAt(0)}
                      </div>

                      {isCurrentlyWorking && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                      )}
                    </div>

                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-black truncate uppercase tracking-wider">
                        {emp.fullName}
                      </p>
                      <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter">
                        {emp.employeeId}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {/* MAIN DATA VIEW */}
          <main className="flex-1 flex flex-col bg-slate-950/20 overflow-hidden">
            {selectedEmp ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <header className="p-10 flex justify-between items-start">
                    <div>
                      {/* UI UPDATE: Small ID badge above name */}
                      <p className="text-indigo-500 text-[10px] font-black tracking-[0.3em] mb-2 uppercase">
                        Registration ID: {selectedEmp.employeeId}
                      </p>
                      <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                        {selectedEmp.fullName}
                      </h1>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {selectedEmp.position}
                        </span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                          Rate: ₱{selectedEmp.hourlyRate}/hr
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <StatCard
                        icon={<Clock size={16} />}
                        label="Total Hours"
                        value={`${totalHours.toFixed(1)}h`}
                      />
                      <StatCard
                        icon={<Wallet size={16} />}
                        label="Earnings"
                        value={`₱${totalEarnings.toLocaleString()}`}
                        color="text-emerald-400"
                      />
                    </div>
                  </header>

                  <div className="mx-10 mb-6 p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ start: e.target.value })}
                          className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                        />
                        <ArrowRight size={14} className="text-slate-700" />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ end: e.target.value })}
                          className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer"
                        />
                      </div>
                      <button
                        onClick={fetchDTR}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Sync Logs'}
                      </button>
                    </div>
                  </div>

                  <div className="px-10 pb-10">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-4xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-slate-500 text-[9px] uppercase font-black tracking-[0.2em]">
                          <tr>
                            <th className="p-6">Date</th>
                            <th className="p-6">Clock In</th>
                            <th className="p-6">Clock Out</th>
                            <th className="p-6 text-center">Hours</th>
                            <th className="p-6 text-right">Payout</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {dtrLogs.map((log) => (
                            <tr
                              key={log._id}
                              className="hover:bg-indigo-600/5 transition-colors group"
                            >
                              <td className="p-6 text-xs font-bold text-slate-300">
                                {new Date(log.clockIn).toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="p-6 text-xs font-mono text-indigo-400">
                                {new Date(log.clockIn).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="p-6 text-xs font-mono text-rose-400">
                                {log.clockOut
                                  ? new Date(log.clockOut).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : '---'}
                              </td>
                              <td className="p-6 text-xs text-center font-black">
                                {log.totalHours || 0}h
                              </td>
                              <td className="p-6 text-xs text-right font-black text-white">
                                ₱{(log.totalEarnings || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Users size={60} strokeWidth={1} className="text-slate-800 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
                  Select Staff Profile
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}

function StatCard({ icon, label, value, color = 'text-white' }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-4xl min-w-44 shadow-xl">
      <div className="flex items-center gap-3 text-slate-500 mb-3">
        <span className="p-2 bg-slate-950 rounded-xl text-indigo-600">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
    </div>
  )
}
