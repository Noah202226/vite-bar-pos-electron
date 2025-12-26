import { BrowserWindow, ipcMain } from 'electron'
import { Product } from './db/models/Product'
import { User } from './db/models/User'
import { Category } from './db/models/Category'
import { Order } from './db/models/Order'
import { ProductMonitoring } from './db/models/ProductMonitoring'
import mongoose from 'mongoose'

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
  ipcMain.handle(
    'db:add-product',
    async (event, { name, category, price, currentStock, lowStockAlert, logData }) => {
      console.log('Adding product with data:', {
        name,
        category,
        price,
        currentStock,
        lowStockAlert,
        logData
      })

      try {
        // Assuming you have a Product model. If not, I can provide the Schema.
        // const newProduct = new Product(productData)
        // await newProduct.save()

        // 1. Save the Product
        const newProduct = new Product({ name, category, price, currentStock, lowStockAlert })
        const savedProduct = await newProduct.save()

        // 2. Save the Monitoring Log
        const monitoringLog = new ProductMonitoring({
          productId: savedProduct._id,
          productName: savedProduct.name,
          type: 'INITIAL_SETUP',
          change: `Added - ${savedProduct.currentStock}`,
          remainingStock: savedProduct.currentStock,
          performedBy: logData.user,
          note: logData.note || 'Initial inventory entry',
          timestamp: logData.timestamp
        })
        await monitoringLog.save()

        return { success: true, product: JSON.parse(JSON.stringify(newProduct)) }
      } catch (error) {
        console.error('Error adding product:', error)
        return { success: false, error: error.message }
      }
    }
  )

  // Handler to update a product
  ipcMain.handle('db:update-product', async (event, id, payload) => {
    // Destructure everything from the payload
    const { name, category, price, currentStock, lowStockAlert, logData } = payload

    console.log('updating product with data:', {
      id,
      name,
      category,
      price,
      currentStock,
      lowStockAlert,
      logData
    })
    const data = { name, category, price, currentStock, lowStockAlert }

    try {
      // 1. Get current product to calculate stock difference
      const oldProduct = await Product.findById(id)
      if (!oldProduct) throw new Error('Product not found')

      const stockChange = (data.currentStock || oldProduct.currentStock) - oldProduct.currentStock

      // 2. Perform Update
      const updated = await Product.findByIdAndUpdate(id, { $set: data }, { new: true }).lean()

      // 3. Log the Monitoring activity
      const monitoringLog = new ProductMonitoring({
        productId: id,
        productName: updated.name,
        type: 'UPDATE',
        change: `${stockChange >= 0 ? 'Added' : 'Removed'} - ${Math.abs(stockChange)}`,
        remainingStock: updated.currentStock,
        performedBy: logData.user,
        note: logData.note || 'Manual info update',
        timestamp: new Date()
      })
      await monitoringLog.save()

      return { success: true, product: JSON.parse(JSON.stringify(updated)) }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  // Handler to delete a product
  ipcMain.handle('db:delete-product', async (event, id, logData) => {
    try {
      const product = await Product.findById(id)
      if (!product) throw new Error('Product not found')

      // 1. Log the VOID/DELETE action before the product record is gone
      const monitoringLog = new ProductMonitoring({
        productId: id,
        productName: product.name,
        type: 'VOID_DELETE',
        change: -product.currentStock, // Stock effectively becomes 0
        remainingStock: 0,
        performedBy: logData.user,
        note: logData.note || 'Permanent deletion',
        timestamp: new Date()
      })
      await monitoringLog.save()

      // 2. Remove the actual product
      await Product.findByIdAndDelete(id)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  })
  ipcMain.handle('db:get-inventory-logs', async () => {
    try {
      const logs = await ProductMonitoring.find({})
        .sort({ timestamp: -1 }) // Newest first
        .lean()
      return JSON.parse(JSON.stringify(logs))
    } catch (error) {
      console.error('Error fetching logs:', error)
      return []
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
        user.lastLogin = new Date() // Record the start of this session
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
      return JSON.parse(JSON.stringify(categories))
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
  ipcMain.handle('db:delete-category', async (event, id) => {
    try {
      console.log('deleting cat:', id)
      // Use the Mongoose model 'Category' instead of 'db'
      await Category.findByIdAndDelete(id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: 'Failed to delete category' }
    }
  })

  // Update order items
  // ipcMain.handle('db:update-order-items', async (event, { orderId, items, subtotal, total }) => {
  //   try {
  //     const updatedOrder = await Order.findByIdAndUpdate(
  //       orderId,
  //       {
  //         $set: {
  //           items: items, // Mongoose casts the string productId to ObjectId here
  //           subtotal: total,
  //           total: total
  //         }
  //       },
  //       { new: true, runValidators: true }
  //     ).lean()

  //     // Crucial: Use JSON stringify/parse to remove Mongoose-specific logic
  //     // before sending the data back across the bridge to React.
  //     return JSON.parse(JSON.stringify(updatedOrder))
  //   } catch (error) {
  //     console.error('Database Save Error:', error)
  //     return { success: false, error: error.message }
  //   }
  // })
  ipcMain.handle(
    'db:update-order-items',
    async (event, { orderId, items, total, inventoryUpdate, currentUser }) => {
      try {
        // 1. Update the Order Items
        await Order.findByIdAndUpdate(orderId, { items, total })

        if (inventoryUpdate) {
          const { productId, adjustment, tableNumber } = inventoryUpdate

          // 2. Adjust Product Stock & Get the new balance
          const product = await Product.findByIdAndUpdate(
            productId,
            { $inc: { currentStock: adjustment } },
            { new: true } // returns the document AFTER the update
          )

          // 3. Create the Monitoring Log using your schema
          await ProductMonitoring.create({
            productId: productId,
            type: adjustment < 0 ? 'SALE' : 'VOID_DELETE',
            change: adjustment < 0 ? `Sold x${Math.abs(adjustment)}` : `Voided x${adjustment}`,
            remainingStock: product.currentStock, // Snapshot of stock after change
            performedBy: currentUser || 'Unknown User',
            note: `Table ${tableNumber} - ${adjustment < 0 ? 'Order added' : 'Item removed'}`
          })
        }

        return { success: true }
      } catch (error) {
        console.error('Monitoring Error:', error)
        return { error: error.message }
      }
    }
  )

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

  ipcMain.handle('db:checkout-order', async (event, { orderId, transactBy, userId }) => {
    try {
      // 1. Sanitize the userId input
      let finalUserId = null

      // Check if userId is a valid 24-character hex string
      if (userId && typeof userId === 'string' && userId.length === 24) {
        finalUserId = new mongoose.Types.ObjectId(userId)
      } else if (userId && typeof userId === 'object' && userId.id) {
        // Fallback for some BSON structures
        finalUserId = new mongoose.Types.ObjectId(userId.id)
      }

      // 2. Perform the Update
      const finalizedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            status: 'paid',
            closedAt: new Date(),
            isReserved: false,
            openedBy: transactBy,
            userId: finalUserId
          }
        },
        { new: true }
      ).lean()

      if (!finalizedOrder) throw new Error('Order not found')

      // 3. Return a clean JSON object (strips Mongoose magic)
      return JSON.parse(JSON.stringify(finalizedOrder))
    } catch (error) {
      console.error('Checkout IPC Error:', error)
      return { error: error.message }
    }
  })
  // --- UPDATE SESSION SALES TRACKING ---
  ipcMain.handle('get-user-session-sales', async (event, { username, loginTime }) => {
    try {
      // Find paid orders by this user since their login time
      const sessionOrders = await Order.find({
        openedBy: username, // Match the 'transactBy' or 'openedBy' used in checkout
        status: 'paid', // Case-sensitive: make sure this matches your checkout status
        closedAt: { $gte: new Date(loginTime) }
      }).lean()

      const total = sessionOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      const count = sessionOrders.length

      return { total, count }
    } catch (error) {
      console.error('Session sales error:', error)
      return { total: 0, count: 0 }
    }
  })

  ipcMain.handle('print-receipt', async (event, order) => {
    const printWindow = new BrowserWindow({
      show: false, // Keep it hidden
      webPreferences: { sandbox: false }
    })

    const receiptHtml = `
    <html>
      <body style="margin: 0; padding: 0;">
        <div style="width: 80mm; font-family: 'Courier New', monospace; font-size: 12px; padding: 10px;">
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
          <p style="text-align: center; margin-top: 1px;">Thank you! Come again.</p>
        </div>
      </body>
    </html>
  `

    // Load HTML via Data URL
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`)

    // CRITICAL: Wait for the "did-finish-load" and then add a small delay
    return new Promise((resolve) => {
      printWindow.webContents.on('did-finish-load', () => {
        // Give the renderer 500ms to actually paint the pixels before printing
        setTimeout(() => {
          printWindow.webContents.print(
            {
              silent: false,
              printBackground: true,
              margins: { marginType: 'none' },
              pageSize: { width: 80000, height: 200000 }
            },
            (success, failureReason) => {
              printWindow.close()
              resolve(success ? { success: true } : { error: failureReason })
            }
          )
        }, 500) // Adjust to 1000 if it still prints blank
      })
    })
  })
  // In your ipcHandlers.ts file

  ipcMain.handle('print-test-thermal', async () => {
    const testWindow = new BrowserWindow({
      show: false,
      webPreferences: { sandbox: false }
    })

    // 1. We keep the CSS width, but remove the print command width
    const testHtml = `
    <html>
      <body style="margin: 0; padding: 0; font-family: 'Courier New', monospace; width: 100%; max-width: 58mm;">
        <div style="padding-bottom: 50px; text-align: center;">
          <h2 style="margin: 0;">VHYPE POS</h2>
          <p>--------------------------------</p>
          <p style="text-align: left;">PRINTER TEST</p>
          <p style="text-align: left;">Date: ${new Date().toLocaleTimeString()}</p>
          <p>--------------------------------</p>
          <b style="font-size: 16px;">IT WORKS!</b>
          <br /><br />
          <p>.</p>
        </div>
      </body>
    </html>
  `

    await testWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(testHtml)}`)

    const printers = await testWindow.webContents.getPrintersAsync()
    const thermalPrinter =
      printers.find((p) => p.name === 'POS-58') || printers.find((p) => p.isDefault)

    if (!thermalPrinter) return { success: false, error: 'No printer found' }
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
