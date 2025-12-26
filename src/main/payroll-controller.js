import { ipcMain } from 'electron'
import { Shift } from '../main/db/models/Shift.js'
import { Employee } from '../main/db/models/Employee.js'

export function registerPayrollHandlers() {
  // 1. CLOCK IN
  // Use ({ employeeId }) to pull the string out of the object automatically
  ipcMain.handle('attendance:clock-in', async (event, payload) => {
    console.log('Clock-in Payload:', payload)

    try {
      // 1. Extract the actual string ID safely
      const empId = typeof payload === 'object' ? payload.employeeId : payload

      console.log('Processing Clock-in for:', empId)

      // 2. Check for active shift using the custom string ID
      const active = await Shift.findOne({ employeeId: empId, clockOut: null })
      if (active) return { success: false, message: 'Already clocked in' }

      // 3. Find the employee using the custom string ID
      const emp = await Employee.findOne({ employeeId: empId })
      if (!emp) return { success: false, message: 'Employee not found' }

      // 4. Create the shift (Use MongoDB _id for the ref, but store the empId string if needed)
      const newShift = new Shift({
        employeeId: emp.employeeId, // The "EMP-2025-001" string
        employeeName: emp.fullName,
        clockIn: new Date(),
        hourlyRateAtTime: emp.hourlyRate || 0,
        status: 'active'
      })

      await newShift.save()
      return { success: true }
    } catch (e) {
      console.error('Clock-in Error:', e)
      return { success: false, message: e.message }
    }
  })

  // 2. BREAK CONTROL (Toggle)
  ipcMain.handle('attendance:toggle-break', async (event, payload) => {
    try {
      const empId = typeof payload === 'object' ? payload.employeeId : payload

      console.log('Processing Clock-in for:', empId)
      const shift = await Shift.findOne({ employeeId: empId, clockOut: null })
      if (!shift) return { success: false, message: 'No active shift' }

      if (shift.status === 'active') {
        // Start Break
        shift.breaks.push({ start: new Date() })
        shift.status = 'on-break'
      } else if (shift.status === 'on-break') {
        // End Break
        const currentBreak = shift.breaks[shift.breaks.length - 1]
        currentBreak.end = new Date()
        shift.status = 'active'
      }

      await shift.save()
      return { success: true, status: shift.status }
    } catch (e) {
      return { success: false, message: e.message }
    }
  })

  // 3. CLOCK OUT
  ipcMain.handle('attendance:clock-out', async (event, payload) => {
    console.log('Clock-out Payload:', payload)
    try {
      const empId = typeof payload === 'object' ? payload.employeeId : payload
      const shift = await Shift.findOne({ employeeId: empId, clockOut: null })
      if (!shift) return { success: false, message: 'No active shift' }

      // If user is on break, end the break automatically first
      if (shift.status === 'on-break') {
        shift.breaks[shift.breaks.length - 1].end = new Date()
      }

      shift.clockOut = new Date()
      await shift.save()
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  })

  // 4. GET EMPLOYEE DTR (The missing handler causing your error)
  ipcMain.handle('payroll:get-employee-dtr', async (event, { employeeId, start, end }) => {
    try {
      const query = { employeeId }

      // If dates are provided, filter the range
      if (start && end) {
        query.clockIn = {
          $gte: new Date(start),
          $lte: new Date(new Date(end).setHours(23, 59, 59))
        }
      }

      // Return completed shifts first, then active ones
      return await Shift.find(query).sort({ clockIn: -1 }).lean()
    } catch (e) {
      console.error('DTR Fetch Error:', e)
      return []
    }
  })

  // 5. GET ALL ACTIVE SHIFTS (To show who is currently logged in)
  ipcMain.handle('attendance:get-active', async () => {
    try {
      return await Shift.find({ clockOut: null }).select('employeeId status').lean()
    } catch (e) {
      return []
    }
  })
}
