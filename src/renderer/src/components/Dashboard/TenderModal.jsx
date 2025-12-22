import React, { useState, useEffect } from 'react'

const TenderModal = ({ isOpen, total, onConfirm, onClose }) => {
  const [received, setReceived] = useState('')
  const [change, setChange] = useState(0)

  const quickAmounts = [100, 200, 500, 1000]

  // Calculate change whenever 'received' amount changes
  useEffect(() => {
    const amount = parseFloat(received) || 0
    setChange(amount > total ? amount - total : 0)
  }, [received, total])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (parseFloat(received) < total) {
      alert('Amount received is less than Total!')
      return
    }
    onConfirm(parseFloat(received), change)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-9999">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-96 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Payment Tender</h2>

        <div className="space-y-4">
          <div className="flex justify-between text-slate-400">
            <span>Total Amount:</span>
            <span className="text-white font-bold text-xl">₱{total.toFixed(2)}</span>
          </div>

          <div>
            <label className="text-sm text-slate-400">Amount Received:</label>
            <input
              autoFocus
              type="number"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white text-3xl p-3 rounded mt-1 focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
            <div className="flex justify-between items-center">
              <span className="text-blue-300 font-medium">Change:</span>
              <span className="text-blue-400 text-3xl font-black">₱{change.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4 p-2 border-t border-b border-slate-700">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setReceived(amt.toString())}
                className="bg-slate-700 hover:bg-blue-600 text-white py-2 rounded text-sm font-bold transition-colors"
              >
                ₱{amt}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-900/20"
            >
              Confirm & Print
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenderModal
