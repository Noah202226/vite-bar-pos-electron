import React, { useState } from 'react'
import { Lock, User, ShieldAlert, LogIn } from 'lucide-react'

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Call the Main Process handler via the exposed bridge
    const result = await window.api.login({ username, password })

    if (result.success) {
      onLoginSuccess(result.user)
    } else {
      setError(result.message || 'Access Denied: Invalid Credentials')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-800/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl px-6">
        {/* Terminal Logo Area */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-xl shadow-indigo-500/10">
            <Lock className="text-indigo-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-[0.2em] uppercase mt-20">
            VHYPE<span className="text-indigo-500">POS</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            Secure Terminal Access
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-4xl backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1"
                htmlFor="username"
              >
                Operator ID
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <input
                  type="text"
                  id="username"
                  autoComplete="off"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/50 transition-all"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1"
                htmlFor="password"
              >
                Security Key
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
                <input
                  type="password"
                  id="password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/50 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-in fade-in zoom-in duration-200">
                <ShieldAlert size={16} />
                <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="group relative w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <div className="relative z-10 flex items-center justify-center gap-2 tracking-widest uppercase text-xs">
                {loading ? (
                  <span className="animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Authorize Session
                  </>
                )}
              </div>
              {/* Button Shine Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-slate-600 text-[10px] font-medium uppercase tracking-[0.2em]">
          Restricted Access Console &copy; 2025
        </p>
      </div>
    </div>
  )
}
