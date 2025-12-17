import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  note: String,
  status: { type: String, enum: ['pending', 'sent', 'served'], default: 'pending' }
})

const OrderSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'paid', 'void'], default: 'open' },
    openedBy: String,
    closedAt: Date
  },
  { timestamps: true }
)

export const Order = mongoose.model('Order', OrderSchema)
