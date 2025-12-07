// services/pdfGenerator.js
import puppeteer from 'puppeteer'; // ✅ FIXED: Remove .js extension
import handlebars from 'handlebars'; // ✅ FIXED: Remove .js extension

export const generatePurchaseOrderPDF = async (poData) => {
  try {
    // HTML template for the PO
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Purchase Order - {{poNumber}}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                background: #f5f5f5;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                min-height: 100vh;
            }
            
            .header {
                background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
                color: white;
                padding: 20px;
                text-align: center;
            }
            
            .hospital-info {
                background: #f8f9fa;
                padding: 15px;
                border-bottom: 3px solid #4a90e2;
            }
            
            .hospital-name {
                font-size: 18px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }
            
            .hospital-details {
                font-size: 11px;
                color: #666;
            }
            
            .po-title {
                background: #34495e;
                color: white;
                padding: 10px;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
            }
            
            .info-section {
                display: flex;
                margin: 20px 0;
            }
            
            .info-left, .info-right {
                flex: 1;
                padding: 15px;
            }
            
            .info-left {
                background: #e3f2fd;
                border-left: 4px solid #2196f3;
            }
            
            .info-right {
                background: #f3e5f5;
                border-left: 4px solid #9c27b0;
                margin-left: 20px;
            }
            
            .info-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 10px;
                color: #2c3e50;
            }
            
            .info-item {
                margin-bottom: 5px;
            }
            
            .info-label {
                font-weight: bold;
                display: inline-block;
                width: 120px;
            }
            
            .items-section {
                margin: 20px;
            }
            
            .items-title {
                background: #34495e;
                color: white;
                padding: 10px;
                font-weight: bold;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 0;
            }
            
            .items-table th {
                background: #4a90e2;
                color: white;
                padding: 10px 8px;
                text-align: center;
                font-weight: bold;
            }
            
            .items-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #ddd;
                text-align: center;
            }
            
            .items-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .total-row {
                background: #e8f5e8 !important;
                font-weight: bold;
            }
            
            .terms-section {
                display: flex;
                margin: 20px;
                gap: 20px;
            }
            
            .terms-left {
                flex: 2;
                background: #fff9c4;
                padding: 15px;
                border: 1px solid #f0c419;
                border-radius: 5px;
            }
            
            .terms-right {
                flex: 1;
                background: #f8f9fa;
                padding: 15px;
                border: 1px solid #dee2e6;
                border-radius: 5px;
            }
            
            .terms-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 10px;
                color: #d68910;
            }
            
            .terms-list {
                list-style: none;
                padding: 0;
            }
            
            .terms-list li {
                margin-bottom: 5px;
                font-size: 11px;
            }
            
            .special-instructions {
                background: #e8f4fd;
                border: 1px solid #b3d9ff;
                border-radius: 5px;
                padding: 10px;
                margin-top: 10px;
                font-style: italic;
            }
            
            .signatures-section {
                display: flex;
                justify-content: space-between;
                margin: 40px 20px 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
            }
            
            .signature-box {
                text-align: center;
                width: 200px;
            }
            
            .signature-line {
                border-bottom: 1px solid #333;
                height: 40px;
                margin-bottom: 5px;
            }
            
            .footer {
                background: #34495e;
                color: white;
                text-align: center;
                padding: 15px;
                font-size: 10px;
            }
            
            .footer-note {
                margin-top: 10px;
                font-style: italic;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Hospital Header -->
            <div class="hospital-info">
                <div class="hospital-name">P. P. Maniya Children's Super Speciality Hospital</div>
                <div class="hospital-details">
                    And Maternity Home, Laparoscopy & Test Tube Baby Centre<br>
                    (A centre for women & child)<br>
                    📍 129 Hospital Street, Medical District &nbsp;&nbsp;&nbsp; 📞 +91-9830456710 &nbsp;&nbsp;&nbsp; 
                    📧 info@ppmaniya.com &nbsp;&nbsp;&nbsp; 🌐 www.ppmaniya.com
                </div>
            </div>
            
            <!-- PO Title -->
            <div class="po-title">PURCHASE ORDER</div>
            
            <!-- Info Section -->
            <div class="info-section">
                <div class="info-left">
                    <div class="info-title">Purchase Order Details</div>
                    <div class="info-item">
                        <span class="info-label">PO Number:</span> {{poNumber}}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Order Date:</span> {{orderDate}}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Delivery Date:</span> {{deliveryDate}}
                    </div>
                    <div class="info-item">
                        <span class="info-label">RFQ Number:</span> {{rfqNumber}}
                    </div>
                    <div class="info-item">
                        <span class="info-label">PO Type:</span> {{poType}}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Department:</span> {{department}}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Warranty:</span> {{warrantyPeriod}}
                    </div>
                </div>
                
                <div class="info-right">
                    <div class="info-title">Vendor Details</div>
                    <div style="margin-bottom: 10px;">
                        <strong>{{vendorName}}</strong>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span> {{vendorPhone}}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span> {{vendorEmail}}
                    </div>
                </div>
            </div>
            
            <!-- Items Section -->
            <div class="items-section">
                <div class="items-title">Order Items</div>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 5%">#</th>
                            <th style="width: 30%">Item Description</th>
                            <th style="width: 10%">Unit</th>
                            <th style="width: 10%">Quantity</th>
                            <th style="width: 15%">Unit Price (₹)</th>
                            <th style="width: 15%">Total Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each items}}
                        <tr>
                            <td>{{inc @index}}</td>
                            <td style="text-align: left;">
                                {{this.name}}<br>
                                <small style="color: #666;">{{this.category}}</small>
                            </td>
                            <td>Nos</td>
                            <td>{{this.quantity}}</td>
                            <td>₹{{this.unitPrice}}</td>
                            <td>₹{{this.totalPrice}}</td>
                        </tr>
                        {{/each}}
                        <tr class="total-row">
                            <td colspan="5" style="text-align: right;"><strong>Grand Total:</strong></td>
                            <td><strong>₹{{total}}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Terms Section -->
            <div class="terms-section">
                <div class="terms-left">
                    <div class="terms-title">Terms & Conditions:</div>
                    <ul class="terms-list">
                        <li>• Payment terms: {{paymentTerms}}</li>
                        <li>• Delivery terms: {{deliveryTerms}}</li>
                        <li>• Warranty: {{warrantyPeriod}}</li>
                        <li>• Quality standards: All items must meet specified quality requirements</li>
                        <li>• Late delivery: Penalties may apply for delayed deliveries</li>
                        <li>• Returns: Damaged or non-conforming items will be returned at supplier cost</li>
                        <li>• Inspection: Buyer reserves the right to inspect goods before acceptance</li>
                    </ul>
                    
                    <div class="special-instructions">
                        <strong>Special Instructions:</strong><br>
                        {{specialInstructions}}
                    </div>
                </div>
                
                <div class="terms-right">
                    <div style="margin-bottom: 15px;">
                        <strong>Order Date:</strong><br>
                        {{orderDate}}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Delivery Date:</strong><br>
                        {{deliveryDate}}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Grand Total:</strong><br>
                        <span style="font-size: 18px; color: #27ae60;">₹{{total}}</span>
                    </div>
                </div>
            </div>
            
            <!-- Signatures -->
            <div class="signatures-section">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <strong>Requested By</strong><br>
                    {{createdBy}}<br>
                    <small>Date: {{orderDate}}</small>
                </div>
                
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <strong>Approved By</strong><br>
                    Department Head<br>
                    <small>Date: ___________</small>
                </div>
                
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <strong>Authorized By</strong><br>
                    Purchase Manager<br>
                    <small>Date: ___________</small>
                </div>
                
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <strong>Vendor Acknowledgment</strong><br>
                    {{vendorName}}<br>
                    <small>Date: ___________</small>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                This purchase order is electronically generated and is valid without signature. Please quote PO number <strong>{{poNumber}}</strong> in all correspondence.<br>
                Generated on {{orderDate}} 15:57
                
                <div class="footer-note">
                    🔗 <strong>DOWNLOAD PDF</strong> &nbsp;&nbsp;&nbsp; 📧 <strong>SUPPORT</strong> &nbsp;&nbsp;&nbsp; 📞 <strong>CONTACT US</strong>
                </div>
                
                <div style="margin-top: 10px; font-size: 9px;">
                    © 2025 Digitalex Techno LLP. All Rights Reserved.
                </div>
            </div>
        </div>
    </body>
    </html>`;

    // Register Handlebars helpers
    handlebars.registerHelper('inc', function(value) {
      return parseInt(value) + 1;
    });

    // Compile template
    const template = handlebars.compile(htmlTemplate);
    
    // Prepare data for template
    const templateData = {
      ...poData,
      orderDate: new Date(poData.createdAt || new Date()).toLocaleDateString('en-GB'),
      deliveryDate: new Date(poData.deliveryDate).toLocaleDateString('en-GB'),
      department: 'Central Store Pharmacy',
      warrantyPeriod: poData.warrantyPeriod || '30 days',
      poType: poData.poType === 'regular' ? 'Regular' : poData.poType?.toUpperCase(),
      vendorName: poData.vendor?.name || 'Unknown Vendor',
      vendorEmail: poData.vendor?.email || 'N/A',
      vendorPhone: poData.vendor?.phone || 'N/A',
      rfqNumber: poData.rfq?.number || 'N/A',
      createdBy: poData.createdBy?.name || 'System',
      paymentTerms: poData.paymentTerms || '30 days from invoice date',
      deliveryTerms: poData.deliveryTerms || 'FOB destination',
      specialInstructions: poData.specialInstructions || 'Please ensure all items are packed securely and delivered to the specified address during business hours.'
    };
    
    const html = template(templateData);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });
    
    await browser.close();
    return pdfBuffer;

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};
