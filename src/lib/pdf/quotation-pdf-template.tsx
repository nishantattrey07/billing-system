import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles matching the current HTML preview design
const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
  },
  // Company header styles
  companyHeader: {
    textAlign: 'center',
    marginBottom: 32,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  companyUnderline: {
    width: 96,
    height: 4,
    backgroundColor: '#2563EB',
    marginHorizontal: 'auto',
    borderRadius: 2,
  },
  // Quotation title
  quotationTitle: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#374151',
  },
  // Two-column layout for details
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 32,
  },
  detailsColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    color: '#374151',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    fontSize: 9,
  },
  detailLabel: {
    width: 128,
    color: '#6B7280',
  },
  detailValue: {
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  customerValue: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
    fontSize: 10,
  },
  customerDetail: {
    color: '#374151',
    fontSize: 9,
    marginBottom: 4,
  },
  subjectContainer: {
    marginBottom: 24,
    fontSize: 9,
  },
  subjectLabel: {
    fontWeight: 'bold',
    color: '#374151',
  },
  subjectText: {
    color: '#111827',
  },
  // Table styles
  table: {
    marginBottom: 32,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8,
    textTransform: 'uppercase',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 9,
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  // Table columns
  colSNo: { width: '8%', textAlign: 'center' },
  colDescription: { width: '32%' },
  colQty: { width: '12%', textAlign: 'center' },
  colUnit: { width: '12%', textAlign: 'center' },
  colRate: { width: '14%', textAlign: 'right' },
  colDisc: { width: '10%', textAlign: 'center' },
  colAmount: { width: '12%', textAlign: 'right', fontWeight: 'bold' },
  // Item description
  itemName: {
    fontWeight: 'bold',
    color: '#111827',
  },
  itemRemarks: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 1.3,
  },
  // Calculations section
  calculationsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  calculationsBox: {
    width: 320,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 9,
  },
  calcLabel: {
    color: '#374151',
  },
  calcValue: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: '#111827',
  },
  calcDivider: {
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#111827',
    marginTop: 8,
    fontSize: 11,
    fontWeight: 'bold',
  },
  amountInWords: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  amountInWordsText: {
    fontSize: 8,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  amountInWordsValue: {
    fontWeight: 'bold',
    color: '#111827',
  },
  // Terms section
  termsContainer: {
    marginBottom: 32,
  },
  termsContent: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 48,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    marginTop: 'auto',
  },
  footerLeft: {
    fontSize: 9,
  },
  footerCompanyName: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  footerCompanyState: {
    color: '#6B7280',
  },
  signatureBox: {
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#111827',
    width: 192,
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
});

// Type definitions
interface QuotationPDFProps {
  data: {
    companyName: string;
    companyState: string;
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
  };
}

export const QuotationPDFDocument = ({ data }: QuotationPDFProps) => {
  const isSameState = data.companyState === data.customerState;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.companyHeader}>
          <Text style={styles.companyName}>{data.companyName || 'COMPANY NAME'}</Text>
          <View style={styles.companyUnderline} />
        </View>

        {/* Quotation Title */}
        <Text style={styles.quotationTitle}>QUOTATION</Text>

        {/* Quotation Details & Customer Info */}
        <View style={styles.detailsContainer}>
          {/* Left - Quotation Details */}
          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Quotation Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quotation No:</Text>
              <Text style={styles.detailValue}>{data.number || '—'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{data.date || '—'}</Text>
            </View>
            {data.validUntil && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valid Until:</Text>
                <Text style={styles.detailValue}>{data.validUntil}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>F.Y.:</Text>
              <Text style={styles.detailValue}>{data.financialYear}</Text>
            </View>
          </View>

          {/* Right - Customer Details */}
          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.customerValue}>
              {data.customerName || 'Customer Name'}
            </Text>
            {data.customerAddress && (
              <Text style={styles.customerDetail}>{data.customerAddress}</Text>
            )}
            {data.customerCity && (
              <Text style={styles.customerDetail}>{data.customerCity}</Text>
            )}
            {data.customerState && (
              <Text style={styles.customerDetail}>{data.customerState}</Text>
            )}
            {data.customerGstin && (
              <Text style={styles.customerDetail}>
                <Text style={{ fontWeight: 'bold' }}>GSTIN: </Text>
                {data.customerGstin}
              </Text>
            )}
          </View>
        </View>

        {/* Subject */}
        {data.subject && (
          <View style={styles.subjectContainer}>
            <Text>
              <Text style={styles.subjectLabel}>Subject: </Text>
              <Text style={styles.subjectText}>{data.subject}</Text>
            </Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colSNo}>S.No</Text>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnit}>Unit</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colDisc}>Disc%</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>

          {/* Table Rows */}
          {data.items.length === 0 ? (
            <View style={[styles.tableRow, { paddingVertical: 32, justifyContent: 'center' }]}>
              <Text style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
                No items added yet
              </Text>
            </View>
          ) : (
            data.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : {}
                ]}
              >
                <Text style={styles.colSNo}>{index + 1}</Text>
                <View style={styles.colDescription}>
                  <Text style={styles.itemName}>{item.name || '—'}</Text>
                  {item.remarks && (
                    <Text style={styles.itemRemarks}>{item.remarks}</Text>
                  )}
                </View>
                <Text style={styles.colQty}>{item.quantity.toFixed(3)}</Text>
                <Text style={styles.colUnit}>{item.unit}</Text>
                <Text style={styles.colRate}>₹{item.unitPrice.toFixed(2)}</Text>
                <Text style={styles.colDisc}>
                  {item.discount > 0 ? `${item.discount.toFixed(2)}%` : '—'}
                </Text>
                <Text style={styles.colAmount}>₹{item.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Calculations Summary */}
        <View style={styles.calculationsContainer}>
          <View style={styles.calculationsBox}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Subtotal:</Text>
              <Text style={styles.calcValue}>₹{data.subtotal.toFixed(2)}</Text>
            </View>

            {data.freightCharges > 0 && (
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Freight Charges:</Text>
                <Text style={styles.calcValue}>₹{data.freightCharges.toFixed(2)}</Text>
              </View>
            )}

            {/* GST - Divider before GST */}
            {(data.customerState && data.companyState) && (
              <View style={styles.calcDivider} />
            )}

            {/* GST Breakdown */}
            {isSameState ? (
              <>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>SGST (9%):</Text>
                  <Text style={styles.calcValue}>₹{data.sgst.toFixed(2)}</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>CGST (9%):</Text>
                  <Text style={styles.calcValue}>₹{data.cgst.toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>IGST (18%):</Text>
                <Text style={styles.calcValue}>₹{data.igst.toFixed(2)}</Text>
              </View>
            )}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text>Total:</Text>
              <Text>₹{data.total.toFixed(2)}</Text>
            </View>

            {/* Amount in Words */}
            {data.total > 0 && (
              <View style={styles.amountInWords}>
                <Text style={styles.amountInWordsText}>
                  Amount in Words:{' '}
                  <Text style={styles.amountInWordsValue}>{data.totalInWords}</Text>
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Terms & Conditions */}
        {data.terms && (
          <View style={styles.termsContainer}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <View style={styles.termsContent}>
              <Text>{data.terms}</Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerCompanyName}>{data.companyName || 'Company Name'}</Text>
            <Text style={styles.footerCompanyState}>{data.companyState}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
