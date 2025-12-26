import React, { useEffect } from 'react'
import { LogOut, X, ShoppingBag, Clock, User } from 'lucide-react'
import { useOrderStore } from '../../store/useOrderStore'

export default function LogoutModal({ isOpen, onClose, onConfirm, user }) {
  const { sessionTotal, sessionCount, fetchUserSessionSales } = useOrderStore()

  // Refresh sales data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserSessionSales()
    }
  }, [isOpen, fetchUserSessionSales])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      {/* Modal Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Section */}
        <div className="relative p-6 text-center border-b border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogOut size={32} className="text-indigo-500" />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">End Session?</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Review your shift details
          </p>
        </div>

        {/* Content Section: Stats Grid */}
        <div className="p-8 bg-slate-950/50 space-y-4">
          {/* User Info */}
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <User size={18} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active User
              </span>
            </div>
            <span className="text-sm font-black text-white uppercase">{user?.username}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sales Count */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Transactions
                </span>
              </div>
              <p className="text-xl font-mono font-black text-white">{sessionCount}</p>
            </div>

            {/* Login Time */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Login Time
                </span>
              </div>
              <p className="text-xs font-mono font-black text-white">
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '--:--'}
              </p>
            </div>
          </div>

          {/* Session Total: BIG DISPLAY */}
          <div className="p-6 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl text-center">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-2">
              Session Net Sales
            </span>
            <span className="text-4xl font-mono font-black text-white tracking-tighter">
              ₱{sessionTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex gap-3 bg-slate-900">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase text-xs tracking-widest rounded-2xl transition-all active:scale-95"
          >
            Stay Logged In
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            Close Shift
          </button>
        </div>
      </div>
    </div>
  )
}
