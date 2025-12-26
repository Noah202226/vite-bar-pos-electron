import React, { useState, useEffect } from 'react'
import { X, Clock, Coffee, LogOut, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AttendanceModal({ isOpen, onClose }) {
  const [employees, setEmployees] = useState([])
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    if (isOpen) window.api.getAllEmployees().then(setEmployees)
  }, [isOpen])

  const handleAction = async (action) => {
    if (!selectedId) return toast.error('Please select an employee first')

    try {
      let res
      // Pass ONLY the string 'EMP-2025-001', not an object
      const idToSend = selectedId

      console.log('Performing action:', action, 'for ID:', idToSend)

      if (action === 'in') res = await window.api.clockIn(idToSend)
      if (action === 'out') res = await window.api.clockOut(idToSend)
      if (action === 'break') res = await window.api.toggleBreak(idToSend)

      if (res?.success) {
        toast.success('Attendance Updated')
        setSelectedId('')
        onClose()
      } else {
        toast.error(res?.message || 'Action failed')
      }
    } catch (err) {
      toast.error('Communication Error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Staff Terminal
          </h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white">
            <X />
          </button>
        </div>

        <select
          className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-white mb-8 outline-none focus:border-indigo-500"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select Employee Name...</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp.employeeId}>
              {emp.fullName} ({emp.employeeId})
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 gap-4">
          <ActionButton
            onClick={() => handleAction('in')}
            icon={<Clock />}
            label="Clock In"
            color="bg-emerald-600"
          />
          <div className="grid grid-cols-2 gap-4">
            <ActionButton
              onClick={() => handleAction('break')}
              icon={<Coffee />}
              label="Break Toggle"
              color="bg-amber-600"
            />
            <ActionButton
              onClick={() => handleAction('out')}
              icon={<LogOut />}
              label="Clock Out"
              color="bg-rose-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} p-6 rounded-3xl flex items-center justify-center gap-4 text-white font-black uppercase tracking-widest text-xs hover:opacity-90 active:scale-95 transition-all`}
    >
      {icon} {label}
    </button>
  )
}
