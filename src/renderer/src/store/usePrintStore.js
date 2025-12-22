import { create } from 'zustand'

export const usePrintStore = create((set) => ({
  isPrinting: false,

  // Global function to print a receipt
  printReceipt: async (orderData) => {
    set({ isPrinting: true })
    // ADD 'tendered' and 'change' to this list:
    const { items, total, tableNumber, orderId, paymentType, tendered, change } = orderData

    const receiptHtml = `
      <html>
        <head>
          <style>
            /* Reset for Thermal Printers */
            @page { margin: 0; }
            body { 
              width: 55mm; 
              margin: 0; 
              padding: 0; 
              /* Using a high-resolution font stack similar to Slate theme */
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              font-size: 8px; 
              color: #000;
              line-height: 1.2;
            }
            
            .container { 
              padding: 5px 5px; 
              width: 47mm; 
              margin-left: 8%;
              font-size: 10px; 
            }

            .center { text-align: center; }
            .bold { font-weight: 500; }
            .uppercase { text-transform: uppercase; }
            
            /* Professional Divider */
            .divider { 
              border-bottom: 1px solid #000; 
              margin: 2px 0; 
            }
            .dashed-divider {
              border-bottom: 1px dashed #000;
              margin: 2px 0;
            }

            /* Table Layout */
            .row { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 4px; 
            }
            .item-name { flex: 1; font-weight: 600; padding-right: 4px; }
            .item-price { white-space: nowrap; font-weight: 700; }
            
            /* High-Resolution Total Section */
            .total-section { 
              font-size: 8px; 
              margin-top: 5px;
              padding: 5px 0;
            }

            .payment-info {
              font-size: 11px;
              margin-top: 4px;
            }
            
            .footer { 
              font-size: 8px; 
              margin-top: 15px; 
              line-height: 1.2;
            }

            .feed { height: 1px; } /* Ensures the last line clears the cutter */
          </style>
        </head>
        <body>
          <div class="container">
            <div class="center">
              <h1 style="margin: 0; font-size: 16px; letter-spacing: -1px;">VHYPE</h1>
              <p class="bold" style="margin: 0; font-size: 10px; letter-spacing: 2px;">PREMIUM POS</p>
              <p style="margin: 2px 0;">Calamba, Laguna</p>
              
              <div class="divider"></div>
              
              <p class="bold" style="font-size: 10px; margin: 5px 0;">
                ORDER #${orderId?.toString().slice(-5).toUpperCase() || 'NEW'}
              </p>
              <p class="uppercase" style="font-size: 11px;">
                Table: <span class="bold">${tableNumber || 'Takeout'}</span>
              </p>
              <p style="font-size: 10px;">${new Date().toLocaleString()}</p>
            </div>

            <div class="divider"></div>

            ${items
              .map(
                (item) => `
              <div class="row">
                <span class="item-name">${item.quantity}x ${item.name}</span>
                <span class="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `
              )
              .join('')}

            <div class="dashed-divider"></div>

            <div class="row total-section bold">
                <span>TOTAL DUE</span>
                <span>₱${total.toFixed(2)}</span>
            </div>

            <div class="payment-info">
              <div class="row">
                  <span>Tendered:</span>
                  <span class="bold">₱${(tendered || 0).toFixed(2)}</span>
              </div>
              <div class="row">
                  <span>Change:</span>
                  <span class="bold">₱${(change || 0).toFixed(2)}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="center footer">
              <p class="bold">THANK YOU FOR YOUR PATRONAGE!</p>
              <p>Follow us for promos and updates</p>
              <p style="font-size: 9px; margin-top: 5px;">Powered by VHYPE Systems</p>
              <div class="feed"></div>
              <p>.</p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await window.api.printReceipt(receiptHtml)
    } catch (error) {
      console.error('Auto-print failed:', error)
    } finally {
      set({ isPrinting: false })
    }
  },

  // Simple test print function
  printTest: async () => {
    set({ isPrinting: true })
    try {
      const testHtml = `<html><body style="width:58mm;text-align:center;"><h3>TEST PRINT</h3><p>POS-58 OK</p><div style="height:50px"></div>.</body></html>`
      await window.api.printReceipt(testHtml)
    } catch (error) {
      console.error('Test Print Error:', error)
    } finally {
      set({ isPrinting: false })
    }
  }
}))
