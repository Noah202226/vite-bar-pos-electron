import { ipcMain, BrowserWindow } from 'electron'
import { Product } from './db/models/Product'
import { User } from './db/models/User'
import { Category } from './db/models/Category'
import { Order } from './db/models/Order'
import { createFeatureWindow } from './index'

export function registerIpcHandlers() {
  // Handler to fetch all products
  ipcMain.handle('db:get-products', async () => {
    try {
      // Use .lean() to get plain JavaScript objects suitable for IPC
      const products = await Product.find({}).lean()
      return products
    } catch (error) {
      console.error('Error fetching products:', error)
      return { error: 'Failed to fetch products' }
    }
  })

  // Handler to add a new product
  ipcMain.handle('db:add-product', async (event, productData) => {
    try {
      const newProduct = new Product(productData)
      await newProduct.save()
      return { success: true, product: newProduct.toObject() }
    } catch (error) {
      console.error('Error adding product:', error)
      return { error: 'Failed to add product' }
    }
  })

  // 1. Check Session State (Looks up the single active user in the DB)
  ipcMain.handle('auth:check-session', async () => {
    try {
      // Find the user who has the isActive flag set to true
      const activeUser = await User.findOne({ isActive: true }).lean()

      if (activeUser) {
        // Return safe user data
        const { password, ...safeUser } = activeUser
        return { isLoggedIn: true, user: safeUser }
      }
      return { isLoggedIn: false }
    } catch (error) {
      console.error('Session check error:', error)
      return { isLoggedIn: false }
    }
  })

  // 2. Handle Login Attempt (Sets the user's isActive flag to true)
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    try {
      const user = await User.findOne({ username }) // Removed isActive check here

      if (!user) {
        return { success: false, message: 'User not found.' }
      }

      // Plain text password comparison (Uses the updated model method)
      const isMatch = user.comparePassword(password)

      if (isMatch) {
        // --- CRITICAL SESSION LOGIC ---
        // 1. Ensure all other sessions are inactive (safety step)
        await User.updateMany({}, { $set: { isActive: false } })

        // 2. Set THIS user to active
        user.isActive = true
        await user.save()
        // ------------------------------

        const { password, ...safeUser } = user.toObject()
        return { success: true, user: safeUser }
      } else {
        return { success: false, message: 'Incorrect password.' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'An unexpected error occurred.' }
    }
  })

  // NEW HANDLER: Handle User Registration (Sign-up)
  ipcMain.handle('auth:signup', async (event, userData) => {
    try {
      // 1. Check if the user already exists (unique constraint should handle this, but it's good practice)
      const existingUser = await User.findOne({ username: userData.username })
      if (existingUser) {
        return { success: false, message: 'Username already taken.' }
      }

      // 2. Create a new user instance (Mongoose hashing middleware runs here)
      const newUser = new User(userData)

      // 3. Save the new user to the database
      await newUser.save()

      // Return success and the newly created user (excluding password)
      const { password, ...safeUser } = newUser.toObject()

      return { success: true, user: safeUser }
    } catch (error) {
      console.error('Signup error:', error)

      let message = 'An unexpected error occurred during sign-up.'
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        message = 'The username already exists. Please choose a different one.'
      }

      return { success: false, message }
    }
  })

  // 3. Handle Logout (Sets the user's isActive flag to false)
  ipcMain.handle('auth:logout', async () => {
    try {
      // Set the currently active user (if one exists) to inactive
      await User.updateOne({ isActive: true }, { $set: { isActive: false } })
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false }
    }
  })

  // Handler to fetch all categories
  ipcMain.handle('db:get-categories', async () => {
    try {
      const categories = await Category.find({}).sort({ sortOrder: 1 }).lean()
      return categories
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { error: 'Failed to fetch categories' }
    }
  })

  // Handler to add a new category
  ipcMain.handle('db:add-category', async (event, name) => {
    try {
      const newCategory = new Category({ name })
      await newCategory.save()
      return { success: true, category: newCategory.toObject() }
    } catch (error) {
      console.error('Error adding category:', error)
      if (error.code === 11000) {
        return { error: 'Category already exists.' }
      }
      return { error: 'Failed to add category' }
    }
  })

  // Update order items
  ipcMain.handle('db:update-order-items', async (event, { orderId, items }) => {
    try {
      const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
      const total = subtotal // Add tax logic here if needed

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { items, subtotal, total },
        { new: true }
      ).lean()

      return { success: true, order: updatedOrder }
    } catch (error) {
      return { error: 'Failed to update order' }
    }
  })

  // Get active order for a table or create one
  ipcMain.handle('db:get-table-order', async (event, tableNumber) => {
    try {
      // 1. Try to find existing open order
      let order = await Order.findOne({ tableNumber, status: 'open' }).lean()

      // 2. If not found, create it on the fly
      if (!order) {
        const newOrder = new Order({
          tableNumber,
          items: [],
          status: 'open',
          subtotal: 0,
          total: 0,
          createdAt: new Date()
        })
        const savedOrder = await newOrder.save()
        return JSON.parse(JSON.stringify(savedOrder)) // Clean object for frontend
      }

      return JSON.parse(JSON.stringify(order))
    } catch (error) {
      console.error('IPC Order Error:', error)
      throw error
    }
  })

  ipcMain.on('open-settings-window', (event) => {
    const parent = BrowserWindow.fromWebContents(event.sender)
    createFeatureWindow(parent, 'settings', 900, 700)
  })
}
