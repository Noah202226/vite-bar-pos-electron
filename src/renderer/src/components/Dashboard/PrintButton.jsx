import React from 'react'

const ReceiptButton = () => {
  const receiptHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
  @page {
    margin: 0;
  }

  body {
    width: 58mm;
    margin: 0;
    padding: 0;
    font-family: monospace;
    font-size: 9px;
    color: #000;
  }

  .receipt {
    width: 48mm;          /* 👈 reduce printable width */
    margin-left: 5mm;     /* 👈 HARD left compensation */
    margin-right: auto;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }

  .bold {
    font-weight: bold;
  }

  .line {
    border-top: 1px dashed #000;
    margin: 6px 0;
  }

  .tx-details {
    width: 100%;
    margin: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1px 0;
    font-size: 9px;
  }

  td.qty {
    text-align: center;
    width: 15%;
  }

  td.price {
    text-align: right;
    width: 25%;
  }

  .footer {
    margin-top: 8px;
    font-size: 9px;
    text-align: center;
  }
</style>

  </head>

  <body>
    <div class="receipt">
        <!-- HEADER -->
        <div class="center bold">
          STORE NAME<br />
          Store Address Line 1<br />
          Store Address Line 2<br />
          Tel: 0912-345-6789
        </div>

        <div class="line"></div>
        <div>|123456789012345678901234567890|</div>

        <!-- TRANSACTION INFO -->
        <div class="tx-details">
          Date: ${new Date().toLocaleDateString()}<br />
          Time: ${new Date().toLocaleTimeString()}<br />
          Receipt #: 000123<br />
          Cashier: Admin
        </div>

      <div class="line"></div>

      <!-- ITEMS -->
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="qty">Qty</th>
            <th class="price">Amt</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Item A</td>
            <td class="qty">1</td>
            <td class="price">₱100.00</td>
          </tr>
          <tr>
            <td>Item B</td>
            <td class="qty">2</td>
            <td class="price">₱200.00</td>
          </tr>
        </tbody>
      </table>

      <div class="line"></div>

      <!-- TOTALS -->
      <table>
        <tr>
          <td>Subtotal</td>
          <td class="price">₱300.00</td>
        </tr>
        <tr>
          <td>VAT (12%)</td>
          <td class="price">₱36.00</td>
        </tr>
        <tr class="total">
          <td>TOTAL</td>
          <td class="price">₱336.00</td>
        </tr>
        <tr>
          <td>Cash</td>
          <td class="price">₱500.00</td>
        </tr>
        <tr>
          <td>Change</td>
          <td class="price">₱164.00</td>
        </tr>
      </table>

      <div class="line"></div>

      <!-- FOOTER -->
      <div class="center footer">
        THIS SERVES AS YOUR<br />
        OFFICIAL RECEIPT<br /><br />
        Thank you for your purchase!<br />
        Please come again.<br /><br />
        Powered by Your POS System
      </div>
    </div>
    
  </body>
</html>
`

  return <button onClick={() => window.api.printHtml(receiptHtml)}>Print Receipt</button>
}

export default ReceiptButton
