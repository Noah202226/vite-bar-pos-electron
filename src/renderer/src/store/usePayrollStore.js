import { create } from 'zustand'

export const usePayrollStore = create((set, get) => ({
  isPayrollOpen: false,
  employees: [],
  selectedEmp: null,
  dtrLogs: [],
  isLoading: false,
  dateRange: {
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },

  activeEmployeeIds: [], // Array of IDs like ['EMP-2025-001']

  fetchActiveShifts: async () => {
    const activeShifts = await window.api.getActiveShifts() // Create this IPC handler
    const ids = activeShifts.map((shift) => shift.employeeId)
    set({ activeEmployeeIds: ids })
  },

  // UI Actions
  setPayrollOpen: (val) => set({ isPayrollOpen: val }),
  setDateRange: (range) => set({ dateRange: { ...get().dateRange, ...range } }),

  // Data Actions
  fetchEmployees: async () => {
    set({ isLoading: true })
    try {
      // This must match the name in preload/index.js
      const data = await window.api.getAllEmployees()
      set({ employees: data, isLoading: false })
    } catch (error) {
      console.error('Error fetching employees:', error)
      set({ isLoading: false })
    }
  },

  setSelectedEmp: (emp) => {
    set({ selectedEmp: emp })
    if (emp) get().fetchDTR()
  },

  fetchDTR: async () => {
    const { selectedEmp, dateRange } = get()
    if (!selectedEmp) return

    set({ isLoading: true })
    try {
      const logs = await window.api.getEmployeeDTR({
        employeeId: selectedEmp.employeeId, // Use the string ID
        start: dateRange.start,
        end: dateRange.end
      })
      set({ dtrLogs: logs, isLoading: false })
    } catch (error) {
      console.error('Store Fetch Error:', error)
      set({ isLoading: false })
    }
  }
}))
