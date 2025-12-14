import mongoose from 'mongoose'
import { app } from 'electron'

// Replace with your actual MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/bar-pos-db'

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected successfully!')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    // Optionally quit the app if the connection is critical
    app.quit()
  }
}

// Optional: Graceful disconnection on app exit
app.on('before-quit', async () => {
  await mongoose.disconnect()
  console.log('MongoDB disconnected.')
})
