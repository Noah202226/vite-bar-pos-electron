import React from 'react'
import { Crown, Sparkles, Zap, Percent } from 'lucide-react'

export default function FloorPlan({ selectedTable, onSelectTable }) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">Floor Management</h2>
              <p className="text-slate-500 text-sm font-medium">
                Real-time status of all active zones.
              </p>
            </div>
            <div className="flex gap-4">
              <StatusBadge color="bg-slate-800" text="Available" />
              <StatusBadge color="bg-indigo-500" text="Occupied" />
              <StatusBadge color="bg-amber-500" text="VIP" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <TableButton
              label="V1"
              isVIP
              isSelected={selectedTable === 'V1'}
              onClick={() => onSelectTable('V1')}
            />
            <TableButton
              label="V2"
              isVIP
              isSelected={selectedTable === 'V2'}
              onClick={() => onSelectTable('V2')}
            />
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <TableButton
                key={num}
                label={num}
                isSelected={selectedTable === num}
                onClick={() => onSelectTable(num)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Promos Section */}
      <div className="h-64 bg-slate-900/50 border-t border-slate-800 p-8">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-indigo-400">
            <Sparkles size={18} />
            <h3 className="font-black uppercase tracking-[0.2em] text-xs">Active Promos</h3>
          </div>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
            <PromoCard
              title="Happy Hour"
              desc="50% OFF local beers"
              time="4PM-8PM"
              icon={<Zap size={24} />}
              color="from-amber-500/20 to-orange-500/20 border-amber-500/30"
            />
            <PromoCard
              title="Beer Bucket"
              desc="Buy 5+1 Promo"
              time="All Night"
              icon={<Percent size={24} />}
              color="from-blue-500/20 to-indigo-500/20 border-blue-500/30"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

// Sub-components used inside FloorPlan
function TableButton({ label, isVIP, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`h-28 rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all ${
        isSelected
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl -translate-y-2'
          : isVIP
            ? 'bg-slate-900 border-amber-500/30 text-amber-500'
            : 'bg-slate-900 border-slate-800 text-slate-500'
      }`}
    >
      {isVIP && <Crown size={18} className="mb-1" />}
      <span className="text-xl font-black">{label}</span>
      <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">
        {isSelected ? 'Active' : 'Empty'}
      </span>
    </button>
  )
}

function StatusBadge({ color, text }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {text}
      </span>
    </div>
  )
}

function PromoCard({ title, desc, time, icon, color }) {
  return (
    <div
      className={`min-w-[240px] p-5 rounded-3xl border bg-gradient-to-br flex flex-col justify-between ${color}`}
    >
      <div className="flex justify-between items-start">
        <div className="p-2 bg-slate-950/40 rounded-xl">{icon}</div>
        <span className="text-[10px] font-black bg-slate-950/50 px-2 py-1 rounded-lg uppercase tracking-widest">
          {time}
        </span>
      </div>
      <div>
        <h4 className="font-black text-sm text-white mb-1">{title}</h4>
        <p className="text-[10px] text-slate-300 font-medium leading-tight">{desc}</p>
      </div>
    </div>
  )
}
