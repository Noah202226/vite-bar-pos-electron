import React from 'react'

const ReceiptButton = () => {
  const handlePrint = () => {
    const receiptData = {
      printerName: 'POS-58', // Change to your printer's system name
      total: '45.00',
      items: [
        { name: 'Coffee', price: '15.00' },
        { name: 'Sandwich', price: '30.00' }
      ]
    }

    // Use the API exposed in preload
    window.api.sendToPrinter(receiptData)
  }

  return <button onClick={handlePrint}>Print Receipt</button>
}

export default ReceiptButton
