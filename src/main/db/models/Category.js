import { Schema, model } from 'mongoose'

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Optional: Para sa sorting sa UI
  sortOrder: {
    type: Number,
    default: 0
  }
})

const Category = model('Category', CategorySchema)

export { Category }
