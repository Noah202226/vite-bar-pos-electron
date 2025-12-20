import { Schema, model } from 'mongoose'

const ProductSchema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  currentStock: { type: Number, default: 0, min: 0 },
  lowStockAlert: { type: Number, min: 0, require: true },
  available: { type: Boolean, default: true }
})

const Product = model('Product', ProductSchema)

export { Product }
