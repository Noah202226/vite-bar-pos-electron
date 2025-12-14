import React, { useEffect, useState } from 'react'
import { useCartStore } from '../store/useCartStore'

// Placeholder for the sub-component
function CategorySettings() {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const { categories, setCategories, fetchCategories } = useCartStore() // I-A-UPDATE natin ang store

  // Fetch categories on mount
  useEffect(() => {
    // Fetch lang kung wala pang categories
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [fetchCategories, categories.length])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setLoading(true)
    const result = await window.api.addCategory(newCategoryName.trim())

    if (result.success) {
      // I-update ang Zustand store at UI agad
      setCategories([...categories, result.category])
      alert(`Category '${result.category.name}' added!`)
      setNewCategoryName('')
    } else {
      alert('Error adding category: ' + result.error)
    }
    setLoading(false)
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-xl font-bold mb-4">Product Categories Management</h3>

      {/* Form for Adding New Category */}
      <form
        onSubmit={handleAddCategory}
        className="flex space-x-2 mb-6 p-4 bg-gray-50 border rounded-md"
      >
        <input
          type="text"
          placeholder="Enter new category name (e.g., Hot Drinks)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="grow border border-gray-300 rounded-md p-2"
          required
        />
        <button
          type="submit"
          disabled={loading || !newCategoryName.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {/* Current Categories List */}
      <h4 className="text-lg font-semibold mb-3">Current Categories:</h4>
      <div className="flex flex-wrap gap-2">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <span
              key={cat._id}
              className="bg-green-200 text-green-800 text-sm font-medium px-3 py-1 rounded-full"
            >
              {cat.name}
            </span>
          ))
        ) : (
          <p className="text-gray-500">No categories found. Please add one.</p>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  // State to manage the active settings tab
  const [activeTab, setActiveTab] = useState('categories')

  const tabs = [
    { id: 'categories', name: 'Product Categories' },
    { id: 'users', name: 'User Management' },
    { id: 'system', name: 'System Preferences' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <CategorySettings />
      case 'users':
        return <div className="p-4">User management controls...</div>
      case 'system':
        return <div className="p-4">Change currency, theme, etc...</div>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Application Settings</h1>

      <div className="flex space-x-2 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
                            py-2 px-4 font-medium transition duration-200 
                            ${
                              activeTab === tab.id
                                ? 'border-b-4 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }
                        `}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="mt-4">{renderContent()}</div>
    </div>
  )
}
