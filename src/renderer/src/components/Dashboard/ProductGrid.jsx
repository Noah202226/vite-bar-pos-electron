// ===================================
// FILE: src/renderer/src/components/Dashboard/ProductGrid.jsx
// ===================================
import React, { useEffect } from 'react'
import { useCartStore } from '../../store/useCartStore'

export default function ProductGrid() {
  // Get state and actions from the store
  const { products, productsLoading, fetchProducts, addItem } = useCartStore()

  // Fetch products when the component mounts
  useEffect(() => {
    // Only fetch if the product list is empty
    if (products.length === 0) {
      fetchProducts()
    }
  }, [fetchProducts, products.length])

  if (productsLoading) {
    return <div className="p-4 text-center text-gray-500">Loading products from database...</div>
  }

  if (products.length === 0) {
    return (
      <div className="p-4 text-center text-red-500">
        No products available. Add some via the Admin panel!
      </div>
    )
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Menu Items</h2>

      {/* Product Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <button
            key={product._id}
            onClick={() => addItem(product)} // <--- Add item to cart on click
            className={`
              p-4 rounded-lg shadow-md transition duration-200 
              ${product.available ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-300 opacity-70 cursor-not-allowed'}
            `}
            disabled={!product.available}
          >
            <h3 className="font-bold text-lg text-blue-900 truncate">{product.name}</h3>
            <p className="text-2xl font-extrabold mt-1">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-600">{product.category}</p>
            {!product.available && <span className="text-red-600 font-semibold">OUT OF STOCK</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
