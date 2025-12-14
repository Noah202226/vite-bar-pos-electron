import { ipcMain } from 'electron'
import { Product } from './db/models/Product'

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
}
