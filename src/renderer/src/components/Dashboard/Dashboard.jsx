import React, { useState, useEffect } from 'react'
import DashboardHeader from './DashboardHeader'
import OrderSidebar from './OrderSidebar'
import FloorPlan from './FloorPlan'
import OperationsSidebar from './OperationsSidebar'

export default function Dashboard({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTable, setSelectedTable] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <DashboardHeader user={user} currentTime={currentTime} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Section */}
        <OrderSidebar selectedTable={selectedTable} />

        {/* Center Section */}
        <FloorPlan selectedTable={selectedTable} onSelectTable={setSelectedTable} />

        {/* Right Section */}
        <OperationsSidebar />
      </div>
    </div>
  )
}
