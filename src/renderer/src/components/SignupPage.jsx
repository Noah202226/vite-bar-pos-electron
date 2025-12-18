import React, { useState } from 'react'
import { UserPlus, User, Lock, ShieldCheck, ArrowLeft, ShieldAlert } from 'lucide-react'

export default function SignupPage({ onReturnToLogin, onSignupSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Bartender')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const userData = { username, password, role }
    const result = await window.api.signup(userData)

    if (result.success) {
      onSignupSuccess(result.user)
    } else {
      setError(result.message || 'Registration failed.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans p-6">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-xl">
            <UserPlus className="text-indigo-500" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">
            Create <span className="text-indigo-500">Operator</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            Register New Staff Credentials
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-4xl backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Operator Name */}
            <div>
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
                Operator Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-600 transition-all"
                  placeholder="e.g. John Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Access Key */}
            <div>
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
                Access Key
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <input
                  type="password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-600 transition-all"
                  placeholder="Set password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Permission Role */}
            <div>
              <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
                Permission Level
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold appearance-none focus:outline-none focus:border-indigo-600 transition-all cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="Bartender">Bartender</option>

                  {/* <option value="Manager">Manager</option> */}
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <ShieldAlert size={16} />
                <span className="text-xs font-bold uppercase">{error}</span>
              </div>
            )}

            {/* Submit & Back Buttons */}
            <div className="pt-2 space-y-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 uppercase text-xs tracking-widest"
                disabled={loading}
              >
                {loading ? 'Initializing...' : 'Confirm Registration'}
              </button>

              <button
                type="button"
                onClick={onReturnToLogin}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 font-black uppercase text-[10px] tracking-widest transition-colors"
                disabled={loading}
              >
                <ArrowLeft size={14} />
                Return to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
