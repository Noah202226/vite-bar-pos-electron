import { Schema, model } from 'mongoose'

const EmployeeSchema = new Schema(
  {
    // We keep this as required/unique, but we will generate it automatically
    employeeId: { type: String, unique: true },
    fullName: { type: String, required: true },
    position: { type: String, default: 'Staff' },
    hourlyRate: { type: Number, default: 0 },
    contactNumber: { type: String },
    dateJoined: { type: Date, default: Date.now },
    isCurrentlyActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

// PRE-SAVE HOOK: This runs automatically before .save() is called
EmployeeSchema.pre('save', async function () {
  // 'this' refers to the document being saved
  if (!this.employeeId) {
    const year = new Date().getFullYear()

    // 1. Find the last employee created this year
    const lastEmp = await this.constructor.findOne(
      { employeeId: new RegExp(`EMP-${year}-`) },
      {},
      { sort: { createdAt: -1 } }
    )

    let newSerialNumber = 1
    if (lastEmp && lastEmp.employeeId) {
      // 2. Extract the number from the last ID (e.g., "001" from "EMP-2025-001")
      const lastParts = lastEmp.employeeId.split('-')
      const lastNum = parseInt(lastParts[lastParts.length - 1]) // Get the last part
      newSerialNumber = lastNum + 1
    }

    // 3. Format with leading zeros: EMP-2025-001
    this.employeeId = `EMP-${year}-${String(newSerialNumber).padStart(3, '0')}`
  }

  // NOTE: No next() needed here because the function is async!
})

const Employee = model('Employee', EmployeeSchema)
export { Employee }
