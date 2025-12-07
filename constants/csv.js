import { createObjectCsvStringifier } from 'csv-writer';

export function generateRFQCsv(rfq) {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'itemName', title: 'Item' },
      { id: 'category', title: 'Category' },
      { id: 'quantityRequired', title: 'Quantity' },
      { id: 'unitPrice', title: 'Unit Price (₹)' },
      { id: 'totalPrice', title: 'Total Price (₹)' },
    ],
  });

  const records = rfq.items.map(item => ({
    itemName: item.itemName,
    category: item.category,
    quantityRequired: item.quantityRequired,
    unitPrice: '',         // vendor will fill
    totalPrice: '',        // vendor will fill
  }));

  const csvHeader = csvStringifier.getHeaderString();
  const csvBody = csvStringifier.stringifyRecords(records);

  const csvContent = csvHeader + csvBody;
  return Buffer.from(csvContent, 'utf-8');
}
