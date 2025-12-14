import { Schema, model } from 'mongoose'
// import bcrypt from 'bcrypt' // Use bcrypt for password hashing

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Manager', 'Bartender', 'Admin'], default: 'Bartender' }, // We will repurpose this field to track the single logged-in user
  isActive: { type: Boolean, default: false } // Default to false when created
})

// // Hashing Middleware: Define using a standard function that explicitly uses next()
// // This ensures Mongoose correctly recognizes the middleware chain.
// UserSchema.pre('save', async function (next) {
//   // Check if the password field is new or has been modified
//   if (!this.isModified('password')) {
//     return next() // If not modified, skip hashing and move on
//   }

//   try {
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next() // Call next() only upon success
//   } catch (err) {
//     next(err) // Pass the error to Mongoose
//   }
// })

// // Instance method to check password validity (this is fine)
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password)
// }

// Instance method to check password validity (NOW SIMPLE COMPARISON)
UserSchema.methods.comparePassword = function (candidatePassword) {
  // Check if the provided password matches the stored password string
  return candidatePassword === this.password
}

const User = model('User', UserSchema)
export { User }
