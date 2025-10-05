import { formatCurrency } from '@/lib/utils/quotation-calculations';

interface PDFData {
  companyName: string;
  companyGstin?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyState?: string;
  number: string;
  date: string;
  validUntil?: string;
  financialYear: string;
  subject?: string;
  customerName: string;
  customerGstin?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  items: Array<{
    name: string;
    remarks?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    amount: number;
  }>;
  freightCharges: number;
  subtotal: number;
  sgst: number;
  cgst: number;
  igst: number;
  total: number;
  totalInWords: string;
  terms?: string;
}

export function generateQuotationHTML(data: PDFData): string {
  const isSameState = data.companyState === data.customerState;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #111827;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 48px;
      background: white;
      page-break-after: always;
    }

    .company-header {
      text-align: center;
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .company-name {
      font-size: 28pt;
      font-weight: bold;
      color: #111827;
      margin-bottom: 4px;
    }

    .company-underline {
      width: 96px;
      height: 4px;
      background-color: #2563EB;
      margin: 0 auto 16px auto;
      border-radius: 2px;
    }

    .company-details {
      font-size: 10pt;
      color: #374151;
    }

    .company-address {
      font-weight: bold;
      margin-bottom: 3px;
    }

    .company-phone,
    .company-gstin {
      margin-bottom: 3px;
    }

    .quotation-title {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 32px;
      color: #374151;
    }

    .details-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      gap: 32px;
      page-break-inside: avoid;
    }

    .details-column {
      flex: 1;
    }

    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
      margin-bottom: 12px;
      color: #111827;
      letter-spacing: 0.5px;
    }

    .detail-row {
      display: flex;
      margin-bottom: 6px;
      font-size: 9pt;
    }

    .detail-label {
      width: 128px;
      color: #6B7280;
    }

    .detail-value {
      font-weight: bold;
      color: #111827;
      flex: 1;
    }

    .customer-value {
      font-weight: bold;
      color: #111827;
      margin-bottom: 6px;
      font-size: 10pt;
    }

    .customer-detail {
      color: #374151;
      font-size: 9pt;
      margin-bottom: 4px;
    }

    .subject-container {
      margin-bottom: 24px;
      font-size: 9pt;
    }

    .subject-label {
      font-weight: bold;
      color: #374151;
    }

    /* Table Styles */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      border: 2px solid #111827;
    }

    thead tr {
      background-color: #111827;
      color: white;
    }

    th {
      border: 1px solid #374151;
      padding: 8px 12px;
      font-size: 8pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    td {
      border: 1px solid #374151;
      padding: 8px 12px;
      font-size: 9pt;
    }

    tbody tr:hover {
      background-color: #F9FAFB;
    }

    .item-name {
      font-weight: bold;
      color: #111827;
    }

    .item-remarks {
      font-size: 8pt;
      color: #111827;
      font-weight: 600;
      margin-top: 2px;
      white-space: pre-wrap;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .font-mono {
      font-family: 'Courier New', monospace;
      color: #111827;
    }

    /* Calculations */
    .calculations-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .calculations-box {
      width: 320px;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 9pt;
    }

    .calc-label {
      color: #374151;
    }

    .calc-value {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #111827;
    }

    .calc-divider {
      border-top: 1px solid #D1D5DB;
      margin: 8px 0;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-top: 2px solid #111827;
      margin-top: 8px;
      font-size: 11pt;
      font-weight: bold;
    }

    .amount-in-words {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #E5E7EB;
      font-size: 8pt;
      color: #6B7280;
      font-style: italic;
    }

    .amount-in-words-value {
      font-weight: bold;
      color: #111827;
    }

    /* Terms */
    .terms-container {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .terms-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: underline;
      margin-bottom: 12px;
      color: #111827;
    }

    .terms-line {
      display: flex;
      margin-bottom: 6px;
      align-items: flex-start;
    }

    .terms-bullet {
      font-size: 10pt;
      margin-right: 8px;
      color: #111827;
      font-weight: bold;
      min-width: 12px;
    }

    .terms-text {
      font-size: 10pt;
      line-height: 1.5;
      flex: 1;
      color: #374151;
    }

    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 48px;
      border-top: 1px solid #D1D5DB;
      page-break-inside: avoid;
    }

    .footer-left {
      font-size: 9pt;
      color: #6B7280;
    }

    .footer-company-name {
      font-weight: bold;
      color: #111827;
    }

    .signature-box {
      text-align: center;
    }

    .signature-line {
      width: 192px;
      border-top: 1px solid #111827;
      margin-bottom: 8px;
    }

    .signature-text {
      font-size: 9pt;
      font-weight: bold;
      color: #374151;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Company Header -->
    <div class="company-header">
      <div class="company-name">${data.companyName || 'COMPANY NAME'}</div>
      <div class="company-underline"></div>
      <div class="company-details">
        ${data.companyAddress ? `<div class="company-address">${data.companyAddress}</div>` : ''}
        ${data.companyPhone ? `<div class="company-phone">Phone: ${data.companyPhone}</div>` : ''}
        ${data.companyGstin ? `<div class="company-gstin">GSTIN: ${data.companyGstin}</div>` : ''}
      </div>
    </div>

    <!-- Quotation Title -->
    <div class="quotation-title">QUOTATION</div>

    <!-- Details Container -->
    <div class="details-container">
      <!-- Quotation Details -->
      <div class="details-column">
        <div class="section-title">Quotation Details</div>
        <div class="detail-row">
          <div class="detail-label">Quotation No:</div>
          <div class="detail-value">${data.number || '—'}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Date:</div>
          <div class="detail-value">${data.date || '—'}</div>
        </div>
        ${data.validUntil ? `
        <div class="detail-row">
          <div class="detail-label">Valid Until:</div>
          <div class="detail-value">${data.validUntil}</div>
        </div>
        ` : ''}
        <div class="detail-row">
          <div class="detail-label">F.Y.:</div>
          <div class="detail-value">${data.financialYear}</div>
        </div>
      </div>

      <!-- Customer Details -->
      <div class="details-column">
        <div class="section-title">Bill To</div>
        <div class="customer-value">${data.customerName || 'Customer Name'}</div>
        ${data.customerAddress ? `<div class="customer-detail">${data.customerAddress}</div>` : ''}
        ${data.customerCity ? `<div class="customer-detail">${data.customerCity}</div>` : ''}
        ${data.customerState ? `<div class="customer-detail">${data.customerState}</div>` : ''}
        ${data.customerGstin ? `<div class="customer-detail"><strong>GSTIN:</strong> ${data.customerGstin}</div>` : ''}
      </div>
    </div>

    <!-- Subject -->
    ${data.subject ? `
    <div class="subject-container">
      <span class="subject-label">Subject: </span>
      <span>${data.subject}</span>
    </div>
    ` : ''}

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="text-align: left; width: 7%;">S.No</th>
          <th style="text-align: left; width: 30%;">Description</th>
          <th style="text-align: center; width: 10%;">Qty</th>
          <th style="text-align: center; width: 10%;">Unit</th>
          <th style="text-align: right; width: 16%;">Rate</th>
          <th style="text-align: center; width: 10%;">Disc%</th>
          <th style="text-align: right; width: 17%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.length === 0 ? `
        <tr>
          <td colspan="7" style="text-align: center; padding: 32px; color: #9CA3AF; font-style: italic;">
            No items added yet
          </td>
        </tr>
        ` : data.items.map((item, index) => `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>
            <div class="item-name">${item.name || '—'}</div>
            ${item.remarks ? `<div class="item-remarks">${item.remarks}</div>` : ''}
          </td>
          <td class="text-center">${item.quantity.toFixed(3)}</td>
          <td class="text-center">${item.unit}</td>
          <td class="text-right font-mono">${formatCurrency(item.unitPrice)}</td>
          <td class="text-center">${item.discount > 0 ? `${item.discount.toFixed(2)}%` : '—'}</td>
          <td class="text-right font-mono" style="font-weight: bold;">${formatCurrency(item.amount)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Calculations -->
    <div class="calculations-container">
      <div class="calculations-box">
        <div class="calc-row">
          <div class="calc-label">Subtotal:</div>
          <div class="calc-value">${formatCurrency(data.subtotal)}</div>
        </div>

        ${data.freightCharges > 0 ? `
        <div class="calc-row">
          <div class="calc-label">Freight Charges:</div>
          <div class="calc-value">${formatCurrency(data.freightCharges)}</div>
        </div>
        ` : ''}

        ${(data.customerState && data.companyState) ? '<div class="calc-divider"></div>' : ''}

        ${isSameState ? `
        <div class="calc-row">
          <div class="calc-label">SGST (9%):</div>
          <div class="calc-value">${formatCurrency(data.sgst)}</div>
        </div>
        <div class="calc-row">
          <div class="calc-label">CGST (9%):</div>
          <div class="calc-value">${formatCurrency(data.cgst)}</div>
        </div>
        ` : `
        <div class="calc-row">
          <div class="calc-label">IGST (18%):</div>
          <div class="calc-value">${formatCurrency(data.igst)}</div>
        </div>
        `}

        <div class="total-row">
          <div>Total:</div>
          <div class="font-mono">${formatCurrency(data.total)}</div>
        </div>

        ${data.total > 0 ? `
        <div class="amount-in-words">
          Amount in Words: <span class="amount-in-words-value">${data.totalInWords}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Terms & Conditions -->
    ${data.terms ? `
    <div class="terms-container">
      <div class="terms-title">Terms & Conditions</div>
      <div>
        ${data.terms.split('\n').map(line => {
          const trimmed = line.trim();
          if (!trimmed) return '<div style="height: 6px;"></div>';
          return `
          <div class="terms-line">
            <div class="terms-bullet">•</div>
            <div class="terms-text">${trimmed}</div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-company-name">${data.companyName || 'Company Name'}</div>
        <div>${data.companyState || ''}</div>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <div class="signature-text">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
