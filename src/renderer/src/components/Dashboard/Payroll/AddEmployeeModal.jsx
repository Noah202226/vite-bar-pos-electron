import React, { useState } from 'react'
import { UserPlus, X, DollarSign, Briefcase, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePayrollStore } from '../../../store/usePayrollStore'

const INITIAL_STATE = {
  fullName: '',
  position: 'Bartender',
  hourlyRate: 0,
  contactNumber: ''
}

export default function AddEmployeeModal({ isOpen, onClose }) {
  const fetchEmployees = usePayrollStore((state) => state.fetchEmployees)
  const [formData, setFormData] = useState(INITIAL_STATE)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // IPC Call to Electron Main Process
      const res = await window.api.addEmployee(formData)

      if (res.success) {
        toast.success(`${formData.fullName} registered successfully!`)
        await fetchEmployees()
        setFormData(INITIAL_STATE) // Reset form
        onClose()
      } else {
        // Now shows the specific Mongoose error (e.g. "Path fullName is required")
        toast.error(res.message || 'Failed to save employee')
        console.error('DB Error:', res.message)
      }
    } catch (err) {
      toast.error('IPC Connection error')
    }
  }

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">New Staff</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                System will auto-generate ID
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 bg-slate-950/20">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <User size={12} className="text-indigo-500" /> Full Name
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Position */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                <Briefcase size={12} className="text-indigo-500" /> Position
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none appearance-none"
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                value={formData.position}
              >
                <option value="Bartender">Bartender</option>
                <option value="Server">Server</option>
                <option value="Manager">Manager</option>
                <option value="Kitchen">Kitchen</option>
              </select>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                <DollarSign size={12} className="text-indigo-500" /> Rate (₱)
              </label>
              <input
                type="number"
                required
                value={formData.hourlyRate}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none"
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Optional Contact Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              <Phone size={12} className="text-indigo-500" /> Contact Number
            </label>
            <input
              type="text"
              placeholder="09xx xxx xxxx"
              value={formData.contactNumber}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none"
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="p-8 bg-slate-900 border-t border-slate-800">
          <button
            type="submit"
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-[0.3em] rounded-3xl shadow-xl transition-all active:scale-95"
          >
            Confirm Registration
          </button>
        </div>
      </form>
    </div>
  )
}
