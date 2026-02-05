import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '@/types';

export function generateReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales Report', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Date range
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(
    `${data.summary.startDate} to ${data.summary.endDate}`,
    pageWidth / 2,
    y,
    { align: 'center' },
  );
  doc.setTextColor(0);
  y += 14;

  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryData = [
    ['Total Revenue', formatCurrency(data.summary.totalRevenue)],
    ['Total Orders', data.summary.totalOrders.toString()],
    ['Average Order Value', formatCurrency(data.summary.avgOrderValue)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60, halign: 'right' },
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;

  // Orders by Status
  if (data.ordersByStatus.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Orders by Status', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Status', 'Count', 'Revenue']],
      body: data.ordersByStatus.map((s) => [
        s.status,
        s.count.toString(),
        formatCurrency(s.revenue),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }

  // Top Selling Products
  if (data.topSellingProducts.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Selling Products', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Product', 'Qty Sold', 'Revenue']],
      body: data.topSellingProducts.map((p) => [
        p.name,
        p.totalQuantity.toString(),
        formatCurrency(p.totalRevenue),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }

  // Orders List
  if (data.orders.length > 0) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [['Order ID', 'Customer', 'Date', 'Status', 'Total']],
      body: data.orders.map((o) => [
        o.id.slice(0, 8) + '...',
        o.user ? `${o.user.firstName} ${o.user.lastName}` : 'N/A',
        new Date(o.createdAt).toLocaleDateString('en-US'),
        o.status,
        formatCurrency(o.total),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { halign: 'right' },
      },
    });
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' },
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-US')}`,
      14,
      doc.internal.pageSize.getHeight() - 10,
    );
  }

  doc.save(`sales-report-${data.summary.startDate}-to-${data.summary.endDate}.pdf`);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
