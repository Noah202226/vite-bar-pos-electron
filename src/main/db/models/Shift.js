import { Schema, model } from 'mongoose'

const ShiftSchema = new Schema(
  {
    employeeId: { type: String, required: true },
    employeeName: String,
    clockIn: { type: Date, required: true },
    clockOut: { type: Date, default: null },
    // Array to track multiple breaks
    breaks: [
      {
        start: Date,
        end: Date
      }
    ],
    hourlyRateAtTime: { type: Number },
    totalHours: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'on-break', 'completed'], default: 'active' }
  },
  { timestamps: true }
)

ShiftSchema.pre('save', function () {
  if (this.clockIn && this.clockOut) {
    const diffInMs = this.clockOut - this.clockIn

    // Calculate total break time in ms
    let breakMs = 0
    this.breaks.forEach((b) => {
      if (b.start && b.end) {
        breakMs += b.end - b.start
      }
    })

    // Work time = Total duration - Break duration
    const workMs = diffInMs - breakMs
    const hours = workMs / (1000 * 60 * 60)

    this.totalHours = parseFloat(Math.max(0, hours).toFixed(2))
    this.totalEarnings = parseFloat((this.totalHours * this.hourlyRateAtTime).toFixed(2))
    this.status = 'completed'
  }
})

const Shift = model('Shift', ShiftSchema)
export { Shift }
