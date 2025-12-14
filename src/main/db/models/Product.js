import { Schema, model } from 'mongoose'

const ProductSchema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ['Beer', 'Cocktail', 'Snack', 'Other'], required: true },
  stock: { type: Number, default: 0, min: 0 },
  available: { type: Boolean, default: true }
})

const Product = model('Product', ProductSchema)

export { Product }
