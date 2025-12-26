import React from 'react'
import {
  Trash2,
  Tag,
  Calculator,
  Users,
  UserCheck,
  UserX,
  History,
  Settings,
  BarChart3,
  Printer
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usePrintStore } from '../../store/usePrintStore'

export default function OperationsSidebar() {
  const handleOpenSettings = () => {
    window.api.openSettingsWindow() // This triggers the IPC -> createFeatureWindow
  }

  const handleOpenSalesReport = () => {
    try {
      window.api.openSalesReport() // Triggers the 'window:open-sales-report' IPC
    } catch (e) {
      toast.error('Err:', e)
    }
  }

  const { printTest, isPrinting } = usePrintStore()

  const handleTestPrint = async () => {
    console.log('Initiating test print to POS-58 thermal printer')

    // 1. Create a 58mm specific test design
    const testHtml = `
      <html>
        <body style="width: 58mm; font-family: monospace; padding: 10px;">
          <div style="text-align: center;">
            <h2>VHYPE POS</h2>
            <p>Printer NAME: POS-58</p>
            <p>${new Date().toLocaleString()}</p>
            <p>-------------------------</p>
            <p>Ready to Print</p>
            <br/><br/>.
          </div>
        </body>
      </html>
    `
    try {
      // 2. Send to the 'print-html' handler in index.js
      await window.api.testPrintHtml(testHtml)
    } catch (err) {
      console.error(err)
      alert('Failed to send test: ' + err.message)
    }
  }

  return (
    <nav className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <h2 className="font-black uppercase tracking-[0.2em] text-slate-500 text-[10px]">
          Operations Cockpit
        </h2>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto mt-20">
        <section>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">
            Transaction Control
          </p>
          <div className="space-y-3">
            {/* <WideOpButton
              icon={<Trash2 />}
              label="Void Entire Order"
              color="hover:border-red-500 text-red-400 m-20"
            />
            <WideOpButton
              icon={<Tag />}
              label="Apply Discount"
              color="hover:border-amber-500 text-amber-400"
            /> */}
            {/* <WideOpButton
              icon={<Calculator />}
              label="Split Bill / Items"
              color="hover:border-indigo-500 text-indigo-400"
            />
            */}
            <WideOpButton
              onClick={handleOpenSalesReport}
              icon={<BarChart3 />}
              label="Daily Sales Report"
              color="hover:border-indigo-600 text-indigo-400"
            />
            <WideOpButton
              icon={<Users />}
              label="Payroll"
              color="hover:border-emerald-500 text-emerald-400"
            />
          </div>
        </section>

        <div className="mt-auto p-2 bg-slate-900/50 border-t border-slate-800 rounded-b-2xl">
          <div className="flex items-center justify-between">
            {/* <div>
              <h4 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                System Diagnostics
              </h4>
              <p className="text-slate-500 text-[9px]">Check hardware connection</p>
            </div> */}

            <button
              disabled={isPrinting}
              onClick={printTest}
              // className="flex w-full items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition-all text-[10px] font-bold"
              className="bg-blue-600 p-2 rounded w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-700 text-white font-bold text-[14px] justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              <Printer size={14} />
              {isPrinting ? 'Printing...' : 'Run Thermal Test'}
            </button>
          </div>
        </div>

        <section>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">
            Staff & Attendance
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all gap-2 group">
              <UserCheck className="text-slate-500 group-hover:text-emerald-500" />
              <span className="text-[10px] font-black uppercase">Clock In</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-2xl border border-slate-700 hover:border-red-500 transition-all gap-2 group">
              <UserX className="text-slate-500 group-hover:text-red-500" />
              <span className="text-[10px] font-black uppercase">Clock Out</span>
            </button>
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-slate-800">
        <button
          onClick={handleOpenSettings}
          className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3">
            <Settings
              size={20}
              className="text-slate-500 group-hover:rotate-90 transition-transform"
            />
            <span className="text-xs font-black uppercase tracking-widest text-slate-300">
              Terminal Admin
            </span>
          </div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
        </button>
      </div>
    </nav>
  )
}

function WideOpButton({ icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-800 rounded-2xl transition-all active:scale-95 ${color}`}
    >
      <div className="shrink-0">{icon}</div>
      <span className="text-xs font-black uppercase tracking-widest leading-none">{label}</span>
    </button>
  )
}
