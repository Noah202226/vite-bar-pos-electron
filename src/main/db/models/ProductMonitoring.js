import { Schema, model } from 'mongoose'

const ProductMonitoringSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: ['INITIAL_SETUP', 'UPDATE', 'RESTOCK', 'SALE', 'VOID_DELETE'],
      required: true
    },
    change: { type: String, required: true },
    remainingStock: { type: Number, required: true },
    performedBy: { type: String, required: true },
    createdBy: { type: String },
    note: { type: String }
  },
  { timestamps: true }
)

const ProductMonitoring = model('ProductMonitoring', ProductMonitoringSchema)

export { ProductMonitoring }
