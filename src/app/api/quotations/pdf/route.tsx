import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { QuotationPDFDocument } from '@/lib/pdf/quotation-pdf-template';
import { format } from 'date-fns';
import { requireAuth } from '@/lib/api/auth';
import { numberToWords } from '@/lib/utils/quotation-calculations';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { error: authError } = await requireAuth();
    if (authError) {
      return authError;
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate required fields
    if (!body.companyName || !body.customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName and customerName are required' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // 4. Format data for PDF template
    const pdfData = {
      companyName: body.companyName,
      companyState: body.companyState || '',
      number: body.number || 'DRAFT',
      date: body.date ? format(new Date(body.date), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy'),
      validUntil: body.validUntil ? format(new Date(body.validUntil), 'dd MMM yyyy') : undefined,
      financialYear: body.financialYear,
      subject: body.subject,
      customerName: body.customerName,
      customerGstin: body.customerGstin,
      customerAddress: body.customerAddress,
      customerCity: body.customerCity,
      customerState: body.customerState,
      items: body.items.map((item: any) => ({
        name: item.name,
        remarks: item.remarks,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        amount: Number(item.amount),
      })),
      freightCharges: Number(body.freightCharges || 0),
      subtotal: Number(body.subtotal),
      sgst: Number(body.sgst),
      cgst: Number(body.cgst),
      igst: Number(body.igst),
      total: Number(body.total),
      totalInWords: body.totalInWords || numberToWords(Number(body.total)),
      terms: body.terms,
    };

    // 5. Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <QuotationPDFDocument data={pdfData} />
    );

    // 6. Return PDF as downloadable file
    const filename = `Quotation-${body.number || 'draft'}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to generate PDF from saved quotation
export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const quotationId = searchParams.get('id');

    if (!quotationId) {
      return NextResponse.json({ error: 'Quotation ID required' }, { status: 400 });
    }

    // Fetch quotation from database
    const { prisma } = await import('@/lib/prisma');
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        company: true,
        customer: true,
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Format data
    const pdfData = {
      companyName: quotation.company.name,
      companyState: quotation.company.state || '',
      number: quotation.number,
      date: format(quotation.date, 'dd MMM yyyy'),
      validUntil: quotation.validUntil ? format(quotation.validUntil, 'dd MMM yyyy') : undefined,
      financialYear: quotation.financialYear,
      subject: quotation.subject,
      customerName: quotation.customerName,
      customerGstin: quotation.customerGstin || undefined,
      customerAddress: quotation.customerAddress || undefined,
      customerCity: quotation.customerCity || undefined,
      customerState: quotation.customerState || undefined,
      items: quotation.items.map(item => ({
        name: item.name,
        remarks: item.remarks || undefined,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        amount: Number(item.amount),
      })),
      freightCharges: Number(quotation.freightCharges),
      subtotal: Number(quotation.subtotal),
      sgst: Number(quotation.sgst),
      cgst: Number(quotation.cgst),
      igst: Number(quotation.igst),
      total: Number(quotation.total),
      totalInWords: numberToWords(Number(quotation.total)),
      terms: quotation.terms || undefined,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(<QuotationPDFDocument data={pdfData} />);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Quotation-${quotation.number}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
