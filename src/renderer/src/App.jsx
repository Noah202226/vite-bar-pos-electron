import { useState, useEffect } from 'react' // Import hooks
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App() {
  const [products, setProducts] = useState([])
  const [fetchStatus, setFetchStatus] = useState('idle')

  // This still works because the template exposes it
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  const fetchProducts = async () => {
    setFetchStatus('loading')
    try {
      // Direct access in JavaScript: NO type error!
      const result = await window.api.getProducts()

      if (result && result.error) {
        console.error('Error fetching products:', result.error)
        setFetchStatus('error')
        setProducts([])
        return
      }

      console.log('Products fetched:', result)
      setProducts(result)
      setFetchStatus('success')
    } catch (error) {
      console.error('Error in renderer while fetching products:', error)
      setFetchStatus('error')
    }
  }

  // Optional: Fetch on mount
  useEffect(() => {
    // You can call fetchProducts() here if you want
  }, [])

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>

      <h1 className="text-3xl font-bold underline text-blue-900 mt-4">Bar POS Interface</h1>

      <div className="actions flex space-x-4 mt-4">
        <div className="action">
          <a
            className="cursor-pointer bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={fetchProducts}
          >
            {fetchStatus === 'loading' ? 'Fetching...' : 'Fetch Products'}
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send Template IPC (Ping)
          </a>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded shadow w-full max-w-lg mx-auto">
        <h2 className="text-xl font-semibold">Products List ({products.length})</h2>
        {fetchStatus === 'success' && products.length > 0 ? (
          <div className="space-y-2 pt-2">
            {products.map((p) => (
              <div
                key={p._id}
                className="p-3 bg-gray-50 rounded flex justify-between items-center border"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-lg font-bold text-red-600">${p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : fetchStatus === 'loading' ? (
          <p>Loading products from MongoDB...</p>
        ) : fetchStatus === 'error' ? (
          <p className="text-red-600">
            Failed to connect to or fetch from the database. Check console for Mongoose errors!
          </p>
        ) : (
          <p className="text-gray-500">Click "Fetch Products" to load data.</p>
        )}
      </div>

      <Versions />
    </>
  )
}

export default App
