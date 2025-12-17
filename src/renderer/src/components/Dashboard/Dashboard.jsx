import Header from './Header'
import ReceiptButton from './PrintButton'
import ProductGrid from './ProductGrid' // <--- NEW IMPORT
// import OrderCart from './OrderCart'  // Next step!

export default function Dashboard({ user, onLogout }) {
  return (
    // Note: Removed the padding/min-height from App.jsx and put it here
    <div className="p-4 bg-gray-50 min-h-screen flex flex-col">
      <Header user={user} onLogout={onLogout} />

      {/* Main POS Layout Container */}
      <main className="mt-4 flex flex-1 overflow-hidden gap-4">
        {/* Right Side: Order Cart (Fixed width area) */}
        <div className="w-96 bg-white shadow rounded-lg p-4 shrink-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Cart</h2>
          {/* Placeholder for the OrderCart component */}
          <div className="h-full border border-dashed p-4 text-gray-500">
            Build OrderCart.jsx here!
            <ReceiptButton />
          </div>
        </div>

        {/* Left Side: Product Selection (Wide area) */}
        <div className="flex-1 min-h-0">
          <ProductGrid />
        </div>
      </main>
    </div>
  )
}
