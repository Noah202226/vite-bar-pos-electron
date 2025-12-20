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
      const products = await Product.find({}).lean()
      // FIX: Convert BSON ObjectIds to strings immediately
      return JSON.parse(JSON.stringify(products))
    } catch (error) {
      console.error('Error fetching products:', error)
      return { error: 'Failed to fetch products' }
    }
  })

  // Handler to add a new product
  ipcMain.handle('db:add-product', async (event, productData) => {
    try {
      // Assuming you have a Product model. If not, I can provide the Schema.
      const newProduct = new Product(productData)
      await newProduct.save()
      return { success: true, product: JSON.parse(JSON.stringify(newProduct)) }
    } catch (error) {
      console.error('Error adding product:', error)
      return { success: false, error: error.message }
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
  ipcMain.handle('db:update-order-items', async (event, { orderId, items, subtotal, total }) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            items: items, // Mongoose casts the string productId to ObjectId here
            subtotal: total,
            total: total
          }
        },
        { new: true, runValidators: true }
      ).lean()

      // Crucial: Use JSON stringify/parse to remove Mongoose-specific logic
      // before sending the data back across the bridge to React.
      return JSON.parse(JSON.stringify(updatedOrder))
    } catch (error) {
      console.error('Database Save Error:', error)
      return { success: false, error: error.message }
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
  ipcMain.handle('db:place-order', async (event, { orderId }) => {
    try {
      return await Order.findByIdAndUpdate(
        orderId,
        { $set: { 'items.$[].status': 'sent' } }, // Update all items to sent
        { new: true }
      ).lean()
    } catch (error) {
      return { error: 'Failed to place order' }
    }
  })

  // 1. Update Floor Status to include isReserved
  ipcMain.handle('db:get-floor-status', async () => {
    try {
      const activeOrders = await Order.find({ status: 'open' })
        .select('tableNumber total status isReserved')
        .lean()
      return JSON.parse(JSON.stringify(activeOrders))
    } catch (error) {
      return []
    }
  })

  // 2. Add Toggle Reservation Handler
  ipcMain.handle('db:toggle-reservation', async (event, { tableNumber }) => {
    try {
      let order = await Order.findOne({ tableNumber, status: 'open' })
      if (!order) {
        order = new Order({ tableNumber, status: 'open', isReserved: true })
      } else {
        order.isReserved = !order.isReserved
      }
      await order.save()
      return JSON.parse(JSON.stringify(order))
    } catch (error) {
      return { error: error.message }
    }
  })

  ipcMain.handle('db:checkout-order', async (event, { orderId }) => {
    try {
      const finalizedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            status: 'paid',
            closedAt: new Date(),
            isReserved: false // Automatically clear reservation on pay
          }
        },
        { new: true }
      ).lean()

      return JSON.parse(JSON.stringify(finalizedOrder))
    } catch (error) {
      console.error('Checkout Error:', error)
      return { error: 'Failed to process payment' }
    }
  })
  ipcMain.handle('print-receipt', async (event, order) => {
    const receiptHtml = `
    <div style="width: 80mm; font-family: monospace; font-size: 12px;">
      <h2 style="text-align: center;">VHYPE POS</h2>
      <p style="text-align: center;">Table: ${order.tableNumber}</p>
      <hr>
      ${order.items
        .map(
          (item) => `
        <div style="display: flex; justify-content: space-between;">
          <span>${item.quantity}x ${item.name}</span>
          <span>₱${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `
        )
        .join('')}
      <hr>
      <div style="display: flex; justify-content: space-between; font-weight: bold;">
        <span>TOTAL:</span>
        <span>₱${order.total.toFixed(2)}</span>
      </div>
      <p style="text-align: center; margin-top: 20px;">Thank you! Come again.</p>
    </div>
  `

    // Use your existing printing logic here (e.g., hidden window print)
    // await printFunction(receiptHtml);
  })

  ipcMain.handle('db:get-sales-report', async (_, { start, end }) => {
    const startTime = new Date(start)
    startTime.setHours(0, 0, 0, 0)

    const endTime = new Date(end)
    endTime.setHours(23, 59, 59, 999)

    return await Order.find({
      status: 'paid',
      closedAt: {
        $gte: startTime,
        $lte: endTime
      }
    })
      .sort({ closedAt: -1 })
      .lean()
  })
}
