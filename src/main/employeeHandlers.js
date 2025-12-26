// src/main/employeeHandlers.js
import { ipcMain } from 'electron'
import { Employee } from '../main/db/models/Employee.js'

export function registerEmployeeHandlers() {
  console.log('Registering Employee IPC Handlers...')
  // GET ALL
  ipcMain.handle('employee:get-all', async () => {
    try {
      // Return active employees
      const list = await Employee.find({ isCurrentlyActive: true }).lean()
      return JSON.parse(JSON.stringify(list)) // Ensure it's serializable for IPC
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      return []
    }
  })

  // ADD
  ipcMain.handle('employee:add', async (event, data) => {
    try {
      console.log('Main Process: Attempting to save:', data)

      const newEmp = new Employee(data) // Pre-save hook handles the ID
      const saved = await newEmp.save()

      console.log('✅ Success! Saved as:', saved.employeeId)
      return { success: true }
    } catch (error) {
      // THIS LOG IS CRITICAL: It shows up in your terminal/cmd
      console.error('❌ MONGOOSE SAVE ERROR:', error.message)

      return {
        success: false,
        message: error.message,
        code: error.code // Useful for spotting duplicate (11000) errors
      }
    }
  })
}
