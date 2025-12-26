import React, { useState, useEffect } from 'react'
import { ChefHat, LogOut, Plus, Users, Settings, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import LogoutModal from './LogoutModal' // Import the new modal

export default function Header({ onLogout }) {
  const user = useAuthStore((state) => state.user)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false) // State for Modal

  // Real-time Clock Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!user) return null

  const isAdmin = user && (user.role === 'Admin' || user.role === 'Manager')

  return (
    <>
      <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 shrink-0 z-20 shadow-2xl">
        {/* 1. BRANDING & LOGO */}
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tighter text-white">
              VHYPE <span className="text-indigo-500">POS</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              ArcTech OS v1.0
            </p>
          </div>
        </div>

        {/* 2. PROMINENT REAL-TIME CLOCK (Center) */}
        <div className="flex flex-col items-center cursor-default">
          <div className="text-3xl font-mono font-black tracking-widest text-white">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </div>
          <div className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em]">
            {currentTime.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* 3. ACTION ZONE & USER PROFILE */}
        <div className="flex items-center gap-4">
          {/* USER INFO */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-0.5">
              {isAdmin && <ShieldCheck size={14} className="text-indigo-400" />}
              <p className="text-sm font-black text-white uppercase tracking-tight">
                {user.username}
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {user.role}
              </span>
            </div>
          </div>

          {/* LOGOUT BUTTON - Now triggers modal */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="ml-4 p-3 bg-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-2xl transition-all border border-slate-700 hover:border-red-500/50 shadow-lg"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* LOGOUT MODAL COMPONENT */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
        user={user}
      />
    </>
  )
}
