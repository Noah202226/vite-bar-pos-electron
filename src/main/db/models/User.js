import { Schema, model } from 'mongoose'
// import bcrypt from 'bcrypt' // Use bcrypt for password hashing

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Manager', 'Bartender', 'Admin'], default: 'Bartender' }, // We will repurpose this field to track the single logged-in user
  isActive: { type: Boolean, default: false }, // Default to false when created
  lastLogin: { type: Date }
})

// Instance method to check password validity (NOW SIMPLE COMPARISON)
UserSchema.methods.comparePassword = function (candidatePassword) {
  // Check if the provided password matches the stored password string
  return candidatePassword === this.password
}

const User = model('User', UserSchema)
export { User }
