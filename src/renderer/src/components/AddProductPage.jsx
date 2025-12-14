import React, { useEffect, useState } from 'react'

import { useCartStore } from '../store/useCartStore'
import toast from 'react-hot-toast'

export default function AddProductPage() {
  const { categories, fetchCategories, categoriesLoading } = useCartStore()

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  // Set default category based on store data, or use an empty string
  const [category, setCategory] = useState('')

  // Fetch categories if they haven't been loaded yet
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
    // Set the default category once categories are loaded
    if (categories.length > 0 && category === '') {
      setCategory(categories[0].name)
    }
  }, [categories, fetchCategories, category])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!category) {
      toast.error('Please select a category.')
      return
    }

    // Call the 'db:add-product' IPC handler
    const result = await window.api.addProduct({
      name,
      price,
      category: category, // <--- NOW DYNAMIC
      available: true
    })

    if (result.success) {
      toast.success(`Product ${name} added successfully!`)

      setName('')
      setPrice(0)
      // Optional: Close the window after success
      //   window.close()
    } else {
      // Improved error message display
      toast.error('Failed to add product: ' + (result.error?.message || result.error))
    }
  }

  if (categoriesLoading) {
    return <div className="p-6 text-center text-gray-500">Loading categories...</div>
  }

  if (categories.length === 0 && !categoriesLoading) {
    return (
      <div className="p-6 text-center text-red-500">
        Please add categories in the Settings page first.
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Price Input */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Category Select Dropdown (NEW) */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white"
            required
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Product
        </button>
      </form>
    </div>
  )
}
